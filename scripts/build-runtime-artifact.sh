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

DISABLE_SENTRY_BUILD=true pnpm build
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
cp package.json "$BUILD_DIR/package.json"
cp ecosystem.config.cjs "$BUILD_DIR/ecosystem.config.cjs"

if [ -f .env.production.example ]; then
  cp .env.production.example "$BUILD_DIR/.env.production.example"
fi

find "$BUILD_DIR" -name '.DS_Store' -delete

tar -C "$BUILD_DIR" -czf "$ARTIFACT_PATH" .

echo "$ARTIFACT_PATH"
