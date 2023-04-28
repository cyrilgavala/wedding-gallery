import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['**/*.vitest.*'],
    globals: true,
    environment: 'jsdom',
    mockReset: true,
    setupFiles: './setupTests.ts',
  },
});
