/**
 * Comandos personalizados para autenticación con la sesión MOCK.
 *
 * En modo test (VITE_USE_MOCKS=true y Supabase sin configurar) la app guarda
 * la sesión en localStorage bajo esta clave. Sembrándola antes de cargar la
 * app, el usuario queda autenticado sin pasar por la UI de login.
 */
const MOCK_SESSION_KEY = "vegetableai-mock-session"

const buildSession = (user = {}) => ({
  access_token: "mock-token",
  user: {
    id: user.id || "mock-user-001",
    email: user.email || "demo@vegetableai.app",
    user_metadata: { full_name: user.full_name || "Juan Pérez" },
  },
})

// Visita una ruta ya autenticado (siembra la sesión antes de cargar la app).
Cypress.Commands.add("visitAuthed", (path = "/dashboard", user) => {
  cy.visit(path, {
    onBeforeLoad(win) {
      win.localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(buildSession(user)))
    },
  })
})
