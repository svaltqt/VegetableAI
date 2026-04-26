import axios from "axios"
import env from "@/config/env"
import { supabase } from "@/supabaseClient"

export const api = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
})

api.interceptors.request.use(async (config) => {
  try {
    const { data } = await supabase.auth.getSession()
    const token = data?.session?.access_token
    if (token) config.headers.Authorization = `Bearer ${token}`
  } catch {
    // sesión no disponible: la solicitud sale sin Authorization
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Ocurrió un error inesperado. Inténtalo nuevamente."
    return Promise.reject({ ...error, message })
  }
)

export const isMockMode = () => env.useMocks
