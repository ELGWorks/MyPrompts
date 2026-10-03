import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  publicDir: false,
  build: {
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, 'src/content.ts'),
      formats: ['iife'],
      name: 'MyPromptsContent',
      fileName: () => 'content.js',
    },
  },
})