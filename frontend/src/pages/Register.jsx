import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff, Loader2, MailCheck } from "lucide-react"
import { AuthLayout } from "@/components/layout/AuthLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuthStore } from "@/store/auth.store"
import { useToast } from "@/hooks/useToast"
import { authService } from "@/services/auth.service"
import { registerSchema } from "@/utils/validation"
import { ROUTES } from "@/config/routes"

export default function Register() {
  const navigate = useNavigate()
  const toast = useToast()
  const signUp = useAuthStore((s) => s.signUp)
  const [showPassword, setShowPassword] = useState(false)
  const [confirmation, setConfirmation] = useState(null)
  const [resending, setResending] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: "", email: "", password: "", confirmPassword: "" },
  })

  const onSubmit = async (data) => {
    try {
      const { session, requiresEmailConfirmation } = await signUp(data)
      if (requiresEmailConfirmation) {
        setConfirmation({ email: data.email, fullName: data.fullName })
        return
      }
      if (session) {
        toast.success("Cuenta creada. ¡Bienvenido a VegetableAI!")
        navigate(ROUTES.DASHBOARD, { replace: true })
      }
    } catch (err) {
      toast.error(err.message || "No fue posible completar el registro.")
    }
  }

  const handleResend = async () => {
    if (!confirmation?.email) return
    setResending(true)
    try {
      await authService.resendConfirmation(confirmation.email)
      toast.success("Hemos reenviado el correo de confirmación.")
    } catch (err) {
      toast.error(err.message || "No fue posible reenviar el correo.")
    } finally {
      setResending(false)
    }
  }

  if (confirmation) {
    return (
      <AuthLayout>
        <Card className="border-0 shadow-xl ring-1 ring-border/60">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <MailCheck className="h-7 w-7 text-primary" />
            </div>
            <CardTitle className="text-2xl">Confirma tu correo</CardTitle>
            <CardDescription>
              Te enviamos un enlace de verificación a{" "}
              <span className="font-medium text-foreground">{confirmation.email}</span>.
              Debes confirmar tu cuenta antes de poder iniciar sesión.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md border bg-secondary/40 px-4 py-3 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Pasos siguientes</p>
              <ol className="mt-1 ml-4 list-decimal space-y-0.5 text-xs">
                <li>Abre tu correo electrónico (revisa también la carpeta de spam).</li>
                <li>Haz clic en el botón "Confirmar mi cuenta".</li>
                <li>Vuelve a esta pantalla e inicia sesión.</li>
              </ol>
            </div>

            <Button asChild size="lg" className="w-full">
              <Link to={ROUTES.LOGIN}>Ir a iniciar sesión</Link>
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={handleResend}
              disabled={resending}
            >
              {resending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Reenviar correo de confirmación
            </Button>

            <p className="text-center text-[11px] text-muted-foreground">
              Si no recibes el correo en unos minutos, verifica que la dirección esté
              escrita correctamente o intenta de nuevo el registro.
            </p>
          </CardContent>
        </Card>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <Card className="border-0 shadow-xl ring-1 ring-border/60">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl">Crear cuenta</CardTitle>
          <CardDescription>Empieza a controlar tus alimentos en segundos.</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="fullName">Nombre completo</Label>
              <Input id="fullName" placeholder="Ej: María González" {...register("fullName")} />
              {errors.fullName ? (
                <p className="text-xs text-destructive">{errors.fullName.message}</p>
              ) : null}
            </div>

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
                  autoComplete="new-password"
                  placeholder="Mínimo 8 caracteres, 1 mayúscula y 1 número"
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

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Repite la contraseña"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword ? (
                <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
              ) : null}
            </div>

            <p className="rounded-md border bg-secondary/40 px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
              Te enviaremos un correo de confirmación. Deberás verificar tu cuenta antes
              de poder iniciar sesión.
            </p>

            <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Crear cuenta
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              ¿Ya tienes cuenta?{" "}
              <Link to={ROUTES.LOGIN} className="font-medium text-primary hover:underline">
                Inicia sesión
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
