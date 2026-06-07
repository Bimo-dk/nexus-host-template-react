import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Re-emits Vite's auto-injected `<script type="module">` tags as
 * `<script type="module-shim">` so es-module-shims (loaded in
 * index.html) handles every module the host runs. Without this,
 * native-federation's late-injected import map is ignored by the
 * native loader and any Angular remote chunk with shared `@angular/core`
 * imports throws "Failed to resolve module specifier" (B-22).
 */
function moduleShim(): Plugin {
  return {
    name: 'nexus-module-shim',
    transformIndexHtml(html) {
      return html.replace(/<script\s+type="module"/g, '<script type="module-shim"');
    },
  };
}

export default defineConfig({
  plugins: [react(), moduleShim()],
  build: {
    outDir: 'dist',
    target: 'esnext',
  },
  server: {
    port: 8667,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://localhost:8670',
        changeOrigin: true,
      },
    },
  },
});
