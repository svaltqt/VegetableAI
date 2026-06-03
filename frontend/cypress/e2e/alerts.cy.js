import { AlertsPage } from "../support/pages/AlertsPage"

describe("Módulo: Notificaciones", () => {
  beforeEach(() => {
    AlertsPage.visit()
  })

  it("lista las alertas del usuario", () => {
    cy.contains("Queso crema venció hoy").should("be.visible")
    cy.contains("Leche entera vence en 2 días").should("be.visible")
  })

  it("filtra por la pestaña de descartadas", () => {
    AlertsPage.tab("descartadas")
    cy.contains("Pan integral vence en 5 días").should("be.visible")
  })

  it("marca todas las pendientes como vistas", () => {
    AlertsPage.markAll()
    cy.contains("se marcaron como vistas").should("be.visible")
  })
})
