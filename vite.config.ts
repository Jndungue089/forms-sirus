import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Backend local (forms-sirus-back); evita CORS ao servir tudo na mesma origem.
    proxy: { '/api': 'http://localhost:3001' },
  },
})
