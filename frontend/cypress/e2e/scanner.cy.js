import { ScannerPage } from "../support/pages/ScannerPage"
import { InventoryPage } from "../support/pages/InventoryPage"

describe("Módulo: Escáner OCR", () => {
  let ocr
  before(() => cy.fixture("ocr").then((o) => (ocr = o)))
  beforeEach(() => {
    ScannerPage.visit()
  })

  it("muestra las opciones de captura", () => {
    cy.contains("button", "Usar cámara").should("be.visible")
    cy.contains("button", "Cargar archivo").should("be.visible")
  })

  it("detecta la fecha al subir una imagen (OCR mock)", () => {
    ScannerPage.uploadFixture()
    cy.contains("Fecha detectada", { timeout: 15000 }).should("be.visible")
    cy.get("#ocr-date").should("have.value", ocr.expectedDate)
  })

  it("guarda en el inventario el producto detectado", () => {
    ScannerPage.uploadFixture()
    cy.get("#ocr-date", { timeout: 15000 }).should("have.value", ocr.expectedDate)
    ScannerPage.fillName(ocr.scannedName)
    ScannerPage.selectCategory(ocr.scannedCategory)
    ScannerPage.save()
    cy.location("pathname").should("eq", "/inventory")
    InventoryPage.expectProduct(ocr.scannedName)
  })
})
