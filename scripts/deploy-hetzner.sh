#!/usr/bin/env bash
set -euo pipefail

# SportWarren Hetzner Deployment Wrapper
# Automates Build -> Upload -> Deploy to 'snel-bot'

SSH_TARGET="snel-bot"
REMOTE_PATH="/tmp"
REMOTE_APP_ROOT="/opt/sportwarren-api"

echo "🚀 Starting Tactical Deployment to $SSH_TARGET..."

# 1. Build locally
echo "📦 Building runtime artifact..."
ARTIFACT_PATH=$(bash scripts/build-runtime-artifact.sh | tail -n 1)
ARTIFACT_NAME=$(basename "$ARTIFACT_PATH")

if [ ! -f "$ARTIFACT_PATH" ]; then
  echo "❌ Build failed, artifact not found at $ARTIFACT_PATH"
  exit 1
fi

# 2. Upload to server
echo "📤 Uploading $ARTIFACT_NAME to $SSH_TARGET..."
scp "$ARTIFACT_PATH" "$SSH_TARGET:$REMOTE_PATH/"

# 3. Trigger remote deploy script
echo "⚡ Executing remote deployment script..."
ssh "$SSH_TARGET" "bash $REMOTE_APP_ROOT/current/scripts/deploy-runtime-release.sh $REMOTE_PATH/$ARTIFACT_NAME"

# 4. Final health check
echo "✅ Deployment complete. Waiting for restart..."
sleep 5
echo "🩺 Running health check..."
curl -s "https://api.sportwarren.com/api/health" | grep -q '"status":"ok"' && echo "✨ System is HEALTHY" || echo "⚠️ System status is UNCERTAIN (check manually)"

echo "🏁 Mission Accomplished."
