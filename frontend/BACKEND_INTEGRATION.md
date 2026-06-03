# Integración con el Backend — VegetableAI

Documento que describe el **estado real** del backend (en `../backend/` y `../supabase/schema.sql`) frente a lo que el frontend ya muestra al usuario, y la **deuda técnica pendiente** para cubrir el SRS completo.

> El frontend ya consume los endpoints reales por defecto. Si el backend no está disponible se puede activar el modo demo con `VITE_USE_MOCKS=true` en `.env.local`.

---

## 1. Auditoría rápida (qué se ve en la PWA vs. qué hay en el backend)

| Vista / acción del frontend | ¿Existe en backend? | Pendiente |
|---|---|---|
| Login / registro / recuperación / confirmación de correo | ✅ Supabase Auth | Activar **Email confirmations** en el panel de Supabase (Authentication → Providers). |
| Subir foto de perfil | ⚠️ Bucket y columna existen | **Política RLS de escritura en `storage.objects`** (sección 4). Sin ella la subida falla con 403. |
| "Miembro desde {fecha}" | ✅ `profiles.created_at` con trigger `handle_new_user` | — |
| Editar nombre completo | ✅ `profiles.name` (PUT `/api/users/me`) | El trigger debe inicializar `name` desde `raw_user_meta_data.full_name` (sección 3.1). |
| Email del perfil | ✅ Mezcla con `auth.users.email` | Opcional: sincronizar a `profiles.email`. |
| Preferencias de alerta (7/3/1 días) | ✅ `profiles.preferences.alert_days` (JSONB) | — |
| Notificaciones push (toggle Perfil) | ❌ No existe | Tabla `push_subscriptions`, endpoints, VAPID, `web-push` (secciones 3.4 y 6). |
| Cerrar sesión / eliminar cuenta | ✅ Supabase Auth + `DELETE /api/users/me` | — |
| Dashboard: tarjetas total / vigente / próximo / vencido | ✅ Se computa en cliente desde `/api/inventory` | Opcional: endpoint `/api/inventory/summary`. |
| Dashboard: "alertas recientes" + página /alerts | ❌ Endpoints faltantes | Extender tabla `alerts`, agregar endpoints, cron generador (sección 3.3). |
| Inventario CRUD básico | ✅ `/api/inventory` GET/POST/PUT/DELETE | — |
| Inventario: `quantity`, `notes`, `source` (RF-06) | ❌ Columnas faltantes | `ALTER TABLE inventory ADD ...` (sección 3.2). |
| Trigger `updated_at` automático | ❌ Solo existe la columna en `profiles`, sin trigger | Función `set_updated_at()` + triggers (sección 3.5). |
| Escáner OCR | ✅ `POST /api/ocr` con Tesseract.js | — |
| Guardar imagen escaneada en `inventory_images` (RF-12) | ⚠️ Bucket y columna existen | Política RLS de INSERT (sección 4). Cuando exista, el frontend la usará para llenar `image_url`. |
| Estado de alimento por IA | ❌ Marcado "En construcción" en la PWA | Se decidirá en una fase posterior. |

Leyenda: ✅ funciona · ⚠️ parcial · ❌ no existe.

---

## 2. Variables de entorno

**Frontend (`frontend/.env.local`):**

| Variable | Descripción |
|---|---|
| `VITE_API_BASE_URL` | URL base del backend, p. ej. `http://localhost:3000/api` |
| `VITE_SUPABASE_URL` | URL del proyecto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Clave anónima del cliente Supabase |
| `VITE_VAPID_PUBLIC_KEY` | Clave pública VAPID (cuando el backend implemente Web Push) |
| `VITE_USE_MOCKS` | `false` (default) usa REST real; `true` para correr sin backend |

**Backend (`backend/.env`) — pendiente de agregar para Web Push:**

```env
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
PORT=3000

# Pendientes para activar notificaciones push:
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
VAPID_CONTACT_EMAIL=soporte@vegetableai.app
```

Toda solicitud autenticada **incluye automáticamente** el header `Authorization: Bearer <jwt>` que el frontend toma de la sesión Supabase activa.

---

## 3. Esquema y endpoints — lo que existe y lo que falta

### 3.1 `profiles` (existe)

