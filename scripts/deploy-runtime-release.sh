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

if [ -f "$SHARED_DIR/.env" ]; then
  ln -sfn "$SHARED_DIR/.env" "$RELEASE_DIR/.env"
fi

ln -sfn "$RELEASE_DIR" "$CURRENT_LINK"

if pm2 describe "$APP_NAME" >/dev/null 2>&1; then
  pm2 startOrReload "$APP_ROOT/current/ecosystem.config.cjs" --only "$APP_NAME" --update-env
else
  pm2 start "$APP_ROOT/current/ecosystem.config.cjs" --only "$APP_NAME" --update-env
fi

pm2 save

find "$RELEASES_DIR" -mindepth 1 -maxdepth 1 -type d | sort | head -n -"$KEEP_RELEASES" | xargs -r rm -rf

echo "Deployed $APP_NAME to $RELEASE_DIR on port $PORT"
