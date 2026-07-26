import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // Relative base so the built dist works whether it is uploaded to the domain
  // root or any subfolder (assets are referenced as ./assets/... instead of
  // /assets/...). Combined with HashRouter this makes the SPA portable.
  base: './',
  plugins: [react(), tailwindcss()],
})
