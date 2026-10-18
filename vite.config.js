import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5173,
    open: true,
    headers: {
      // Security headers for high-performance SharedArrayBuffer & WebAssembly if used
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
