import { Link } from "react-router-dom"
import { Bell } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import { useAlerts } from "@/hooks/useAlerts"
import { useAuthStore } from "@/store/auth.store"
import { getInitials } from "@/utils/initials"
import { ROUTES } from "@/config/routes"
import { cn } from "@/lib/utils"

export function Topbar({ title, description, action, className }) {
  const profile = useAuthStore((s) => s.profile)
  const { data: alerts = [] } = useAlerts()
  const pending = alerts.filter((a) => a.status === "pendiente").length

  return (
    <header className={cn("flex items-start gap-4 justify-between px-4 lg:px-8 py-5 lg:py-7 border-b bg-background/80 backdrop-blur sticky top-0 z-30", className)}>
      <div className="min-w-0">
        <h1 className="text-xl lg:text-2xl font-bold text-foreground tracking-tight">{title}</h1>
        {description ? (
          <p className="mt-0.5 text-sm text-muted-foreground line-clamp-2">{description}</p>
        ) : null}
      </div>

      <div className="flex items-center gap-2">
        {action}
        <ThemeToggle className="hidden lg:inline-flex" />
        <Button asChild variant="ghost" size="icon" className="relative">
          <Link to={ROUTES.ALERTS} aria-label="Ver alertas">
            <Bell className="h-5 w-5" />
            {pending > 0 ? (
              <Badge
                variant="destructive"
                className="absolute -right-1 -top-1 h-5 min-w-5 justify-center rounded-full px-1 text-[10px]"
              >
                {pending}
              </Badge>
            ) : null}
          </Link>
        </Button>
        <Link to={ROUTES.PROFILE} className="hidden sm:block">
          <Avatar className="h-9 w-9 ring-2 ring-background hover:ring-primary/40 transition">
            {profile?.avatar_url ? <AvatarImage src={profile.avatar_url} alt="Avatar" /> : null}
            <AvatarFallback>{getInitials(profile?.full_name)}</AvatarFallback>
          </Avatar>
        </Link>
      </div>
    </header>
  )
}
