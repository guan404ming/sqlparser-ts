# sqlparser-rs

[![npm version](https://img.shields.io/npm/v/sqlparser-rs.svg)](https://www.npmjs.com/package/sqlparser-rs)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-16+-green.svg)](https://nodejs.org/)
[![WebAssembly](https://img.shields.io/badge/WebAssembly-powered-blueviolet.svg)](https://webassembly.org/)
[![sqlparser](https://img.shields.io/badge/sqlparser--rs-v0.60.0-orange.svg)](https://github.com/apache/datafusion-sqlparser-rs)

A SQL parser for JavaScript and TypeScript, powered by [datafusion-sqlparser-rs](https://github.com/apache/datafusion-sqlparser-rs) via WebAssembly.

## Features

- Parse SQL into a detailed Abstract Syntax Tree (AST)
- Support for 13+ SQL dialects (PostgreSQL, MySQL, SQLite, BigQuery, etc.)
- Full TypeScript type definitions
- Works in Node.js and browsers
- Fast and accurate parsing using the battle-tested Rust implementation
- Zero native dependencies

## Installation

```bash
npm install sqlparser-rs
```

## Quick Start

```typescript
import { Parser, GenericDialect, PostgreSqlDialect } from 'sqlparser-rs';

// Simple parsing
const statements = await Parser.parse('SELECT * FROM users', new GenericDialect());
console.log(statements);

// With specific dialect
const pgStatements = await Parser.parse(
  'SELECT * FROM users WHERE id = $1',
  new PostgreSqlDialect()
);

// Format SQL
const formatted = await Parser.format('select   *   from   users', new GenericDialect());
console.log(formatted); // "SELECT * FROM users"

// Validate SQL
try {
  await Parser.validate('SELEC * FROM users', new GenericDialect());
} catch (error) {
  console.log('Invalid SQL:', error.message);
}
```

## API

### Parser

The main class for parsing SQL.

#### Static Methods

```typescript
// Parse SQL into statements
const statements = await Parser.parse(sql: string, dialect: Dialect): Promise<Statement[]>;

// Parse and return JSON string
const json = await Parser.parseToJson(sql: string, dialect: Dialect): Promise<string>;

// Parse and return formatted SQL string
const formatted = await Parser.parseToString(sql: string, dialect: Dialect): Promise<string>;

// Format SQL (round-trip through parser)
const formatted = await Parser.format(sql: string, dialect: Dialect): Promise<string>;

// Validate SQL syntax
const isValid = await Parser.validate(sql: string, dialect: Dialect): Promise<boolean>;

// Get list of supported dialects
const dialects = await Parser.getSupportedDialects(): Promise<string[]>;
```

#### Instance Methods (Builder Pattern)

```typescript
import { Parser, PostgreSqlDialect } from 'sqlparser-rs';

const parser = new Parser(new PostgreSqlDialect())
  .withRecursionLimit(50)      // Set max recursion depth
  .withOptions({               // Set parser options
    trailingCommas: true
  });

// Parse asynchronously
const statements = await parser.parseAsync('SELECT * FROM users');

// Parse synchronously (requires initWasm() first)
import { initWasm } from 'sqlparser-rs';
await initWasm();
const statements = parser.parseSync('SELECT * FROM users');
```

### Dialects

All dialects from the upstream Rust crate are supported:

```typescript
import {
  GenericDialect,      // Permissive, accepts most SQL syntax
  AnsiDialect,         // ANSI SQL standard
  MySqlDialect,        // MySQL
  PostgreSqlDialect,   // PostgreSQL
  SQLiteDialect,       // SQLite
  SnowflakeDialect,    // Snowflake
  RedshiftDialect,     // Amazon Redshift
  MsSqlDialect,        // Microsoft SQL Server
  ClickHouseDialect,   // ClickHouse
  BigQueryDialect,     // Google BigQuery
  DuckDbDialect,       // DuckDB
  DatabricksDialect,   // Databricks
  HiveDialect,         // Apache Hive
} from 'sqlparser-rs';

// Create dialect from string
import { dialectFromString } from 'sqlparser-rs';
const dialect = dialectFromString('postgresql'); // Returns PostgreSqlDialect instance
```

### Error Handling

```typescript
import { Parser, GenericDialect, ParserError } from 'sqlparser-rs';

try {
  await Parser.parse('SELEC * FROM users', new GenericDialect());
} catch (error) {
  if (error instanceof ParserError) {
    console.log('Parse error:', error.message);
    if (error.location) {
      console.log(`At line ${error.location.line}, column ${error.location.column}`);
    }
  }
}
```

### AST Types

Full TypeScript types are provided for the AST:

```typescript
import type { Statement, Query, Expr, Ident, ObjectName } from 'sqlparser-rs';

const statements: Statement[] = await Parser.parse('SELECT 1', new GenericDialect());

// Statement is a discriminated union type
for (const stmt of statements) {
  if ('Query' in stmt) {
    const query: Query = stmt.Query;
    console.log('Found SELECT query');
  } else if ('Insert' in stmt) {
    console.log('Found INSERT statement');
  }
}
```

## Building from Source

### Prerequisites

- Rust toolchain (1.70+)
- wasm-pack (`cargo install wasm-pack`)
- Node.js (16+)

### Build

```bash
# Build everything
./scripts/build.sh

# Or step by step:
# 1. Build WASM
wasm-pack build --target nodejs --out-dir ts/wasm

# 2. Build TypeScript
cd ts
npm install
npm run build
```

### Run Tests

```bash
cd ts
npm test
```

## Version

| This package | sqlparser-rs |
|--------------|--------------|
| 0.60.0-x     | 0.60.0       |

## License

Apache-2.0, matching the upstream Rust crate.

## Related Projects

- [datafusion-sqlparser-rs](https://github.com/apache/datafusion-sqlparser-rs) - The Rust SQL parser this package wraps
- [Apache DataFusion](https://github.com/apache/datafusion) - Query execution framework using sqlparser-rs
