/**
 * sqlparser-rs - SQL Parser for JavaScript/TypeScript
 *
 * This package wraps the Rust sqlparser crate via WebAssembly, providing
 * a fast and accurate SQL parser for JavaScript and TypeScript.
 *
 * @example
 * ```typescript
 * import { Parser, GenericDialect, PostgreSqlDialect } from 'sqlparser-rs';
 *
 * // Simple parsing
 * const statements = await Parser.parse('SELECT * FROM users', new GenericDialect());
 *
 * // With specific dialect
 * const pgStatements = await Parser.parse(
 *   'SELECT * FROM users WHERE id = $1',
 *   new PostgreSqlDialect()
 * );
 *
 * // Builder pattern with options
 * const parser = new Parser(new PostgreSqlDialect())
 *   .withRecursionLimit(50)
 *   .withOptions({ trailingCommas: true });
 *
 * const ast = await parser.parseAsync('SELECT * FROM users');
 *
 * // Format SQL
 * const formatted = await Parser.format('select * from users', new GenericDialect());
 * // Returns: "SELECT * FROM users"
 *
 * // Validate SQL
 * try {
 *   await Parser.validate('SELECT * FRO users', new GenericDialect());
 * } catch (e) {
 *   console.log('Invalid SQL:', e.message);
 * }
 * ```
 *
 * @packageDocumentation
 */

// Parser
export { Parser, initWasm } from './parser';
export type { ParserOptions } from './parser';

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
  dialectFromString,
  SUPPORTED_DIALECTS,
} from './dialects';
export type { Dialect, DialectName } from './dialects';

// Types
export * from './types';
