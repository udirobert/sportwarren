# Product calibration — Phase 1 scope

> **Decision date:** 2026-06-19
> **Driver:** First user test, Tuesday 2026-06-23. Pre-launch — no
> users yet. Captain wedge needs to land cleanly on first contact.

## Why this exists

A code review of `src/server/routers/squad.ts` (2,526 lines) flagged
it as a "god file." Triaging the 43 procedures revealed that **23
of them serve features that aren't in the stated product wedge**
— TON treasury, transfer market, DAO governance, geo territory,
AI manager autonomy, 3D entitlement, etc.

The procedures are wired into ~17 dashboard widgets and one
modal — none orphaned, all loaded at `/dashboard`. So the "code
problem" was actually a **product scope problem**: the dashboard has
accreted past the wedge that `VISION.md` and `AGENTS.md` describe.

Pre-launch is the **only cheap window** to trim. After Tuesday's
players build workflows around features, you can't take them away
without breaking their experience.

## The decision

Phase 1 (Tuesday test → first iteration) shows **only the
preservation thesis surface**:

- log a match → twin updates → moment preserved → captain shares

Everything else is hidden from the dashboard. **The code stays.**
The router stays. The components stay. The Prisma models stay.
Nothing is deleted. The decision is reversible by removing the
relevant entry from `PHASE_1_HIDDEN_WIDGET_IDS`.

## What stays visible

| Widget | Why |
|---|---|
| `onboarding-checklist` + `OnboardingFlow` | First-run experience |
| `quick-log` | The core preservation loop — log a match |
| `match-engine` (zero state) | "Log your first match" callout when stats.matches === 0 |
| `match-coordination` | Match planning surface |
| `recent-session` | The most recent match |
| `pending-actions` | Captain workflow inbox |
| `captains-log` | What captains care about |
| `quick-stats` | Goals / assists / matches / rating |
| `squad-digital-twin` | The squad's twin (preservation surface) |
| `digital-twin-3d-gate` | Twin upgrade (entitlement gate, no purchase flow) |
| `recent-matches` | Match history (Match Center link) |
| `referral-widget` | Captain wedge multiplier — bring more players |
| `quick-log` retry callouts | First-run XP feedback loop |

Plus secondary widgets that are gated by existing user-preference
filters (twin hero card, prestige, etc.) — those keep their
existing logic, not phase-1 trimmed.

## What is hidden

Added to `PHASE_1_HIDDEN_WIDGET_IDS` in
`src/components/adaptive/AdaptiveDashboard.tsx`:

| Widget | Cluster | Notes |
|---|---|---|
| `event-feed` | Web3 financial | Mixes treasury + transfer-offer alerts. Not the moments feed. |
| `governance` | Web3 governance | DAO voting surface. |
| `lens-social` | Web3 social | Lens social hub. |
| `nearby-squads` | Geo gamification | Triggers `createChallenge`. |
| `territory` | Geo gamification | Territory control map. |
| `staff-feed` | AI staff | Surfaces `StaffRoom`. |
| `coach-kite` | Coaching marketplace | `AGENTS.md` explicitly defers this to phase 2. |
| `squad-dynamics` | Squad analysis | Phase 2. |
| `scouting-report` | Squad analysis | Phase 2. |
| `weekly-challenges` | Gamification | Streak loop. |
| `sharpness-streak` | Gamification | Streak loop. |
| `daily-drill` | Gamification | Drill loop. |
| `post-match-reaction` | Gamification | Reaction loop. |
| `training` | Training | TrainingCenter. |
| `communication-hub` | Comms | Redundant with WhatsApp/Telegram integrations. |

Plus two direct JSX mounts commented out:
- `AgenticConcierge` (line 1294) — phase-2 AI surface
- `StaffRoom` modal (line 1319) — phase-2 AI manager surface

## What was *not* touched

- **`src/server/routers/squad.ts`** — the 2,526-line router stays as-is.
  Splitting it adds risk for no Tuesday benefit; the dashboard slim
  hides the consumers without removing the supply.
- **Other routes** — `/squad`, `/match`, `/profile`, etc. unchanged.
  `SquadAutonomySettings` still lives on `/squad` (consider hiding
  from there post-Tuesday).
- **Prisma schema** — no migrations.
- **tRPC procedure surface** — every procedure is still callable
  via the API. The dashboard just doesn't surface most of them.

## Verifying the slim

```bash
pnpm typecheck        # passes
pnpm dev              # open /dashboard — should see only KEEP widgets
```

## Post-Tuesday review plan

After the Tuesday game test, hold a 30-minute review with the
following inputs:

1. **What test users actually engaged with** — observe, ask them
   directly: what did you log, what surprised you, what did you
   never click?
2. **What test users asked about that's hidden** — if anyone says
   "wait, can I trade players between squads?" or "does this have a
   wallet?" that's a real signal the hidden feature has a customer.
3. **What test users wanted that doesn't exist** — net-new feature
   asks.

Then decide per cluster:

