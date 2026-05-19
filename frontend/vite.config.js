import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'node:path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), './src'),
    },
  },
  server: {
    host: true,
    port: 5173,
  },
  plugins: [
    react(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.svg', 'icons/icon.svg', 'icons/maskable.svg'],
      manifest: {
        name: 'VegetableAI',
        short_name: 'VegetableAI',
        description: 'Gestiona tu inventario de alimentos y evita el desperdicio mediante OCR.',
        lang: 'es',
        dir: 'ltr',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#16a34a',
        background_color: '#ffffff',
        categories: ['food', 'lifestyle', 'productivity'],
        icons: [
          { src: '/icons/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          { src: '/icons/maskable.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
        ],
        shortcuts: [
          {
            name: 'Escanear producto',
            short_name: 'Escanear',
            description: 'Captura una fecha de vencimiento con OCR.',
            url: '/scanner',
            path: '/scanner'
          },
          {
            name: 'Ver inventario',
            short_name: 'Inventario',
            description: 'Consulta tu lista de alimentos.',
            url: '/inventory',
            path: '/inventory'
          },
        ],
      },
      devOptions: {
        enabled: true,
        type: 'module'
      }
    }),
  ],
})
