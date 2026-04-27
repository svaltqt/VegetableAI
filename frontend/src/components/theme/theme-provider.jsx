import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { useProfile, useUpdateProfile } from "@/hooks/useProfile"

const STORAGE_KEY = "vegetableai-theme"

const ThemeProviderContext = createContext({
  theme: "light",
  setTheme: () => null,
})

export function ThemeProvider({ children, defaultTheme = "light" }) {
  const { data: profile } = useProfile()
  const updateProfile = useUpdateProfile()

  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return defaultTheme
    return localStorage.getItem(STORAGE_KEY) || defaultTheme
  })

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove("light", "dark")

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      root.classList.add(systemTheme)
      return
    }

    root.classList.add(theme)
  }, [theme])

  // Hydrate theme from the authenticated profile when it loads/changes.
  useEffect(() => {
    const remoteTheme = profile?.preferences?.theme
    if (remoteTheme) {
      setTheme((prev) => (prev === remoteTheme ? prev : remoteTheme))
      localStorage.setItem(STORAGE_KEY, remoteTheme)
    }
  }, [profile?.id, profile?.preferences?.theme])

  /**
   * Updates the active theme: paints the UI immediately, mirrors it in
   * localStorage, and persists it to the backend when the user is logged in.
   *
   * @param {"light" | "dark" | "system"} next
   */
  const applyTheme = useCallback(
    async (next) => {
      localStorage.setItem(STORAGE_KEY, next)
      setTheme(next)

      if (!profile?.id) return
      try {
        await updateProfile.mutateAsync({
          preferences: { ...profile.preferences, theme: next },
        })
      } catch {
        // Persistence failure is non-blocking: local state already changed.
      }
    },
    [profile, updateProfile]
  )

  const value = useMemo(() => ({ theme, setTheme: applyTheme }), [theme, applyTheme])

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)
  if (!context) throw new Error("useTheme must be used within ThemeProvider")
  return context
}
