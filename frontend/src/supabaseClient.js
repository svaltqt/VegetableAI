import { createClient } from "@supabase/supabase-js"
import env from "@/config/env"

const stub = {
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithPassword: async () => ({ data: null, error: new Error("Supabase no configurado.") }),
    signUp: async () => ({ data: null, error: new Error("Supabase no configurado.") }),
    signOut: async () => ({ error: null }),
    resetPasswordForEmail: async () => ({ error: null }),
    updateUser: async () => ({ data: null, error: null }),
  },
  storage: {
    from: () => ({
      upload: async () => ({ data: null, error: new Error("Supabase Storage no configurado.") }),
      getPublicUrl: () => ({ data: { publicUrl: "" } }),
    }),
  },
}

export const supabase =
  env.supabaseUrl && env.supabaseAnonKey
    ? createClient(env.supabaseUrl, env.supabaseAnonKey, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
      })
    : stub

export const isSupabaseConfigured = Boolean(env.supabaseUrl && env.supabaseAnonKey)
