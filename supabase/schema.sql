-- Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla: perfiles de usuario
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  avatar_url TEXT,
  preferences JSONB DEFAULT '{"theme": "dark", "notifications": true}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: inventario de productos
CREATE TABLE public.inventory (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  expiration_date DATE NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: historial de notificaciones (Alertas)
CREATE TABLE public.alerts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.inventory(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'vencimiento_proximo',
  status TEXT CHECK (status IN ('pendiente', 'vista', 'descartada')) DEFAULT 'pendiente',
  generated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Políticas RLS (Row Level Security) - Seguridad en Supabase
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios pueden gestionar su perfil" ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Los usuarios controlan su inventario" ON public.inventory FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Los usuarios ven sus alertas" ON public.alerts FOR ALL USING (auth.uid() = user_id);

-- Configuración de Buckets de Archivos (Para fotos subidas)
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('inventory_images', 'inventory_images', true);

-- [NUEVO] Trigger Automático: Cuando alguien se registre en Auth local, se le crea su perfil vacío
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (new.id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
