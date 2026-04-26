import { useMemo } from "react"
import { format, isToday, isYesterday } from "date-fns"
import { es } from "date-fns/locale"
import { BellRing, CheckCheck } from "lucide-react"
import { Topbar } from "@/components/layout/Topbar"
import { PageContainer } from "@/components/layout/PageContainer"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ui/empty-state"
import { AlertItem } from "@/components/alerts/AlertItem"
import { useAlerts, useMarkAlertsSeen, useUpdateAlert } from "@/hooks/useAlerts"
import { useToast } from "@/hooks/useToast"

function groupByDay(alerts) {
  const groups = { hoy: [], ayer: [], anteriores: [] }
  for (const a of alerts) {
    const d = new Date(a.generated_at)
    if (isToday(d)) groups.hoy.push(a)
    else if (isYesterday(d)) groups.ayer.push(a)
    else groups.anteriores.push(a)
  }
  return groups
}

const TAB_FILTERS = {
  todas: () => true,
  pendientes: (a) => a.status === "pendiente",
  vistas: (a) => a.status === "vista",
  descartadas: (a) => a.status === "descartada",
}

export default function Alerts() {
  const toast = useToast()
  const { data: alerts = [], isLoading } = useAlerts()
  const updateAlert = useUpdateAlert()
  const markAllSeen = useMarkAlertsSeen()

  const tabs = ["todas", "pendientes", "vistas", "descartadas"]

  const handleStatus = async (alert, status) => {
    try {
      await updateAlert.mutateAsync({ id: alert.id, status })
    } catch (err) {
      toast.error(err.message || "No fue posible actualizar la alerta.")
    }
  }

  const handleMarkAll = async () => {
    try {
      await markAllSeen.mutateAsync()
      toast.success("Todas las alertas pendientes se marcaron como vistas.")
    } catch (err) {
      toast.error(err.message || "No fue posible actualizar las alertas.")
    }
  }

  const renderList = (filter) => {
    const filtered = alerts.filter(filter)
    if (isLoading) {
      return (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      )
    }
    if (filtered.length === 0) {
      return (
        <EmptyState
          icon={BellRing}
          title="Sin alertas en esta vista"
          description="Cuando un producto se acerque a su fecha de vencimiento aparecerá aquí."
        />
      )
    }
    const groups = groupByDay(filtered)
    return (
      <div className="space-y-6">
        {groups.hoy.length > 0 ? (
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Hoy
            </h3>
            <div className="space-y-2.5">
              {groups.hoy.map((a) => (
                <AlertItem
                  key={a.id}
                  alert={a}
                  onMarkSeen={(x) => handleStatus(x, "vista")}
                  onDismiss={(x) => handleStatus(x, "descartada")}
                />
              ))}
            </div>
          </section>
        ) : null}
        {groups.ayer.length > 0 ? (
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Ayer
            </h3>
            <div className="space-y-2.5">
              {groups.ayer.map((a) => (
                <AlertItem
                  key={a.id}
                  alert={a}
                  onMarkSeen={(x) => handleStatus(x, "vista")}
                  onDismiss={(x) => handleStatus(x, "descartada")}
                />
              ))}
            </div>
          </section>
        ) : null}
        {groups.anteriores.length > 0 ? (
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Anteriores
            </h3>
            <div className="space-y-2.5">
              {groups.anteriores.map((a) => (
                <AlertItem
                  key={a.id}
                  alert={a}
                  onMarkSeen={(x) => handleStatus(x, "vista")}
                  onDismiss={(x) => handleStatus(x, "descartada")}
                />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    )
  }

  const pendingCount = useMemo(
    () => alerts.filter((a) => a.status === "pendiente").length,
    [alerts]
  )

  return (
    <>
      <Topbar
        title="Notificaciones"
        description="Revisa productos próximos a vencer o ya vencidos."
        action={
          pendingCount > 0 ? (
            <Button
              variant="outline"
              onClick={handleMarkAll}
              disabled={markAllSeen.isPending}
              className="hidden md:inline-flex"
            >
              <CheckCheck className="h-4 w-4" />
              Marcar todo como visto
            </Button>
          ) : null
        }
      />

      <PageContainer className="max-w-3xl">
        <Tabs defaultValue="todas">
          <TabsList className="w-full sm:w-auto">
            {tabs.map((t) => (
              <TabsTrigger key={t} value={t} className="capitalize flex-1 sm:flex-none">
                {t}
              </TabsTrigger>
            ))}
          </TabsList>

          {tabs.map((t) => (
            <TabsContent key={t} value={t}>
              {renderList(TAB_FILTERS[t])}
            </TabsContent>
          ))}
        </Tabs>
      </PageContainer>
    </>
  )
}
