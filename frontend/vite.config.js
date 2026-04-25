import { defineConfig } from 'vite'

export default defineConfig({
  // ── Multi-page app: one entry per HTML page ──────────────
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        index:     'index.html',
        auth:      'auth.html',
        upload:    'upload.html',
        download:  'download.html',
        reviews:   'reviews.html',
        dashboard: 'dashboard.html',
      },
    },
  },

  // ── Dev server ────────────────────────────────────────────
  server: {
    port: 5173,
    open: true,   // auto-opens browser on npm run dev

    proxy: {
      // All /api requests → forwarded to your XAMPP PHP backend
      // XAMPP runs Apache on port 80 by default
      '/api': {
        target: 'http://localhost/notown/backend/api',
        rewrite: path => path.replace(/^\/api/, ''),
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
