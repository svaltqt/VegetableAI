export const LoginPage = {
  visit() {
    cy.visit("/login")
    return this
  },
  fillEmail(value) {
    cy.get("#email").clear().type(value)
    return this
  },
  fillPassword(value) {
    cy.get("#password").clear().type(value)
    return this
  },
  submit() {
    cy.contains("button", "Iniciar sesión").click()
    return this
  },
  login(email, password) {
    if (email) this.fillEmail(email)
    if (password) this.fillPassword(password)
    return this.submit()
  },
}
