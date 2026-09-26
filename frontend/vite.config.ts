import path from 'path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// configure vite with react and path alias resolution
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
})
