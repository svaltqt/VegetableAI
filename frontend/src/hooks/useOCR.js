import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { ocrService } from "@/services/ocr.service"

/**
 * Ejecuta el OCR en el navegador y expone el progreso (0-100) del
 * reconocimiento para mostrarlo en la UI.
 */
export function useOCR() {
  const [progress, setProgress] = useState(0)

  const mutation = useMutation({
    mutationFn: (file) => ocrService.process(file, (percent) => setProgress(percent)),
    onMutate: () => setProgress(0),
  })

  return Object.assign(mutation, { progress })
}
