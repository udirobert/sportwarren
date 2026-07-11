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

# Generate Prisma client BEFORE the build so webpack's standalone trace can
# statically capture .prisma/client/ files (if it ever learns to follow them).
pnpm prisma generate

# Build full Next.js app (required for API route compilation)
# We'll prune frontend bloat after build
# Disable Turbopack to avoid hash-based module names that break Prisma
DISABLE_SENTRY_BUILD=true NODE_OPTIONS='--max-old-space-size=8192' pnpm exec next build --webpack

if [ ! -d .next/standalone ]; then
  echo "Missing .next/standalone build output"
  exit 1
fi

# Copy standalone server (API-only mode)
# Next.js standalone output path varies: it includes the workspace project dir
# when built from a monorepo (e.g. .next/standalone/Dev/sportwarren/).
# Use find to locate server.js at any depth instead of hardcoding paths.
STANDALONE_SERVER=$(find .next/standalone -name server.js -maxdepth 4 2>/dev/null | head -1)
if [ -z "$STANDALONE_SERVER" ]; then
  echo "ERROR: Could not find standalone server output"
  exit 1
fi
cp -RL "$(dirname "$STANDALONE_SERVER")" "$BUILD_DIR/.next/standalone"

# Copy prisma schema and config (needed for migrations)
cp -R prisma "$BUILD_DIR/prisma"
[ -f prisma.config.ts ] && cp prisma.config.ts "$BUILD_DIR/prisma.config.ts"

# Copy Prisma client so @prisma/client/default.js resolves at runtime.
# require('.prisma/client/default') in default.js is a MODULE path (not relative)
# — Node resolves it by walking node_modules/ looking for .prisma/client/
# The standalone trace copies @prisma/client as a real dir but does NOT include
# .prisma/client/ (which is loaded dynamically at runtime). We need a top-level
# node_modules/.prisma symlink so Node's module resolution finds it.
PRISMA_PNPM_DIR=$(find node_modules/.pnpm -maxdepth 2 -type d -name '@prisma+client@*' 2>/dev/null | head -1)
if [ -n "$PRISMA_PNPM_DIR" ]; then
  PNPM_PKG_NAME=$(basename "$PRISMA_PNPM_DIR")
  mkdir -p "$BUILD_DIR/.next/standalone/node_modules/.pnpm"
  # Copy the entire @prisma+client pnpm package (contains @prisma/client + .prisma/client)
  if [ ! -d "$BUILD_DIR/.next/standalone/node_modules/.pnpm/$PNPM_PKG_NAME" ]; then
    cp -R "$PRISMA_PNPM_DIR" "$BUILD_DIR/.next/standalone/node_modules/.pnpm/"
  fi
  # Create top-level .prisma symlink so require('.prisma/client/default') resolves
  # through Node's module path traversal from @prisma/client/default.js
  rm -rf "$BUILD_DIR/.next/standalone/node_modules/.prisma"
  ln -sfn ".pnpm/$PNPM_PKG_NAME/node_modules/.prisma" "$BUILD_DIR/.next/standalone/node_modules/.prisma"
fi

# ── PNPM PACKAGE RESOLUTION ──
# The standalone trace copies some packages but misses transitive deps that
# are loaded dynamically at runtime (pg-types, pg-connection-string, etc.).
# We scan for common miss patterns and materialize symlinks for them.
# Also: some packages are traced as real directories that need symlink
# replacement to point into the bundled .pnpm store.

# Map of pnpm sub-path -> target symlink path inside standalone node_modules
# Each entry: <pnpm-fragment>|<link-path>|<top-level-relative-link-target>
PNPM_LINKS="
@swc+helpers@|@swc/helpers|../.pnpm/%PKG%/node_modules/@swc/helpers
@next+env@|@next/env|../.pnpm/%PKG%/node_modules/@next/env
"

# Add all pg-* runtime deps that pg requires dynamically
for _pg_pkg in pg-types pg-connection-string pgpass pg-pool pg-protocol pg-cloudflare; do
  PNPM_LINKS="${PNPM_LINKS}
${_pg_pkg}@|${_pg_pkg}|.pnpm/%PKG%/node_modules/${_pg_pkg}
"
done

# Transitive deps of pg-types (loaded dynamically at runtime)
for _dep in postgres-interval xtend; do
  PNPM_LINKS="${PNPM_LINKS}
${_dep}@|${_dep}|.pnpm/%PKG%/node_modules/${_dep}
"
done

