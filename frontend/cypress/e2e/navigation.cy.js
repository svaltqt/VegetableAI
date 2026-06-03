import { AppShell } from "../support/pages/AppShellPage"

describe("Flujo: Navegación entre módulos", () => {
  beforeEach(() => cy.visitAuthed("/dashboard"))

  it("navega por las secciones principales desde el menú lateral", () => {
    AppShell.navigate("Mis productos")
    cy.location("pathname").should("eq", "/inventory")

    AppShell.navigate("Notificaciones")
    cy.location("pathname").should("eq", "/alerts")

    AppShell.navigate("Estado alimento")
    cy.location("pathname").should("eq", "/food-status")

    AppShell.navigate("Perfil")
    cy.location("pathname").should("eq", "/profile")

    AppShell.navigate("Inicio")
    cy.location("pathname").should("eq", "/dashboard")
  })

  it("la sección Estado del alimento carga el asistente", () => {
    cy.visitAuthed("/food-status")
    cy.contains("Vege").should("be.visible")
    cy.contains("¿Qué productos están por vencerse?").should("be.visible")
  })
})
