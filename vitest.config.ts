import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    globals: true,
    setupFiles: ['./tests/setup.ts'],
  },
  resolve: {
    alias: {
      '../src': path.resolve(__dirname, './dist/index.mjs'),
      '../../src': path.resolve(__dirname, './dist/index.mjs'),
      '../../../src': path.resolve(__dirname, './dist/index.mjs'),
    },
  },
});
