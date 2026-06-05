#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(pwd)
BUILD_DIR="$ROOT_DIR/.deploy-artifact"
ARTIFACTS_DIR="$ROOT_DIR/artifacts"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
ARTIFACT_NAME="sportwarren-runtime-${TIMESTAMP}.tar.gz"
ARTIFACT_PATH="$ARTIFACTS_DIR/$ARTIFACT_NAME"

if [ ! -d node_modules ]; then
  echo "Missing node_modules. Run 'pnpm install --frozen-lockfile' before building the runtime artifact."
  exit 1
fi

rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR/.next" "$ARTIFACTS_DIR"

# Use direct binary call instead of `pnpm build` to work around shell snapshot
# issue where `2>&1` stderr redirect gets parsed as a positional argument by Next.js
DISABLE_SENTRY_BUILD=true NODE_OPTIONS='--max-old-space-size=8192' node_modules/.bin/next build .
pnpm prisma generate

if [ ! -d .next/standalone ]; then
  echo "Missing .next/standalone build output"
  exit 1
fi

if [ ! -d .next/static ]; then
  echo "Missing .next/static build output"
  exit 1
fi

cp -R .next/standalone "$BUILD_DIR/.next/standalone"
cp -R .next/static "$BUILD_DIR/.next/static"
cp -R public "$BUILD_DIR/public"
cp -R prisma "$BUILD_DIR/prisma"
[ -f prisma.config.ts ] && cp prisma.config.ts "$BUILD_DIR/prisma.config.ts"
mkdir -p "$BUILD_DIR/scripts"
cp scripts/deploy-runtime-release.sh "$BUILD_DIR/scripts/deploy-runtime-release.sh"
cp package.json "$BUILD_DIR/package.json"

# Regenerate Prisma client inside standalone bundle so it matches the schema.
# Non-fatal: the main `pnpm prisma generate` above already produced a working
# client; this step only refreshes platform-specific engine binaries.
cp prisma/schema.prisma "$BUILD_DIR/.next/standalone/"
(cd "$BUILD_DIR/.next/standalone" && npx prisma generate 2>/dev/null) || true
rm -f "$BUILD_DIR/.next/standalone/schema.prisma"

cp ecosystem.config.cjs "$BUILD_DIR/ecosystem.config.cjs"

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

echo "$ARTIFACT_PATH"
