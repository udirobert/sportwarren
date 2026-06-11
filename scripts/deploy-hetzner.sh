#!/usr/bin/env bash
set -euo pipefail

# SportWarren Hetzner Deployment Wrapper
# Automates Build -> Upload -> Deploy to 'snel-bot'

SSH_TARGET="snel-bot"
REMOTE_PATH="/tmp"
REMOTE_APP_ROOT="/opt/sportwarren-api"

echo "🚀 Starting Tactical Deployment to $SSH_TARGET..."

# 1. Build locally (API-only artifact, frontend on Vercel)
echo "📦 Building API-only artifact..."
ARTIFACT_PATH=$(bash scripts/build-runtime-artifact.sh | tail -n 1)
ARTIFACT_NAME=$(basename "$ARTIFACT_PATH")

if [ ! -f "$ARTIFACT_PATH" ]; then
  echo "❌ Build failed, artifact not found at $ARTIFACT_PATH"
  exit 1
fi

# 2. Apply pending migrations from the build machine (uses local node_modules +
# DATABASE_URL from .env to connect to the remote DB). If this fails, abort
# before uploading so the server keeps the previous working release.
echo "🗄️  Running prisma migrate deploy..."
if [ -z "${DATABASE_URL:-}" ]; then
  DATABASE_URL=$(node -e "const dotenv = require('dotenv'); dotenv.config({ path: '.env' }); dotenv.config({ path: '.env.local', override: true }); process.stdout.write(process.env.DATABASE_URL || '');")
  export DATABASE_URL
fi

if [ -z "${DATABASE_URL:-}" ]; then
  echo "❌ DATABASE_URL is not set. Add it to .env or export it before deploying."
  exit 1
fi

if ! npx prisma migrate deploy; then
  echo "❌ Migration failed — aborting deploy to keep previous release live"
  exit 1
fi

# 3. Upload to server
echo "📤 Uploading $ARTIFACT_NAME to $SSH_TARGET..."
scp "$ARTIFACT_PATH" "$SSH_TARGET:$REMOTE_PATH/"

# 4. Extract the fresh deploy script from the new artifact so changes to
# the deploy script itself take effect in the same release (not one-deploy-lag).
echo "⚡ Extracting deploy script from new artifact..."
ssh "$SSH_TARGET" "tar -xzf $REMOTE_PATH/$ARTIFACT_NAME -C /tmp ./scripts/deploy-runtime-release.sh"

# 5. Trigger remote deploy script
echo "⚡ Executing remote deployment script..."
ssh "$SSH_TARGET" "bash /tmp/scripts/deploy-runtime-release.sh $REMOTE_PATH/$ARTIFACT_NAME"

# 6. Final health check
echo "✅ Deployment complete. Waiting for restart..."
sleep 5
echo "🩺 Running health check..."
curl -s "https://api.sportwarren.com/api/health" | grep -q '"status":"ok"' && echo "✨ System is HEALTHY" || echo "⚠️ System status is UNCERTAIN (check manually)"

echo "🏁 Mission Accomplished."
