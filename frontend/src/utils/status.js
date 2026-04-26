import { STATUS_THRESHOLD_DAYS } from "@/config/constants"
import { daysUntil } from "./dates"

export function computeStatus(expirationDate, threshold = STATUS_THRESHOLD_DAYS) {
  const days = daysUntil(expirationDate)
  if (days === null) return "vigente"
  if (days < 0) return "vencido"
  if (days <= threshold) return "proximo"
  return "vigente"
}

export const statusMeta = {
  vigente: {
    label: "Vigente",
    badge: "fresh",
    description: "El producto está dentro de su periodo de consumo seguro.",
  },
  proximo: {
    label: "Próximo",
    badge: "warning",
    description: "El producto está cerca de su fecha de vencimiento.",
  },
  vencido: {
    label: "Vencido",
    badge: "danger",
    description: "El producto ha superado su fecha de vencimiento.",
  },
}
