import type { Dialect, DialectName } from './dialects.js';
import { dialectFromString, GenericDialect } from './dialects.js';
import { ParserError } from './types/errors.js';
import type { Statement } from './types/ast.js';
import { getWasmModule } from './wasm.js';

export { initWasm, ready } from './wasm.js';

/** Dialect can be specified as a Dialect instance or a string name */
export type DialectInput = Dialect | DialectName;

function resolveDialect(dialect: DialectInput = 'generic'): Dialect {
  if (typeof dialect === 'string') {
    const resolved = dialectFromString(dialect);
    if (!resolved) {
      throw new Error(`Unknown dialect: ${dialect}`);
    }
    return resolved;
  }
  return dialect;
}

/**
 * Parser options
 */
export interface ParserOptions {
  /** Allow trailing commas in SELECT lists */
  trailingCommas?: boolean;
  /** Maximum recursion depth for parsing nested expressions */
  recursionLimit?: number;
}

/**
 * SQL Parser - parses SQL statements into AST
 *
 * @example
 * ```typescript
 * import { Parser, PostgreSqlDialect } from '@guanmingchiu/sqlparser-ts';
 *
 * const statements = Parser.parse('SELECT * FROM users', 'postgresql');
 *
 * // With options
 * const parser = new Parser(new PostgreSqlDialect())
 *   .withOptions({ trailingCommas: true });
 * const ast = parser.parse('SELECT a, b, FROM users');
 * ```
 */
export class Parser {
  private dialect: Dialect;
  private options: ParserOptions;

  constructor(dialect: Dialect = new GenericDialect()) {
    this.dialect = dialect;
    this.options = {};
  }

  /** Set recursion limit for parsing nested expressions */
  withRecursionLimit(limit: number): Parser {
    this.options.recursionLimit = limit;
    return this;
  }

  /** Set parser options */
  withOptions(options: ParserOptions): Parser {
    this.options = { ...this.options, ...options };
    return this;
  }

  /** Parse SQL statements */
  parse(sql: string): Statement[] {
    const wasm = getWasmModule();
    try {
      const hasOptions = Object.keys(this.options).length > 0;
      if (hasOptions) {
        return wasm.parse_sql_with_options(this.dialect.name, sql, this.options) as Statement[];
      }
      return wasm.parse_sql(this.dialect.name, sql) as Statement[];
    } catch (error) {
      throw ParserError.fromWasmError(error);
    }
  }

  // Static methods

  /** Parse SQL into AST */
  static parse(sql: string, dialect: DialectInput = 'generic'): Statement[] {
    return new Parser(resolveDialect(dialect)).parse(sql);
  }

  /** Parse SQL and return AST as JSON string */
  static parseToJson(sql: string, dialect: DialectInput = 'generic'): string {
    const wasm = getWasmModule();
    try {
      return wasm.parse_sql_to_json_string(resolveDialect(dialect).name, sql);
    } catch (error) {
      throw ParserError.fromWasmError(error);
    }
  }

  /** Parse SQL and return formatted string representation */
  static parseToString(sql: string, dialect: DialectInput = 'generic'): string {
    const wasm = getWasmModule();
    try {
      return wasm.parse_sql_to_string(resolveDialect(dialect).name, sql);
    } catch (error) {
      throw ParserError.fromWasmError(error);
    }
  }

  /** Format SQL by parsing and regenerating it */
  static format(sql: string, dialect: DialectInput = 'generic'): string {
    const wasm = getWasmModule();
    try {
      return wasm.format_sql(resolveDialect(dialect).name, sql);
    } catch (error) {
      throw ParserError.fromWasmError(error);
    }
  }

  /**
   * Validate SQL syntax
   * @throws ParserError if SQL is invalid
   */
  static validate(sql: string, dialect: DialectInput = 'generic'): boolean {
    const wasm = getWasmModule();
    try {
      return wasm.validate_sql(resolveDialect(dialect).name, sql);
    } catch (error) {
      throw ParserError.fromWasmError(error);
    }
  }

  /** Get list of supported dialect names */
  static getSupportedDialects(): string[] {
    return getWasmModule().get_supported_dialects();
  }
}

// Convenience functions

/**
 * Parse SQL into AST
 */
export function parse(sql: string, dialect: DialectInput = 'generic'): Statement[] {
  return Parser.parse(sql, dialect);
}

/**
 * Validate SQL syntax
 * @throws ParserError if SQL is invalid
 */
export function validate(sql: string, dialect: DialectInput = 'generic'): boolean {
  return Parser.validate(sql, dialect);
}

/**
 * Format SQL by parsing and regenerating it
 */
export function format(sql: string, dialect: DialectInput = 'generic'): string {
  return Parser.format(sql, dialect);
}
