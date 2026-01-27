/**
 * Verify ESM and CJS builds work correctly
 *
 * These tests import from the built dist/ files (not source)
 * to ensure both module formats are properly generated and functional.
 */

import { createRequire } from 'module';

/**
 * ESM (ECMAScript Modules) build tests
 * Uses dynamic import() to load dist/index.mjs
 */
describe('ESM build', () => {
  test('exports are available', async () => {
    const esm = await import('../dist/index.mjs');

    expect(typeof esm.parse).toBe('function');
    expect(typeof esm.format).toBe('function');
    expect(typeof esm.validate).toBe('function');
    expect(typeof esm.Parser).toBe('function');
    expect(typeof esm.GenericDialect).toBe('function');
  });

  test('parse works', async () => {
    const { parse } = await import('../dist/index.mjs');
    const result = parse('SELECT 1');
    expect(Array.isArray(result)).toBe(true);
  });

  test('format works', async () => {
    const { format } = await import('../dist/index.mjs');
    const result = format('select 1');
    expect(result).toBe('SELECT 1');
  });

  test('dialect string works', async () => {
    const { parse } = await import('../dist/index.mjs');
    const result = parse('SELECT $1', 'postgresql');
    expect(Array.isArray(result)).toBe(true);
  });
});

/**
 * CJS (CommonJS) build tests
 * Uses createRequire() to load dist/index.cjs
 */
describe('CJS build', () => {
  // createRequire allows using require() in ESM context
  const require = createRequire(import.meta.url);

  test('exports are available', () => {
    const cjs = require('../dist/index.cjs');

    expect(typeof cjs.parse).toBe('function');
    expect(typeof cjs.format).toBe('function');
    expect(typeof cjs.validate).toBe('function');
    expect(typeof cjs.Parser).toBe('function');
    expect(typeof cjs.GenericDialect).toBe('function');
  });

  test('parse works', async () => {
    const { parse, ready } = require('../dist/index.cjs');
    await ready();
    const result = parse('SELECT 1');
    expect(Array.isArray(result)).toBe(true);
  });

  test('format works', async () => {
    const { format, ready } = require('../dist/index.cjs');
    await ready();
    const result = format('select 1');
    expect(result).toBe('SELECT 1');
  });

  test('dialect string works', async () => {
    const { parse, ready } = require('../dist/index.cjs');
    await ready();
    const result = parse('SELECT $1', 'postgresql');
    expect(Array.isArray(result)).toBe(true);
  });
});
