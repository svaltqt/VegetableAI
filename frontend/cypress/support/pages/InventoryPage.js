export const InventoryPage = {
  visit() {
    cy.visitAuthed("/inventory")
    return this
  },
  search(term) {
    cy.get('input[placeholder^="Buscar producto"]').clear().type(term)
    return this
  },
  goToCreate() {
    cy.contains("a", "Registrar manualmente").click()
    return this
  },
  row(name) {
    return cy.contains("td", name).parents("tr")
  },
  expectProduct(name) {
    cy.contains("td", name).should("be.visible")
    return this
  },
  expectNoProduct(name) {
    cy.contains("td", name).should("not.exist")
    return this
  },
  editProduct(name) {
    this.row(name).find('a[aria-label="Editar producto"]').click()
    return this
  },
  deleteProduct(name) {
    this.row(name).find('button[aria-label="Eliminar producto"]').click()
    cy.get('[role="dialog"]').contains("button", "Eliminar").click()
    return this
  },
}
