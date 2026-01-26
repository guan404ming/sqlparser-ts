import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      // Redirect src imports to dist/cjs for testing
      '../src': path.resolve(__dirname, './dist/cjs/index.js'),
      '../../src': path.resolve(__dirname, './dist/cjs/index.js'),
      '../../../src': path.resolve(__dirname, './dist/cjs/index.js'),
    },
  },
});
