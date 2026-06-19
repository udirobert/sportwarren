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
