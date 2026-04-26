# VegetableAI · Frontend

PWA en **React 18 + Vite** que materializa todos los requisitos funcionales (RF-01 a RF-22) y no funcionales del SRS de VegetableAI. Construida con **Tailwind CSS + shadcn/ui + FontAwesome**, soporta **tema claro y oscuro**, autenticación con Supabase, captura OCR de fechas, gestión de inventario, alertas y notificaciones push.

> Mientras el backend está en construcción, la app funciona 100 % con un store *mock* persistente. Al activar el backend basta con poner `VITE_USE_MOCKS=false`.

---

## Características clave

- **PWA instalable** (manifest + Service Worker generados con `vite-plugin-pwa`).
- **Tema claro/oscuro** (toggle persistente en `localStorage`).
- **Capa de estado servidor** con TanStack Query.
- **Capa de estado cliente** con Zustand (auth, UI, push).
- **Validación** de formularios con `react-hook-form + zod`.
- **Captura de cámara nativa** vía `getUserMedia` para OCR.
- **Mensajería al usuario** unificada con Sonner (toasts en español).
- **Diseño responsivo**: sidebar en escritorio y barra inferior en móvil.

---

## Estructura del proyecto

```
frontend/
├── public/
│   ├── favicon.svg
│   └── icons/             # icon.svg + maskable.svg para PWA
├── src/
│   ├── components/
│   │   ├── ui/            # primitives shadcn (button, card, input, ...)
│   │   ├── layout/        # AppShell, Sidebar, MobileNav, Topbar, AuthLayout
│   │   ├── theme/         # ThemeProvider + ThemeToggle
│   │   ├── brand/         # Logo
│   │   ├── inventory/     # ProductCard, ProductTable, StatusBadge
│   │   ├── alerts/        # AlertItem
│   │   ├── dashboard/     # StatCard, QuickAction
│   │   ├── scanner/       # CameraCapture
│   │   ├── auth/          # ProtectedRoute, PublicOnlyRoute
│   │   └── common/        # ConfirmDialog, LoadingScreen
│   ├── config/            # env, constants, routes
│   ├── hooks/             # useProducts, useAlerts, useOCR, useToast, useMediaQuery
│   ├── lib/utils.js       # helper cn() para Tailwind
│   ├── pages/             # Login, Register, ForgotPassword, Dashboard,
│   │                      # Inventory, ProductForm, Scanner, Alerts,
│   │                      # Profile, FoodStatus
│   ├── services/          # api, auth, users, inventory, ocr, alerts,
│   │                      # notifications, mock-data
│   ├── store/             # auth.store, ui.store, push.store (Zustand)
│   ├── utils/             # dates, status, validation, images, initials
│   ├── App.jsx            # router + providers
│   ├── main.jsx
│   ├── index.css          # tokens de diseño + Tailwind
│   └── supabaseClient.js
├── tailwind.config.js
├── postcss.config.js
├── components.json        # configuración shadcn/ui
├── vite.config.js
├── BACKEND_INTEGRATION.md # contrato REST + modelos para el backend
└── README.md
```

---

## Variables de entorno

Crea `frontend/.env.local` a partir de `.env.example`:

```env
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
VITE_API_BASE_URL=http://localhost:3000/api
VITE_VAPID_PUBLIC_KEY=<vapid-public-key>
VITE_USE_MOCKS=true
```

| Variable | Uso |
|---|---|
| `VITE_USE_MOCKS=true` | Toda la app usa el store *mock* (no requiere backend). |
| `VITE_USE_MOCKS=false` | Frontend hace llamadas REST a `VITE_API_BASE_URL`. |
| `VITE_SUPABASE_URL` / `_ANON_KEY` | Cliente Supabase para Auth y Storage. Si están vacías, la app cae al modo mock automáticamente. |
| `VITE_VAPID_PUBLIC_KEY` | Clave pública para suscripción Web Push. |

---

## Comandos

```bash
cd frontend
npm install
npm run dev      # arranca Vite con --host (PWA accesible desde el móvil)
npm run build    # compila a /dist
npm run preview  # sirve /dist
npm run lint
```

---

## Mapeo de páginas con requisitos

| Requisito | Página / componente |
|---|---|
| RF-01, RF-02 | `pages/Login.jsx`, `pages/Register.jsx` |
| RF-03 | `pages/Profile.jsx` (sección "Cerrar sesión") |
| RF-04 | `pages/ForgotPassword.jsx` |
| RF-05 | `pages/Profile.jsx` (avatar + nombre) |
| RF-06, RF-08 | `pages/ProductForm.jsx` |
| RF-07 | `pages/Inventory.jsx` |
| RF-09 | `ConfirmDialog` desde `Inventory.jsx` |
| RF-10 → RF-13 | `pages/Scanner.jsx` + `components/scanner/CameraCapture.jsx` |
| RF-14, RF-17 | `pages/Alerts.jsx` |
| RF-15 | `services/notifications.service.js` + `store/push.store.js` |
| RF-16 | `pages/Profile.jsx` (preferencias de alerta) |
| RF-18 → RF-20 | `pages/FoodStatus.jsx` (módulo en construcción) |
| RF-21 | `pages/Dashboard.jsx` |
| RF-22 | `vite.config.js` (manifest + Service Worker) |

---

## Modo Mock vs. Modo Real

- **Mock** (`VITE_USE_MOCKS=true`): toda la data vive en `src/services/mock-data.js`. La sesión "mock" se persiste en `localStorage`. Útil para demos y para desarrollar la UI sin backend.
- **Real**: cada `*.service.js` reemplaza el mock por una llamada `axios` al endpoint correspondiente. El header `Authorization: Bearer <jwt>` se inyecta automáticamente desde la sesión Supabase.

Detalles del contrato: ver [`BACKEND_INTEGRATION.md`](./BACKEND_INTEGRATION.md).

---

## Notas sobre PWA e iOS

- El manifest usa **iconos SVG** (instalación nativa en Chrome / Android / desktop).
- Para iOS Safari "Añadir a pantalla de inicio" con icono nítido, conviene generar `icon-192.png` e `icon-512.png` a partir de `public/icons/icon.svg` (cualquier convertidor SVG→PNG sirve) y agregarlas al manifest. La estructura ya está preparada en `vite.config.js`.
