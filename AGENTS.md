<!-- BEGIN:nextjs-agent-rules -->

# Next.js: ALWAYS read docs before coding

Before any Next.js work, find and read the relevant doc in
`node_modules/next/dist/docs/`. Your training data is outdated — the docs
are the source of truth.

<!-- END:nextjs-agent-rules -->

## Project-specific guidance

### Stack
- Next.js 16.2 (App Router)
- React 18.3
- Prisma + PostgreSQL
- Sentry for monitoring
- Vercel deployment

### Key conventions
- Use `src/app` for App Router pages
- Server actions in `src/server/actions/`
- API routes in `src/app/api/`
- Components in `src/components/`
- Storage abstraction in `src/server/services/storage/`

### Build commands
- `pnpm run build` — production build
- `pnpm run dev` — dev server
- `pnpm run lint` — ESLint
- `pnpm run typecheck` — TypeScript

### Known gotchas
- `STORAGE_ROOT` env var for custom storage location (defaults to `./storage`)
- Rate limiting via `src/proxy.ts` (replaces middleware in Next 16)

### Personalization domain
- Single source of truth for skin + brain lives in `src/server/services/personalization/`
  - `twin-types.ts` (TwinState, TwinEvent, TwinDiff), `twin-appliers.ts` (pure), `twin-service.ts` (TwinService.recordEvent — the only public mutation entry point), `notify.ts` (channel-tiered delivery), `moments.ts`, `image.ts`, `identity.ts` (getPlayerIdentity / getSquadIdentity)
- Player identity surface is `src/components/identity/PlayerIdentityCard.tsx` (one card, variant-driven)
- All twin state mutations go through `TwinService.recordEvent({ kind, ... })` — no direct Prisma writes to PlayerTwin or Squad twin fields from call sites
- `User.avatar` is a storage key (not base64); image variants generated at upload