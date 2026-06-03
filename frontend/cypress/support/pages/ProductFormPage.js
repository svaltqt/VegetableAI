export const ProductFormPage = {
  fillName(value) {
    cy.get("#name").clear().type(value)
    return this
  },
  selectCategory(label) {
    cy.get("#category").click()
    cy.get('[role="option"]').contains(label).click()
    return this
  },
  fillDate(value) {
    cy.get("#expirationDate").type(value)
    return this
  },
  fillQuantity(value) {
    cy.get("#quantity").clear().type(String(value))
    return this
  },
  fillNotes(value) {
    cy.get("#notes").clear().type(value)
    return this
  },
  fill(data) {
    if (data.name) this.fillName(data.name)
    if (data.category) this.selectCategory(data.category)
    if (data.expirationDate) this.fillDate(data.expirationDate)
    if (data.quantity != null && data.quantity !== "") this.fillQuantity(data.quantity)
    if (data.notes) this.fillNotes(data.notes)
    return this
  },
  save() {
    cy.contains("button", "Guardar producto").click()
    return this
  },
  saveEdit() {
    cy.contains("button", "Guardar cambios").click()
    return this
  },
}
