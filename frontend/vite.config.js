import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Proxy /api/* to the live Render backend — works without a local server.
      // To use a local backend instead, change target to 'http://localhost:5000'
      '/api': {
        target: 'https://loan-approval-platform.onrender.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
