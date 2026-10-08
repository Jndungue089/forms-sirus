import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    server: {
      // Backend (forms-sirus-back); evita CORS ao servir tudo na mesma origem.
      proxy: { '/api': env.BACKEND_URL || 'http://localhost:3001' },
    },
  }
})
