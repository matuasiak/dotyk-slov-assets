import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'es2019',
    sourcemap: true,
    cssCodeSplit: false,
    rollupOptions: {
      input: resolve(process.cwd(), 'src/theme/main.js'),
      output: {
        entryFileNames: 'dotyk-slov.js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames(assetInfo) {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) return 'dotyk-slov.css';
          return 'assets/[name]-[hash][extname]';
        }
      }
    }
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    cors: true
  }
});
