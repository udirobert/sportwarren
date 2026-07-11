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
  pre-seeds the roster + last week's results in one go. By the time the
  group meets, the app already knows them. Two distribution paths: an
  existing squad with known numbers gets a personal preview link DM'd
  directly; a cold roster (players found via a third-party app, no numbers
  known) gets the one shared "who's who" reveal link instead — nobody's
  phone number is ever seeded. See `scripts/seed-kickabout-session.ts` +
  `src/app/preview/[token]/page.tsx` + "Cold-roster distribution" below.
- **Deferred to phase 2:** Coaching marketplace, tournaments/championship
  ladder, agentic-commerce UI. These are optimization layers, not core to
  the preservation thesis.

Read `docs/VISION.md` for the full articulation; `docs/product-calibration.md`
for the current phase-1 scope decision; `docs/flywheel.md` for the
post-Tuesday closed-loop architecture (team allocation, post-session
analysis, twin write-path unification, Bibs Optimizer for kickabouts
+ formation recommendation for fixed squads).

## Engagement rules

Non-negotiable design rules for every player-facing surface (preview,
recap, customize, rate). They distinguish preservation from gamification.

- **The chess.com card model.** Every player starts with a
  position-baselined attribute card (CB: 65 DEF / 60 PHY / 45 PAC,
  ST: 65 SHO / 55 PAC / 40 DEF, etc.) computed by
  `baselineForPosition` in `src/server/services/personalization/position-baselines.ts`.
  The number IS the player; every interaction with the platform is
  in service of moving it. Overall rating (`computeOverall`) is the
  single chess.com-style ELO surfaced prominently on the preview.
- **Stats are never self-editable.** Players edit *vanity* (kit, hair,
  jersey number) via `/preview/[token]/customize`. They cannot edit
  goals, ratings, attributes, or rank. Numbers move only via verified
  third-party proof — peer ratings, Strava sync, bleep-test capture
  with teammate verification, peer-witnessed match performance, and
  small consequential sim outcomes. Say this out loud in the UI:
  "These numbers are how the group remembers you. You can't fake them."
- **Drills give XP and small attribute deltas, capped per day.**
  `/preview/[token]/drill` picks the player's weakest attribute,
  prescribes one real-world drill, applies +1 to that attribute and
  ~15 XP on claim. Once per UTC day per twin. Honor-system v1; Strava
  OAuth is the path to verified-auto-claim. Tactics puzzles will move
  a future `TACTICS` 7th attribute once it ships (post-Tuesday
  migration); current `/preview/[token]/tactics` is a scaffold.
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
- **Privacy gradient — squad-level + player-level, decoupled.**
  - `Squad.visibility`: `'private' | 'group_only' | 'public'`, default
    `'private'`. Controls `/squad/{shortName}` resolution. Captain
    toggles via Settings → Privacy.
  - `User.discoverable`: opts the player into `/player/{handle}` and
    (future) scout indexing — *independent of any squad's visibility*.
    A player in a private squad can still publish their own card.
  - The intersection (squad public AND player discoverable) is the
    talent pool surface that future scouts will see.
  - URL handle: `User.handle` is the URL slug — lowercase, alphanumeric +
    dashes, 3-30 chars, globally unique.

### Two URLs per player — never collapse them

Each player has **two distinct URLs** serving two distinct purposes.
Never conflate them in code or in product copy:

| URL | Auth model | Purpose | Format |
|---|---|---|---|
| `/preview/{walletAddress}` | auth-by-URL token | Captain DMs this to the player. Gates profile edits, customize, perception ratings, sim claims. Only the holder of this URL can mutate the player's state. | `<firstname>-<6char>` — readable in WhatsApp threads, sufficient entropy in suffix |
| `/player/{handle}` | unauthenticated public read | The player chooses to share this URL publicly. Resolves only when `User.discoverable === true`. Read-only — never gates writes. | `<handle>` — lowercase, alphanumeric, hyphens; user-editable |

**Hard rules:**
- The preview token (walletAddress) **must never appear on a public
  surface** — not in markup, not in a meta tag, not in a sitemap. It
  is the auth mechanism.
