import { create } from "zustand"
import { authService } from "@/services/auth.service"
import { usersService } from "@/services/users.service"

export const useAuthStore = create((set, get) => ({
  session: null,
  profile: null,
  status: "idle",

  initialize: async () => {
    set({ status: "loading" })
    try {
      const session = await authService.getSession()
      let profile = null
      if (session) {
        try {
          profile = await usersService.me()
        } catch {
          profile = null
        }
      }
      set({ session, profile, status: "ready" })
    } catch {
      set({ session: null, profile: null, status: "ready" })
    }

    authService.onAuthStateChange(async (session) => {
      if (!session) {
        set({ session: null, profile: null })
        return
      }
      let profile = null
      try {
        profile = await usersService.me()
      } catch {}
      set({ session, profile })
    })
  },

  signIn: async (credentials) => {
    const session = await authService.signIn(credentials)
    let profile = null
    try {
      profile = await usersService.me()
    } catch {}
    set({ session, profile })
    return session
  },

  signUp: async (payload) => {
    const result = await authService.signUp(payload)
    if (result.session) {
      let profile = null
      try {
        profile = await usersService.me()
      } catch {}
      set({ session: result.session, profile })
    }
    return result
  },

  signOut: async () => {
    await authService.signOut()
    set({ session: null, profile: null })
  },

  refreshProfile: async () => {
    const profile = await usersService.me()
    set({ profile })
    return profile
  },

  setProfile: (profile) => set({ profile }),
}))

export const selectIsAuthenticated = (state) => Boolean(state.session)