- **Bring back** — remove from `PHASE_1_HIDDEN_WIDGET_IDS`
- **Sunset** — keep hidden, plan deprecation in next sprint
- **Hard delete** — remove the underlying procedures + Prisma model
  (only after confirming no test user touched it)

The router refactor (`squad.ts` → sub-routers) is contingent on
that decision. If half the procedures get deleted, the remaining
router fits in one file. If everything comes back, the split
happens.

## Rationale (for future-you when you read this)

You asked the right question — "before refactoring, is what
squad.ts currently does actually useful?" The audit answered: about
half is wired to a Web3 game surface that contradicts the stated
preservation thesis. With no users yet and Tuesday on the calendar,
hiding the off-thesis surfaces is the only way to find out whether
the wedge alone is enough to land.

If Tuesday's players say "this is great, it remembers our matches"
and the surface feels light enough — the slim wins.

If they say "I expected more / I feel like I'm missing something"
— the dashboard accretion was actually serving an unstated need
and we bring features back, calibrated.

Either way you get information you can't get any other way. The
slim isn't a deletion. It's a *test*.

## Engagement layer (added 2026-06-21)

The slim trimmed the *surface*. The engagement rules give it teeth.
After seeding three real preview links and reviewing them, the pages
read informational, not provocative. Three changes landed to fix that:

1. **Preview reframe** — replaced the descriptive "What this is" block
   with a "What we don't know yet" panel of empty attribute slots, each
   tagged with the verified-third-party path that fills it (Strava,
   bleep test, peer ratings). Added rank-with-ties framing to the goal
   stat ("1 goal · joint 4th"). Stated the stat-immutability rule
   verbatim on the page.
2. **Reciprocity gate** on `/session/recap/[id]/[token]` — SubmitHub
   loop. Your card unlocks once you've rated 5 teammates; receiving
   ratings is gated by giving them. Counts scoped per-session via
   `peerRating.count({ where: { …, match: { sessionId } } })`.
3. **Canonical identity comment** in `prisma/schema.prisma` —
   `PlatformIdentity.platformUserId` now explicitly documents the
   canonical-identity intent; the `@@unique([platform, platformUserId])`
   constraint that enforces "one canonical Kim per phone" was already
   in place.

See `AGENTS.md` → "Engagement rules" for the consolidated doctrine.

## Chess.com pass (added 2026-06-21)

After re-reviewing the preview pages with seeded players, the static
attribute panel still didn't drive action. The insight that unlocked
it: chess.com works because the number isn't a description, it's a
*position in a hierarchy that you can climb*. Five changes landed to
re-shape SportWarren's twin around that model:

1. **Position baselines** (`src/server/services/personalization/position-baselines.ts`)
   — CB starts 65 DEF / 60 PHY / 45 PAC, ST starts 65 SHO / 55 PAC, etc.
   Players see a *real starting card*, not all 50s. The seed
   (`scripts/seed-kickabout-session.ts`) now creates a PlayerTwin row
   per player with `baselineForPosition(player.position)`.
2. **Chess.com six-bar card on preview** (`src/app/preview/[token]/page.tsx`)
   — replaces the prior "What we don't know" panel. Each attribute
   shows the player's value, a group-avg tick, and the verified path
   that moves it. Above the bars: a single Overall rating
   (`computeOverall`) computed with position-aware weights.
3. **Sim becomes consequential** (`src/app/preview/[token]/sim/_actions.ts`)
   — `claimSimOutcome` server action applies small deltas to
   PlayerTwin.baseAttributes when the player taps "Lock this in" after
   a sim. Bypasses TwinService for v1 (preview-tier only) to avoid
   the Kite signing + moment-generation side effects; should be
   re-routed through `TwinService.recordEvent({ kind: 'admin_adjustment' })`
   post-Tuesday.
4. **Daily drill route** (`src/app/preview/[token]/drill/`) — picks
   the player's weakest attribute, prescribes one real-world drill,
   grants +1 to that attribute + ~15 XP on claim. Once per UTC day
   per twin via `lastDailyDrillAt`. Honor-system v1; Strava OAuth
   verifies post-Tuesday.
5. **Tactics puzzle scaffold** (`src/app/preview/[token]/tactics/`) —
   one hardcoded scenario, multiple-choice, with right/wrong feedback.
   The full library (drag-and-drop board, scenario library, TACTICS
   7th attribute) is a real multi-week project; the scaffold makes
   the architectural direction visible without pretending it's done.

### Post-Tuesday queue (proper builds)

- Re-route the sim claim through `TwinService.recordEvent` so the
  attestation + moment pipeline fires.
- Add a `tactics` 7th key to `AttributeKey` + `ATTRIBUTE_KEYS` +
  `position-baselines.ts` baselines + clamp logic. Requires migration.
- Build the tactics puzzle library: schema, content authoring,
  drag-and-drop board (inspired by JonSzeto821/soccer-tactics and
  spyderkam/Tactics-Board), difficulty progression.
- Strava OAuth integration — verifies daily drills, syncs PAC/PHY.
- Bleep test capture with teammate verification — moves PHY/PAC.
- Full Overall ELO with peer-validated swings and squad-wide ranking.

