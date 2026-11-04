import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    open: false,
    watch: {
      ignored: [
        '**/rawafiles/**',
        '**/Alkram Meta Eggs _ Home_files/**',
        '**/*_files/**'
      ]
    }
  }
})
