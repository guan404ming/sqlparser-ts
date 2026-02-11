import { WasmInitError } from './types/errors.js';

/** WASM module interface */
export interface WasmModule {
  parse_sql: (dialect: string, sql: string) => unknown;
  parse_sql_with_options: (dialect: string, sql: string, options: unknown) => unknown;
  parse_sql_to_json_string: (dialect: string, sql: string) => string;
  parse_sql_to_string: (dialect: string, sql: string) => string;
  format_sql: (dialect: string, sql: string) => string;
  validate_sql: (dialect: string, sql: string) => boolean;
  get_supported_dialects: () => string[];
}

let wasmModule: WasmModule | null = null;
let initPromise: Promise<void> | null = null;

const isBrowser = typeof window !== 'undefined' && typeof process === 'undefined';

/** Get initialized WASM module or throw */
export function getWasmModule(): WasmModule {
  if (wasmModule) {
    return wasmModule;
  }
  throw new WasmInitError(
    'WASM module not yet initialized. Call `await init()` before using the parser.'
  );
}

/**
 * Initialize the WASM module. Must be called before using any parser functions.
 * Safe to call multiple times, subsequent calls are no-ops.
 */
export async function init(): Promise<void> {
  if (wasmModule) {
    return;
  }

  if (!initPromise) {
    initPromise = (async () => {
      try {
        const wasm = await import(/* @vite-ignore */ '../wasm/sqlparser_rs_wasm.js');

        if (isBrowser) {
          const wasmUrl = new URL('../wasm/sqlparser_rs_wasm_bg.wasm', import.meta.url);
          await wasm.default({ module_or_path: wasmUrl });
        } else {
          const { readFile } = await import(/* @vite-ignore */ 'node:fs/promises');
          const wasmPath = new URL('../wasm/sqlparser_rs_wasm_bg.wasm', import.meta.url);
          const bytes = await readFile(wasmPath);
          await wasm.default({ module_or_path: bytes });
        }

        wasmModule = wasm as WasmModule;
      } catch (error) {
        throw new WasmInitError(
          `Failed to load WASM module: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    })();
  }

  await initPromise;
}
