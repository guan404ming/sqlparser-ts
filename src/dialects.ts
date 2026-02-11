/**
 * SQL Dialects
 *
 * Each dialect class represents a specific SQL dialect supported by the parser.
 * These are thin wrappers that provide type safety and a clean API.
 */

/**
 * Base interface for all dialects
 */
export interface Dialect {
  /** The name of the dialect as recognized by the WASM module */
  readonly name: string;
}

/**
 * Generic SQL dialect - accepts most SQL syntax
 */
export class GenericDialect implements Dialect {
  readonly name = 'generic';
}

/**
 * ANSI SQL standard dialect
 */
export class AnsiDialect implements Dialect {
  readonly name = 'ansi';
}

/**
 * MySQL dialect
 */
export class MySqlDialect implements Dialect {
  readonly name = 'mysql';
}

/**
 * PostgreSQL dialect
 */
export class PostgreSqlDialect implements Dialect {
  readonly name = 'postgresql';
}

/**
 * SQLite dialect
 */
export class SQLiteDialect implements Dialect {
  readonly name = 'sqlite';
}

/**
 * Snowflake dialect
 */
export class SnowflakeDialect implements Dialect {
  readonly name = 'snowflake';
}

/**
 * Amazon Redshift dialect
 */
export class RedshiftDialect implements Dialect {
  readonly name = 'redshift';
}

/**
 * Microsoft SQL Server dialect
 */
export class MsSqlDialect implements Dialect {
  readonly name = 'mssql';
}

/**
 * ClickHouse dialect
 */
export class ClickHouseDialect implements Dialect {
  readonly name = 'clickhouse';
}

/**
 * Google BigQuery dialect
 */
export class BigQueryDialect implements Dialect {
  readonly name = 'bigquery';
}

/**
 * DuckDB dialect
 */
export class DuckDbDialect implements Dialect {
  readonly name = 'duckdb';
}

/**
 * Databricks dialect
 */
export class DatabricksDialect implements Dialect {
  readonly name = 'databricks';
}

/**
 * Apache Hive dialect
 */
export class HiveDialect implements Dialect {
  readonly name = 'hive';
}

/**
 * Oracle dialect
 */
export class OracleDialect implements Dialect {
  readonly name = 'oracle';
}

/**
 * All supported dialect names
 */
export const SUPPORTED_DIALECTS = [
  'generic',
  'ansi',
  'mysql',
  'postgresql',
  'sqlite',
  'snowflake',
  'redshift',
  'mssql',
  'clickhouse',
  'bigquery',
  'duckdb',
  'databricks',
  'hive',
  'oracle',
] as const;

export type DialectName = (typeof SUPPORTED_DIALECTS)[number];

/**
 * Map of dialect names to dialect classes
 */
const DIALECT_MAP: Record<DialectName, new () => Dialect> = {
  generic: GenericDialect,
  ansi: AnsiDialect,
  mysql: MySqlDialect,
  postgresql: PostgreSqlDialect,
  sqlite: SQLiteDialect,
  snowflake: SnowflakeDialect,
  redshift: RedshiftDialect,
  mssql: MsSqlDialect,
  clickhouse: ClickHouseDialect,
  bigquery: BigQueryDialect,
  duckdb: DuckDbDialect,
  databricks: DatabricksDialect,
  hive: HiveDialect,
  oracle: OracleDialect,
};

/** Create a dialect instance from a string name (case-insensitive) */
export function dialectFromString(name: string): Dialect | undefined {
  const normalized = name.toLowerCase() as DialectName;

  // Handle common aliases
  const aliasMap: Record<string, DialectName> = {
    postgres: 'postgresql',
    pg: 'postgresql',
    sqlserver: 'mssql',
    duck: 'duckdb',
  };

  const dialectName = aliasMap[normalized] ?? normalized;
  const DialectClass = DIALECT_MAP[dialectName];

  return DialectClass ? new DialectClass() : undefined;
}
