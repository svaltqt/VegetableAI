export const RegisterPage = {
  visit() {
    cy.visit("/register")
    return this
  },
  fill({ fullName, email, password, confirmPassword }) {
    cy.get("#fullName").clear().type(fullName)
    cy.get("#email").clear().type(email)
    cy.get("#password").clear().type(password)
    cy.get("#confirmPassword").clear().type(confirmPassword ?? password)
    return this
  },
  submit() {
    cy.contains("button", "Crear cuenta").click()
    return this
  },
}
