import { Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, Loader2 } from "lucide-react"
import { AuthLayout } from "@/components/layout/AuthLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authService } from "@/services/auth.service"
import { useToast } from "@/hooks/useToast"
import { forgotPasswordSchema } from "@/utils/validation"
import { ROUTES } from "@/config/routes"

export default function ForgotPassword() {
  const toast = useToast()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  })

  const onSubmit = async (data) => {
    try {
      await authService.forgotPassword(data.email)
      toast.success("Si la cuenta existe, hemos enviado un enlace de recuperación.")
    } catch (err) {
      toast.error(err.message || "No fue posible procesar la solicitud.")
    }
  }

  return (
    <AuthLayout>
      <Card className="border-0 shadow-xl ring-1 ring-border/60">
        <CardHeader>
          <Button asChild variant="ghost" size="sm" className="self-start -ml-2 mb-2 text-muted-foreground">
            <Link to={ROUTES.LOGIN}>
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Link>
          </Button>
          <CardTitle className="text-2xl">Recuperar contraseña</CardTitle>
          <CardDescription>
            Ingresa el correo asociado a tu cuenta y te enviaremos un enlace para restablecer la
            contraseña. El enlace tendrá vigencia de 60 minutos.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="usuario@correo.com"
                {...register("email")}
              />
              {errors.email ? (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              ) : null}
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Enviar enlace de recuperación
            </Button>

            {isSubmitSuccessful ? (
              <p className="rounded-lg border border-status-fresh/30 bg-status-fresh-bg/60 px-3 py-2 text-sm text-status-fresh">
                Revisa tu bandeja de entrada y la carpeta de spam.
              </p>
            ) : null}
          </form>
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
