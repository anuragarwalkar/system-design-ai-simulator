import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Relative base for GitHub Pages deployment
  server: {
    port: 5173,
    open: true,
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp'
    }
  },
  optimizeDeps: {
    exclude: ['@wasm-engine']
  },
  build: {
    target: 'esnext'
  }
});
