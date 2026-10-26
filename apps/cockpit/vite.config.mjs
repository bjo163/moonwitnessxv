import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

const dir = import.meta.dirname

export default defineConfig({
  plugins: [react()],
  root: resolve(dir, 'client'),
  build: {
    outDir: resolve(dir, 'dist/client'),
    emptyOutDir: true,
  },
})