# ── PLATFORM NATIVE BINARIES ──
# Some deps (resvg, sharp, prisma) have platform-specific native binaries that
# can't be installed on macOS but are needed at runtime on the Linux Hetzner
# server. The standalone trace doesn't include them because they're resolved
# dynamically based on process.platform. We download and inject them directly.

# Reusable helper: download a platform-specific native binary from npm registry
# and symlink it into the artifact's .pnpm store at top-level node_modules.
# Usage: _inject_native_pkg <package-name> <version-command> <fallback-version> <warning-message>
_inject_native_pkg() {
  local _pkg="$1" _ver_cmd="$2" _fallback_ver="$3" _warning="$4"
  # Derive tarball name by replacing @scope/name with scope-name
  local _tgz_name=$(echo "$_pkg" | sed 's|@||; s|/|-|')
  local _ver=$(node -e "$_ver_cmd" 2>/dev/null) || local _ver="$_fallback_ver"
  local _tgz_path="/tmp/${_tgz_name}-${_ver}.tgz"
  
  if [ ! -f "$_tgz_path" ]; then
    echo "  📥 Downloading $_pkg@$_ver..."
    (cd /tmp && npm pack "${_pkg}@${_ver}" 2>/dev/null)
  fi
  
  if [ -f "$_tgz_path" ]; then
    local _target_dir="$BUILD_DIR/.next/standalone/node_modules/.pnpm/${_pkg}@${_ver}/node_modules/${_pkg}"
    mkdir -p "$_target_dir"
    tar -xzf "$_tgz_path" -C "$_target_dir" --strip-components=1 2>/dev/null
    # Create parent scope directory if needed (e.g. @resvg, @img)
    local _scope_dir=$(dirname "$BUILD_DIR/.next/standalone/node_modules/$_pkg")
    rm -rf "$BUILD_DIR/.next/standalone/node_modules/$_pkg"
    mkdir -p "$_scope_dir"
    ln -sfn "../.pnpm/${_pkg}@${_ver}/node_modules/${_pkg}" "$BUILD_DIR/.next/standalone/node_modules/$_pkg"
    echo "  ✓ injected $_pkg@$_ver"
  else
    echo "  ⚠ WARNING: Could not download $_pkg — $_warning"
  fi
}

_inject_native_pkg \
  "@resvg/resvg-js-linux-x64-gnu" \
  "try { const p = require('@resvg/resvg-js/package.json'); console.log(p.version); } catch(e) { console.log('2.6.2'); }" \
  "2.6.2" \
  "moment-render will fail on Linux"

_inject_native_pkg \
  "@img/sharp-linux-x64" \
  "try { const p = require('@img/sharp-darwin-arm64/package.json'); console.log(p.version); } catch(e) { console.log('0.34.5'); }" \
  "0.34.5" \
  "image processing will fail on Linux"

_inject_native_pkg \
  "@img/sharp-libvips-linux-x64" \
  "try { const p = require('@img/sharp-libvips-darwin-arm64/package.json'); console.log(p.version); } catch(e) { console.log('1.2.4'); }" \
  "1.2.4" \
  "sharp libvips will fail on Linux"

# ── ARTIFACT VALIDATION ──
# Sanity-check that critical modules resolve before shipping the artifact.
# The standalone trace misses dynamically-loaded deps; this catches that early.
echo "🩺 Validating artifact module resolution..."
cd "$BUILD_DIR/.next/standalone"

# sharp's native addon dlopen()s libvips as a genuinely separate shared object
# (unlike @resvg/resvg-js's statically-linked Rust binary) — the OS dynamic
# linker doesn't go through Node's module resolution to find it. Harmless
# no-op when building on macOS: sharp only looks for a linux-x64 binary when
# actually running on linux, so this path is simply never consulted locally.
# The deploy targets (this validation step, the CI smoke-test boot, and
# production's ecosystem.config.cjs) all need the identical export.
export LD_LIBRARY_PATH="$(pwd)/node_modules/@img/sharp-libvips-linux-x64/lib${LD_LIBRARY_PATH:+:$LD_LIBRARY_PATH}"

