import { cn } from "@/lib/utils"

const TONES = {
  default: "bg-card",
  fresh: "bg-status-fresh-bg/70 border-status-fresh/15",
  warning: "bg-status-warning-bg/70 border-status-warning/15",
  danger: "bg-status-danger-bg/70 border-status-danger/15",
}

const ACCENTS = {
  default: "text-foreground",
  fresh: "text-status-fresh",
  warning: "text-status-warning",
  danger: "text-status-danger",
}

export function StatCard({ label, value, hint, tone = "default", className }) {
  return (
    <div className={cn("rounded-md border p-4 lg:p-5", TONES[tone], className)}>
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className={cn("mt-2 text-3xl font-semibold tabular-nums", ACCENTS[tone])}>
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  )
}
