/**
 * Test utilities for sqlparser-ts TypeScript tests
 * Ported from the Rust test utilities
 */

import {
  Parser,
  GenericDialect,
  MySqlDialect,
  PostgreSqlDialect,
  BigQueryDialect,
  SnowflakeDialect,
  DuckDbDialect,
  MsSqlDialect,
  SQLiteDialect,
  RedshiftDialect,
  ClickHouseDialect,
  HiveDialect,
  AnsiDialect,
  OracleDialect,
  DatabricksDialect,
  type Dialect,
  type Statement,
} from '../src';

/**
 * Parse SQL with the given dialect and return statements
 */
export function parse(sql: string, dialect: Dialect = new GenericDialect()): Statement[] {
  return Parser.parse(sql, dialect);
}

/**
 * Parse SQL and expect exactly one statement
 */
export function parseOne(sql: string, dialect: Dialect = new GenericDialect()): Statement {
  const statements = parse(sql, dialect);
  if (statements.length !== 1) {
    throw new Error(`Expected 1 statement, got ${statements.length}`);
  }
  return statements[0];
}

/**
 * Parse SQL and verify it round-trips correctly (parse -> format -> parse)
 */
export function verifyRoundTrip(sql: string, dialect: Dialect = new GenericDialect()): void {
  const formatted = Parser.format(sql, dialect);
  // Parse the formatted SQL to ensure it's valid
  Parser.parse(formatted, dialect);
}

/**
 * Parse SQL and expect it to fail with an error
 */
export function expectParseError(sql: string, dialect: Dialect = new GenericDialect()): Error {
  try {
    Parser.parse(sql, dialect);
    throw new Error(`Expected parse error for: ${sql}`);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Expected parse error')) {
      throw error;
    }
    return error as Error;
  }
}

/**
 * Validate that SQL is syntactically correct
 */
export function validate(sql: string, dialect: Dialect = new GenericDialect()): boolean {
  return Parser.validate(sql, dialect);
}

/**
 * Format SQL using the parser's format function
 */
export function format(sql: string, dialect: Dialect = new GenericDialect()): string {
  return Parser.format(sql, dialect);
}

/**
 * Parse SQL to JSON string
 */
export function parseToJson(sql: string, dialect: Dialect = new GenericDialect()): string {
  return Parser.parseToJson(sql, dialect);
}

// Dialect instances for convenience
export const dialects = {
  generic: new GenericDialect(),
  ansi: new AnsiDialect(),
  mysql: new MySqlDialect(),
  postgresql: new PostgreSqlDialect(),
  postgres: new PostgreSqlDialect(), // alias
  bigquery: new BigQueryDialect(),
  snowflake: new SnowflakeDialect(),
  duckdb: new DuckDbDialect(),
  mssql: new MsSqlDialect(),
  sqlite: new SQLiteDialect(),
  redshift: new RedshiftDialect(),
  clickhouse: new ClickHouseDialect(),
  hive: new HiveDialect(),
  oracle: new OracleDialect(),
  databricks: new DatabricksDialect(),
};

/**
 * Test a SQL statement against multiple dialects
 */
export function testWithDialects(
  sql: string,
  dialectList: Dialect[],
  testFn: (statements: Statement[], dialect: Dialect) => void
): void {
  for (const dialect of dialectList) {
    const statements = parse(sql, dialect);
    testFn(statements, dialect);
  }
}

/**
 * Test that SQL parses successfully with all common dialects
 */
export function testAllDialects(
  sql: string,
  testFn?: (statements: Statement[], dialect: Dialect) => void
): void {
  const allDialects = [
    dialects.generic,
    dialects.mysql,
    dialects.postgresql,
    dialects.bigquery,
    dialects.snowflake,
    dialects.duckdb,
    dialects.mssql,
    dialects.sqlite,
  ];

  for (const dialect of allDialects) {
    try {
      const statements = parse(sql, dialect);
      if (testFn) {
        testFn(statements, dialect);
      }
    } catch {
      // Some SQL may not be valid in all dialects, that's expected
    }
  }
}

// Type guards for statement types
export function isQuery(stmt: Statement): boolean {
  return typeof stmt === 'object' && stmt !== null && 'Query' in stmt;
}

export function isInsert(stmt: Statement): boolean {
  return typeof stmt === 'object' && stmt !== null && 'Insert' in stmt;
}

export function isUpdate(stmt: Statement): boolean {
  return typeof stmt === 'object' && stmt !== null && 'Update' in stmt;
}

export function isDelete(stmt: Statement): boolean {
  return typeof stmt === 'object' && stmt !== null && 'Delete' in stmt;
}

export function isCreateTable(stmt: Statement): boolean {
  return typeof stmt === 'object' && stmt !== null && 'CreateTable' in stmt;
}

export function isCreateView(stmt: Statement): boolean {
  return typeof stmt === 'object' && stmt !== null && 'CreateView' in stmt;
}

export function isCreateIndex(stmt: Statement): boolean {
  return typeof stmt === 'object' && stmt !== null && 'CreateIndex' in stmt;
}

export function isAlterTable(stmt: Statement): boolean {
  return typeof stmt === 'object' && stmt !== null && 'AlterTable' in stmt;
}

export function isDrop(stmt: Statement): boolean {
  return typeof stmt === 'object' && stmt !== null && 'Drop' in stmt;
}

export function isTruncate(stmt: Statement): boolean {
  return typeof stmt === 'object' && stmt !== null && 'Truncate' in stmt;
}

export function isSetVariable(stmt: Statement): boolean {
  return typeof stmt === 'object' && stmt !== null && 'SetVariable' in stmt;
}

export function isExplain(stmt: Statement): boolean {
  return typeof stmt === 'object' && stmt !== null && 'Explain' in stmt;
}

export function isMerge(stmt: Statement): boolean {
  return typeof stmt === 'object' && stmt !== null && 'Merge' in stmt;
}

export function isCopy(stmt: Statement): boolean {
  return typeof stmt === 'object' && stmt !== null && 'Copy' in stmt;
}

export function isGrant(stmt: Statement): boolean {
  return typeof stmt === 'object' && stmt !== null && 'Grant' in stmt;
}

export function isRevoke(stmt: Statement): boolean {
  return typeof stmt === 'object' && stmt !== null && 'Revoke' in stmt;
}

export function isStartTransaction(stmt: Statement): boolean {
  return typeof stmt === 'object' && stmt !== null && 'StartTransaction' in stmt;
}

export function isCommit(stmt: Statement): boolean {
  return typeof stmt === 'object' && stmt !== null && 'Commit' in stmt;
}

export function isRollback(stmt: Statement): boolean {
  return typeof stmt === 'object' && stmt !== null && 'Rollback' in stmt;
}

export function isCreateSchema(stmt: Statement): boolean {
  return typeof stmt === 'object' && stmt !== null && 'CreateSchema' in stmt;
}

export function isCreateDatabase(stmt: Statement): boolean {
  return typeof stmt === 'object' && stmt !== null && 'CreateDatabase' in stmt;
}
