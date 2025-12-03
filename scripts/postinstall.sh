#!/bin/bash

# Remove test files and non-code files from thread-stream package
# This is a workaround for Next.js 16 Turbopack trying to bundle test files

echo "Cleaning up thread-stream package..."

# Remove test directories
find node_modules/.pnpm/thread-stream@*/node_modules/thread-stream/test -type d -exec rm -rf {} + 2>/dev/null || true

# Remove bench.js
find node_modules/.pnpm/thread-stream@*/node_modules/thread-stream -name "bench.js" -type f -delete 2>/dev/null || true

# Remove LICENSE and README that cause parsing errors
find node_modules/.pnpm/thread-stream@*/node_modules/thread-stream -name "LICENSE" -type f -delete 2>/dev/null || true
find node_modules/.pnpm/thread-stream@*/node_modules/thread-stream -name "README.md" -type f -delete 2>/dev/null || true

echo "✓ Cleaned up thread-stream package successfully"
