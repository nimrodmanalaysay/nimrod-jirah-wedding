import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ============================================================
// Vite Configuration
//
// `base` MUST match your GitHub repository name exactly.
// Example: if your repo URL is
//   https://github.com/yourname/nimrod-jirah-wedding
// then base should be:
//   '/nimrod-jirah-wedding/'
//
// ✏️ Change the base value below if your repo name is different.
// ============================================================
// vite.config.js
export default defineConfig({
  plugins: [react()],
  base: '/',   // ← change from '/nimrod-jirah-wedding/' to just '/'
})