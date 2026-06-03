// Navegación lateral (sidebar) y acciones globales de la app.
export const AppShell = {
  // Navega usando un enlace del sidebar (visible en escritorio).
  navigate(label) {
    cy.get("aside nav").contains("a", label).click()
    return this
  },
  signOut() {
    cy.get("aside").contains("button", "Cerrar sesión").click()
    return this
  },
}
