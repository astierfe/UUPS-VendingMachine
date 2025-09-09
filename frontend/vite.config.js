import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/UUPS-VendingMachine/', // 👈 AJOUT pour GitHub Pages
  define: {
    global: 'globalThis',
  },
  server: {
    port: 3000
  },
  build: {
    outDir: 'dist' // 👈 AJOUT pour clarifier le dossier de sortie
  }
})