```sql
profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  name TEXT,
  avatar_url TEXT,
  preferences JSONB DEFAULT '{"theme":"dark","notifications":true}',
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

**Pendiente — mejorar el trigger de creación:**

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, preferences)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    jsonb_build_object('theme','light','notifications',true,'alert_days',jsonb_build_array(3,1,0))
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

> Hoy el trigger solo inserta el `id`, por lo que el campo `name` queda vacío en cada registro nuevo y `preferences.alert_days` no existe hasta el primer guardado desde la PWA.

### 3.2 `inventory` (existe parcialmente)

```sql
inventory (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  name TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  expiration_date DATE NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ
)
```

**Pendiente — campos requeridos por RF-06:**

```sql
ALTER TABLE inventory ADD COLUMN quantity INT;
ALTER TABLE inventory ADD COLUMN notes TEXT;
ALTER TABLE inventory ADD COLUMN source TEXT DEFAULT 'manual'
  CHECK (source IN ('manual','ocr'));
ALTER TABLE inventory ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();

-- Índices recomendados para rendimiento (RNF-01)
CREATE INDEX inventory_user_exp_idx ON inventory (user_id, expiration_date);
```

> Mientras estos campos no existan, el frontend los **filtra antes de enviar** y los muestra como opcionales. Cuando el backend los agregue, dejarán de filtrarse y se persistirán automáticamente sin tocar el cliente.

### 3.3 `alerts` (existe simplificada — sin endpoints)

```sql
alerts (
  id UUID PRIMARY KEY,
  user_id UUID,
  message TEXT NOT NULL,
  type TEXT CHECK (type IN ('expiration','system','info')),
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ
)
```

**Pendiente — para cumplir RF-14 y RF-17:**

```sql
ALTER TABLE alerts ADD COLUMN product_id UUID
  REFERENCES inventory(id) ON DELETE CASCADE;
ALTER TABLE alerts ADD COLUMN status TEXT DEFAULT 'pendiente'
  CHECK (status IN ('pendiente','vista','descartada'));
ALTER TABLE alerts ADD COLUMN generated_at TIMESTAMPTZ DEFAULT NOW();
CREATE INDEX alerts_user_status_idx ON alerts (user_id, status, generated_at DESC);
```

**Endpoints pendientes:**

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/alerts` | Lista del usuario, ordenada por `generated_at DESC`. |
| PATCH | `/api/alerts/:id` | Body `{ status: "vista" \| "descartada" }`. |
| POST | `/api/alerts/seen-all` | Marca todas las pendientes como `vista`. |

**Cron de generación (cada 24 h, RNF-03):**

```js
// Pseudocódigo: cada usuario, según preferences.alert_days
for (const profile of profiles) {
  const days = profile.preferences?.alert_days ?? [3, 1, 0]
  for (const product of inventoryDeUsuario(profile.id)) {
    const diff = diasHasta(product.expiration_date)
    if (diff < 0) crearAlertaUnica(product, "expiration", "vencido")
    else if (days.includes(diff)) crearAlertaUnica(product, "expiration", `proximo_${diff}`)
  }
}
```

### 3.4 `push_subscriptions` (no existe — crear)

```sql
CREATE TABLE public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  endpoint TEXT NOT NULL,
  keys_p256dh TEXT NOT NULL,
  keys_auth TEXT NOT NULL,
  user_agent TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, endpoint)
);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_subscriptions" ON public.push_subscriptions
  FOR ALL USING (auth.uid() = user_id);
```

**Endpoints pendientes:**

| Método | Endpoint | Body / Respuesta |
|---|---|---|
| GET | `/api/notifications/vapid-public-key` | `{ key: <VAPID_PUBLIC_KEY> }` |
| POST | `/api/notifications/subscribe` | `{ endpoint, keys: { p256dh, auth }, user_agent }` |
| DELETE | `/api/notifications/subscribe` | Anula la suscripción del dispositivo activo. |
| POST | `/api/notifications/test` | Envía push de prueba al usuario actual. |

### 3.5 Trigger `updated_at` automático (no existe — recomendado)

```sql
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE TRIGGER inventory_set_updated_at
  BEFORE UPDATE ON public.inventory
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
```

### 3.6 Endpoint opcional `/api/inventory/summary`

Mientras no exista, el frontend ya computa el resumen en cliente. Si por rendimiento conviene mover al servidor:

