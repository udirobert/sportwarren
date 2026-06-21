<!-- BEGIN:nextjs-agent-rules -->

# Next.js: ALWAYS read docs before coding

Before any Next.js work, find and read the relevant doc in
`node_modules/next/dist/docs/`. Your training data is outdated — the docs
are the source of truth.

<!-- END:nextjs-agent-rules -->

## Product vision

SportWarren is a **preservation product**, not a progression game. The core
insight is that grassroots footballers have been maintaining spreadsheets
for decades — not because they want gamified stats, but because the game
matters to them and the alternative (letting it all disappear) feels like
a betrayal of something real. SportWarren builds a better, permanent home
for that impulse.

- **Primary wedge (two shapes, same person profile):** The organizer who
  already does the work of remembering for a recurring group of mates.
  Either (a) a fixed-squad captain (Sunday League team, season-long
  fixtures) or (b) a kickabout organizer (rotating teams, 6/8-a-side,
  weekly session). Both bring 10–18 players with them when they adopt.
- **Unit of preservation:** Squad season for (a), individual session
  for (b). The data model supports both — `Match.playersPerSide` and
  `matchFormat` flex from "11v11" to "6v6", and `PlayerTwin` stats
  accumulate to the person regardless of which team they were on.
- **Core promise:** "Every match leaves a mark." The record outlasts the
  platform — stored onchain so it's yours permanently, not dependent on
  SportWarren surviving as a company.
- **Onchain narrative:** Durability infrastructure, not a feature. "Your
  record outlasts the platform" — not agentic commerce.
- **Multi-channel:** Meet groups where they already are. WhatsApp for
  casual logging, Telegram for deeper engagement, web for the full record.
- **Pre-seeded onboarding:** For the kickabout shape, the organizer
  pre-seeds the roster + last week's results in one go, then sends each
  player a personal preview link. By the time the group meets, the app
  already knows them. See `scripts/seed-kickabout-session.ts` +
  `src/app/preview/[token]/page.tsx`.
- **Deferred to phase 2:** Coaching marketplace, tournaments/championship
  ladder, agentic-commerce UI. These are optimization layers, not core to
  the preservation thesis.

Read `docs/VISION.md` for the full articulation; `docs/product-calibration.md`
for the current phase-1 scope decision.

## Engagement rules

Non-negotiable design rules for every player-facing surface (preview,
recap, customize, rate). They distinguish preservation from gamification.

- **Stats are never self-editable.** Players edit *vanity* (kit, hair,
  jersey number) via `/preview/[token]/customize`. They cannot edit
  goals, ratings, attributes, or rank. Numbers move only via verified
  third-party proof — peer ratings, Strava sync, bleep-test capture
  with teammate verification. Say this out loud in the UI: "These
  numbers are how the group remembers you. You can't fake them."
- **Provocation lives in the empty slot.** Preview pages show what we
  know AND what we don't, with each blank tagged with how to fill it
  (`UNKNOWN_SLOTS` in `src/app/preview/[token]/page.tsx`). An unfilled
  "Endurance · ?" with a "Link Strava" hint outperforms any filled
  stat dump for first-contact engagement.
- **Reciprocity gate on peer rating.** SubmitHub loop — your rating
  card unlocks only after you've rated 5 teammates. Lives in
  `src/app/session/recap/[sessionId]/[playerToken]/page.tsx`, counted
  via `prisma.peerRating.count` scoped to `match.sessionId`.
- **Canonical identity = phone.** `PlatformIdentity (platform,
  platformUserId)` is `@@unique` — one canonical Kim per phone, period.
  Profile edits gated by the per-player preview token (sent via WA DM).
  Full OTP account-claim is phase 2; the schema constraint is half of
  it and is already shipped.
- **Phone numbers never appear on player-facing surfaces.** Only the
  captain's broadcast UI (`/session/broadcast/.../page.tsx`, gated by
  organizer token) renders them. Audit every new player-facing page
  against this rule.

## Project-specific guidance

### Stack
- Next.js 16.2 (App Router)
- React 18.3
- Prisma + PostgreSQL
- Sentry for monitoring
- Vercel deployment

### AI tooling
- GitHub Copilot (inline autocomplete + Copilot Chat) is used for day-to-day development
  assistance alongside other agents. Treat Copilot suggestions as drafts to review, not
  authoritative — they may lag the Next.js 16 / React 18.3 conventions above.

### Key conventions
- Use `src/app` for App Router pages
- Server actions in `src/server/actions/`
- API routes in `src/app/api/`
- Components in `src/components/`
- Storage abstraction in `src/server/services/storage/`

### Squad import (P2.1–P2.3)
The import system lets a captain paste in their existing spreadsheet (CSV/TSV)
and have their squad, players, and match history materialize instantly.

