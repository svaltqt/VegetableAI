import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, Loader2 } from "lucide-react"
import { AuthLayout } from "@/components/layout/AuthLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authService } from "@/services/auth.service"
import { supabase } from "@/supabaseClient"
import { useToast } from "@/hooks/useToast"
import { resetPasswordSchema } from "@/utils/validation"
import { ROUTES } from "@/config/routes"

export default function ResetPassword() {
  const navigate = useNavigate()
  const toast = useToast()
  const [hasRecoverySession, setHasRecoverySession] = useState(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  })

  useEffect(() => {
    let cancelled = false

    // Supabase parses the hash automatically when detectSessionInUrl is on
    // and emits PASSWORD_RECOVERY. We listen for that event and also poll
    // getSession as a fallback for direct link visits.
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
        setHasRecoverySession(true)
      }
    })

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return
      setHasRecoverySession((prev) => prev ?? Boolean(session))
    })

    return () => {
      cancelled = true
      data?.subscription?.unsubscribe?.()
    }
  }, [])

  const onSubmit = async ({ password }) => {
    try {
      await authService.resetPassword(password)
      toast.success("Contraseña actualizada. Inicia sesión con la nueva contraseña.")
      navigate(ROUTES.LOGIN, { replace: true })
    } catch (err) {
      toast.error(err.message || "No fue posible actualizar la contraseña.")
    }
  }

  return (
    <AuthLayout>
      <Card className="border-0 shadow-xl ring-1 ring-border/60">
        <CardHeader>
          <Button asChild variant="ghost" size="sm" className="self-start -ml-2 mb-2 text-muted-foreground">
            <Link to={ROUTES.LOGIN}>
              <ArrowLeft className="h-4 w-4" />
              Volver al inicio de sesión
            </Link>
          </Button>
          <CardTitle className="text-2xl">Establecer nueva contraseña</CardTitle>
          <CardDescription>
            Ingresa la nueva contraseña para tu cuenta. Debe tener al menos 8 caracteres,
            una mayúscula y un número.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {hasRecoverySession === false ? (
            <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              Este enlace de recuperación no es válido o ha expirado. Solicita uno nuevo desde
              "Olvidé mi contraseña".
            </p>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="password">Nueva contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  {...register("password")}
                />
                {errors.password ? (
                  <p className="text-xs text-destructive">{errors.password.message}</p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  {...register("confirmPassword")}
                />
                {errors.confirmPassword ? (
                  <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
                ) : null}
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={isSubmitting || hasRecoverySession === null}
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Guardar nueva contraseña
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
