-- Migración: agrega cantidad y notas al inventario.
-- Ejecútalo una vez en el SQL Editor de Supabase.

ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1;
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS notes TEXT;
