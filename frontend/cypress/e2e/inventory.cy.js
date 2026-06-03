import { InventoryPage } from "../support/pages/InventoryPage"
import { ProductFormPage } from "../support/pages/ProductFormPage"

describe("Módulo: Inventario", () => {
  let data
  before(() => cy.fixture("products").then((d) => (data = d)))
  beforeEach(() => {
    InventoryPage.visit()
  })

  it("lista los productos del usuario", () => {
    data.existing.forEach((name) => InventoryPage.expectProduct(name))
  })

  it("filtra por nombre con el buscador", () => {
    InventoryPage.search("Leche")
    InventoryPage.expectProduct("Leche entera")
    InventoryPage.expectNoProduct("Arroz integral")
  })

  it("crea un producto nuevo con cantidad y notas", () => {
    cy.fixture("new-product").then((p) => {
      InventoryPage.goToCreate()
      cy.location("pathname").should("eq", "/inventory/new")
      ProductFormPage.fill(p).save()
      cy.location("pathname").should("eq", "/inventory")
      InventoryPage.expectProduct(p.name)
    })
  })

  it("edita un producto existente", () => {
    InventoryPage.editProduct(data.toEdit)
    cy.location("pathname").should("match", /\/inventory\/.+/)
    ProductFormPage.fillName(data.editedName).saveEdit()
    cy.location("pathname").should("eq", "/inventory")
    InventoryPage.expectProduct(data.editedName)
  })

  it("elimina un producto con confirmación", () => {
    InventoryPage.deleteProduct(data.toDelete)
    InventoryPage.expectNoProduct(data.toDelete)
  })
})
