const getDynamicApiUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  if (typeof window !== "undefined" && window.location) {
    const hostname = window.location.hostname;
    // Si estás en producción o tienes SSL, o en un celular, apuntamos al puerto 3000 de esa misma máquina
    return `http://${hostname}:3000/api`;
  }
  return "http://localhost:3000/api";
};

const env = {
  apiBaseUrl: getDynamicApiUrl(),
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || "",
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || "",
  vapidPublicKey: import.meta.env.VITE_VAPID_PUBLIC_KEY || "",
  useMocks:
    String(import.meta.env.VITE_USE_MOCKS ?? "false").toLowerCase() === "true",
}

export default env