```
GET /api/inventory/summary
→ { total: number, vigente: number, proximo: number, vencido: number }
```

---

## 4. Storage — políticas pendientes (críticas para subida de avatar y OCR)

El schema crea los buckets `avatars` e `inventory_images` como públicos para lectura, pero **no incluye políticas de escritura**. Sin estas políticas el frontend recibe `403 new row violates row-level security`.

```sql
-- Avatares
CREATE POLICY "avatars_owner_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "avatars_owner_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "avatars_owner_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Imágenes de inventario (capturas OCR)
CREATE POLICY "inventory_owner_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'inventory_images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
```

> El frontend siempre sube los archivos con la ruta `<auth.uid>/<archivo>` para que estas políticas funcionen sin cambios adicionales.

---

## 5. Mapeo cliente ↔ servidor

### 5.1 Inventario — `status`

Backend devuelve string en español; el frontend lo normaliza con `BACKEND_STATUS_MAP`:

| Backend | Frontend |
|---|---|
| `Vigente` | `vigente` |
| `Próximo a vencer` | `proximo` |
| `Vencido` | `vencido` |

### 5.2 OCR — formato de fecha

Backend devuelve `{ success, textExtracted, detectedDate, detectedRaw }`. `detectedDate` ya viene **normalizado en ISO `yyyy-MM-dd`** (el backend ancla en palabras clave `EXP/VENCE/CAD` vs `PROD/FAB`, soporta fechas compactas tipo `28012018` y valida rangos); `detectedRaw` es el texto crudo coincidente. El frontend lo consume con `parseDateInput()` y conserva `extractDateFromText()` como respaldo (`utils/dates.js`).

### 5.3 Profile — origen mixto

El frontend siempre presenta `{ id, full_name, email, avatar_url, alert_days, preferences, created_at }`:

- `id`, `name → full_name`, `avatar_url`, `preferences`, `created_at` salen de `profiles`.
- `email` sale de `auth.users.email` (sesión Supabase).
- `alert_days` se lee/escribe dentro de `preferences.alert_days`.

---

## 6. Checklist mínimo para activar Web Push (RF-15)

1. Backend: instalar `web-push` y configurar VAPID.
2. Crear tabla `push_subscriptions` y políticas RLS (sección 3.4).
3. Exponer los endpoints `/api/notifications/*`.
4. Exponer la clave pública en `VITE_VAPID_PUBLIC_KEY` del frontend.
5. Programar el cron de evaluación de vencimientos (sección 3.3).
6. Para cada alerta nueva, enviar push con `web-push` a las suscripciones activas del usuario.

---

## 7. Errores estándar esperados por el cliente

El frontend muestra `error.response.data.message` al usuario. Recomendado:

```json
{
  "error": "INVALID_CREDENTIALS",
  "message": "Credenciales incorrectas. Verifica tu correo y contraseña."
}
```

Códigos: `400` validación · `401` no autenticado · `403` sin permisos · `404` no existe · `413` archivo muy grande · `415` tipo no soportado · `500` error interno.

---

## 8. Comandos típicos

```bash
# Backend
cd backend
npm install
npm start                # http://localhost:3000

# Frontend
cd frontend
cp .env.example .env.local   # ajustar VITE_SUPABASE_*
npm install
npm run dev                  # http://localhost:5173
```

---

## 9. Resumen ejecutivo de deuda

Para que **todo lo que muestra la PWA hoy** funcione 100 % real, el backend debe agregar (en orden de prioridad):

1. Políticas RLS en `storage.objects` para `avatars` e `inventory_images` (sección 4).
2. Mejorar `handle_new_user` para inicializar `name` y `preferences.alert_days` (sección 3.1).
3. Trigger `set_updated_at` en `profiles` e `inventory` (sección 3.5).
4. `ALTER TABLE inventory` con `quantity`, `notes`, `source`, `updated_at` (sección 3.2).
5. Extender `alerts` con `product_id`, `status`, `generated_at` + endpoints + cron (sección 3.3).
6. Crear `push_subscriptions` + endpoints `/api/notifications/*` + VAPID + `web-push` (sección 3.4 y 6).
7. (Opcional) `/api/inventory/summary` para evitar el cómputo en cliente.
