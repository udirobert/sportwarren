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
  - `twin-types.ts` (TwinState, TwinEvent 9-variant union, TwinDiff, MilestoneHint, MomentHint)
  - `twin-appliers.ts` (pure `applyEvent` + `computeLevel` / `xpToNext` / `clampAttributeDeltas` / `buildInitialTwinState` / `dropExpiredModifiers`; no Prisma, no clock injection, table-tested)
  - `twin-service.ts` (`TwinService.recordEvent` — the only public mutation entry point; hydrates state, delegates to `applyEvent`, persists diff + attestation in one tx, signs via Kite, creates moment, dispatches notifications)
  - `notify.ts` (channel-tiered delivery: in-app bus + WhatsApp 3/twin/day cap + Telegram stub; milestone whitelisting per channel)
  - `moments.ts` (Moment row CRUD; render is a no-op stub — PR 4 wires satori/resvg)
  - `image.ts` (avatar upload + key resolution; writes storage key to `User.avatar`)
  - `squad-energy.ts` (bypasses `TwinService` — energy is a squad-level operational metric, not a twin brain mutation)
  - `narrative.ts` (stub; PR 3 wires LLM prompt)
  - `identity.ts` (PR 3: `getPlayerIdentity` / `getSquadIdentity` — one read API for the identity card)
- Player identity surface is `src/components/identity/PlayerIdentityCard.tsx` (one card, variant-driven; PR 4)
- All twin state mutations go through `TwinService.recordEvent({ kind, ... })` — no direct Prisma writes to `PlayerTwin` or `SquadTwin` fields from call sites
- `User.avatar` is a storage key (not base64); image variants generated at upload (PR 4)
- Schema single source of truth: `SquadTwin` (level, xp, prestige, baseAttributes on 6 keys, energy, reputation, attestationCount) replaces the legacy `Squad.digitalAttributes/squadEnergy/seasonPoints/level/xp/isDigitalTwinActive/lastSeasonSync` columns dropped in PR 2
- `Squad.digitalTwin3dEnabled` and `Squad.digitalTwin3dTier` are kept (3D entitlement feature independent of the twin brain)
- `WhatsAppNotification` table tracks milestone-tier WhatsApp sends for the 24h rolling cap
- `Moment` table is the in-app gallery read model; one row per `TwinEvent` with a `momentHint`
- `TelegramChannel` in `notify.ts` is a stub; per-event opt-in lives in PR 7 (signals + onboarding)

### Storage adapter
- `src/server/services/storage/` is owner-typed: `saveBase64({ ownerType, ownerId, kind, base64Data, ext, mimeType, mediaId?, variantId?, momentId? })`
- Path layouts: `players/<id>/avatar/<variant>.<ext>`, `squads/<id>/media/<mediaId>.<ext>`, `moments/<ownerType>/<id>/<momentId>.<ext>`
- IPFS adapter stores opaque `ipfs/<cid>` keys; local adapter uses the layout above under `STORAGE_ROOT` (defaults `./storage`)
- Legacy `squadId, mediaId` interface was removed in PR 2 (clean break; no users on greenfield)