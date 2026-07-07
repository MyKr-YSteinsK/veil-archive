import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/veil-archive/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['icons/apple-touch-icon.png'],
      manifest: {
        id: '/veil-archive/',
        name: 'The Veil Archive｜帷幕档案',
        short_name: 'Veil｜帷幕',
        description: '一部关于誓约、残响与异赐的私人档案。',
        lang: 'zh-CN',
        start_url: '/veil-archive/',
        scope: '/veil-archive/',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#08070B',
        background_color: '#08070B',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        globPatterns: ['**/*.{html,js,css,png,svg,ico,woff2}'],
        navigateFallback: 'index.html',
      },
    }),
  ],
})