- The handle **must never gate auth** — it's a vanity URL, anyone can
  guess one, and unique-ness is just for routing.
- Handle collisions are **fail-soft** — `safelySetHandle()` in the
  seed scripts catches P2002 and leaves the user with `handle=null`;
  the captain (or the user themselves) sets a custom handle later via
  Settings → Privacy. Seed scripts must never abort on a name clash.

A third, distinct category: `/preview/session/{revealToken}` (see Flywheel
surfaces → "Cold-roster distribution") is a per-*session* shared URL, not a
per-player one — it shows names only, never a walletAddress in page source,
and gates no writes (the tap-through still lands on the real, private
`/preview/{walletAddress}` for whoever taps their own name). Doesn't
collapse the two-URL rule above; it's the discovery step that precedes it
when no player has a personal link yet.

### Public surfaces (shipped 2026-06-21)

The multi-team scaffolding — squads + players exposed to the open web
when their owners opt in. Both use the canonical V3 card via
`src/components/identity/V3PlayerCard.tsx`.

- **Public squad page** (`/squad/{shortName}` — `src/app/squad/[shortName]/page.tsx`)
  Resolves only when `Squad.visibility !== 'private'`. At `group_only`
  shows roster + aggregate Overall + group avg by attribute. At
  `public` adds linkable per-player V3 cards (compact variant).
- **Public player page** (`/player/{handle}` — `src/app/player/[handle]/page.tsx`)
  Resolves only when `User.discoverable === true`. Renders the V3
  card (full variant) + visible squads (those not `private`).
- **Settings → Privacy tab** (`src/app/(app)/settings/PrivacyTab.tsx`)
  Player toggles discoverable + sets handle. If user captains any
  squad, also surfaces per-squad visibility radios. Both flows hit
  `player.updatePrivacy` / `squad.setVisibility` tRPC procedures.
- **Homepage dual CTA** — Captain ("Set up your group" →
  `#squad-import-wizard`) + Player ("Build your card" → existing
  PlayerCardPreview flow). Visible to public visitors only.

### V3 / V4 — the two visual registers

SportWarren runs on two paired visual registers. They share Antonio +
JetBrains Mono typography but apply different ground / atmosphere
depending on what the brand is doing.

- **V3 — the RECORD** (editorial / archival).
  Cream paper + ink + 4 accents (red / navy / sage / mustard). Used
  on every player-facing in-app surface where the brand is about
  *preservation*: the chess.com card, post-session recap, public
  squad/player profile, post-session analysis. Lives in
  `src/components/v3/` — see below.

- **V4 — the GAME** (dark stadium / atmospheric).
  Lives on the homepage hero + landing sections (`HeroSection`,
  `ProblemSection`, `SolutionSection`, `HowItWorksSection`,
  `AppPreviewSection`). The dark gradient (gray-900 → green-900 →
  gray-900) + ambient blur orbs + grid overlay + emerald/green
  accents on CTAs. The visual identity of the homepage and
  marketing flow.

  Primitive library at `src/components/v4/`:
  - `tokens.ts` — `PALETTE` (gray-900, slate-900, green-900,
    emerald-400, emerald-500, amber-500, blue-400, cream, muted,
    subtle), `TYPE` + `TRACKING` (same fonts as V3).
  - `primitives.tsx` — `V4StadiumBackdrop`, `V4SectionShell`,
    `V4Eyebrow`, `V4Heading`, `V4PrimaryCTA`, `V4DualCTA`,
    `V4EarlyAccessBadge`.
  - `index.ts` — barrel export.

  **Important:** the homepage and landing sections currently inline
  these patterns as Tailwind utilities — they work, and an earlier
  pass that touched them caused regression. The primitive library
  exists for **future V4 surfaces**, not for an immediate refactor.
  Don't migrate `HeroSection` etc. to the primitives unless
  explicitly asked.

