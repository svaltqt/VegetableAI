import { api, isMockMode } from "./api"
import { delay } from "./mock-data"
import { extractDateFromText, formatDateISO, parseDateInput } from "@/utils/dates"
import { validateImageFile } from "@/utils/images"

/**
 * Esquema real del backend (POST /api/ocr, multipart/form-data, campo "image"):
 *   { success: true, textExtracted: string, detectedDate: string | null }
 *
 * `detectedDate` es el match crudo de la RegEx (ej. "12/04/2026" o "11 OCT 2017").
 * Aquí lo parseamos a ISO `yyyy-MM-dd` para alimentar el `<input type="date">`.
 */

function normalizeOcrResponse(raw) {
  const text = raw?.textExtracted || raw?.raw_text || ""
  const rawDate = raw?.detectedDate || raw?.expiration_date || null
  let parsed = null
  if (rawDate) {
    parsed = parseDateInput(rawDate) || extractDateFromText(rawDate) || extractDateFromText(text)
  } else if (text) {
    parsed = extractDateFromText(text)
  }
  return {
    success: Boolean(parsed),
    raw_text: text,
    expiration_date: parsed ? formatDateISO(parsed) : null,
    confidence: parsed ? 0.85 : 0.2,
  }
}

export const ocrService = {
  async process(file) {
    const validation = validateImageFile(file)
    if (!validation.valid) throw new Error(validation.message)

    if (isMockMode()) {
      await delay(1500)
      const seedTexts = [
        "Consumir antes de 12/04/2026",
        "VENCE 30/06/2026",
        "BEST BEFORE 2026-08-15",
        "Caduca 15 ABR 2026",
      ]
      const sampleText = seedTexts[Math.floor(Math.random() * seedTexts.length)]
      return normalizeOcrResponse({ success: true, textExtracted: sampleText, detectedDate: sampleText })
    }

    const form = new FormData()
    form.append("image", file)
    const { data } = await api.post("/ocr", form, {
      headers: { "Content-Type": undefined },
      timeout: 30000,
    })
    return normalizeOcrResponse(data)
  },
}
