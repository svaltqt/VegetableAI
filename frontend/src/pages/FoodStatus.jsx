import { Hammer, Sparkles, ArrowLeft } from "lucide-react"
import { Link } from "react-router-dom"
import { Topbar } from "@/components/layout/Topbar"
import { PageContainer } from "@/components/layout/PageContainer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/config/routes"

export default function FoodStatus() {
  return (
    <>
      <Topbar
        title="Estado del alimento"
        description="Consulta orientativa sobre alimentos frescos asistida por IA."
      />

      <PageContainer className="max-w-2xl">
        <Card className="border-dashed">
          <CardContent className="py-14 flex flex-col items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Hammer className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-semibold tracking-tight">
              Módulo en construcción
            </h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Estamos preparando esta funcionalidad para que puedas consultar el estado
              estimado de tus alimentos frescos a partir de su nombre o de una fotografía.
              Mientras tanto, puedes seguir registrando productos y recibiendo alertas
              automáticas de vencimiento.
            </p>

            <div className="mt-6 grid sm:grid-cols-2 gap-2 w-full max-w-md text-left">
              <div className="rounded-lg border bg-secondary/40 p-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Próximamente
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Consulta el estado estimado y recomendaciones de almacenamiento.
                </p>
              </div>
              <div className="rounded-lg border bg-secondary/40 p-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Análisis por foto
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Identificación de madurez o deterioro mediante imagen.
                </p>
              </div>
            </div>

            <p className="mt-6 max-w-sm text-[11px] text-muted-foreground">
              Recuerda: cualquier estimación generada por IA será orientativa y no sustituye
              criterios sanitarios profesionales.
            </p>

            <Button asChild variant="outline" className="mt-6">
              <Link to={ROUTES.DASHBOARD}>
                <ArrowLeft className="h-4 w-4" />
                Volver al inicio
              </Link>
            </Button>
          </CardContent>
        </Card>
      </PageContainer>
    </>
  )
}
