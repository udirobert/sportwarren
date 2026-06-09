#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(pwd)
BUILD_DIR="$ROOT_DIR/.deploy-artifact"
ARTIFACTS_DIR="$ROOT_DIR/artifacts"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
ARTIFACT_NAME="sportwarren-api-${TIMESTAMP}.tar.gz"
ARTIFACT_PATH="$ARTIFACTS_DIR/$ARTIFACT_NAME"

if [ ! -d node_modules ]; then
  echo "Missing node_modules. Run 'pnpm install --frozen-lockfile' before building the runtime artifact."
  exit 1
fi

rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR/.next" "$ARTIFACTS_DIR"

# Build full Next.js app (required for API route compilation)
# We'll prune frontend bloat after build
DISABLE_SENTRY_BUILD=true NODE_OPTIONS='--max-old-space-size=8192' node_modules/.bin/next build . --webpack
pnpm prisma generate

if [ ! -d .next/standalone ]; then
  echo "Missing .next/standalone build output"
  exit 1
fi

# Copy standalone server (API-only mode)
cp -R .next/standalone "$BUILD_DIR/.next/standalone"

# Copy prisma schema and config (needed for migrations)
cp -R prisma "$BUILD_DIR/prisma"
[ -f prisma.config.ts ] && cp prisma.config.ts "$BUILD_DIR/prisma.config.ts"

# Copy deploy script and configs
mkdir -p "$BUILD_DIR/scripts"
cp scripts/deploy-runtime-release.sh "$BUILD_DIR/scripts/deploy-runtime-release.sh"
cp package.json "$BUILD_DIR/package.json"
cp ecosystem.config.cjs "$BUILD_DIR/ecosystem.config.cjs"

# ── API-ONLY OPTIMIZATION ──
# Remove frontend bloat from standalone output
echo "🗑️  Pruning frontend from standalone output..."

# Remove .next/static (frontend JS/CSS bundles) - Vercel handles this
rm -rf "$BUILD_DIR/.next/static"

# Remove public directory (frontend assets) - Vercel handles this
rm -rf "$BUILD_DIR/public"

# Remove frontend app routes (keep only API routes)
# App Router compiles to .next/server/app/ - we keep only api/ subdirectory
if [ -d "$BUILD_DIR/.next/standalone/.next/server/app" ]; then
  # Find all directories in app/ except 'api'
  find "$BUILD_DIR/.next/standalone/.next/server/app" -mindepth 1 -maxdepth 1 -type d ! -name 'api' -exec rm -rf {} +
  # Find all files in app/ (page files like page_client-reference-manifest.js)
  find "$BUILD_DIR/.next/standalone/.next/server/app" -maxdepth 1 -type f -delete
fi

# Remove pages router output if it exists (legacy pages)
rm -rf "$BUILD_DIR/.next/standalone/.next/server/pages"

# Keep all required manifests - Next.js standalone server needs them at boot

# Remove image optimization (frontend-only feature)
rm -rf "$BUILD_DIR/.next/standalone/.next/server/image-optimizer*"

# Cleanup
find "$BUILD_DIR" -name '.DS_Store' -delete
find "$BUILD_DIR" -type f \( \
  -name '.env' -o \
  -name '.env.*' -o \
  -name '*.env' -o \
  -name '*.env.*' \
\) -delete

export COPYFILE_DISABLE=1
if tar --help 2>/dev/null | grep -q -- '--no-xattrs'; then
  tar --no-xattrs -C "$BUILD_DIR" -czf "$ARTIFACT_PATH" .
else
  tar -C "$BUILD_DIR" -czf "$ARTIFACT_PATH" .
fi

# Report size reduction
ORIGINAL_SIZE=$(du -sh .next/standalone 2>/dev/null | cut -f1 || echo "unknown")
API_SIZE=$(du -sh "$BUILD_DIR" 2>/dev/null | cut -f1 || echo "unknown")
echo "✅ API-only artifact: $API_SIZE (original standalone: $ORIGINAL_SIZE)"
echo "$ARTIFACT_PATH"
