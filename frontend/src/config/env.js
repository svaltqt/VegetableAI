const getDynamicApiUrl = () => {
  // En producción define SIEMPRE VITE_API_BASE_URL (se hornea en build).
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  if (typeof window !== "undefined" && window.location) {
    const { protocol, hostname } = window.location;
    const isLocal =
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(hostname);
    // Dev / red LAN: backend en el puerto 3000 de la misma máquina (respeta http/https).
    if (isLocal) return `${protocol}//${hostname}:3000/api`;
    // Producción: mismo origen detrás de reverse proxy → evita mixed content y CORS.
    return "/api";
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
