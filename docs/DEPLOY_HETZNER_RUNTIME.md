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

> **pm2 cwd gotcha.** `pm2 reload` and `pm2 startOrReload` update env vars but
> **do not** change a process's working directory — pm2 caches `cwd` from the
> first `pm2 start`. After a symlink swap, a reload keeps serving the previous
> release. `scripts/deploy-runtime-release.sh` therefore does
> `pm2 delete && pm2 start` on every deploy so the new release directory is
> picked up.

> **Next standalone `.env` gotcha.** `next build` snapshots the current
> `.env` into `.next/standalone/.env`, and the standalone server reads
> from that file (not from `process.cwd`). The deploy script replaces it
> with a symlink to `shared/.env` so runtime-only secrets such as
> `KAPSO_API_KEY` and `WHATSAPP_PHONE_NUMBER_ID` are live without
> rebuilding the artifact.

## Build notes
- Next 16 enables Turbopack by default but our `next.config.js` keeps a
  custom `webpack` block (path aliases + minimization). The build script
  passes `--webpack` explicitly to avoid the
  "build is using Turbopack with a webpack config" worker error.
- `DISABLE_SENTRY_BUILD=true` is required in non-prod environments to skip
  the Sentry source-map upload.

## Notes
- Keep `MEDIA_STORAGE=local` only if you intentionally want local disk persistence.
- If WhatsApp Web is no longer used, old `.wwebjs_auth` cache on the server can be removed after verification.
- Long term, object storage is preferable for media.
