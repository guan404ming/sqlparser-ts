#!/bin/bash

# Patch script - release your own fixes without changing upstream version
# Usage: ./scripts/patch.sh

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR/ts"

# Get current version
CURRENT=$(node -p "require('./package.json').version")

# Check if already a patch version (e.g., 0.60.0-1)
if [[ "$CURRENT" =~ -[0-9]+$ ]]; then
    # Increment: 0.60.0-1 → 0.60.0-2
    BASE=$(echo "$CURRENT" | sed 's/-[0-9]*$//')
    PATCH_NUM=$(echo "$CURRENT" | grep -oE '[0-9]+$')
    NEW_PATCH=$((PATCH_NUM + 1))
    NEW_VERSION="${BASE}-${NEW_PATCH}"
else
    # First patch: 0.60.0 → 0.60.0-1
    NEW_VERSION="${CURRENT}-1"
fi

echo "Patching: $CURRENT → $NEW_VERSION"

# Update package.json
npm version "$NEW_VERSION" --no-git-tag-version

echo ""
echo "Version updated to $NEW_VERSION"
echo ""
echo "Next steps:"
echo "  1. Build:   ./scripts/build.sh"
echo "  2. Test:    cd ts && npm test"
echo "  3. Commit:  git add -A && git commit -m 'fix: description'"
echo "  4. Tag:     git tag v$NEW_VERSION"
echo "  5. Push:    git push && git push --tags"
echo ""
echo "CI will auto-publish to npm when tag is pushed."
