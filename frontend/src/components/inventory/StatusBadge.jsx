import { Badge } from "@/components/ui/badge"
import { statusMeta } from "@/utils/status"
import { humanizeDays, daysUntil } from "@/utils/dates"

export function StatusBadge({ status, expirationDate, withDays = false, className }) {
  const meta = statusMeta[status] ?? statusMeta.vigente
  const days = expirationDate ? daysUntil(expirationDate) : null
  const text = withDays && days !== null ? humanizeDays(days) : meta.label

  return (
    <Badge variant={meta.badge} className={className}>
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-current" />
      {text}
    </Badge>
  )
}
