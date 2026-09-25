import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    globals: true,
    // Fase 1 heeft nog geen tests; vanaf fase 2 wel.
    passWithNoTests: true,
    // Pure logica draait in Node; island-tests zetten zelf `// @vitest-environment jsdom`.
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}', 'worker/**/*.test.ts'],
    exclude: ['tests/**', 'node_modules/**', 'dist/**'],
    coverage: {
      provider: 'v8',
      include: ['src/lib/**', 'worker/src/**'],
    },
  },
});