**V3 / V4 in Figma:** both registers live in file
`MjsiLmieTcZhKWwimOlZ0u` (SportWarren — Moment Cards V3 (Risograph)).
Two variable collections: `V3 Risograph` (cream + ink + V3 accents,
already established) and `V4 Stadium` (10 dark stadium variables —
ground/*, energy/*, light/*, signal/*, text/*). Pages: V3 has Cover +
Components + Archetypes; V4 has the `V4 — Site / Marketing` page with
a token-swatch cover + a 1920×1080 hero mockup that mirrors the live
`HeroSection.tsx`.

**Don't confuse the registers.** A failed earlier pass introduced a
"verdant rustic" palette (pitch/dusk/chalk/worn) as V4 — that register
felt plastic vs the homepage's atmospheric depth, and was reverted.
Current V4 = the dark stadium aesthetic that's already shipped on
the homepage.

### V3 design system

Single source of truth lives at `src/components/v3/`:

- `tokens.ts` — `PALETTE`, `TYPE` (font stacks), `TRACKING`
  (letter-spacing). The canonical home for V3 colors and typography.
  Never hardcode V3 hex values; always import.
- `primitives.tsx` — composable building blocks:
  - `V3PageShell` — cream bg + max-width container + standard padding
  - `V3Ribbon` — 4-color top strip (reorderable)
  - `V3IdentityLine` — "SportWarren · <context>" eyebrow
  - `V3Heading` — Antonio display headline (`huge` | `large` | `medium`)
  - `V3SectionLabel` — small uppercase mono label between sections
  - `V3StatBand` — black ink + accent left border + BIG number + label
  - `V3CTAButton` — `primary` (mustard fill) | `secondary` (transparent
    + navy border) | `tertiary` (transparent + thin inkLight border)
  - `V3HollowCard` — dashed-border accent card (for empty/unknown slots)
  - `V3SolidCard` — bordered solid card with optional accent stripe
- `index.ts` — barrel export. Import everything via
  `import { … } from '@/components/v3';` — including `V3PlayerCard`,
  which lives in `src/components/identity/V3PlayerCard.tsx` but is
  re-exported here.

**Rule:** any new V3 page composes from these primitives. If you find
yourself inlining `gap: 4, marginBottom: 28` ribbons or hand-rolled
Antonio `h1`s, you're not using the primitives — fix it. If a pattern
repeats 3+ times in V3 surfaces, promote it into `primitives.tsx`.

**`PALETTE` re-export:** `src/app/preview/_components/MiniAvatar.tsx`
re-exports `PALETTE` from the v3 tokens for back-compat (20+ files
import via MiniAvatar). New code imports directly from
`@/components/v3`.

### V3PlayerCard (DRY)

`src/components/identity/V3PlayerCard.tsx` is the canonical chess.com
card surface. Three variants: `full` (Overall + 6 bars + comparison),
`compact` (Overall + name, for roster lists), `showcase` (marketing,
animated). `buildPlayerCardData(...)` is the normaliser from twin row
→ card data. Consumed by `/preview/[token]`, `/player/[handle]`,
`/squad/[shortName]`, `/session/[id]/analysis/[token]`. Re-exported
through `@/components/v3`.

The legacy `PlayerIdentityCard.tsx` (Tailwind dark theme) survives
ONLY on the in-app `/profile` page — marked with a TODO pointing at
V3PlayerCard. When the rest of `(app)` is ported to V3, delete it.
`SquadIdentityCard.tsx` was unused and deleted in the harmonization pass.

### Flywheel surfaces (shipped 2026-06-21, extended 2026-07-09, 2026-07-11 & 2026-07-12)

The closed-loop ecosystem (`docs/flywheel.md`) bound together by:

- **Bibs Optimizer** (`src/server/services/personalization/bibs-optimizer.ts`)
  — Primary B (kickabout) team allocation. Snake-draft by Overall +
  role-preserving balance swap. Surface at
  `/session/live/{token}/teams` — captain picks format (5/6/7/8-a-side)
  + ticks confirmed players + reads suggested split. `formatBibsForTelegram`
  renders the same `BibsResult` as a Markdown group-chat message; a
  "📣 Send teams to the group" button (`BroadcastTeamsButton.tsx` +
  `broadcastTeams` action) recomputes server-side and pushes it via
  `broadcastToSquadGroups` (`src/server/services/communication/squad-broadcast.ts`
  — the single DRY, channel-agnostic "loop linked SquadGroups → send" helper:
  it fans out to every linked Telegram AND WhatsApp group (WhatsApp has no
  inline URL buttons, so the keyboard's links are flattened into the message
  body), also used by `formation-of-week`).
- **Chat match capture → player stats** — casual chat ("we won 4-2, I got 2,
  Sammy the other") is turned into a match by the single-source
  `parseMatchResult` (`src/lib/ai/match-parser.ts` — deterministic pattern pass
  first, LLM fallback for messy phrasing; `ParsedMatch` carries scorers/assists).
  Every channel routes through this one parser — never re-implement score
  parsing at a call site. On confirm, `processMatchLog` resolves the scorer
  names to squad `PlayerProfile`s via `resolveScorers`
  (`src/server/services/match/scorer-attribution.ts` — deliberately
  conservative: self-reference / exact name / unique first-name only, never
  guesses; ambiguous or unknown names are logged as plain team goals, with an
  inline "assign to a player" correction step — Redis-backed via `sfix:`/`sfixa:`
  callbacks). The resolved goals/assists ride into `submitMatchResult` (optional
  `playerGoals`/`playerAssists`) so they're written onto `PlayerMatchStats`
  inside the seed→XP window on every verification path. Career totals + XP stay
  gated behind verification (`applyMatchXP` reads those rows), so nothing counts
  until the result is verified.
- **Cold-roster distribution + voluntary phone-link** — when the seed script
  is given an `upcomingSession` block, it creates an `open` `Session` dated
  forward (distinct from the "last week" one), assigns `team` per player via
  `SessionAttendee.teamPreference`, and mints a Redis-backed reveal token
  (`session-reveal.ts`). Output leads with the ONE shared "who's who" URL —
  `/preview/session/{token}` (`RosterReveal.tsx`) — names only, never raw
  preview tokens in page source; tapping a name calls `resolveRosterMemberToken`
  (re-validates + confirms the profileId is actually on that session's roster)
  before redirecting into that player's own card. No phone number is ever
  seeded — a player volunteers their own from two placements sharing one
  component (`PhoneLinkPrompt.tsx`): a low-key line under the pre-game "bold
  call" (`PreviewFirstContact`, context `pregame`) and a "same time next
  week?" commit bundle on the returning-visitor dashboard (`PreviewCardDashboard`
  + `NextKickaboutCommit.tsx`, context `next_week` — reuses `commitmentFraming`
  and chains onto the same upcoming `Session` the reveal page points at, or
  creates one a week out). Mechanism (`phone-link.ts` + `preview/[token]/_actions.ts`
  `requestPhoneLink`): type a number → WhatsApp texts back a football-themed
  confirm word → replying it is the ONLY proof-of-ownership step, checked in
  `whatsapp.ts`'s text handler (mirrors the `wa:avail:` pending-lookup
  pattern) → only then does `PlatformIdentity` get written.
- **Post-session analysis** (`/session/{sessionId}/analysis/{playerToken}`)
  — chess.com "your match" surface. Reads PlayerMatchStats + PeerRating
  + PlayerTwin to assemble goals/ratings/attributes/weakness story, plus
  two additions:
  - **Prediction payoff** — re-derives the first-contact "bold call"
    (`generatePrediction`, seeded by profileId, no storage) and resolves
    it against the session outcome (`resolvePrediction` — both in
    `predictions.ts`). Three verdicts: `answered` / `unproven` / `open`,
    framed on a consistent "prove us wrong" doubt so the copy reads right
    whether the bold call was a compliment or a backhander. One-tap share
    (`SharePayoffButton.tsx` + `buildShareLinks`) renders a keepsake via
    `/api/og/payoff` (`resolveSessionPayoff` in `session-payoff.ts` is the
    standalone bundle used by the OG route + share metadata).
  - **Peak-end commitment capture** — `NextGameCommit.tsx` + `commitToNextSession`
    action. Moves the "same time next week?" ask to the moment right
    after the payoff verdict (endorphin peak) instead of a mid-week chase.
    Finds-or-creates the squad's next `Session` (`status: 'scheduled'`)
    and upserts `SessionAttendee.status`/`committedAt`. Copy from
    `commitment-framing.ts` (pure, tested) honestly loss-frames the
    group's ritual ("needs 10 to happen — 7 in, 3 to go") with an
    explicit no-shaming rule — see `docs/product-calibration.md` →
    "Behavioural-design doctrine".
- **Unified twin write path** — preview-tier sim and drill claims
  route through `TwinService.recordEvent` with `skipMoment: true` +
  `skipNotification: true`. The single funnel for twin mutations is
  preserved; preview surfaces don't trigger Kite signing, moment
  rendering, or push notifications, which is correct for preview-tier.
  Pattern: use `admin_adjustment` for direct attribute deltas (sim),
  `daily_drill` for the drill applier (handles xp + level + clamp +
  `lastDailyDrillAt` atomically).
- **Squad-aware drill picker** — `pickTargetAttribute` in
  `/preview/{token}/drill/page.tsx` scores by `gapBelowSquadAvg * 1.5
  + (99 - myValue)`. When the whole squad lags on PAS, everyone gets
  PAS drills. UI surfaces a "Squad-wide weakness" callout when picked
  attribute reflects a group lag.

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
- `next/og` (satori) throws `Expected <div> to have explicit display` for
  any element with more than one child node — including a div whose
  children are two interpolated expressions (`{a}{b}`) or a number child.
  Give every multi-child node `display: flex` and collapse text to a
  single string (`` `${a} ${b}` ``, not `{a}{b}`). Bit the payoff OG card
  (`src/app/api/og/payoff/route.tsx`) in production-shaped testing —
  typecheck doesn't catch it, only rendering the route does.
- Never edit a migration's `.sql` file after it has been applied — the
  applied DB keeps the old contents forever, so schema.prisma silently
  drifts from reality (this happened to `Session.afterAttributes`,
  healed by migration `20260709000000`). Add a new migration instead.
- Group-verification confirm/dispute state is Redis-backed
  (`communication/verification-store.ts` — `makeGroupVerificationStore`), NOT an
  in-memory `Map`. The webhook that creates a pending verification and the
  button-press / expiry-cron that resolves it routinely hit different serverless
  instances, so instance-local state silently drops votes. Never reintroduce a
  `Map` for cross-request conversation state — persist to Redis.
- There are TWO `communication/` trees: `src/server/services/communication/`
  (the Next.js / production path — edit this one) and a legacy
  `server/services/communication/` used only by `dev:server` (`server/index.ts`).
  They keep independent copies (e.g. their own `bridge.ts`), so a grep can show
  a symbol as "still used" when only the dead legacy tree references it.
- Deeply-inferred tRPC output types can trip `TS2589` ("Type instantiation is
  excessively deep") at an *unrelated* call site when the project's type graph
  shifts — the reported line is where the budget ran out, not the cause (bit
  `sessions/page.tsx`). Fix by annotating the consuming variable with an
  explicit shallow row type, or giving a factory an explicit return interface —
  don't chase the reported line or trim your own change.

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
  - `bibs-optimizer.ts` (`bibsOptimizer` — kickabout team allocation, snake-draft + balance swap, see Flywheel surfaces above; `formatBibsForTelegram` is its Markdown-message sibling)
  - `predictions.ts` (`generatePrediction` — deterministic position+attribute-driven "bold call" for first contact, seeded by profileId, no Prisma; `resolvePrediction` — resolves it against a session outcome into an `answered`/`unproven`/`open` verdict. Pure, table-tested, single source of truth for both the preview page and the post-session payoff — never re-implement this logic, re-derive with the same seed)
  - `session-payoff.ts` (`resolveSessionPayoff` — standalone payoff bundle for surfaces that only need the summary, e.g. the OG card route; delegates resolution to `predictions.ts`, only aggregates the session outcome)
  - `commitment-framing.ts` (`commitmentFraming` — pure copy logic for the peak-end "same time next week?" capture; honest loss-framing + social proof, explicitly no bandwagon-shaming)
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