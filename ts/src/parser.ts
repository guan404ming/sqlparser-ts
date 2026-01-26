import type { Dialect } from './dialects';
import { GenericDialect } from './dialects';
import { ParserError, WasmInitError } from './types/errors';
import type { Statement } from './types/ast';

/**
 * Parser options
 */
export interface ParserOptions {
  /**
   * Allow trailing commas in SELECT lists
   */
  trailingCommas?: boolean;

  /**
   * Maximum recursion depth for parsing nested expressions
   */
  recursionLimit?: number;
}

// WASM module interface
interface WasmModule {
  parse_sql: (dialect: string, sql: string) => unknown;
  parse_sql_with_options: (dialect: string, sql: string, options: unknown) => unknown;
  parse_sql_to_json_string: (dialect: string, sql: string) => string;
  parse_sql_to_string: (dialect: string, sql: string) => string;
  format_sql: (dialect: string, sql: string) => string;
  validate_sql: (dialect: string, sql: string) => boolean;
  get_supported_dialects: () => string[];
}

// Global WASM module instance
let wasmModule: WasmModule | null = null;
let wasmInitPromise: Promise<WasmModule> | null = null;

/**
 * Initialize the WASM module
 * This is called automatically when needed, but can be called manually for eager loading
 */
export async function initWasm(): Promise<void> {
  await getWasmModule();
}

/**
 * Get or initialize the WASM module
 */
