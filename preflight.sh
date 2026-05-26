#!/usr/bin/env bash
# Run before pushing: verifies the build and tests pass.
# Usage:  bash preflight.sh
# Hook:   git config core.hooksPath .githooks  (once per clone)
set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"
echo ""
echo "▶ Build…"
node "$ROOT/build.mjs"
echo ""
echo "▶ Tests…"
npm test --prefix "$ROOT"
echo ""
echo "✓ Preflight passed"
