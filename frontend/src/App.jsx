import { useEffect } from "react"
import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "sonner"
import { ThemeProvider } from "@/components/theme/theme-provider"
import { AppShell } from "@/components/layout/AppShell"
import { ProtectedRoute, PublicOnlyRoute } from "@/components/auth/ProtectedRoute"
import { useAuthStore } from "@/store/auth.store"
import { ROUTES } from "@/config/routes"

import Login from "@/pages/Login"
import Register from "@/pages/Register"
import ForgotPassword from "@/pages/ForgotPassword"
import Dashboard from "@/pages/Dashboard"
import Inventory from "@/pages/Inventory"
import ProductForm from "@/pages/ProductForm"
import Scanner from "@/pages/Scanner"
import Alerts from "@/pages/Alerts"
import Profile from "@/pages/Profile"
import FoodStatus from "@/pages/FoodStatus"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30 * 1000, refetchOnWindowFocus: false, retry: 1 },
  },
})

function App() {
  const initialize = useAuthStore((s) => s.initialize)
  useEffect(() => {
    initialize()
  }, [initialize])

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <Router>
          <Routes>
            <Route element={<PublicOnlyRoute />}>
              <Route path={ROUTES.LOGIN} element={<Login />} />
              <Route path={ROUTES.REGISTER} element={<Register />} />
              <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPassword />} />
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route element={<AppShell />}>
                <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
                <Route path={ROUTES.INVENTORY} element={<Inventory />} />
                <Route path={ROUTES.PRODUCT_NEW} element={<ProductForm />} />
                <Route path={ROUTES.PRODUCT_EDIT} element={<ProductForm />} />
                <Route path={ROUTES.SCANNER} element={<Scanner />} />
                <Route path={ROUTES.ALERTS} element={<Alerts />} />
                <Route path={ROUTES.PROFILE} element={<Profile />} />
                <Route path={ROUTES.FOOD_STATUS} element={<FoodStatus />} />
              </Route>
            </Route>

            <Route path="/" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
            <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
          </Routes>
        </Router>
        <Toaster position="top-right" richColors closeButton expand />
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App
