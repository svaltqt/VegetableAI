import { createWorker, PSM } from "tesseract.js"
import { readFileAsDataUrl } from "@/utils/images"

/**
 * OCR del lado del CLIENTE (navegador, WASM). La imagen nunca sale del
 * dispositivo y el backend no interviene en el reconocimiento.
 *
 * El worker se crea una sola vez y se reutiliza (la primera llamada descarga
 * los modelos spa+eng desde el CDN y los cachea; las siguientes son rápidas).
 */
let workerPromise = null
let progressCb = null

async function getWorker() {
  if (!workerPromise) {
    workerPromise = (async () => {
      return await createWorker("spa+eng", 1, {
        logger: (m) => progressCb?.(m),
      })
    })()
  }
  return workerPromise
}

/**
 * Pre-procesa la imagen en un <canvas>: reescala (agranda las pequeñas),
 * pasa a escala de grises y sube el contraste. Mejora mucho la lectura de
 * etiquetas y sellos. Si algo falla, se devuelve null y se usa el archivo tal cual.
 */
async function preprocess(file) {
  try {
    const dataUrl = await readFileAsDataUrl(file)
    const img = await new Promise((resolve, reject) => {
      const image = new Image()
      image.onload = () => resolve(image)
      image.onerror = reject
      image.src = dataUrl
    })

    const targetW = img.width < 1200 ? 1500 : Math.min(img.width, 2000)
    const ratio = targetW / img.width
    const canvas = document.createElement("canvas")
    canvas.width = Math.round(img.width * ratio)
    canvas.height = Math.round(img.height * ratio)
    const ctx = canvas.getContext("2d")
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const d = imageData.data
    for (let i = 0; i < d.length; i += 4) {
      const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]
      const contrasted = Math.min(255, Math.max(0, (gray - 128) * 1.4 + 128))
      d[i] = d[i + 1] = d[i + 2] = contrasted
    }
    ctx.putImageData(imageData, 0, 0)
    return canvas
  } catch {
    return null
  }
}

/**
 * Reconoce el texto de una imagen en el navegador.
 * @param {File|Blob} file
 * @param {(m: { status: string, progress: number }) => void} [onProgress]
 * @returns {Promise<string>}
 */
/**
 * Reconoce el texto de una imagen en el navegador.
 * @param {File|Blob} file
 * @param {(percent: number) => void} [onProgress] - Progreso 0-100, continuo.
 * @returns {Promise<string>}
 */
export async function recognizeText(file, onProgress) {
  const passes = [PSM.SINGLE_BLOCK, PSM.SPARSE_TEXT]
  const span = 1 / passes.length
  let base = 0
  // Escalamos el progreso de cada pasada a una sola barra continua 0-100,
  // así no llega a 100 y "reinicia" entre pasadas.
  progressCb = (m) => {
    if (m?.status === "recognizing text" && typeof m.progress === "number") {
      onProgress?.(Math.min(100, Math.round((base + m.progress * span) * 100)))
    }
  }
  try {
    const worker = await getWorker()
    const source = (await preprocess(file)) || file
    let combined = ""
    for (let i = 0; i < passes.length; i++) {
      base = i * span
      await worker.setParameters({ tessedit_pageseg_mode: passes[i] })
      const { data } = await worker.recognize(source)
      if (data?.text) combined += data.text + "\n"
    }
    onProgress?.(100)
    return combined
  } finally {
    progressCb = null
  }
}
