export const ForgotPasswordPage = {
  visit() {
    cy.visit("/forgot-password")
    return this
  },
  fillEmail(value) {
    cy.get("#email").clear().type(value)
    return this
  },
  submit() {
    cy.contains("button", "Enviar enlace de recuperación").click()
    return this
  },
}
