import { Loader2 } from "lucide-react"

export function LoadingScreen({ label = "Cargando…" }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-background text-muted-foreground">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm">{label}</p>
    </div>
  )
}
