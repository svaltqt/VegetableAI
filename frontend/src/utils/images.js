import { IMAGE_RULES } from "@/config/constants"

export function formatBytes(bytes) {
  if (!bytes) return "0 B"
  const units = ["B", "KB", "MB", "GB"]
  let i = 0
  let value = bytes
  while (value >= 1024 && i < units.length - 1) {
    value = value / 1024
    i += 1
  }
  return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${units[i]}`
}

export function validateImageFile(file) {
  if (!file) {
    return { valid: false, message: "No se ha seleccionado ningún archivo." }
  }
  const ext = file.name?.split(".").pop()?.toLowerCase() || ""
  const validType =
    IMAGE_RULES.acceptedTypes.includes(file.type) ||
    IMAGE_RULES.acceptedExtensions.includes(ext)

  if (!validType) {
    return {
      valid: false,
      message: `Formato no permitido. Solo se aceptan imágenes ${IMAGE_RULES.acceptedExtensions
        .join(", ")
        .toUpperCase()}.`,
    }
  }
  if (file.size > IMAGE_RULES.maxSizeBytes) {
    return {
      valid: false,
      message: `La imagen pesa ${formatBytes(file.size)} y supera el máximo permitido (${IMAGE_RULES.maxSizeLabel}).`,
    }
  }
  if (file.size === 0) {
    return { valid: false, message: "El archivo está vacío o se corrompió durante la carga." }
  }
  return { valid: true }
}

export function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error("No se pudo leer la imagen."))
    reader.readAsDataURL(file)
  })
}

export async function compressImage(file, maxWidth = 1280, quality = 0.85) {
  if (!file.type.startsWith("image/")) return file
  const dataUrl = await readFileAsDataUrl(file)
  const img = await new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = dataUrl
  })

  const ratio = img.width > maxWidth ? maxWidth / img.width : 1
  const canvas = document.createElement("canvas")
  canvas.width = img.width * ratio
  canvas.height = img.height * ratio
  const ctx = canvas.getContext("2d")
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return resolve(file)
        resolve(new File([blob], file.name.replace(/\.\w+$/, ".jpg"), { type: "image/jpeg" }))
      },
      "image/jpeg",
      quality
    )
  })
}
