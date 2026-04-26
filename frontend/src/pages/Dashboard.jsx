import { Link } from "react-router-dom"
import { ScanLine, PencilLine, Bell, Sparkles, Plus, ChevronRight } from "lucide-react"
import { Topbar } from "@/components/layout/Topbar"
import { PageContainer } from "@/components/layout/PageContainer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { StatCard } from "@/components/dashboard/StatCard"
import { QuickAction } from "@/components/dashboard/QuickAction"
import { StatusBadge } from "@/components/inventory/StatusBadge"
import { useAuthStore } from "@/store/auth.store"
import { useInventorySummary, useProducts } from "@/hooks/useProducts"
import { useAlerts } from "@/hooks/useAlerts"
import { ROUTES } from "@/config/routes"
import { formatDateLocal, humanizeDays, daysUntil } from "@/utils/dates"

export default function Dashboard() {
  const profile = useAuthStore((s) => s.profile)
  const { data: products = [], isLoading: loadingProducts } = useProducts()
  const { data: summary, isLoading: loadingSummary } = useInventorySummary()
  const { data: alerts = [] } = useAlerts()

  const upcoming = products
    .filter((p) => p.status !== "vigente")
    .slice(0, 5)

  const recentAlerts = alerts.slice(0, 3)

  const greetName = profile?.full_name?.split(" ")[0] || "Usuario"

  return (
    <>
      <Topbar
        title={`Bienvenido, ${greetName}`}
        description="Aquí tienes el resumen de tu inventario."
        action={
          <Button asChild className="hidden md:inline-flex">
            <Link to={ROUTES.SCANNER}>
              <ScanLine className="h-4 w-4" />
              Escanear producto
            </Link>
          </Button>
        }
      />

      <PageContainer>
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          {loadingSummary ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
          ) : (
            <>
              <StatCard label="Total productos" value={summary?.total ?? 0} />
              <StatCard label="Vigentes" value={summary?.vigente ?? 0} tone="fresh" />
              <StatCard label="Próximos a vencer" value={summary?.proximo ?? 0} tone="warning" />
              <StatCard label="Vencidos" value={summary?.vencido ?? 0} tone="danger" />
            </>
          )}
        </section>

        <section className="grid lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2">
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-base">Alertas recientes</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Productos próximos a vencer o ya vencidos.
                </p>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link to={ROUTES.INVENTORY}>
                  Ver todo <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {loadingProducts ? (
                <Skeleton className="h-32 w-full rounded-lg" />
              ) : upcoming.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">
                  No hay productos en zona crítica. ¡Buen trabajo!
                </p>
              ) : (
                upcoming.map((p) => {
                  const days = daysUntil(p.expiration_date)
                  const tone =
                    p.status === "vencido"
                      ? "border-status-danger/30 bg-status-danger-bg/60 text-status-danger"
                      : p.status === "proximo"
                      ? "border-status-warning/30 bg-status-warning-bg/60 text-status-warning"
                      : "border-status-fresh/30 bg-status-fresh-bg/60 text-status-fresh"
                  return (
                    <div
                      key={p.id}
                      className={`rounded-xl border p-3.5 flex items-start justify-between gap-3 ${tone}`}
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate text-foreground">
                          {p.name}
                        </p>
                        <p className="text-xs opacity-90">
                          {humanizeDays(days)} — {formatDateLocal(p.expiration_date)}
                        </p>
                      </div>
                      <StatusBadge status={p.status} className="bg-card/40" />
                    </div>
                  )
                })
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Acceso rápido</CardTitle>
              <p className="text-xs text-muted-foreground">
                Las acciones más frecuentes.
              </p>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-2">
              <QuickAction
                to={ROUTES.SCANNER}
                icon={ScanLine}
                title="Escanear fecha"
                description="Usar cámara u OCR"
              />
              <QuickAction
                to={ROUTES.PRODUCT_NEW}
                icon={Plus}
                title="Agregar manual"
                description="Registrar producto"
              />
              <QuickAction
                to={ROUTES.FOOD_STATUS}
                icon={Sparkles}
                title="Estado alimento"
                description="Consultar con IA"
              />
              <QuickAction
                to={ROUTES.INVENTORY}
                icon={PencilLine}
                title="Ver productos"
                description="Lista completa"
              />
              <QuickAction
                to={ROUTES.ALERTS}
                icon={Bell}
                title="Notificaciones"
                description={`${recentAlerts.length} recientes`}
              />
            </CardContent>
          </Card>
        </section>
      </PageContainer>
    </>
  )
}
