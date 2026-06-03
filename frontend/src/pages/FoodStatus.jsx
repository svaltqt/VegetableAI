import { ArrowLeft } from "lucide-react"
import { Link } from "react-router-dom"
import { Topbar } from "@/components/layout/Topbar"
import { PageContainer } from "@/components/layout/PageContainer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/config/routes"
import Chat from "@/pages/Chat"

export default function FoodStatus() {
  return (
    <>
      <Topbar
        title="Estado del alimento"
        description="Consulta orientativa sobre alimentos frescos asistida por IA."
      />

      <PageContainer className="max-w-2xl">
        <Card>
          <CardContent className="p-0">
            <Chat embedded />
          </CardContent>
        </Card>

        <p className="mt-4 text-center max-w-sm mx-auto text-[11px] text-muted-foreground">
          Recuerda: cualquier estimación generada por IA será orientativa y no sustituye
          criterios sanitarios profesionales.
        </p>

        <div className="mt-4 text-center">
          <Button asChild variant="outline">
            <Link to={ROUTES.DASHBOARD}>
              <ArrowLeft className="h-4 w-4" />
              Volver al inicio
            </Link>
          </Button>
        </div>
      </PageContainer>
    </>
  )
}
