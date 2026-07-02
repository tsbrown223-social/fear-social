import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: { outDir: 'dist', sourcemap: false },
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'https://fear.social',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
