# sqlparser-ts

[![npm version](https://img.shields.io/npm/v/@guanmingchiu/sqlparser-ts.svg)](https://www.npmjs.com/package/@guanmingchiu/sqlparser-ts)
[![npm downloads](https://img.shields.io/npm/dm/@guanmingchiu/sqlparser-ts.svg)](https://www.npmjs.com/package/@guanmingchiu/sqlparser-ts)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)
[![WebAssembly](https://img.shields.io/badge/WebAssembly-powered-blueviolet.svg)](https://webassembly.org/)
[![sqlparser](https://img.shields.io/badge/sqlparser--rs-v0.61.0-orange.svg)](https://github.com/apache/datafusion-sqlparser-rs)

SQL parser for JavaScript and TypeScript, powered by [datafusion-sqlparser-rs](https://github.com/apache/datafusion-sqlparser-rs) via WebAssembly.

## Features

- Parse SQL into a detailed AST with full TypeScript types
- Support 14 SQL dialects (PostgreSQL, MySQL, SQLite, BigQuery, and more)
- Run in Node.js and browsers
- Stay small (~600KB gzipped) and fast (Rust + WebAssembly)
- Ship zero native dependencies

## Installation

```bash
npm install @guanmingchiu/sqlparser-ts
```

## Usage

```typescript
import { init, parse, format, validate } from '@guanmingchiu/sqlparser-ts';

// Initialize WASM module (must be called once before using any parser functions)
await init();

// Parse SQL into AST
const ast = parse('SELECT * FROM users');

// With specific dialect
const ast = parse('SELECT * FROM users WHERE id = $1', 'postgresql');

// Format SQL
const sql = format('select   *   from   users');
// "SELECT * FROM users"

// Validate SQL (throws on invalid)
validate('SELECT * FROM users'); // ok
```

### Vite Configuration

WASM packages must be excluded from Vite's dev server [dependency pre-bundling](https://github.com/vitejs/vite/discussions/9256). This only affects the dev server. Production builds use Rollup instead of esbuild and handle WASM files correctly.

```typescript
// vite.config.ts
export default defineConfig({
  optimizeDeps: {
    exclude: ['@guanmingchiu/sqlparser-ts'],
  },
});
```

### Working with AST

```typescript
// Parse and inspect
const ast = parse('SELECT id, name FROM users WHERE active = true');
console.log(JSON.stringify(ast, null, 2));

// Multiple statements
const statements = parse(`
  SELECT * FROM users;
  SELECT * FROM orders;
`);
console.log(statements.length); // 2

// Modify AST and convert back to SQL
const ast = parse('SELECT * FROM users')[0];
// ... modify ast ...
const sql = format(JSON.stringify([ast]));
```

### Error Handling

```typescript
try {
  parse('SELEC * FORM users');
} catch (e) {
  console.error(e.message); // Parse error details
}
```

## Supported Dialects

`generic`, `ansi`, `mysql`, `postgresql`, `sqlite`, `snowflake`, `redshift`, `mssql`, `clickhouse`, `bigquery`, `duckdb`, `databricks`, `hive`, `oracle`

## Versioning

Follows [Semantic Versioning](https://semver.org/) with upstream tracking:

- MAJOR.MINOR: Tracks upstream [datafusion-sqlparser-rs](https://github.com/apache/datafusion-sqlparser-rs)
- PATCH: sqlparser-ts specific releases

Example: `0.60.4` = upstream 0.60 + 4 sqlparser-ts releases

## License

Apache-2.0
