import { create } from "zustand"
import { authService } from "@/services/auth.service"

// Module-level guards prevent React StrictMode and remounts from triggering
// duplicate session bootstraps in development.
let initializePromise = null
let authSubscriptionAttached = false

export const useAuthStore = create((set) => ({
  session: null,
  status: "idle",

  initialize: () => {
    if (initializePromise) return initializePromise
    initializePromise = (async () => {
      set({ status: "loading" })
      try {
        const session = await authService.getSession()
        set({ session, status: "ready" })
      } catch {
        set({ session: null, status: "ready" })
      }

      if (authSubscriptionAttached) return
      authSubscriptionAttached = true
      authService.onAuthStateChange((session) => {
        set({ session: session ?? null })
      })
    })()
    return initializePromise
  },

  signIn: async (credentials) => {
    const session = await authService.signIn(credentials)
    set({ session })
    return session
  },

  signUp: async (payload) => {
    const result = await authService.signUp(payload)
    if (result.session) set({ session: result.session })
    return result
  },

  signOut: async () => {
    // Clear local state first so the UI never gets stuck if the remote
    // signOut hangs or rejects (network issue, expired token, etc.).
    set({ session: null })
    try {
      await authService.signOut()
    } catch {
      // Ignored on purpose: local session is already cleared.
    }
  },
}))

export const selectIsAuthenticated = (state) => Boolean(state.session)
