import { api, isMockMode } from "./api"
import { mockStore, delay } from "./mock-data"

/**
 * Endpoints REST esperados (a implementar en backend):
 *   GET   /api/alerts          → historial de alertas del usuario
 *   PATCH /api/alerts/:id      → actualiza estado { status: "vista" | "descartada" }
 *   POST  /api/alerts/seen-all → marca todas las pendientes como vistas
 */
export const alertsService = {
  async list() {
    if (isMockMode()) {
      await delay(200)
      return mockStore.listAlerts()
    }
    const { data } = await api.get("/alerts")
    return data
  },

  async updateStatus(id, status) {
    if (isMockMode()) {
      await delay(180)
      return mockStore.updateAlert(id, { status })
    }
    const { data } = await api.patch(`/alerts/${id}`, { status })
    return data
  },

  async markAllSeen() {
    if (isMockMode()) {
      await delay(220)
      const alerts = mockStore.listAlerts()
      alerts.forEach((a) => {
        if (a.status === "pendiente") mockStore.updateAlert(a.id, { status: "vista" })
      })
      return { ok: true }
    }
    const { data } = await api.post("/alerts/seen-all")
    return data
  },
}