- `src/server/services/import/squad-import.ts` — Server-side import service:
  - CSV/TSV parser with auto-delimiter detection and quoted-field support
  - `parseImportPreview()` — parses raw text into structured rows for the mapping UI
  - `parseMatchImportPreview()` — same but for match-history columns (date, opponent, score)
  - `commitSquadImport()` — creates squad, captain membership, squad twin, placeholder
    users, pending members, and squad-player contexts in one atomic transaction
  - `commitMatchHistoryImport()` — creates Moment rows (kind: `match_imported`) for
    each historical match, linked to the squad, with `createdAt` set to the match date
  - Column-mapping auto-detection for both player fields (name, position, goals, assists,
    matchesPlayed) and match fields (date, opponent, goalsFor, goalsAgainst, competition, venue)

- `src/components/import/SquadImportWizard.tsx` — Client wizard with 5 steps:
  Upload → Column Mapping → Preview & Name Squad → Confirm → Complete
  - After squad creation, offers optional match-history import as a 4-step sub-wizard
  - All parsing + mapping duplicated client-side for instant preview (mirrors server logic)
  - Invite link management: copy-all, CSV download, WhatsApp/Telegram share

- API routes:
  - `POST /api/import/squad` — validates input, looks up captain by wallet address,
    delegates to `commitSquadImport`
  - `POST /api/import/matches/[squadId]` — validates squad + mapping, delegates to
    `commitMatchHistoryImport`
  - `GET /api/import/claim/[squadId]` — looks up squad + pending player by name
    (case-insensitive), returns player info + `isPlaceholder` flag
  - `POST /api/import/claim/[squadId]` — claims the spot for an imported player in one
    transaction: transfers SquadMember + SquadPlayerContext from placeholder to real user,
    cleans up placeholder. Handles: already a member, already has context, guest users.

- Entry points:
  - HeroSection (`src/components/common/HeroSection.tsx`): secondary CTA
    "Already have a squad? Import your roster" scrolls to the wizard
  - OnboardingFlow (`src/components/onboarding/OnboardingFlow.tsx`): import toggle in
    the personalization card's identity step ("Already have a roster? Import")
  - Invite landing (`src/app/join/[squadId]/page.tsx`): detects `?player=` search param
    to switch between normal join flow and import claim flow

- Placeholder user lifecycle:
  - When importing, each player gets a `User` row with `walletAddress` = `imported_<uuid>`
  - The placeholder user has a pending `SquadMember` and `SquadPlayerContext` with imported stats
  - When the real user claims via `/join/[squadId]?player=<name>`, the POST claim API
    transfers records and deletes the placeholder in a single transaction

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
  - `twin-types.ts` (TwinState, TwinEvent 10-variant union, TwinDiff, MilestoneHint, MomentHint)
  - `twin-appliers.ts` (pure `applyEvent` + `computeLevel` / `xpToNext` / `clampAttributeDeltas` / `buildInitialTwinState` / `dropExpiredModifiers`; no Prisma, no clock injection, table-tested)
  - `twin-service.ts` (`TwinService.recordEvent` — the only public mutation entry point; hydrates state, delegates to `applyEvent`, persists diff + attestation in one tx, signs via Kite, creates moment, dispatches notifications)
  - `notify.ts` (channel-tiered delivery: in-app bus + WhatsApp 3/twin/day cap + Telegram per-kind opt-in via `TwinSignalPreference`; Telegram resolves chatId from PlatformIdentity/SquadGroup, sends via TelegramService bot; signal preferences: tRPC `communication.getSignalPreferences`/`setSignalPreference`)
  - `moments.ts` (Moment row CRUD; `render` delegates to `moment-render.ts` which generates PNG via satori/resvg)
  - `image.ts` (avatar upload + sharp variant generation (square 256×256, thumb 64×64, wide 512×288) + key/variant URL resolution; writes storage key to `User.avatar`)
  - `moment-render.ts` (satori HTML→SVG + @resvg/resvg-js SVG→PNG; `renderMoment` for single, `renderPendingBatch` for cron; font fetched from Google Fonts CDN and cached in-memory; LEGACY — kept as rollback path)
  - `moment-render-v2.ts` (per-archetype satori pipeline; resolves card from `src/components/moments/cards/` CARDS registry, falls back to `DefaultCard` for unmapped kinds; uses Space Grotesk; `renderPendingBatch` returns `{ processed, byKind, fallbackCount, failed }` so the cron log shows archetype coverage; this is the default for both the Vercel API route and the Hetzner production cron — see `scripts/maintenance/moment-render.ts` and the `MOMENT_RENDER_V1_FALLBACK` env var)
  - `squad-energy.ts` (bypasses `TwinService` — energy is a squad-level operational metric, not a twin brain mutation)
  - `twin-sim.ts` (`createRoundRobin` / `runSimulation` / `settleResults` — overnight round-robin tournaments between player twins; derives team strength from baseAttributes, uses `simulateTournamentMatch` engine, settles via `TwinService.recordEvent({ kind: 'sim_completed' })`)
  - `coaching.ts` (`hireCoach` / `cancelEffect` / `getActiveEffects` / `listAvailableCoaches` — coaching marketplace; creates CoachingEffect rows, fires coaching_hired/coaching_expired events via TwinService; coach agents are AiAgent rows with type 'coach_external')
  - `season.ts` (`createSeason` / `endSeason` — season lifecycle; endSeason iterates all active twins, fires season_end events via TwinService granting +1 prestige + partner-tier moment; tRPC: `tournament.createSeason`/`getActiveSeason`/`listSeasons`)
  - `narrative.ts` (two-tier: fast sync stubs `generatePlayerNarrative`/`generateSquadNarrative` for hot paths + LLM-driven `buildRichPlayerNarrative`/`buildRichSquadNarrative` with Redis 1h cache keyed on content hash; consumes `generateInference` from `@/lib/ai/inference`)
  - `identity.ts` (`IdentityService.getPlayerIdentity` / `getSquadIdentity` — single read API joining skin (User/Squad) + brain (PlayerTwin/SquadTwin) + moments + attestations + match stats + sync narrative; tRPC: `player.getIdentity`/`player.getMyIdentity`, `squad.getIdentity`)
