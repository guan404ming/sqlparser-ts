/**
 * SQL parser for JavaScript/TypeScript, powered by Rust + WebAssembly
 * @packageDocumentation
 */

// Parser
export { Parser, init, parse, validate, format } from './parser.js';
export type { ParserOptions, DialectInput } from './parser.js';

// Dialects
export {
  GenericDialect,
  AnsiDialect,
  MySqlDialect,
  PostgreSqlDialect,
  SQLiteDialect,
  SnowflakeDialect,
  RedshiftDialect,
  MsSqlDialect,
  ClickHouseDialect,
  BigQueryDialect,
  DuckDbDialect,
  DatabricksDialect,
  HiveDialect,
  OracleDialect,
  dialectFromString,
  SUPPORTED_DIALECTS,
} from './dialects.js';
export type { Dialect, DialectName } from './dialects.js';

// Types
export * from './types/index.js';