async function getWasmModule(): Promise<WasmModule> {
  if (wasmModule) {
    return wasmModule;
  }

  if (wasmInitPromise) {
    return wasmInitPromise;
  }

  wasmInitPromise = (async () => {
    try {
      // Try to load the WASM module
      // Use dynamic path to avoid TypeScript path resolution issues
      // The path is relative to the compiled output in dist/cjs or dist/esm
      const wasmPath = '../../wasm/sqlparser_rs_wasm.js';
      const wasm = await import(/* webpackIgnore: true */ wasmPath);
      wasmModule = wasm as unknown as WasmModule;
      return wasmModule;
    } catch (error) {
      throw new WasmInitError(
        `Failed to initialize WASM module: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  })();

  return wasmInitPromise;
}

/**
 * Get the WASM module synchronously (throws if not initialized)
 */
function getWasmModuleSync(): WasmModule {
  if (!wasmModule) {
    throw new WasmInitError(
      'WASM module not initialized. Call initWasm() first or use async methods.'
    );
  }
  return wasmModule;
}

/**
 * SQL Parser
 *
 * Parses SQL statements into an Abstract Syntax Tree (AST).
 *
 * @example
 * ```typescript
 * import { Parser, PostgreSqlDialect } from 'sqlparser-rs';
 *
 * // Simple parsing
 * const statements = await Parser.parse('SELECT * FROM users', new PostgreSqlDialect());
 *
 * // With builder pattern
 * const parser = new Parser(new PostgreSqlDialect())
 *   .withRecursionLimit(50)
 *   .withOptions({ trailingCommas: true });
 *
 * const ast = await parser.parseAsync('SELECT * FROM users');
 * ```
 */
export class Parser {
  private dialect: Dialect;
  private options: ParserOptions;

  /**
   * Create a new parser instance
   *
   * @param dialect - The SQL dialect to use (defaults to GenericDialect)
   */
  constructor(dialect: Dialect = new GenericDialect()) {
    this.dialect = dialect;
    this.options = {};
  }

  /**
   * Set the recursion limit for parsing nested expressions
   *
   * @param limit - Maximum recursion depth
   * @returns This parser instance for chaining
   */
  withRecursionLimit(limit: number): Parser {
    this.options.recursionLimit = limit;
    return this;
  }

  /**
   * Set parser options
   *
   * @param options - Parser options
   * @returns This parser instance for chaining
   */
  withOptions(options: ParserOptions): Parser {
    this.options = { ...this.options, ...options };
    return this;
  }

  /**
   * Parse SQL statements asynchronously
   *
   * @param sql - SQL string to parse
   * @returns Array of parsed statements
   */
  async parseAsync(sql: string): Promise<Statement[]> {
    const wasm = await getWasmModule();
    return this.parseWithWasm(wasm, sql);
  }

  /**
   * Parse SQL statements synchronously
   * Requires WASM module to be initialized first via initWasm()
   *
   * @param sql - SQL string to parse
   * @returns Array of parsed statements
   */
  parseSync(sql: string): Statement[] {
    const wasm = getWasmModuleSync();
    return this.parseWithWasm(wasm, sql);
  }

  private parseWithWasm(wasm: WasmModule, sql: string): Statement[] {
    try {
      const hasOptions = Object.keys(this.options).length > 0;

      if (hasOptions) {
        const result = wasm.parse_sql_with_options(
          this.dialect.name,
          sql,
          this.options
        );
        return result as Statement[];
      } else {
        const result = wasm.parse_sql(this.dialect.name, sql);
        return result as Statement[];
      }
    } catch (error) {
      throw ParserError.fromWasmError(error);
    }
  }

  // ============================================================================
  // Static methods for simple one-off parsing
  // ============================================================================

  /**
   * Parse SQL statements (async)
   *
   * @param sql - SQL string to parse
   * @param dialect - SQL dialect to use
   * @returns Array of parsed statements
   *
   * @example
   * ```typescript
   * const statements = await Parser.parse('SELECT 1', new GenericDialect());
   * ```
   */
  static async parse(sql: string, dialect: Dialect = new GenericDialect()): Promise<Statement[]> {
    const parser = new Parser(dialect);
    return parser.parseAsync(sql);
  }

  /**
   * Parse SQL and return the AST as a JSON string (async)
   *
   * @param sql - SQL string to parse
   * @param dialect - SQL dialect to use
   * @returns JSON string representation of the AST
   */
  static async parseToJson(sql: string, dialect: Dialect = new GenericDialect()): Promise<string> {
    const wasm = await getWasmModule();
    try {
      return wasm.parse_sql_to_json_string(dialect.name, sql);
    } catch (error) {
      throw ParserError.fromWasmError(error);
    }
  }

  /**
   * Parse SQL and return a formatted string representation (async)
   *
   * @param sql - SQL string to parse
   * @param dialect - SQL dialect to use
   * @returns String representation of the parsed SQL
   */
  static async parseToString(sql: string, dialect: Dialect = new GenericDialect()): Promise<string> {
    const wasm = await getWasmModule();
    try {
      return wasm.parse_sql_to_string(dialect.name, sql);
    } catch (error) {
      throw ParserError.fromWasmError(error);
    }
  }

  /**
   * Format SQL by parsing and regenerating it (round-trip)
   *
   * @param sql - SQL string to format
   * @param dialect - SQL dialect to use
   * @returns Formatted SQL string
   */
  static async format(sql: string, dialect: Dialect = new GenericDialect()): Promise<string> {
    const wasm = await getWasmModule();
    try {
      return wasm.format_sql(dialect.name, sql);
    } catch (error) {
      throw ParserError.fromWasmError(error);
    }
  }

  /**
   * Validate SQL syntax without returning the full AST
   *
   * @param sql - SQL string to validate
   * @param dialect - SQL dialect to use
   * @returns true if valid, throws ParserError if invalid
   */
  static async validate(sql: string, dialect: Dialect = new GenericDialect()): Promise<boolean> {
    const wasm = await getWasmModule();
    try {
      return wasm.validate_sql(dialect.name, sql);
    } catch (error) {
      throw ParserError.fromWasmError(error);
    }
  }

  /**
   * Get the list of supported dialect names
   */
  static async getSupportedDialects(): Promise<string[]> {
    const wasm = await getWasmModule();
    return wasm.get_supported_dialects();
  }
}
