import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: '/' for Vercel (served from root, not a subfolder)
export default defineConfig({
  plugins: [react()],
  base: '/',
})
