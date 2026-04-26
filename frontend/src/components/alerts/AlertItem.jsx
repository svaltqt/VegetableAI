import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const TYPE_STYLES = {
  vencido: "bg-status-danger-bg text-status-danger border-status-danger/30",
  proximo_1: "bg-status-warning-bg text-status-warning border-status-warning/30",
  proximo_2: "bg-status-warning-bg text-status-warning border-status-warning/30",
  proximo_3: "bg-status-warning-bg text-status-warning border-status-warning/30",
  proximo_5: "bg-status-fresh-bg text-status-fresh border-status-fresh/30",
  proximo_7: "bg-status-fresh-bg text-status-fresh border-status-fresh/30",
}

export function AlertItem({ alert, onMarkSeen, onDismiss }) {
  const tone = TYPE_STYLES[alert.type] || "bg-muted text-muted-foreground border-border"
  const isPending = alert.status === "pendiente"
  const isDismissed = alert.status === "descartada"

  return (
    <article
      className={cn(
        "relative rounded-xl border p-4 transition-all",
        tone,
        isDismissed && "opacity-60"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider opacity-80">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-current" />
            <span>{format(new Date(alert.generated_at), "HH:mm", { locale: es })}</span>
          </div>
          <h3 className="mt-1 text-sm font-semibold">{alert.message.split(" ").slice(0, 3).join(" ")}</h3>
          <p className="text-xs opacity-90">{alert.message}</p>
        </div>

        {isPending ? (
          <div className="flex shrink-0 gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              aria-label="Marcar como vista"
              onClick={() => onMarkSeen?.(alert)}
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              aria-label="Descartar"
              onClick={() => onDismiss?.(alert)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <span className="text-[11px] uppercase tracking-wider opacity-80">
            {alert.status}
          </span>
        )}
      </div>
    </article>
  )
}
