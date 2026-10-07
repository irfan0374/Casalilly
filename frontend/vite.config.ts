import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // @ffmpeg/ffmpeg starts its worker via `new URL("./worker.js", import.meta.url)`.
  // Pre-bundling moves the library into .vite/deps where that file doesn't
  // exist (404), so ffmpeg.load() hung forever in dev and compression never
  // started. Serving it unbundled keeps the worker next to it.
  optimizeDeps: {
    exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util'],
  },
  server: {
    port: 5180,
    strictPort: true,
  },
})
