# VegetableAI · Backend

API REST en **Node.js + Express** que orquesta el OCR (Tesseract.js), el inventario y la autenticación contra Supabase.

## Requisitos

- **Node.js**: `>=20.11 <21` o `>=22 LTS` (recomendado **Node 20 LTS** o **Node 22 LTS**).
- **npm**: 10.x o superior.

```bash
node -v   # debe ser 20.x o 22.x
npm -v    # debe ser 10.x+
```

## Instalación

```bash
cd backend
npm install
```

Crea un archivo `backend/.env`:

```env
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
PORT=3000
```

> La *Service Role Key* es necesaria porque el endpoint `DELETE /api/users/me` usa `supabase.auth.admin.deleteUser`.

## Comandos

```bash
npm run dev    # node --watch (recarga al guardar)
npm start      # producción
```

El servidor escucha en `http://localhost:3000`.

## Estructura

```
backend/
├── server.js                # Express bootstrap
├── seed.js                  # Datos de prueba
├── spa.traineddata          # Modelo OCR español (Tesseract)
└── src/
    ├── config/supabase.js   # Cliente Supabase Admin
    ├── routes/              # Endpoints REST
    ├── controllers/         # Handlers HTTP
    ├── services/            # Lógica de negocio (OCR, inventario, usuarios)
    └── middlewares/         # auth (JWT) y upload (multer en memoria)
```

## Endpoints

| Método  | Ruta                  | Descripción                                      | Auth |
|---------|-----------------------|--------------------------------------------------|------|
| POST    | `/api/ocr`            | Extrae fecha de vencimiento desde una imagen     | ✅   |
| GET     | `/api/inventory`      | Lista productos del usuario con `status`         | ✅   |
| POST    | `/api/inventory`      | Crea un producto                                  | ✅   |
| PUT     | `/api/inventory/:id`  | Actualiza un producto                             | ✅   |
| DELETE  | `/api/inventory/:id`  | Elimina un producto                               | ✅   |
| GET     | `/api/users/me`       | Perfil del usuario y `preferences` (theme, etc.) | ✅   |
| PUT     | `/api/users/me`       | Upsert del perfil/preferencias                    | ✅   |
| DELETE  | `/api/users/me`       | Elimina la cuenta (cascada)                       | ✅   |

> Toda ruta autenticada requiere `Authorization: Bearer <jwt>` (token de Supabase Auth).
