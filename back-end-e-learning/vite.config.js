import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Optionnel : ajoute ceci pour voir les erreurs plus facilement
    strictPort: true, 
  }
})