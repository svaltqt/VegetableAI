import { Link } from "react-router-dom"
import { Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "./StatusBadge"
import { formatDateLocal } from "@/utils/dates"

export function ProductTable({ products = [], onDelete, getEditPath }) {
  if (products.length === 0) {
    return null
  }

  return (
    <div className="hidden lg:block overflow-hidden rounded-xl border bg-card shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted/50 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-5 py-3">Producto</th>
            <th className="px-5 py-3">Categoría</th>
            <th className="px-5 py-3">Vencimiento</th>
            <th className="px-5 py-3">Estado</th>
            <th className="px-5 py-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {products.map((p) => (
            <tr key={p.id} className="hover:bg-muted/30 transition-colors">
              <td className="px-5 py-3.5">
                <p className="font-medium text-foreground">{p.name}</p>
                {p.notes ? (
                  <p className="text-xs text-muted-foreground line-clamp-1">{p.notes}</p>
                ) : null}
              </td>
              <td className="px-5 py-3.5 capitalize text-muted-foreground">{p.category}</td>
              <td className="px-5 py-3.5 text-muted-foreground">{formatDateLocal(p.expiration_date)}</td>
              <td className="px-5 py-3.5">
                <StatusBadge status={p.status} />
              </td>
              <td className="px-5 py-3.5">
                <div className="flex justify-end gap-1">
                  <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                    <Link to={getEditPath(p.id)} aria-label="Editar producto">
                      <Pencil className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => onDelete?.(p)}
                    aria-label="Eliminar producto"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
