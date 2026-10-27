// apps/echolog/vite.config.mjs — operator UI build for the ECHOLOG console.
// The dev server binds loopback only and proxies /api and /health to ECHOLOG's
// own loopback port (3006). No credentials and no service keys ever live here;
// the operator authenticates with their own ARSY session bearer token.
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

const dir = import.meta.dirname
const ECHOLOG_ORIGIN = 'http://127.0.0.1:3006'

export default defineConfig({
  plugins: [react()],
  root: resolve(dir, 'client'),
  build: {
    outDir: resolve(dir, 'dist/client'),
    emptyOutDir: true,
  },
  server: {
    host: '127.0.0.1',
    port: 3106,
    strictPort: true,
    proxy: {
      '/api': { target: ECHOLOG_ORIGIN, changeOrigin: false },
      '/health': { target: ECHOLOG_ORIGIN, changeOrigin: false },
    },
  },
})