_VALIDATION_FAILED=0
for _mod in '@prisma/client' 'pg' '@resvg/resvg-js' 'sharp' '@swc/helpers/_/_interop_require_default'; do
  # `|| true` is required: under `set -e`, a failing command inside a plain
  # `var=$(...)` assignment aborts the script immediately (bash does NOT
  # suppress -e for assignment command-substitutions) — it skipped straight
  # to script exit before this loop's own if/else could report which module
  # failed or why. The try/catch (rather than piping raw stderr through
  # `head`) surfaces `err.message` directly — a raw Node stack trace's first
  # line is just a useless `node:internal/...:NNN` frame header, not the
  # actual error.
  _err=$(node -e "try { require('$_mod'); } catch (e) { console.error(e.message); process.exit(1); }" 2>&1 1>/dev/null) || true
  if [ -z "$_err" ]; then
    echo "  ✓ $_mod"
  else
    echo "  ✗ $_mod — $_err"
    _VALIDATION_FAILED=1
  fi
done
cd "$ROOT_DIR"
if [ "$_VALIDATION_FAILED" -eq 1 ]; then
  echo "❌ Artifact validation FAILED — some modules won't resolve at runtime"
  exit 1
fi
echo "✅ Artifact validation passed — all critical modules resolve"

while IFS='|' read -r _pnpm_pattern _link_path _link_target; do
  [ -z "$_pnpm_pattern" ] && continue
  _pkg_dir=$(find "$BUILD_DIR/.next/standalone/node_modules/.pnpm" -maxdepth 3 -type d -name "${_pnpm_pattern}*" 2>/dev/null | head -1)
  if [ -z "$_pkg_dir" ]; then
    # Try from the local node_modules/.pnpm if not found in artifact
    _pkg_dir=$(find "$ROOT_DIR/node_modules/.pnpm" -maxdepth 2 -type d -name "${_pnpm_pattern}*" 2>/dev/null | head -1)
    if [ -n "$_pkg_dir" ]; then
      _pkg_name=$(basename "$_pkg_dir")
      mkdir -p "$BUILD_DIR/.next/standalone/node_modules/.pnpm"
      if [ ! -d "$BUILD_DIR/.next/standalone/node_modules/.pnpm/$_pkg_name" ]; then
        cp -R "$_pkg_dir" "$BUILD_DIR/.next/standalone/node_modules/.pnpm/"
      fi
      _pkg_dir="$BUILD_DIR/.next/standalone/node_modules/.pnpm/$_pkg_name"
    fi
  fi
  if [ -n "$_pkg_dir" ]; then
    _pkg_name=$(basename "$_pkg_dir")
    _target="$BUILD_DIR/.next/standalone/node_modules/$_link_path"
    rm -rf "$_target"
    mkdir -p "$(dirname "$_target")"
    _resolved_target=$(echo "$_link_target" | sed "s/%PKG%/$_pkg_name/g")
    ln -sfn "$_resolved_target" "$_target"
    echo "  ✓ linked $_link_path -> $_resolved_target"
  fi
done <<< "$PNPM_LINKS"

# Copy deploy script and configs
mkdir -p "$BUILD_DIR/scripts/maintenance"
cp scripts/deploy-runtime-release.sh "$BUILD_DIR/scripts/deploy-runtime-release.sh"
cp scripts/maintenance/*.ts "$BUILD_DIR/scripts/maintenance/"
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

# Remove pages router output but keep 500.html (Next.js needs it as error fallback)
if [ -d "$BUILD_DIR/.next/standalone/.next/server/pages" ]; then
  find "$BUILD_DIR/.next/standalone/.next/server/pages" -mindepth 1 -maxdepth 1 ! -name '500.html' -exec rm -rf {} +
fi

# Keep all required manifests - Next.js standalone server needs them at boot

# Remove image optimization (frontend-only feature)
rm -rf "$BUILD_DIR/.next/standalone/.next/server/image-optimizer*"

# Cleanup
find "$BUILD_DIR" -name '.DS_Store' -delete
# Delete .env files from the tarball to prevent credential leakage.
# The remote deploy-runtime-release.sh creates a symlink to shared/.env instead.
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

# ── PRUNING ──
# Keep only the most recent 5 artifacts to save disk space
echo "🧹 Pruning old artifacts (keeping last 5)..."
# List by time, exclude directories, skip first 5, delete remaining
ls -tp "$ARTIFACTS_DIR"/sportwarren-api-*.tar.gz 2>/dev/null | grep -v '/$' | tail -n +6 | xargs -I {} rm -- {} || true

# Report size reduction
ORIGINAL_SIZE=$(du -sh .next/standalone 2>/dev/null | cut -f1 || echo "unknown")
API_SIZE=$(du -sh "$BUILD_DIR" 2>/dev/null | cut -f1 || echo "unknown")
echo "✅ API-only artifact: $API_SIZE (original standalone: $ORIGINAL_SIZE)"
echo "$ARTIFACT_PATH"
