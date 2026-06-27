import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],

  base: '/',

  build: {
    // Output directly into the backend folder so FastAPI serves it.
    outDir: path.resolve(__dirname, 'kaara_backend/dist'),
    emptyOutDir: true,
  },

  server: {
    port: 5173,
    // During development: forward /api calls to the FastAPI backend.
    // This means you can run `npm run dev` AND `uvicorn` simultaneously
    // without any CORS issues — the browser always talks to port 5173.
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
})
