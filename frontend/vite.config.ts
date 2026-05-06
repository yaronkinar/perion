import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 3000,
    // Vite rejects requests whose Host header is not in this list (403). In
    // Docker Compose, browsers and Playwright reach the dev server as
    // http://frontend:3000 — that Host must be allowed or /api proxying breaks
    // from sibling containers while same-container curl to 127.0.0.1 still works.
    allowedHosts: [
      'localhost',
      '.localhost',
      'frontend',
      ...(process.env.VITE_EXTRA_ALLOWED_HOSTS?.split(',')
        .map((h) => h.trim())
        .filter(Boolean) ?? []),
    ],
    proxy: {
      '/api': {
        target: process.env.VITE_API_TARGET ?? 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.test.ts'],
    setupFiles: ['./vitest.setup.ts'],
  },
});
