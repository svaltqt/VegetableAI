import { Link } from "react-router-dom"
import { BrandMark } from "@/components/brand/Logo"
import { cn } from "@/lib/utils"

const YEAR = new Date().getFullYear()

export function Footer({ className, variant = "app" }) {
  if (variant === "minimal") {
    return (
      <footer
        className={cn(
          "px-5 py-5 text-center text-[11px] leading-relaxed text-muted-foreground",
          className
        )}
      >
        <p>
          © {YEAR} VegetableAI · Todos los derechos reservados.
        </p>
        <p className="mt-0.5">
          Trabajo académico — Politécnico Colombiano Jaime Isaza Cadavid.
        </p>
      </footer>
    )
  }

  return (
    <footer
      className={cn(
        "mt-auto border-t bg-card/40",
        className
      )}
    >
      <div className="mx-auto w-full max-w-6xl px-4 lg:px-8 py-7 grid gap-6 sm:grid-cols-[auto_1fr_auto] sm:items-start">
        <div className="flex items-start gap-3">
          <BrandMark size={42} className="shrink-0" />
          <div>
            <p className="text-sm font-semibold text-foreground">VegetableAI</p>
            <p className="text-xs text-muted-foreground">
              Cosecha datos organizados, no desperdicio de cocina.
            </p>
          </div>
        </div>

        <div className="text-xs text-muted-foreground sm:border-l sm:pl-6 space-y-1">
          <p>
            Proyecto académico desarrollado por estudiantes del{" "}
            <span className="font-medium text-foreground">
              Politécnico Colombiano Jaime Isaza Cadavid
            </span>.
          </p>
          <p>
            Las imágenes y datos cargados se utilizan exclusivamente con fines del
            sistema. Las estimaciones generadas por IA son orientativas y no
            sustituyen criterios sanitarios profesionales.
          </p>
        </div>

        <div className="flex flex-col items-start sm:items-end gap-1.5 text-xs text-muted-foreground">
          <p>© {YEAR} VegetableAI</p>
          <p>Todos los derechos reservados.</p>
          <div className="flex gap-3 mt-1.5">
            <Link to="/profile" className="hover:text-foreground">
              Privacidad
            </Link>
            <span aria-hidden>·</span>
            <Link to="/profile" className="hover:text-foreground">
              Términos
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
