#!/usr/bin/env bash
set -euo pipefail

APP_NAME=${APP_NAME:-sportwarren-api}
APP_ROOT=${APP_ROOT:-/opt/sportwarren-api}
SHARED_DIR="$APP_ROOT/shared"
RELEASES_DIR="$APP_ROOT/releases"
CURRENT_LINK="$APP_ROOT/current"
KEEP_RELEASES=${KEEP_RELEASES:-3}
PORT=${PORT:-5200}

if [ $# -lt 1 ]; then
  echo "Usage: $0 <artifact.tar.gz>"
  exit 1
fi

ARTIFACT_PATH=$1
if [ ! -f "$ARTIFACT_PATH" ]; then
  echo "Artifact not found: $ARTIFACT_PATH"
  exit 1
fi

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
RELEASE_DIR="$RELEASES_DIR/$TIMESTAMP"

mkdir -p "$SHARED_DIR" "$RELEASES_DIR" "$RELEASE_DIR"
mkdir -p "$SHARED_DIR/storage"

tar -C "$RELEASE_DIR" -xzf "$ARTIFACT_PATH"
ln -sfn "$SHARED_DIR/storage" "$RELEASE_DIR/storage"

if [ -d "$SHARED_DIR/.kite-passport" ]; then
  ln -sfn "$SHARED_DIR/.kite-passport" "$RELEASE_DIR/.kite-passport"
fi

if [ -f "$SHARED_DIR/.env" ]; then
  ln -sfn "$SHARED_DIR/.env" "$RELEASE_DIR/.env"
  # Next.js standalone loads .env from the directory containing server.js, not
  # from process.cwd. Replace the baked-in build-time snapshot with a symlink
  # so runtime-only secrets (KAPSO_API_KEY, WHATSAPP_PHONE_NUMBER_ID, etc.)
  # come from shared/.env on every release.
  if [ -f "$RELEASE_DIR/.next/standalone/.env" ]; then
    rm -f "$RELEASE_DIR/.next/standalone/.env"
  fi
  ln -sfn "$SHARED_DIR/.env" "$RELEASE_DIR/.next/standalone/.env"
fi

# Run pending Prisma migrations (Prisma 7.x needs prisma.config.ts + dotenv)
if [ -d "$RELEASE_DIR/prisma/migrations" ]; then
  echo "Running Prisma migrations..."
  (cd "$RELEASE_DIR" && npm install --no-save prisma dotenv 2>/dev/null)
  (cd "$RELEASE_DIR" && npx prisma migrate deploy) || echo "Warning: migration failed (may already be applied)"
  # Regenerate Prisma client in standalone bundle
  if [ -d "$RELEASE_DIR/.next/standalone/node_modules/@prisma" ]; then
    cp "$RELEASE_DIR/prisma/schema.prisma" "$RELEASE_DIR/.next/standalone/"
    (cd "$RELEASE_DIR/.next/standalone" && npx prisma generate)
    rm -f "$RELEASE_DIR/.next/standalone/schema.prisma"
  fi
fi

ln -sfn "$RELEASE_DIR" "$CURRENT_LINK"

# pm2 caches `cwd` on first start; a reload won't move it to the new release.
# Delete + start guarantees the new release's path is picked up.
if pm2 describe "$APP_NAME" >/dev/null 2>&1; then
  pm2 delete "$APP_NAME" >/dev/null
fi
pm2 start "$APP_ROOT/current/ecosystem.config.cjs" --only "$APP_NAME" --update-env

pm2 save

find "$RELEASES_DIR" -mindepth 1 -maxdepth 1 -type d | sort | head -n -"$KEEP_RELEASES" | xargs -r rm -rf

echo "Deployed $APP_NAME to $RELEASE_DIR on port $PORT"
