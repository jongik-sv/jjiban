import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '~': fileURLToPath(new URL('./app', import.meta.url)),
      '~/types': fileURLToPath(new URL('./types', import.meta.url)),
      '~/stores': fileURLToPath(new URL('./app/stores', import.meta.url)),
      '~/components': fileURLToPath(new URL('./app/components', import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./tests/unit/setup.ts'],
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['server/utils/**/*.ts', 'app/components/**/*.vue', 'app/composables/**/*.ts'],
      exclude: ['**/node_modules/**', '**/tests/**'],
    },
  },
});
