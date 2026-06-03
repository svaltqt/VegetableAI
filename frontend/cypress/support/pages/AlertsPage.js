export const AlertsPage = {
  visit() {
    cy.visitAuthed("/alerts")
    return this
  },
  tab(name) {
    cy.contains('[role="tab"]', name).click()
    return this
  },
  markAll() {
    cy.contains("button", "Marcar todo como visto").click()
    return this
  },
}
