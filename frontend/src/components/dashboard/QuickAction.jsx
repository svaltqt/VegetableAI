import { Link } from "react-router-dom"
import { ArrowUpRight } from "lucide-react"
import { cn } from "@/lib/utils"

export function QuickAction({ to, icon: Icon, title, description, className }) {
  return (
    <Link
      to={to}
      className={cn(
        "group flex items-center gap-3 rounded-md border bg-card px-4 py-3 transition-colors hover:bg-accent/40",
        className
      )}
    >
      {Icon ? (
        <Icon className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
      ) : null}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        {description ? (
          <p className="text-xs text-muted-foreground line-clamp-1">{description}</p>
        ) : null}
      </div>
      <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-primary transition-colors" />
    </Link>
  )
}
