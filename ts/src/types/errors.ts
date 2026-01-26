/**
 * Location information for parser errors
 */
export interface ErrorLocation {
  line: number;
  column: number;
}

/**
 * Error thrown when SQL parsing fails
 */
export class ParserError extends Error {
  public readonly location?: ErrorLocation;

  constructor(message: string, location?: ErrorLocation) {
    super(message);
    this.name = 'ParserError';
    this.location = location;

    // Maintain proper stack trace in V8 environments
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ParserError);
    }
  }

  /**
   * Create a ParserError from a WASM error object
   */
  static fromWasmError(error: unknown): ParserError {
    if (typeof error === 'string') {
      return new ParserError(error);
    }

    if (error && typeof error === 'object') {
      const err = error as Record<string, unknown>;
      const message = typeof err.message === 'string' ? err.message : String(error);
      const location =
        typeof err.line === 'number' && typeof err.column === 'number'
          ? { line: err.line, column: err.column }
          : undefined;
      return new ParserError(message, location);
    }

    return new ParserError(String(error));
  }
}

/**
 * Error thrown when WASM module fails to initialize
 */
export class WasmInitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WasmInitError';

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, WasmInitError);
    }
  }
}
