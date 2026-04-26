import { supabase, isSupabaseConfigured } from "@/supabaseClient"
import { mockStore, delay } from "./mock-data"

const MOCK_SESSION_KEY = "vegetableai-mock-session"

function buildMockSession() {
  const user = mockStore.getUser()
  return {
    access_token: "mock-token",
    user: { id: user.id, email: user.email, user_metadata: { full_name: user.full_name } },
  }
}

function translateAuthError(error) {
  const message = String(error?.message || "").toLowerCase()
  if (message.includes("email not confirmed") || message.includes("confirm")) {
    return new Error(
      "Tu correo aún no ha sido confirmado. Revisa tu bandeja de entrada y haz clic en el enlace de verificación que te enviamos."
    )
  }
  if (message.includes("invalid login credentials") || message.includes("invalid_credentials")) {
    return new Error("Credenciales incorrectas. Verifica tu correo y contraseña.")
  }
  if (message.includes("too many requests") || message.includes("rate limit")) {
    return new Error("Has realizado demasiados intentos. Espera unos minutos antes de volver a intentarlo.")
  }
  if (message.includes("user already registered") || message.includes("already registered")) {
    return new Error("Este correo ya está registrado en la plataforma.")
  }
  if (message.includes("password should be at least")) {
    return new Error("La contraseña debe tener al menos 8 caracteres, una mayúscula y un número.")
  }
  return new Error(error?.message || "No fue posible completar la operación.")
}

export const authService = {
  async getSession() {
    if (!isSupabaseConfigured) {
      const stored = localStorage.getItem(MOCK_SESSION_KEY)
      return stored ? JSON.parse(stored) : null
    }
    const { data } = await supabase.auth.getSession()
    return data?.session || null
  },

  onAuthStateChange(callback) {
    if (!isSupabaseConfigured) {
      const handler = () => {
        const stored = localStorage.getItem(MOCK_SESSION_KEY)
        callback(stored ? JSON.parse(stored) : null)
      }
      window.addEventListener("storage", handler)
      return () => window.removeEventListener("storage", handler)
    }
    const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(session))
    return () => data?.subscription?.unsubscribe?.()
  },

  async signIn({ email, password }) {
    if (!isSupabaseConfigured) {
      await delay()
      if (!email || !password) {
        throw new Error("Credenciales incorrectas. Verifica tu correo y contraseña.")
      }
      const session = buildMockSession()
      localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(session))
      window.dispatchEvent(new StorageEvent("storage", { key: MOCK_SESSION_KEY }))
      return session
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw translateAuthError(error)
    return data.session
  },

  async signUp({ email, password, fullName }) {
    if (!isSupabaseConfigured) {
      await delay()
      mockStore.setUser({ email, full_name: fullName })
      const session = buildMockSession()
      localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(session))
      window.dispatchEvent(new StorageEvent("storage", { key: MOCK_SESSION_KEY }))
      return { session, requiresEmailConfirmation: false }
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/login`,
      },
    })
    if (error) throw translateAuthError(error)

    // Supabase devuelve `session = null` cuando el proyecto exige confirmación
    // de correo (RF-01: el usuario debe verificar antes de iniciar sesión).
    const requiresEmailConfirmation = !data.session
    return { session: data.session, requiresEmailConfirmation }
  },

  async signOut() {
    if (!isSupabaseConfigured) {
      localStorage.removeItem(MOCK_SESSION_KEY)
      window.dispatchEvent(new StorageEvent("storage", { key: MOCK_SESSION_KEY }))
      return
    }
    await supabase.auth.signOut()
  },

  async forgotPassword(email) {
    if (!isSupabaseConfigured) {
      await delay()
      return { ok: true }
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/forgot-password`,
    })
    if (error) throw translateAuthError(error)
    return { ok: true }
  },

  async resendConfirmation(email) {
    if (!isSupabaseConfigured) {
      await delay()
      return { ok: true }
    }
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: `${window.location.origin}/login` },
    })
    if (error) throw translateAuthError(error)
    return { ok: true }
  },
}
