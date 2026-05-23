import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Change base to your GitHub repo name if deploying to GitHub Pages
  // e.g. base: '/nimrod-jirah-wedding/'
  base: '/',
})
