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
let initStarted = false;

const isBrowser = typeof window !== 'undefined' && typeof process === 'undefined';

function startInit(): void {
  if (initStarted) return;
  initStarted = true;
  initPromise = initWasm().catch(() => {
    // Silently ignore init errors - they'll be thrown when APIs are used
  });
}

// Start init on module load
startInit();

/** Get initialized WASM module or throw */
export function getWasmModule(): WasmModule {
  if (wasmModule) {
    return wasmModule;
  }
  throw new WasmInitError(
    'WASM module not yet initialized. Use the async import or wait for module to load: import("@guanmingchiu/sqlparser-ts").then(({ parse }) => parse(sql))'
  );
}

/**
 * Wait for WASM module to be ready
 */
export async function ready(): Promise<void> {
  startInit();
  await initPromise;
}

/**
 * Initialize the WASM module explicitly.
 * Usually not needed - the module auto-initializes on first use.
 */
export async function initWasm(): Promise<void> {
  if (wasmModule) {
    return;
  }

  if (isBrowser) {
    try {
      const wasmJsUrl = new URL('../wasm/sqlparser_rs_wasm_web.js', import.meta.url);
      const wasmBinaryUrl = new URL('../wasm/sqlparser_rs_wasm_web_bg.wasm', import.meta.url);

      const wasm = await import(/* @vite-ignore */ wasmJsUrl.href);

      if (typeof wasm.default === 'function') {
        await wasm.default({ module_or_path: wasmBinaryUrl });
      }

      wasmModule = wasm as WasmModule;
    } catch (error) {
      throw new WasmInitError(
        `Failed to load WASM module in browser: ${error instanceof Error ? error.message : String(error)}`
      );
    }
    return;
  }

  // Node.js
  try {
    const wasmUrl = new URL('../wasm/sqlparser_rs_wasm.js', import.meta.url);
    const wasm = await import(/* @vite-ignore */ wasmUrl.href);
    wasmModule = wasm as WasmModule;
  } catch (error) {
    throw new WasmInitError(
      `Failed to load WASM module: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
