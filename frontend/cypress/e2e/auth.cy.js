import { LoginPage } from "../support/pages/LoginPage"
import { RegisterPage } from "../support/pages/RegisterPage"
import { ForgotPasswordPage } from "../support/pages/ForgotPasswordPage"
import { AppShell } from "../support/pages/AppShellPage"

describe("Módulo: Autenticación", () => {
  let users
  before(() => cy.fixture("users").then((u) => (users = u)))

  it("protege las rutas privadas redirigiendo a login", () => {
    cy.visit("/inventory")
    cy.location("pathname").should("eq", "/login")
    cy.contains("Bienvenido a VegetableAI").should("be.visible")
  })

  it("exige el correo en el login (validación)", () => {
    // Correo vacío: pasa la validación nativa de type=email pero falla en zod,
    // que muestra el mensaje de la app.
    LoginPage.visit().fillPassword("x").submit()
    cy.contains("Correo electrónico inválido").should("be.visible")
    cy.location("pathname").should("eq", "/login")
  })

  it("inicia sesión y entra al dashboard", () => {
    LoginPage.visit().login(users.valid.email, users.valid.password)
    cy.location("pathname").should("eq", "/dashboard")
    cy.contains("Bienvenido,").should("be.visible")
  })

  it("registra una cuenta nueva y entra (mock)", () => {
    RegisterPage.visit().fill(users.newAccount).submit()
    cy.location("pathname").should("eq", "/dashboard")
  })

  it("solicita la recuperación de contraseña", () => {
    ForgotPasswordPage.visit().fillEmail(users.valid.email).submit()
    cy.contains("Revisa tu bandeja de entrada").should("be.visible")
  })

  it("cierra sesión y vuelve a login", () => {
    cy.visitAuthed("/dashboard")
    AppShell.signOut()
    cy.location("pathname").should("eq", "/login")
  })
})
