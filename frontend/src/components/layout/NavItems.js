import {
  LayoutDashboard,
  PackageSearch,
  ScanLine,
  Bell,
  UserCircle2,
  Sparkles,
} from "lucide-react"
import { ROUTES } from "@/config/routes"

export const NAV_ITEMS = [
  { to: ROUTES.DASHBOARD, label: "Inicio", icon: LayoutDashboard },
  { to: ROUTES.INVENTORY, label: "Mis productos", icon: PackageSearch },
  { to: ROUTES.SCANNER, label: "Escanear OCR", icon: ScanLine },
  { to: ROUTES.FOOD_STATUS, label: "Estado alimento", icon: Sparkles },
  { to: ROUTES.ALERTS, label: "Notificaciones", icon: Bell },
  { to: ROUTES.PROFILE, label: "Perfil", icon: UserCircle2 },
]

export const MOBILE_NAV_ITEMS = [
  { to: ROUTES.DASHBOARD, label: "Inicio", icon: LayoutDashboard },
  { to: ROUTES.INVENTORY, label: "Productos", icon: PackageSearch },
  { to: ROUTES.SCANNER, label: "Escanear", icon: ScanLine },
  { to: ROUTES.ALERTS, label: "Alertas", icon: Bell },
  { to: ROUTES.PROFILE, label: "Perfil", icon: UserCircle2 },
]
