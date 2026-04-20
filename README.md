# 🥦 VegetableAI - Intelligent Inventory PWA

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/React-18.x-61dafb.svg?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-20.x-339933.svg?logo=nodedotjs)
![Supabase](https://img.shields.io/badge/Supabase-DB%20&%20Auth-3ECF8E.svg?logo=supabase)
![Tesseract.js](https://img.shields.io/badge/OCR-Tesseract.js-lightgrey.svg)

**VegetableAI** es una Aplicación Web Progresiva (PWA) de vanguardia diseñada para combatir el desperdicio de alimentos. Mediante inteligencia artificial (OCR) lee las fechas de caducidad de tus productos desde la cámara de tu teléfono y gestiona tu inventario calculando su tiempo de vida de forma inteligente.

---

## ✨ Características Principales

- **📸 OCR de Última Generación**: Utiliza un micro-servicio con `Tesseract.js` en el backend capaz de extraer fechas en formatos numéricos (`12/04/2026`) y alfanuméricos en español/inglés (`12 ABR 2026`).
- **📱 PWA Nativo Total**: Totalmente instalable en iOS y Android gracias a *Vite PWA Plugin*, comportándose como una app real en tu pantalla de inicio.
- **🔐 Seguridad de Nivel Bancario**: Integración estricta con **Supabase Auth** y **Row Level Security (RLS)** que asegura la absoluta privacidad de tus datos mediante JWT's.
- **🏗️ Arquitectura N-Capas**: Backend desacoplado y escalable escrito en NodeJS, agrupado elegantemente en Rutas, Controladores, Servicios y Middlewares de autorización.
- **🎨 UI Glassmorphism Premium**: Interfaz deslumbrante estilo "vidrio" creada exclusivamente en CSS puro (modo oscuro envolvente).

---

## 🛠️ Arquitectura del Ecosistema

El código fuente está organizado en una arquitectura de N-Capas, fragmentado en dos motores principales que se comunican entre sí y un bloque de base de datos:

```text
VegetableAI/
├── backend/                  # Motor de APIs y OCR (Node.js/Express)
│   ├── src/
│   │   ├── config/           # Instancia global Supabase (Admin Key)
│   │   ├── controllers/      # Funciones puras para procesar peticiones HTTP (CRUD)
│   │   ├── middlewares/      # Filtros JWT y Multer (Carga de Fotos en RAM)
│   │   ├── routes/           # Mapa unificado de Endpoints
│   │   └── services/         # Algoritmos OCR Tesseract y Funciones Cronológicas
│   ├── server.js             # Punto de entrada de la orquestación Express
│   └── .env                  # Variables privadas backend
│
├── frontend/                 # Aplicación Nativa PWA (React + Vite)
│   ├── public/               # Íconos y dependencias estáticas
│   ├── src/
│   │   ├── pages/            # Escenas primarias (Dashboard, Scanner, Profile, Login)
│   │   ├── App.jsx           # Ruteo protector de React y lógica persistente
│   │   ├── main.jsx          # Cúspide del árbol virtual del explorador
│   │   ├── index.css         # Diseño UI Glassmorphism de alto nivel
│   │   └── supabaseClient.js # Handshake web con Supabase (Anon Key)
│   ├── vite.config.js        # Compilación con soporte nativo de PWA (Workbox)
│   └── .env.local            # Variables locales del frontend
│
└── supabase/
    └── schema.sql            # Molde de Tablas, Triggers automatizados y Seguridad RLS
```

1. **`/frontend`**: Capa de presentación armada en *Vite + React*. Maneja sesiones y UI UX offline.
2. **`/backend`**: Núcleo robusto. Atrapa operaciones de IA y base de datos evitando estresar los celulares de los usuarios.

---

## 🚀 Guía Exhaustiva de Instalación Local

### 1. Requisitos Previos Obligatorios
- [Node.js](https://nodejs.org/es/) versión v16+.
- Una cuenta abierta en [Supabase](https://supabase.com/) (Free Tier).

### 2. Configurar la Nube de Base de Datos
1. Inicia un nuevo proyecto en la consola de Supabase.
2. Navega rápido a la sección de **SQL Editor** y pega íntegramente el contenido de nuestro archivo maestro localizado en: 👉 `supabase/schema.sql` y ejécutalo en RUN.
3. Se generarán automáticamente tus tablas de perfiles, los disparadores (triggers) de creación automática y todo el escudo hiper-seguro de **Políticas RLS**.

### 3. Encender el "Cerebro" (Backend)
En una consola, sitúate en la raíz del proyecto y ve a backend:
```bash
cd backend
npm install
```
Añade o crea un archivo `.env` incluyendo tu URL global y tu Llave Administradora Roles (*Service Role Key* crucial para purgados o reestructuraciones):
```env
SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
PORT=3000
```
Arranca el servidor Node:
```bash
npm start
```

### 4. Iluminar la "Cara" (Frontend)
Abre otra pestaña nueva en tu terminal y dirígete al frontend:
```bash
cd frontend
npm install
```
Acá generarás un archivo diferente llamado `.env.local` empleando estrictamente tu Llave Anónima y segura (*Publishable / Anon*):
```env
VITE_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```
Ejecuta la capa gráfica. (Se ha dejado el flag `--host` habilitado por defecto para que conecte tu PWA localmente con cualquier teléfono de la misma red WiFi).
```bash
npm run dev --host
```

---

## 📖 Endpoints Primarios REST (Backend)

| Método | Endpoint (Localhost:3000) | Descripción | Requisito de Entrada |
|---|---|---|---|
| **POST** | `/api/ocr` | Detecta las fechas de vencimiento de las fotos con Tesseract AI | Multi-Part `image` enviado en Memoria Pura |
| **GET** | `/api/users/me` | Retorna los metadatos completos y estatus de preferencias del Usuario | `Bearer JWT` Header |
| **GET** | `/api/inventory` | Llama los productos y los pasa por filtro analítico devolviendo "Vencido" o "Vigente".| `Bearer JWT` Header |
| **POST** | `/api/inventory` | Registra eficientemente un alimento y fecha salvada. | `{ name, expiration_date, category }` |
| **DELETE**| `/api/users/me` | Destruye identidad universal por medio del admin. | Auth Token |

---

*Cosecha datos organizados, no desperdicio de cocina.* 🌱