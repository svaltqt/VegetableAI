# 🌱 VegetableAI

Sistema PWA para captura OCR con backend de IA y frontend web.

---

## 🔑 Configuración de Claves

Debes agregar las credenciales de tu proyecto de Supabase en los siguientes archivos:

`/backend/.env`
`/frontend/.env.local`

Asegúrate de incluir correctamente:

* URL del proyecto
* API Key

---

## 🚀 Levantar los Servidores

Abre **dos terminales**:

### 🖥️ Terminal 1 — Backend (Motor de IA)

```bash
cd backend
npm start
```

Deberías ver:

```
🚀 VegetableAI Backend vivo en puerto 3000
```

---

### 🌐 Terminal 2 — Frontend (Interfaz PWA)

```bash
cd frontend
npm run dev
```

---

## 📱 Probar en el celular

Este proyecto está pensado como una **PWA con OCR**, así que puedes probarlo directamente en tu móvil.

1. Ejecuta el frontend (`npm run dev`)
2. Busca la IP local que aparece en consola, algo como:

```
http://192.168.X.X:5173
```

3. Abre esa URL desde tu celular (misma red WiFi)

💡 Gracias a la directiva `capture="environment"`, el botón de escanear abrirá la **cámara trasera**, como una app nativa.

---

## ❓ Acceso desde el celular

Crear un proyecto en tu PC **NO lo hace automáticamente accesible en internet**, pero sí puedes acceder desde tu celular dentro de la misma red local.

### ✔️ Requisitos

* Ambos dispositivos deben estar en la **misma red WiFi**
* El servidor debe escuchar en la red, no solo en `localhost`

### 🔧 Configuración en Vite

Ejecuta:

```bash
npm run dev -- --host
```

O configura `vite.config.js`:

```js
export default {
  server: {
    host: true
  }
}
```

---

## 🔥 Resumen

* `localhost` → solo accesible desde tu PC
* `192.168.X.X` → accesible desde tu celular (misma red)
* Internet (global) → necesitas deploy (Vercel, Netlify, etc.)

---


Supabase pass : Papitasfritas#2026
Database password: Papitasfritas#2026