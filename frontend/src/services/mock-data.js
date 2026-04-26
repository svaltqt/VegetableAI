import { computeStatus } from "@/utils/status"

const today = () => new Date()
const addDays = (n) => {
  const d = today()
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

let _user = {
  id: "mock-user-001",
  email: "demo@vegetableai.app",
  full_name: "Juan Pérez",
  avatar_url: null,
  alert_days: [3, 1, 0],
  created_at: new Date("2026-01-15").toISOString(),
}

let _products = [
  { id: "p-001", user_id: _user.id, name: "Arroz integral", category: "envasado", expiration_date: addDays(240), quantity: 1, notes: "", image_url: null, source: "manual", created_at: addDays(-30) },
  { id: "p-002", user_id: _user.id, name: "Leche entera", category: "lacteo", expiration_date: addDays(2), quantity: 2, notes: "Refrigerar", image_url: null, source: "ocr", created_at: addDays(-3) },
  { id: "p-003", user_id: _user.id, name: "Yogurt natural", category: "lacteo", expiration_date: addDays(3), quantity: 4, notes: "", image_url: null, source: "ocr", created_at: addDays(-2) },
  { id: "p-004", user_id: _user.id, name: "Queso crema", category: "lacteo", expiration_date: addDays(-1), quantity: 1, notes: "", image_url: null, source: "manual", created_at: addDays(-7) },
  { id: "p-005", user_id: _user.id, name: "Atún en lata", category: "envasado", expiration_date: addDays(540), quantity: 6, notes: "", image_url: null, source: "manual", created_at: addDays(-15) },
  { id: "p-006", user_id: _user.id, name: "Tomates", category: "verdura", expiration_date: addDays(0), quantity: 5, notes: "", image_url: null, source: "ocr", created_at: addDays(-5) },
  { id: "p-007", user_id: _user.id, name: "Pan integral", category: "envasado", expiration_date: addDays(5), quantity: 1, notes: "", image_url: null, source: "manual", created_at: addDays(-1) },
  { id: "p-008", user_id: _user.id, name: "Pechuga de pollo", category: "carnico", expiration_date: addDays(1), quantity: 2, notes: "Congelar si no se consume.", image_url: null, source: "manual", created_at: addDays(-2) },
]

let _alerts = [
  { id: "a-001", user_id: _user.id, product_id: "p-004", type: "vencido", message: "Queso crema venció hoy", status: "pendiente", generated_at: new Date().toISOString(), created_at: new Date().toISOString() },
  { id: "a-002", user_id: _user.id, product_id: "p-002", type: "proximo_2", message: "Leche entera vence en 2 días", status: "pendiente", generated_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
  { id: "a-003", user_id: _user.id, product_id: "p-003", type: "proximo_3", message: "Yogurt natural vence en 3 días", status: "vista", generated_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
  { id: "a-004", user_id: _user.id, product_id: "p-007", type: "proximo_5", message: "Pan integral vence en 5 días", status: "descartada", generated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString() },
]

let _push_subscriptions = []

export const mockStore = {
  getUser: () => ({ ..._user }),
  setUser: (patch) => {
    _user = { ..._user, ...patch }
    return { ..._user }
  },

  listProducts: () =>
    _products
      .map((p) => ({ ...p, status: computeStatus(p.expiration_date) }))
      .sort(
        (a, b) => new Date(a.expiration_date).getTime() - new Date(b.expiration_date).getTime()
      ),
  getProduct: (id) => {
    const p = _products.find((p) => p.id === id)
    if (!p) return null
    return { ...p, status: computeStatus(p.expiration_date) }
  },
  createProduct: (payload) => {
    const product = {
      id: `p-${Date.now()}`,
      user_id: _user.id,
      source: payload.source || "manual",
      created_at: new Date().toISOString(),
      image_url: null,
      quantity: 1,
      notes: "",
      ...payload,
    }
    _products = [product, ..._products]
    return { ...product, status: computeStatus(product.expiration_date) }
  },
  updateProduct: (id, patch) => {
    _products = _products.map((p) => (p.id === id ? { ...p, ...patch } : p))
    const next = _products.find((p) => p.id === id)
    return next ? { ...next, status: computeStatus(next.expiration_date) } : null
  },
  removeProduct: (id) => {
    _products = _products.filter((p) => p.id !== id)
    _alerts = _alerts.filter((a) => a.product_id !== id)
    return true
  },

  listAlerts: () =>
    _alerts.slice().sort((a, b) => new Date(b.generated_at).getTime() - new Date(a.generated_at).getTime()),
  updateAlert: (id, patch) => {
    _alerts = _alerts.map((a) => (a.id === id ? { ...a, ...patch } : a))
    return _alerts.find((a) => a.id === id)
  },

  listSubscriptions: () => _push_subscriptions.slice(),
  addSubscription: (sub) => {
    _push_subscriptions = [..._push_subscriptions, { ...sub, id: `sub-${Date.now()}` }]
    return _push_subscriptions[_push_subscriptions.length - 1]
  },
  removeSubscription: (id) => {
    _push_subscriptions = _push_subscriptions.filter((s) => s.id !== id)
    return true
  },
}

export function delay(ms = 350) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