## First-contact pass (added 2026-07-09)

The London kickabout's first invite got a tepid response. Root cause was
an **inverted value exchange**: the seed message led with a chore ("rate
the lads"), and clicking through dropped a brand-new player into the
rate-5 quiz with their **own card locked**. First contact asked for
labour before showing them anything about themselves.

The fix reframes first contact as **a personal verdict + a bet**, not a
chore. Three changes:

1. **The message leads with a bet, not a chore.**
   `scripts/seed-kickabout-session.ts` now opens with a cheeky,
   debatable one-liner about *them* + their strong/weak stat — the
   debate starts in the WhatsApp thread before they even click. Tone
   level chosen: **spicy** (bold-call one-liner + weakness callout +
   "prove us wrong on the night"). Shape-agnostic ("on the night", not
   "Tuesday") so it works for London (Sun) and Nairobi (Tue).

2. **Card-first landing** (`PreviewFirstContact.tsx`). Tier 0 now shows
   the player's *predicted* card + the bold call first, with the
   rate-the-lads quiz as the second action (launched from the CTA). The
   **peer-verdict card stays gated behind rating 5** — the reciprocity
   doctrine is intact; what's surfaced here is the app's *prediction*,
   not what the group said.

3. **The prediction engine**
   (`src/server/services/personalization/predictions.ts`,
   table-tested). Pure + deterministic (seeded by profileId, so the
   bold call is stable per player). Position + attribute driven:
   `generatePrediction({ position, attrs, seed })` → bold call +
   predicted line + strength/weakness.

**Guardrail (keeps this on-thesis, not the drift the audit flagged):**
the controversy comes FROM THE APP and resolves through real play —
never player-vs-player. It's always framed as a *prediction* ("our
call", "prove us wrong"), never asserted as an earned stat — the
"stats are never self-editable" rule is untouched.

Also fixed a latent bug: the preview `getPreviewUser` include now loads
`playerProfile.twin`, so the card reads the player's real baseline
attributes instead of silently falling back to the position default
(the Tier-1 dashboard shared the same fallback).

## Behavioural-design doctrine (added 2026-07-09)

A pass through the lens of cognitive bias / behavioural heuristics — to
enhance stickiness, retention, and virality **without** becoming the
dark-pattern gamification the vision rejects (and the perception/clubhouse
audit already cut).

**The reframe:** preservation is already a behavioural engine. The reason
the 30-year spreadsheet exists is loss aversion + endowment + sunk cost —
nobody gamified it. So the move is to *sharpen the biases that already
align with preservation*, not bolt on tricks.

**The ethical test (apply to every lever):**
> Does the lever still "work" if the underlying record is empty or fake?
> If yes → dark pattern (manufactured engagement), cut it. If it only
> works *because the record is real and theirs* → ethical stickiness.

Variable-ratio dopamine and streak-anxiety pass the "works on an empty
record" test → off-thesis. Loss aversion over a real accumulating record
fails it → honest.

**Three tiers:**

- **Leverage (build):** endowment + sunk cost (the accumulating record),
  Zeigarnik / open loops (the never-finished card, the "open call" that
  settles next session, empty slots), curiosity gap (the bold call is
  screenshot-worthy *because* it provokes "is that true?"), commitment &
  consistency (the app doubts you → you commit to proving it), peak-end
  (make the last thing each session the keepsake), positive labeling
  (archetype/bold call).
- **Calibrate (dual-use):** social proof (real consensus ✅ / vanity
  boards ❌), social comparison (banter ✅ / rank-anxiety ❌),
  goal-gradient (the rate-5 reciprocity gate ✅ / deeper unlock-bait ❌).
- **Resist (dark patterns):** variable-ratio reward, manufactured
  scarcity / streak anxiety, FOMO-anxiety pushes, bandwagon shaming.

**Virality note (Berger's STEPPS):** high-*arousal* emotion +
*self-relevance* + *social currency* drive sharing. The spicy bold call
already nails arousal + self-relevance; the payoff verdict is a *resolved
curiosity gap* ("we said X → here's what happened") — the most shareable
shape there is. Hence the one-tap shareable payoff card
(`/api/og/payoff` + `resolveSessionPayoff` + `buildShareLinks`) is the
viral primitive built on top of the payoff loop.

## Related files

- `docs/makeathon/post-submission-roadmap.md` — earlier roadmap;
  some items here overlap (recruitment-share, moment URLs)
- `docs/makeathon/app-integration-triggers.md` — per-card trigger
  inventory; useful when deciding which moment cards to surface
  most prominently for Tuesday
- `docs/makeathon/avatar-customization-roadmap.md` — also relevant
  if you build the avatar customization flow for Tuesday
- `src/components/adaptive/AdaptiveDashboard.tsx` — where the
  `PHASE_1_HIDDEN_WIDGET_IDS` set lives
- `VISION.md`, `AGENTS.md` — the source of truth for what the
  wedge is supposed to be
