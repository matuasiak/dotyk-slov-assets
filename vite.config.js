import { defineConfig } from 'vite';
import { resolve } from 'node:path';

const legacyStyleGuard = {
  name: 'dotyk-disable-legacy-style-loaders',
  transform(code, id) {
    if (!id.includes('/js/')) return null;
    if (!code.includes('function ensureCss') && !code.includes('function ensureStyles')) return null;

    const transformed = code
      .replace(/function\s+ensureCss\(\)\s*\{/g, 'function ensureCss(){if(window.DS_BUNDLED_THEME)return;')
      .replace(/function\s+ensureStyles\(\)\s*\{/g, 'function ensureStyles(){if(window.DS_BUNDLED_THEME)return;');

    return { code: transformed, map: null };
  }
};

export default defineConfig({
  base: './',
  plugins: [legacyStyleGuard],
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
    cors: {
      origin: ['https://www.dotykslov.sk', 'https://dotykslov.sk']
    },
    headers: {
      'Access-Control-Allow-Private-Network': 'true'
    }
  }
});