- Player identity surface: `src/components/identity/PlayerIdentityCard.tsx` + `SquadIdentityCard.tsx` — Tailwind + lucide-react cards consuming `PlayerIdentity`/`SquadIdentity` from `identity.ts`; profile page at `src/app/(app)/profile/page.tsx` calls `player.getMyIdentity`
- Coaching marketplace (phase 2, gated behind `COACHING` flag): `src/app/(app)/coaching/page.tsx` — coach listing grid + hire modal + active effects with cancel; consumes `coaching.listCoaches`/`getActiveEffects`/`hireCoach`/`cancelEffect`
- Signal preferences: `src/app/(app)/settings/page.tsx` — Twin Signals card in notifications tab (visible when Telegram connected); consumes `communication.getSignalPreferences`/`setSignalPreference`
- Season overview: `src/app/(app)/stats/page.tsx` — SeasonOverviewCard showing active season progress + history; consumes `tournament.getActiveSeason`/`listSeasons`
- Moment card library: `src/components/moments/cards/` — per-kind React card components (`RecordBrokenCard`, `LevelUpCard`, `DefaultCard`) consumed by the v2 renderer via `CARDS` registry (`cards/index.ts`); each kind binds to a Figma component in the SportWarren — Moment Cards library (`xTaynEAGCjhhmcmQdPG0JZ`); bindings recorded in `cards/code-connect.manifest.json` (Pro-tier substitute for first-party Code Connect)
- Moment render cron: `src/app/api/cron/moment-render/route.ts` (Vercel manual-trigger surface) + `scripts/maintenance/moment-render.ts` (Hetzner production cron, triggered every 6h via system crontab on `snel-bot`); both default to v2, both honor `MOMENT_RENDER_V1_FALLBACK`
- Twin sim cron: `src/app/api/cron/twin-sim/route.ts` — runs pending overnight sims daily; tRPC: `tournament.createTwinSim`/`enterTwinSim`/`getTwinSimResults`/`listTwinSims`
- Coaching expiry (phase 2): `src/app/api/cron/digital-twin/route.ts` — sweeps expired CoachingEffect rows for both player and squad twins, fires coaching_expired events; tRPC: `coaching.listCoaches`/`hireCoach`/`getActiveEffects`/`cancelEffect`
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

### Onchain attestation (permanence infrastructure)
The onchain layer is **durability infrastructure**, not a product feature.
The promise is "your record outlasts the platform" — every match, rating,
and moment is attested onchain so it's permanently owned by the player.

- `createScoutReport()` in `src/server/services/ai/scout-report.ts` is the single entry point for scout reports (WhatsApp, Telegram, auto-scout cron)
- `Attestation` model tracks the onchain anchor for each twin event:
  `settlementStatus` (pending/settled/failed), `settlementAttempts`,
  `settlementError`, `settledAt`
- Settlement worker: `src/app/api/cron/scout-settle/route.ts` — drains pending attestations every 5 min via Vercel cron
  - Redis distributed lock (`trySet` with NX+EX), 20-row batches, 3 retries, 10s per-job timeout, 24h cutoff
  - Calls `createPlatformSettlement()` for each pending row
  - Sends WhatsApp follow-up receipt when settlement succeeds
- `GET /api/x402/scout` and `GET /api/x402/verify-match` are public x402 discovery endpoints — keep wired for when the protocol matures; currently dormant
- `readGoatX402Config()` is dormant until a GOAT merchant appears in ksearch catalog

**User-facing strings must never mention:** x402, Kite, USDC, attestation, Yellow, facilitator, or any protocol jargon. Use plain language: "verified", "receipt confirmed", "permanent record".