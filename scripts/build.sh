#!/bin/bash

set -e

echo "=========================================="
echo "Building sqlparser-ts npm package"
echo "=========================================="

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo ""
echo "Project directory: $PROJECT_DIR"
echo ""

if ! command -v wasm-pack &> /dev/null; then
    echo "Error: wasm-pack is not installed."
    echo "Install it with: cargo install wasm-pack"
    echo "Or visit: https://rustwasm.github.io/wasm-pack/installer/"
    exit 1
fi

echo "Step 1: Building WASM module..."
cd "$PROJECT_DIR"
wasm-pack build --target web --out-dir ts/wasm

echo ""
echo "Step 2: Installing npm dependencies..."
cd "$PROJECT_DIR/ts"
npm install

echo ""
echo "Step 3: Building TypeScript..."
npm run build:ts

echo ""
echo "=========================================="
echo "Build complete!"
echo "=========================================="
echo ""
echo "Output files:"
echo "  - WASM:  ts/wasm/"
echo "  - ESM:   ts/dist/index.mjs"
echo "  - CJS:   ts/dist/index.cjs"
echo "  - Types: ts/dist/index.d.{mts,cts}"
echo ""
echo "To run tests: cd ts && npm test"
echo "To publish: cd ts && npm publish"
