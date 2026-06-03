describe("Módulo: Dashboard", () => {
  beforeEach(() => cy.visitAuthed("/dashboard"))

  it("muestra el saludo y las tarjetas de resumen", () => {
    cy.contains("Bienvenido,").should("be.visible")
    cy.contains("Total productos").should("be.visible")
    cy.contains("Vigentes").should("be.visible")
    cy.contains("Próximos a vencer").should("be.visible")
    cy.contains("Vencidos").should("be.visible")
  })

  it("lista los productos en zona crítica", () => {
    cy.contains("Alertas recientes").should("be.visible")
    cy.contains("Queso crema").should("be.visible") // vencido en los mocks
  })

  it("ofrece accesos rápidos a las secciones", () => {
    cy.contains("Acceso rápido").should("be.visible")
    cy.contains("Escanear fecha").should("be.visible")
    cy.contains("Estado alimento").should("be.visible")
  })
})
