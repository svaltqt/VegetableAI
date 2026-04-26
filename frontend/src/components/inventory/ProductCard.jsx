import { Link } from "react-router-dom"
import { faAppleWhole, faBoxOpen, faCarrot, faCheese, faCow, faEllipsis, faTrash, faPenToSquare } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { StatusBadge } from "./StatusBadge"
import { formatDateLocal } from "@/utils/dates"
import { cn } from "@/lib/utils"

const CATEGORY_ICONS = {
  envasado: faBoxOpen,
  fruta: faAppleWhole,
  verdura: faCarrot,
  lacteo: faCheese,
  carnico: faCow,
  otro: faBoxOpen,
}

const STATUS_BORDER = {
  vigente: "before:bg-status-fresh",
  proximo: "before:bg-status-warning",
  vencido: "before:bg-status-danger",
}

export function ProductCard({ product, onDelete, editTo }) {
  const icon = CATEGORY_ICONS[product.category] || faBoxOpen
  const borderClass = STATUS_BORDER[product.status] || STATUS_BORDER.vigente

  return (
    <article
      className={cn(
        "relative flex items-start gap-3 rounded-xl border bg-card p-4 shadow-sm transition-all hover:shadow-md",
        "before:absolute before:left-0 before:top-3 before:bottom-3 before:w-1 before:rounded-full",
        borderClass
      )}
    >
      <div className="ml-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
        <FontAwesomeIcon icon={icon} className="h-5 w-5" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-foreground">{product.name}</h3>
            <p className="text-xs text-muted-foreground capitalize">
              {product.category} · Vence: {formatDateLocal(product.expiration_date)}
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <FontAwesomeIcon icon={faEllipsis} />
                <span className="sr-only">Acciones</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to={editTo}>
                  <FontAwesomeIcon icon={faPenToSquare} className="h-3.5 w-3.5" />
                  Editar
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete?.(product)}
                className="text-destructive focus:text-destructive"
              >
                <FontAwesomeIcon icon={faTrash} className="h-3.5 w-3.5" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-2 flex items-center gap-2">
          <StatusBadge status={product.status} expirationDate={product.expiration_date} withDays />
          {product.quantity ? (
            <span className="text-[11px] text-muted-foreground">x{product.quantity}</span>
          ) : null}
          {product.source === "ocr" ? (
            <span className="text-[11px] uppercase tracking-wider text-primary/80">OCR</span>
          ) : null}
        </div>
      </div>
    </article>
  )
}
