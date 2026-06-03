export const ScannerPage = {
  visit() {
    cy.visitAuthed("/scanner")
    return this
  },
  uploadFixture(fixture = "producto-fecha.png") {
    cy.get('input[type="file"]').selectFile(`cypress/fixtures/${fixture}`, { force: true })
    return this
  },
  fillName(value) {
    cy.get("#ocr-name").clear().type(value)
    return this
  },
  selectCategory(label) {
    cy.get("#ocr-category").click()
    cy.get('[role="option"]').contains(label).click()
    return this
  },
  save() {
    cy.contains("button", "Confirmar y guardar").click()
    return this
  },
}
