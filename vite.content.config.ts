import { defineConfig } from 'vite'
import { resolve } from 'path'

// Builds the small scripts the manifest references directly:
// content.js (run on AI sites) and background.js (MV3 service worker).
function extScript(name: 'content' | 'background') {
  return defineConfig({
    publicDir: false,
    build: {
      emptyOutDir: false,
      lib: {
        entry: resolve(__dirname, `src/${name}.ts`),
        formats: ['iife'],
        name: `MyPrompts${name[0].toUpperCase()}${name.slice(1)}`,
        fileName: () => `${name}.js`,
      },
    },
  })
}

export const viteContentConfig = extScript('content')
export const viteBackgroundConfig = extScript('background')

// Kept so `vite --config vite.content.config.ts` still builds content.js.
export default viteContentConfig