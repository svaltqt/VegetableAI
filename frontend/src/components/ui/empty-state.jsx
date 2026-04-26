import { cn } from "@/lib/utils"

export function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center px-6 py-14 rounded-xl border border-dashed bg-muted/30",
        className
      )}
    >
      {Icon ? (
        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary mb-4">
          <Icon className="w-6 h-6" />
        </div>
      ) : null}
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      {description ? (
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}
