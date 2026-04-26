import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuthStore } from "@/store/auth.store"
import { LoadingScreen } from "@/components/common/LoadingScreen"
import { ROUTES } from "@/config/routes"

export function ProtectedRoute() {
  const status = useAuthStore((s) => s.status)
  const session = useAuthStore((s) => s.session)
  const location = useLocation()

  if (status === "loading" || status === "idle") {
    return <LoadingScreen label="Sincronizando sesión…" />
  }

  if (!session) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />
  }

  return <Outlet />
}

export function PublicOnlyRoute() {
  const status = useAuthStore((s) => s.status)
  const session = useAuthStore((s) => s.session)
  if (status === "loading" || status === "idle") {
    return <LoadingScreen label="Cargando…" />
  }
  if (session) return <Navigate to={ROUTES.DASHBOARD} replace />
  return <Outlet />
}
