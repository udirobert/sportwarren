# Lean Hetzner Runtime Deployment

This project can be deployed to Hetzner as a **runtime-only artifact** while the frontend remains on Vercel.

## Why
The full repository checkout on the server is unnecessarily large because it includes:
- full `node_modules`
- local Next build artifacts
- source files and git metadata

The PM2 runtime only needs the Next standalone server and its runtime assets.

## Runtime layout
Recommended server layout:

```text
/opt/sportwarren-api/
  current -> releases/<timestamp>
  releases/
  shared/
    .env
    storage/
  ecosystem.config.cjs
```

Each release contains only:
- `.next/standalone`
- `.next/static`
- `public`
- `prisma`
- `package.json`
- `ecosystem.config.cjs`

## Build artifact locally or in CI
First install dependencies in the workspace that will produce the release artifact:

```bash
pnpm install --frozen-lockfile
npm run deploy:runtime:build
```

This prints the generated artifact path, for example:
```text
artifacts/sportwarren-runtime-20260514-120000.tar.gz
```

## Server bootstrap
One-time setup on Hetzner:
```bash
mkdir -p /opt/sportwarren-api/shared/storage /opt/sportwarren-api/releases
cp /path/to/your/.env /opt/sportwarren-api/shared/.env
```

## Deploy a release
Upload the artifact to the server, then run:
```bash
bash scripts/deploy-runtime-release.sh /path/to/sportwarren-runtime-*.tar.gz
```

The deploy script will:
1. unpack a new timestamped release
2. link shared storage and environment
3. point `current` at the new release
4. reload PM2
5. prune older releases

## PM2
The provided `ecosystem.config.cjs` runs:
- script: `current/.next/standalone/server.js`
- cwd: `current`
- port: `5200`

## Notes
- Keep `MEDIA_STORAGE=local` only if you intentionally want local disk persistence.
- If WhatsApp Web is no longer used, old `.wwebjs_auth` cache on the server can be removed after verification.
- Long term, object storage is preferable for media.
