import env from "@/config/env"
import { api, isMockMode } from "./api"
import { mockStore, delay } from "./mock-data"

/**
 * Endpoints REST esperados (a implementar en backend) — flujo Web Push (RFC 8292):
 *   GET    /api/notifications/vapid-public-key         → { key: string }
 *   POST   /api/notifications/subscribe                → guarda PushSubscription
 *      payload: { endpoint, keys: { p256dh, auth }, user_agent }
 *   DELETE /api/notifications/subscribe                → elimina suscripción del dispositivo
 *   POST   /api/notifications/test                     → envío de prueba (admin)
 *
 * Mientras se construye el backend, este servicio simula la suscripción y
 * persiste los datos en el store mock para visualizar el estado en el perfil.
 */

function urlBase64ToUint8Array(base64String) {
  if (!base64String) return new Uint8Array()
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
  const raw = atob(base64)
  const output = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; ++i) output[i] = raw.charCodeAt(i)
  return output
}

export const notificationsService = {
  isSupported() {
    return (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window
    )
  },

  permission() {
    if (typeof Notification === "undefined") return "unsupported"
    return Notification.permission
  },

  async requestPermission() {
    if (typeof Notification === "undefined") return "unsupported"
    const result = await Notification.requestPermission()
    return result
  },

  async subscribe() {
    if (!this.isSupported()) {
      throw new Error("Tu navegador no soporta notificaciones push.")
    }
    const permission = await this.requestPermission()
    if (permission !== "granted") {
      throw new Error("Permiso de notificaciones denegado.")
    }

    if (isMockMode()) {
      await delay(400)
      return mockStore.addSubscription({
        endpoint: "mock://push.local/" + Date.now(),
        keys: { p256dh: "mock-p256dh", auth: "mock-auth" },
        user_agent: navigator.userAgent,
      })
    }

    const registration = await navigator.serviceWorker.ready
    const sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(env.vapidPublicKey),
    })
    const payload = sub.toJSON()
    const { data } = await api.post("/notifications/subscribe", {
      endpoint: payload.endpoint,
      keys: payload.keys,
      user_agent: navigator.userAgent,
    })
    return data
  },

  async unsubscribe() {
    if (isMockMode()) {
      await delay(180)
      const subs = mockStore.listSubscriptions()
      subs.forEach((s) => mockStore.removeSubscription(s.id))
      return { ok: true }
    }
    const registration = await navigator.serviceWorker.ready
    const sub = await registration.pushManager.getSubscription()
    if (sub) {
      await sub.unsubscribe()
      await api.delete("/notifications/subscribe")
    }
    return { ok: true }
  },

  async listMockSubscriptions() {
    return mockStore.listSubscriptions()
  },
}
