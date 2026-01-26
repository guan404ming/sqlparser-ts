#!/bin/bash

set -e

echo "=========================================="
echo "Building sqlparser-rs npm package"
echo "=========================================="

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo ""
echo "Project directory: $PROJECT_DIR"
echo ""

# Check for wasm-pack
if ! command -v wasm-pack &> /dev/null; then
    echo "Error: wasm-pack is not installed."
    echo "Install it with: cargo install wasm-pack"
    echo "Or visit: https://rustwasm.github.io/wasm-pack/installer/"
    exit 1
fi

# Build WASM for Node.ts
echo "Step 1: Building WASM module for Node.ts..."
cd "$PROJECT_DIR"
wasm-pack build --target nodets --out-dir ts/wasm

echo ""
echo "Step 2: Installing npm dependencies..."
cd "$PROJECT_DIR/ts"
npm install

echo ""
echo "Step 3: Building TypeScript..."
npm run build:esm
npm run build:cts

echo ""
echo "=========================================="
echo "Build complete!"
echo "=========================================="
echo ""
echo "Output files:"
echo "  - WASM: ts/wasm/"
echo "  - ESM:  ts/dist/esm/"
echo "  - CJS:  ts/dist/cts/"
echo "  - Types: ts/dist/types/"
echo ""
echo "To run tests: cd ts && npm test"
echo "To publish: cd ts && npm publish"
