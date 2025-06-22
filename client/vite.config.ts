import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// No need to import 'path'
export default defineConfig({
  plugins: [vue()],
  base: '/erp-cooley/',
  build: {
    outDir: '../docs',
    emptyOutDir: true,
  },
})
