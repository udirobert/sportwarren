#!/usr/bin/env bash
set -euo pipefail

APP_ROOT="/opt/sportwarren-api"
CURRENT_DIR="$APP_ROOT/current"
SHARED_DIR="$APP_ROOT/shared"
ENV_FILE="$SHARED_DIR/.env"

if [ $# -lt 1 ]; then
  echo "Usage: $0 <script-name.ts>"
  exit 1
fi

SCRIPT_PATH="$SHARED_DIR/scripts/maintenance/$1"

if [ ! -f "$SCRIPT_PATH" ]; then
  echo "Script not found: $SCRIPT_PATH"
  exit 1
fi

# Export all variables from .env if it exists
if [ -f "$ENV_FILE" ]; then
  set -o allexport
  source "$ENV_FILE"
  set +o allexport
fi

# Run with npx tsx from the current release directory to use its node_modules
cd "$CURRENT_DIR"
npx tsx "$SCRIPT_PATH"
