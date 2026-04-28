import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { LogOut, Loader2, Trash2, Bell } from "lucide-react"
import { Topbar } from "@/components/layout/Topbar"
import { PageContainer } from "@/components/layout/PageContainer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import { ChangePasswordCard } from "@/components/profile/ChangePasswordCard"
import { ThemeToggle } from "@/components/theme/theme-toggle"
import { useProfile, useUpdateProfile, useSignOut } from "@/hooks/useProfile"
import { usePushStore } from "@/store/push.store"
import { useToast } from "@/hooks/useToast"
import { usersService } from "@/services/users.service"
import { profileSchema } from "@/utils/validation"
import { ALERT_PREFERENCES } from "@/config/constants"
import { ROUTES } from "@/config/routes"
import { getInitials } from "@/utils/initials"

export default function Profile() {
  const navigate = useNavigate()
  const toast = useToast()
  const { data: profile } = useProfile()
  const updateProfile = useUpdateProfile()
  const signOut = useSignOut()

  const push = usePushStore()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [confirmSignOut, setConfirmSignOut] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting, isDirty },
    reset,
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: profile?.full_name || "",
      alertDays: profile?.alert_days || [3, 1, 0],
    },
  })

  useEffect(() => {
    if (profile) {
      reset({
        fullName: profile.full_name || "",
        alertDays: profile.alert_days || [3, 1, 0],
      })
    }
  }, [profile, reset])

  const selectedAlerts = watch("alertDays") || []

  const toggleAlertDay = (day) => {
    const next = selectedAlerts.includes(day)
      ? selectedAlerts.filter((d) => d !== day)
      : [...selectedAlerts, day].sort((a, b) => b - a)
    setValue("alertDays", next, { shouldDirty: true, shouldValidate: true })
  }

  const onSubmit = async (data) => {
    try {
      await updateProfile.mutateAsync({
        full_name: data.fullName,
        alert_days: data.alertDays,
      })
      toast.success("Perfil actualizado.")
    } catch (err) {
      toast.error(err.message || "No fue posible guardar los cambios.")
    }
  }

  const handleDeleteAccount = async () => {
    try {
      await usersService.remove()
      await signOut()
      toast.success("Cuenta eliminada correctamente.")
      navigate(ROUTES.LOGIN, { replace: true })
    } catch (err) {
      toast.error(err.message || "No fue posible eliminar la cuenta.")
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } finally {
      navigate(ROUTES.LOGIN, { replace: true })
    }
  }

  const handlePushToggle = async (checked) => {
    try {
      if (checked) await push.enable()
      else await push.disable()
      toast.success(
        checked
          ? "Notificaciones activadas. Te avisaremos cuando un producto esté próximo a vencer."
          : "Notificaciones push desactivadas."
      )
    } catch (err) {
      toast.error(err.message || "No fue posible actualizar las notificaciones.")
    }
  }

  return (
    <>
      <Topbar
        title="Perfil y preferencias"
        description="Configura tus datos personales y preferencias de alertas."
      />

      <PageContainer className="max-w-3xl space-y-5">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Avatar className="h-20 w-20 ring-4 ring-background">
                {profile?.avatar_url ? (
                  <AvatarImage src={profile.avatar_url} alt={profile?.full_name} />
                ) : null}
                <AvatarFallback className="text-xl">
                  {getInitials(profile?.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-semibold">{profile?.full_name || "Usuario"}</h2>
                <p className="text-sm text-muted-foreground truncate">
                  {profile?.email || "Sin correo"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Miembro desde {profile?.created_at ? new Date(profile.created_at).toLocaleDateString("es") : "—"}
                </p>
              </div>
              <ThemeToggle className="hidden sm:inline-flex" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Información personal</CardTitle>
            <p className="text-xs text-muted-foreground">
              Edita tu nombre completo y preferencias de notificación.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="fullName">Nombre completo</Label>
                <Input id="fullName" {...register("fullName")} />
                {errors.fullName ? (
                  <p className="text-xs text-destructive">{errors.fullName.message}</p>
                ) : null}
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Preferencias de alerta</Label>
                <p className="text-xs text-muted-foreground">
                  Selecciona con cuántos días de anticipación quieres recibir notificaciones.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {ALERT_PREFERENCES.map((pref) => {
                    const active = selectedAlerts.includes(pref.value)
                    return (
                      <button
                        key={pref.value}
                        type="button"
                        onClick={() => toggleAlertDay(pref.value)}
                        className={
                          "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors " +
                          (active
                            ? "bg-primary text-primary-foreground border-transparent"
                            : "bg-background text-muted-foreground hover:bg-accent")
                        }
                      >
                        {pref.label}
                      </button>
                    )
                  })}
                </div>
                {errors.alertDays ? (
                  <p className="text-xs text-destructive">{errors.alertDays.message}</p>
                ) : null}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="submit" disabled={!isDirty || isSubmitting}>
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Guardar cambios
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notificaciones push</CardTitle>
            <p className="text-xs text-muted-foreground">
              Recibe alertas en tu dispositivo cuando un producto esté próximo a vencer.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start justify-between gap-4 rounded-lg border bg-secondary/40 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                  <Bell className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">Activar notificaciones</p>
                  <p className="text-xs text-muted-foreground">
                    Estado actual: <span className="font-medium">{push.permission}</span>
                  </p>
                </div>
              </div>
              <Switch
                checked={push.isSubscribed}
                onCheckedChange={handlePushToggle}
                disabled={push.loading}
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              El envío de notificaciones requiere que el backend esté configurado con claves
              VAPID y el endpoint <code className="font-mono">POST /api/notifications/subscribe</code>.
              Mientras tanto, esta opción se simula localmente.
            </p>
          </CardContent>
        </Card>

        <ChangePasswordCard />

        <Card className="border-destructive/40">
          <CardHeader>
            <CardTitle className="text-base text-destructive">Zona peligrosa</CardTitle>
            <p className="text-xs text-muted-foreground">
              Las acciones siguientes no pueden deshacerse.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => setConfirmSignOut(true)}
            >
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </Button>
            <Button
              variant="destructive"
              className="w-full justify-start"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="h-4 w-4" />
              Eliminar cuenta permanentemente
            </Button>
          </CardContent>
        </Card>
      </PageContainer>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Eliminar cuenta"
        description="Se eliminarán todos tus datos: productos, alertas y suscripciones. Esta acción no se puede deshacer."
        confirmLabel="Sí, eliminar mi cuenta"
        destructive
        onConfirm={handleDeleteAccount}
      />

      <ConfirmDialog
        open={confirmSignOut}
        onOpenChange={setConfirmSignOut}
        title="Cerrar sesión"
        description="Volverás a la pantalla de inicio de sesión."
        confirmLabel="Cerrar sesión"
        onConfirm={handleSignOut}
      />
    </>
  )
}
