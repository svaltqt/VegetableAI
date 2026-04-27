import { api, isMockMode } from "./api"
import { mockStore, delay } from "./mock-data"
import { BACKEND_STATUS_MAP } from "@/config/constants"
import { computeStatus } from "@/utils/status"

/**
 * Backend `inventory` table schema:
 *   id, user_id, name, category, expiration_date, image_url, created_at
 *
 * Endpoints:
 *   GET    /api/inventory      → array with `status` ('Vigente' | 'Próximo a vencer' | 'Vencido') and `days_left`
 *   POST   /api/inventory      → array (Supabase .insert().select())
 *   PUT    /api/inventory/:id  → array
 *   DELETE /api/inventory/:id  → { success: true, deleted: [...] }
 *
 * There is no /summary endpoint; it is computed client-side from the list.
 * `quantity`, `notes` and `source` are not yet columns in the backend table,
 * so they are stripped before sending.
 */

const ALLOWED_FIELDS = ["name", "category", "expiration_date", "image_url"]

function sanitizeForBackend(payload) {
  return Object.fromEntries(
    Object.entries(payload).filter(([key]) => ALLOWED_FIELDS.includes(key))
  )
}

function normalizeProduct(item) {
  if (!item) return null
  const status = BACKEND_STATUS_MAP[item.status] || (item.status?.toLowerCase?.() ?? null) || computeStatus(item.expiration_date)
  return {
    ...item,
    quantity: item.quantity ?? null,
    notes: item.notes ?? "",
    source: item.source ?? "manual",
    status,
  }
}

function unwrapList(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  if (data && typeof data === "object") return [data]
  return []
}

export const inventoryService = {
  async list() {
    if (isMockMode()) {
      await delay(200)
      return mockStore.listProducts()
    }
    const { data } = await api.get("/inventory")
    return unwrapList(data).map(normalizeProduct)
  },

  async get(id) {
    if (isMockMode()) {
      await delay(150)
      return mockStore.getProduct(id)
    }
    const list = await this.list()
    return list.find((p) => String(p.id) === String(id)) || null
  },

  async create(payload) {
    if (isMockMode()) {
      await delay(250)
      return mockStore.createProduct(payload)
    }
    const body = sanitizeForBackend(payload)
    const { data } = await api.post("/inventory", body)
    const first = unwrapList(data)[0]
    return normalizeProduct(first)
  },

  async update(id, payload) {
    if (isMockMode()) {
      await delay(250)
      return mockStore.updateProduct(id, payload)
    }
    const body = sanitizeForBackend(payload)
    const { data } = await api.put(`/inventory/${id}`, body)
    const first = unwrapList(data)[0]
    return normalizeProduct(first)
  },

  async remove(id) {
    if (isMockMode()) {
      await delay(200)
      return mockStore.removeProduct(id)
    }
    await api.delete(`/inventory/${id}`)
    return true
  },

  async summary() {
    if (isMockMode()) {
      await delay(180)
      const products = mockStore.listProducts()
      const counters = { total: products.length, vigente: 0, proximo: 0, vencido: 0 }
      for (const p of products) counters[p.status] += 1
      return counters
    }
    const products = await this.list()
    const counters = { total: products.length, vigente: 0, proximo: 0, vencido: 0 }
    for (const p of products) {
      if (counters[p.status] !== undefined) counters[p.status] += 1
    }
    return counters
  },
}
