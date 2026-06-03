import { api, isMockMode } from "./api"
import { delay } from "./mock-data"
import { extractExpirationFromText } from "@/utils/dates"
import { recognizeText } from "@/utils/ocr"
import { validateImageFile } from "@/utils/images"

const AI_POLL_INTERVAL = 3000
const AI_MAX_WAIT = 270000 // 4.5 min (algo más que el timeout del backend)

/**
 * OCR 100% en el navegador (Tesseract WASM). La imagen NUNCA sale del
 * dispositivo y el backend no participa en el reconocimiento.
 *
 * Devuelve la forma que consume el formulario del escáner:
 *   { success, raw_text, expiration_date (ISO yyyy-MM-dd | null), confidence }
 *
 * @param {File} file
 * @param {(m: { status: string, progress: number }) => void} [onProgress]
 */
export const ocrService = {
  async process(file, onProgress) {
    const validation = validateImageFile(file)
    if (!validation.valid) throw new Error(validation.message)

    if (isMockMode()) {
      await delay(1200)
      const text = "Caduca 15 ABR 2026"
      const chosen = extractExpirationFromText(text)
      return {
        success: Boolean(chosen),
        raw_text: text,
        expiration_date: chosen ? chosen.iso : null,
        confidence: chosen ? 0.85 : 0.2,
      }
    }

    const text = await recognizeText(file, onProgress)
    const chosen = extractExpirationFromText(text)
    return {
      success: Boolean(chosen),
      raw_text: text,
      expiration_date: chosen ? chosen.iso : null,
      confidence: chosen ? 0.85 : 0.2,
    }
  },

  /**
   * Lectura con IA (modelo de visión en el backend) en modo ASÍNCRONO: arranca
   * un trabajo, recibe un jobId y consulta el estado con peticiones cortas, así
   * la espera larga (~1-2 min) nunca tumba la conexión.
   *
   * @param {File} file
   * @param {{ signal?: AbortSignal, onTick?: (segundos: number) => void }} [opts]
   */
  async processWithAI(file, { signal, onTick } = {}) {
    const validation = validateImageFile(file)
    if (!validation.valid) throw new Error(validation.message)

    if (isMockMode()) {
      for (let s = 3; s <= 9; s += 3) {
        await delay(1000)
        onTick?.(s)
      }
      return { success: true, raw_text: "EXP 28012018 (mock IA)", expiration_date: "2018-01-28", confidence: 0.9 }
    }

    const form = new FormData()
    form.append("image", file)
    const { data } = await api.post("/ocr/ai", form, { headers: { "Content-Type": undefined }, signal })
    const jobId = data?.jobId
    if (!jobId) throw new Error("No se pudo iniciar la lectura con IA.")

    const start = Date.now()
    // eslint-disable-next-line no-constant-condition
    while (true) {
      await delay(AI_POLL_INTERVAL)
      if (signal?.aborted) throw new Error("Lectura con IA cancelada.")

      const { data: job } = await api.get(`/ocr/ai/${jobId}`, { signal })
      onTick?.(Math.round((Date.now() - start) / 1000))

      if (job.status === "done") {
        return {
          success: Boolean(job.detectedDate),
          raw_text: job.textExtracted || "",
          expiration_date: job.detectedDate || null,
          confidence: job.detectedDate ? 0.9 : 0.2,
        }
      }
      if (job.status === "error") {
        throw new Error(job.error || "La lectura con IA falló.")
      }
      if (Date.now() - start > AI_MAX_WAIT) {
        throw new Error("La lectura con IA tardó demasiado. Inténtalo de nuevo.")
      }
    }
  },
}
