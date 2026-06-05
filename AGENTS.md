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
  - `notify.ts` (channel-tiered delivery: in-app bus + WhatsApp 3/twin/day cap + Telegram per-kind opt-in via `TwinSignalPreference`; Telegram resolves chatId from PlatformIdentity/SquadGroup, sends via TelegramService bot; signal preferences: tRPC `communication.getSignalPreferences`/`setSignalPreference`)
  - `moments.ts` (Moment row CRUD; `render` delegates to `moment-render.ts` which generates PNG via satori/resvg)
  - `image.ts` (avatar upload + sharp variant generation (square 256×256, thumb 64×64, wide 512×288) + key/variant URL resolution; writes storage key to `User.avatar`)
  - `moment-render.ts` (satori HTML→SVG + @resvg/resvg-js SVG→PNG; `renderMoment` for single, `renderPendingBatch` for cron; font fetched from Google Fonts CDN and cached in-memory)
  - `squad-energy.ts` (bypasses `TwinService` — energy is a squad-level operational metric, not a twin brain mutation)
  - `twin-sim.ts` (`createRoundRobin` / `runSimulation` / `settleResults` — overnight round-robin tournaments between player twins; derives team strength from baseAttributes, uses `simulateTournamentMatch` engine, settles via `TwinService.recordEvent({ kind: 'sim_completed' })`)
  - `coaching.ts` (`hireCoach` / `cancelEffect` / `getActiveEffects` / `listAvailableCoaches` — coaching marketplace; creates CoachingEffect rows, fires coaching_hired/coaching_expired events via TwinService; coach agents are AiAgent rows with type 'coach_external')
  - `season.ts` (`createSeason` / `endSeason` — season lifecycle; endSeason iterates all active twins, fires season_end events via TwinService granting +1 prestige + partner-tier moment; tRPC: `tournament.createSeason`/`getActiveSeason`/`listSeasons`)
  - `narrative.ts` (two-tier: fast sync stubs `generatePlayerNarrative`/`generateSquadNarrative` for hot paths + LLM-driven `buildRichPlayerNarrative`/`buildRichSquadNarrative` with Redis 1h cache keyed on content hash; consumes `generateInference` from `@/lib/ai/inference`)
  - `identity.ts` (`IdentityService.getPlayerIdentity` / `getSquadIdentity` — single read API joining skin (User/Squad) + brain (PlayerTwin/SquadTwin) + moments + attestations + match stats + sync narrative; tRPC: `player.getIdentity`/`player.getMyIdentity`, `squad.getIdentity`)
- Player identity surface: `src/components/identity/PlayerIdentityCard.tsx` + `SquadIdentityCard.tsx` — Tailwind + lucide-react cards consuming `PlayerIdentity`/`SquadIdentity` from `identity.ts`; profile page at `src/app/(app)/profile/page.tsx` calls `player.getMyIdentity`
- Coaching marketplace: `src/app/(app)/coaching/page.tsx` — coach listing grid + hire modal + active effects with cancel; consumes `coaching.listCoaches`/`getActiveEffects`/`hireCoach`/`cancelEffect`
- Signal preferences: `src/app/(app)/settings/page.tsx` — Twin Signals card in notifications tab (visible when Telegram connected); consumes `communication.getSignalPreferences`/`setSignalPreference`
- Season overview: `src/app/(app)/stats/page.tsx` — SeasonOverviewCard showing active season progress + history; consumes `tournament.getActiveSeason`/`listSeasons`
- Moment render cron: `src/app/api/cron/moment-render/route.ts` — picks up unrendered moments, generates PNGs every 6h
- Twin sim cron: `src/app/api/cron/twin-sim/route.ts` — runs pending overnight sims daily; tRPC: `tournament.createTwinSim`/`enterTwinSim`/`getTwinSimResults`/`listTwinSims`
- Coaching expiry: `src/app/api/cron/digital-twin/route.ts` — sweeps expired CoachingEffect rows for both player and squad twins, fires coaching_expired events; tRPC: `coaching.listCoaches`/`hireCoach`/`getActiveEffects`/`cancelEffect`
- Season end cron: `src/app/api/cron/season/route.ts` — auto-ends seasons past endDate, fires season_end for all active twins
- Admin twin adjustment: `player.adminAdjustTwin` — admin-only pass-through to TwinService for manual attribute/XP/reputation fixes
- All twin state mutations go through `TwinService.recordEvent({ kind, ... })` — no direct Prisma writes to `PlayerTwin` or `SquadTwin` fields from call sites
- `User.avatar` is a storage key (not base64); sharp generates square/thumb/wide variants at upload
- Schema single source of truth: `SquadTwin` (level, xp, prestige, baseAttributes on 6 keys, energy, reputation, attestationCount) replaces the legacy `Squad.digitalAttributes/squadEnergy/seasonPoints/level/xp/isDigitalTwinActive/lastSeasonSync` columns dropped in PR 2
- `Squad.digitalTwin3dEnabled` and `Squad.digitalTwin3dTier` are kept (3D entitlement feature independent of the twin brain)
- `WhatsAppNotification` table tracks milestone-tier WhatsApp sends for the 24h rolling cap
- `Moment` table is the in-app gallery read model; one row per `TwinEvent` with a `momentHint`
- `TelegramChannel` in `notify.ts` delivers milestones/moments via Telegram bot; per-kind opt-in via `TwinSignalPreference` table; defaults seeded on twin creation (twin_created, level_up, sim_win, record_broken)

### Storage adapter
- `src/server/services/storage/` is owner-typed: `saveBase64({ ownerType, ownerId, kind, base64Data, ext, mimeType, mediaId?, variantId?, momentId? })`
- Path layouts: `players/<id>/avatar/<variant>.<ext>`, `squads/<id>/media/<mediaId>.<ext>`, `moments/<ownerType>/<id>/<momentId>.<ext>`
- IPFS adapter stores opaque `ipfs/<cid>` keys; local adapter uses the layout above under `STORAGE_ROOT` (defaults `./storage`)
- Legacy `squadId, mediaId` interface was removed in PR 2 (clean break; no users on greenfield)