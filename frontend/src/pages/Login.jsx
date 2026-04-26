import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff, Loader2, MailWarning } from "lucide-react"
import { AuthLayout } from "@/components/layout/AuthLayout"
import { BrandMark } from "@/components/brand/Logo"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuthStore } from "@/store/auth.store"
import { useToast } from "@/hooks/useToast"
import { authService } from "@/services/auth.service"
import { loginSchema } from "@/utils/validation"
import { ROUTES } from "@/config/routes"

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()
  const signIn = useAuthStore((s) => s.signIn)
  const [showPassword, setShowPassword] = useState(false)
  const [unconfirmedEmail, setUnconfirmedEmail] = useState(null)
  const [resending, setResending] = useState(false)

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  const onSubmit = async (data) => {
    setUnconfirmedEmail(null)
    try {
      await signIn(data)
      toast.success("¡Bienvenido de vuelta!")
      const redirectTo = location.state?.from?.pathname || ROUTES.DASHBOARD
      navigate(redirectTo, { replace: true })
    } catch (err) {
      const msg = err.message || "No fue posible iniciar sesión."
      if (msg.toLowerCase().includes("confirmado")) {
        setUnconfirmedEmail(data.email)
      } else {
        toast.error(msg)
      }
    }
  }

  const handleResend = async () => {
    const email = unconfirmedEmail || getValues("email")
    if (!email) return
    setResending(true)
    try {
      await authService.resendConfirmation(email)
      toast.success("Hemos reenviado el correo de confirmación.")
    } catch (err) {
      toast.error(err.message || "No fue posible reenviar el correo.")
    } finally {
      setResending(false)
    }
  }

  return (
    <AuthLayout>
      <Card className="border-0 shadow-xl ring-1 ring-border/60">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-3">
            <BrandMark size={68} />
          </div>
          <CardTitle className="text-2xl">Bienvenido a VegetableAI</CardTitle>
          <CardDescription>Gestiona tu inventario y evita desperdicios.</CardDescription>
        </CardHeader>

        <CardContent className="pt-4">
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

            <div className="space-y-1.5">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="pr-10"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password ? (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              ) : null}
            </div>

            {unconfirmedEmail ? (
              <div className="rounded-md border border-status-warning/30 bg-status-warning-bg/60 px-3 py-3 text-status-warning">
                <div className="flex items-start gap-2">
                  <MailWarning className="h-4 w-4 mt-0.5 shrink-0" />
                  <div className="text-xs leading-relaxed">
                    <p className="font-semibold">Tu correo aún no está confirmado.</p>
                    <p>
                      Revisa tu bandeja de entrada (y la carpeta de spam) y haz clic en
                      el enlace de verificación para activar tu cuenta.
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-3 w-full"
                  onClick={handleResend}
                  disabled={resending}
                >
                  {resending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                  Reenviar correo de confirmación
                </Button>
              </div>
            ) : null}

            <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Iniciar sesión
            </Button>

            <Link
              to={ROUTES.FORGOT_PASSWORD}
              className="block text-center text-sm font-medium text-primary hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </Link>

            <Button asChild variant="outline" size="lg" className="w-full">
              <Link to={ROUTES.REGISTER}>Crear cuenta nueva</Link>
            </Button>
          </form>
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
