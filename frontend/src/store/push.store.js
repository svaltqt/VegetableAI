import { create } from "zustand"
import { notificationsService } from "@/services/notifications.service"

export const usePushStore = create((set, get) => ({
  permission: typeof Notification !== "undefined" ? Notification.permission : "default",
  isSubscribed: false,
  loading: false,
  error: null,

  refresh: () => {
    if (typeof Notification === "undefined") return
    set({ permission: Notification.permission })
  },

  enable: async () => {
    set({ loading: true, error: null })
    try {
      await notificationsService.subscribe()
      set({ isSubscribed: true, permission: "granted", loading: false })
    } catch (err) {
      set({ loading: false, error: err.message || "No fue posible activar las notificaciones." })
      throw err
    }
  },

  disable: async () => {
    set({ loading: true, error: null })
    try {
      await notificationsService.unsubscribe()
      set({ isSubscribed: false, loading: false })
    } catch (err) {
      set({ loading: false, error: err.message || "No fue posible desactivar las notificaciones." })
      throw err
    }
  },
}))
