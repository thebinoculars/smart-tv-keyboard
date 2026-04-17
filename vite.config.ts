import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'SmartTVKeyboard',
      fileName: (format) => `smart-tv-keyboard.${format === 'es' ? 'esm' : format}.js`,
    },
    rollupOptions: {
      output: {
        assetFileNames: 'smart-tv-keyboard.[ext]',
      },
    },
  },
  server: {
    open: '/index.html',
  },
  root: '.',
})
