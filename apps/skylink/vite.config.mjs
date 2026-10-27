import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

const dir = import.meta.dirname
const SKYLINK_ORIGIN = 'http://127.0.0.1:3005'

export default defineConfig({
  plugins: [react()],
  root: resolve(dir, 'client'),
  build: { outDir: resolve(dir, 'dist/client'), emptyOutDir: true },
  server: {
    host: '127.0.0.1', port: 3105, strictPort: true,
    proxy: {
      '/api': { target: SKYLINK_ORIGIN, changeOrigin: false },
      '/health': { target: SKYLINK_ORIGIN, changeOrigin: false },
      '/ws': { target: SKYLINK_ORIGIN, changeOrigin: false, ws: true },
    },
  },
})
