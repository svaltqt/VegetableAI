import { api, isMockMode } from "./api"
import { mockStore, delay } from "./mock-data"
import { supabase } from "@/supabaseClient"
import { STORAGE_BUCKETS } from "@/config/constants"

/**
 * Esquema real del backend:
 *   GET    /api/users/me  → { id, name, avatar_url, preferences, created_at, updated_at } (de tabla profiles)
 *   PUT    /api/users/me  → upsert con los mismos campos
 *   DELETE /api/users/me  → elimina la cuenta (Supabase admin) y cascadea profiles/inventory
 *
 * El correo del usuario NO está en `profiles`; vive en `auth.users`. Por eso aquí
 * componemos el perfil mezclando la respuesta del backend con la sesión Supabase.
 *
 * Las preferencias (alert_days, theme, etc.) viven dentro del JSONB `preferences`.
 */

const DEFAULT_PREFERENCES = {
  alert_days: [3, 1, 0],
  theme: "light",
  notifications: true,
}

function mapFromBackend(row, sessionUser) {
  const preferences = { ...DEFAULT_PREFERENCES, ...(row?.preferences || {}) }
  return {
    id: row?.id || sessionUser?.id || null,
    full_name: row?.name || sessionUser?.user_metadata?.full_name || "",
    email: sessionUser?.email || "",
    avatar_url: row?.avatar_url || null,
    alert_days: preferences.alert_days,
    preferences,
    created_at: row?.created_at || null,
    updated_at: row?.updated_at || null,
  }
}

function mapToBackend(payload, currentPreferences = DEFAULT_PREFERENCES) {
  const out = {}
  if (payload.full_name !== undefined) out.name = payload.full_name
  if (payload.avatar_url !== undefined) out.avatar_url = payload.avatar_url
  if (payload.alert_days !== undefined || payload.preferences !== undefined) {
    out.preferences = {
      ...currentPreferences,
      ...(payload.preferences || {}),
      ...(payload.alert_days !== undefined ? { alert_days: payload.alert_days } : {}),
    }
  }
  return out
}

async function getSessionUser() {
  const { data } = await supabase.auth.getSession()
  return data?.session?.user || null
}

export const usersService = {
  async me() {
    if (isMockMode()) {
      await delay(200)
      return mockStore.getUser()
    }
    const [sessionUser, response] = await Promise.all([
      getSessionUser(),
      api.get("/users/me").then((r) => r.data).catch(() => ({})),
    ])
    return mapFromBackend(response, sessionUser)
  },

  async update(payload) {
    if (isMockMode()) {
      await delay(250)
      return mockStore.setUser(payload)
    }
    const sessionUser = await getSessionUser()
    const current = await api
      .get("/users/me")
      .then((r) => r.data)
      .catch(() => ({}))
    const mapped = mapToBackend(payload, current?.preferences)
    const { data } = await api.put("/users/me", mapped)
    const profileRow = data?.profile || data
    return mapFromBackend(profileRow, sessionUser)
  },

  async uploadAvatar(file) {
    if (isMockMode()) {
      await delay(400)
      const reader = new FileReader()
      const url = await new Promise((resolve) => {
        reader.onload = () => resolve(reader.result)
        reader.readAsDataURL(file)
      })
      return mockStore.setUser({ avatar_url: url })
    }
    
    const sessionUser = await getSessionUser()
    if (!sessionUser) throw new Error("Sesión no válida. Vuelve a iniciar sesión.")

    const formData = new FormData()
    formData.append("avatar", file)

    const { data } = await api.post("/users/me/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    })

    const profileRow = data?.profile || data
    return mapFromBackend(profileRow, sessionUser)
  },

  async remove() {
    if (isMockMode()) {
      await delay(300)
      return { ok: true }
    }
    const { data } = await api.delete("/users/me")
    return data
  },
}
