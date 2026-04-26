import { useMutation } from "@tanstack/react-query"
import { ocrService } from "@/services/ocr.service"

export function useOCR() {
  return useMutation({ mutationFn: (file) => ocrService.process(file) })
}
