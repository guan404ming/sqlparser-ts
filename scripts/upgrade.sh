#!/bin/bash

# Upgrade script for sqlparser-rs
# Usage: ./scripts/upgrade.sh 0.61.0

set -e

if [ -z "$1" ]; then
    echo "Usage: $0 <version>"
    echo "Example: $0 0.61.0"
    exit 1
fi

VERSION=$1
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "Upgrading to sqlparser v${VERSION}..."

# Update Cargo.toml
sed -i '' "s/sqlparser = { version = \"[^\"]*\"/sqlparser = { version = \"${VERSION}\"/" "$PROJECT_DIR/Cargo.toml"
sed -i '' "s/^version = \"[^\"]*\"/version = \"${VERSION}\"/" "$PROJECT_DIR/Cargo.toml"

# Update package.json
sed -i '' "s/\"version\": \"[^\"]*\"/\"version\": \"${VERSION}\"/" "$PROJECT_DIR/ts/package.json"

# Update README badge
sed -i '' "s/sqlparser--rs-v[0-9.]*-orange/sqlparser--rs-v${VERSION}-orange/" "$PROJECT_DIR/README.md"

echo ""
echo "Updated to v${VERSION}. Next steps:"
echo ""
echo "1. Check upstream changelog for breaking changes:"
echo "   https://github.com/apache/datafusion-sqlparser-rs/releases"
echo ""
echo "2. Update AST types if needed:"
echo "   - Check new/removed statement types"
echo "   - Check changed field names"
echo ""
echo "3. Update dialects if new ones added:"
echo "   - src/lib.rs (Rust bindings)"
echo "   - ts/src/dialects.ts (TypeScript)"
echo ""
echo "4. Build and test:"
echo "   ./scripts/build.sh"
echo "   cd ts && npm test"
echo ""
echo "5. Commit and tag:"
echo "   git add -A"
echo "   git commit -m 'chore: upgrade to sqlparser v${VERSION}'"
echo "   git tag v${VERSION}"
