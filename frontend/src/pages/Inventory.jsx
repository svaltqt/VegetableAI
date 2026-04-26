import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { Plus, Search, Filter as FilterIcon, PackageX } from "lucide-react"
import { Topbar } from "@/components/layout/Topbar"
import { PageContainer } from "@/components/layout/PageContainer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ui/empty-state"
import { ProductCard } from "@/components/inventory/ProductCard"
import { ProductTable } from "@/components/inventory/ProductTable"
import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import { useDeleteProduct, useProducts } from "@/hooks/useProducts"
import { useToast } from "@/hooks/useToast"
import { useUiStore } from "@/store/ui.store"
import { PRODUCT_CATEGORIES, PRODUCT_STATUSES } from "@/config/constants"
import { ROUTES } from "@/config/routes"

export default function Inventory() {
  const toast = useToast()
  const { data: products = [], isLoading } = useProducts()
  const removeMutation = useDeleteProduct()
  const { inventoryFilters, setInventoryFilter } = useUiStore()
  const [confirm, setConfirm] = useState(null)

  const filtered = useMemo(() => {
    let items = products
    const { search, category, status, sort } = inventoryFilters
    if (search) {
      const term = search.toLowerCase()
      items = items.filter((p) => p.name.toLowerCase().includes(term))
    }
    if (category && category !== "all") {
      items = items.filter((p) => p.category === category)
    }
    if (status && status !== "all") {
      items = items.filter((p) => p.status === status)
    }
    if (sort === "name") {
      items = [...items].sort((a, b) => a.name.localeCompare(b.name))
    } else {
      items = [...items].sort(
        (a, b) =>
          new Date(a.expiration_date).getTime() - new Date(b.expiration_date).getTime()
      )
    }
    return items
  }, [products, inventoryFilters])

  const handleDelete = async () => {
    if (!confirm) return
    try {
      await removeMutation.mutateAsync(confirm.id)
      toast.success(`Producto "${confirm.name}" eliminado.`)
      setConfirm(null)
    } catch (err) {
      toast.error(err.message || "No fue posible eliminar el producto.")
    }
  }

  return (
    <>
      <Topbar
        title="Mis productos"
        description="Consulta, filtra y administra tus alimentos."
        action={
          <Button asChild className="hidden md:inline-flex">
            <Link to={ROUTES.PRODUCT_NEW}>
              <Plus className="h-4 w-4" />
              Registrar manualmente
            </Link>
          </Button>
        }
      />

      <PageContainer>
        <section className="rounded-xl border bg-card p-3 lg:p-4 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar producto…"
                value={inventoryFilters.search}
                onChange={(e) => setInventoryFilter("search", e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="grid grid-cols-2 lg:flex gap-2">
              <Select
                value={inventoryFilters.category}
                onValueChange={(v) => setInventoryFilter("category", v)}
              >
                <SelectTrigger className="w-full lg:w-44">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {PRODUCT_CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={inventoryFilters.status}
                onValueChange={(v) => setInventoryFilter("status", v)}
              >
                <SelectTrigger className="w-full lg:w-44">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  {PRODUCT_STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={inventoryFilters.sort}
                onValueChange={(v) => setInventoryFilter("sort", v)}
              >
                <SelectTrigger className="w-full lg:w-44">
                  <FilterIcon className="h-4 w-4 mr-1.5 text-muted-foreground" />
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expiration">Por fecha de vencimiento</SelectItem>
                  <SelectItem value="name">Por nombre A–Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        <Button asChild className="md:hidden w-full" size="lg">
          <Link to={ROUTES.PRODUCT_NEW}>
            <Plus className="h-4 w-4" />
            Registrar producto manualmente
          </Link>
        </Button>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={PackageX}
            title="Sin productos para mostrar"
            description="Ajusta los filtros o registra un nuevo producto desde el escáner OCR o manualmente."
            action={
              <Button asChild>
                <Link to={ROUTES.SCANNER}>Escanear producto</Link>
              </Button>
            }
          />
        ) : (
          <>
            <ProductTable
              products={filtered}
              onDelete={(p) => setConfirm(p)}
              getEditPath={(id) => ROUTES.PRODUCT_EDIT.replace(":id", id)}
            />
            <div className="grid lg:hidden gap-3">
              {filtered.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  editTo={ROUTES.PRODUCT_EDIT.replace(":id", product.id)}
                  onDelete={(p) => setConfirm(p)}
                />
              ))}
            </div>
          </>
        )}
      </PageContainer>

      <ConfirmDialog
        open={Boolean(confirm)}
        onOpenChange={(open) => !open && setConfirm(null)}
        title="Eliminar producto"
        description={
          confirm ? `Se eliminará "${confirm.name}" de tu inventario. Esta acción no se puede deshacer.` : ""
        }
        confirmLabel="Eliminar"
        destructive
        loading={removeMutation.isPending}
        onConfirm={handleDelete}
      />
    </>
  )
}
