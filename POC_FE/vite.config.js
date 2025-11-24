import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // ✅ Tailwind v4 plugin for Vite
  ],
  optimizeDeps: {
    exclude: ['antd'],
  },
})
