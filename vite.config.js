import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    watch: {
      // Ignorar archivos comprimidos para que no causen crashes al watcher
      ignored: ['**/*.zip', '**/*.rar', '**/*.7z'],
    },
  },
})
