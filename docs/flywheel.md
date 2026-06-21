# Flywheel — closed-loop ecosystem (post-Tuesday architecture)

> **Status:** Pre-Tuesday audit + design. The post-Tuesday architectural
> queue. Wait for real signal from Tuesday's three players before
> building the items here — but lock in the shape so future-us doesn't
> redo the audit.

## What we're trying to build

A self-reinforcing engagement loop where every match feeds twin
attributes, twin attributes feed formation/team-allocation, and
formation drives the next match's narrative. The chess.com analogy
is precise — your card *is* the player; every interaction with the
platform is in service of moving it.

```
                  ┌─────────────────────┐
                  │   Real session      │
                  │   (live capture)    │
                  └──────────┬──────────┘
                             │
                             ▼
                  ┌─────────────────────┐
                  │  Peer ratings +     │  ← existing pipeline
                  │  goals + minutes    │    (the only working loop)
                  └──────────┬──────────┘
                             │  TwinService.recordEvent
                             │  ('peer_rating_consensus')
                             ▼
                  ┌─────────────────────┐
                  │  Twin attributes    │
                  │  shift              │
                  └──────────┬──────────┘
                             │
        ┌────────────────────┼────────────────────┐
        ▼                    ▼                    ▼
┌──────────────┐  ┌───────────────────┐  ┌──────────────┐
│ Post-match   │  │ Team allocation   │  │ Drill picker │
│ analysis     │  │ + formation for   │  │ biases to    │
│ page (NEW)   │  │ next session      │  │ new weakness │
│              │  │ (NEW)             │  │              │
└──────┬───────┘  └─────────┬─────────┘  └──────┬───────┘
       │                    │                   │
       │  ┌─────────────┐   │   ┌────────────┐  │
       └─→│ Tactics     │   └──→│ Captain    │  │
          │ puzzle tied │       │ accepts in │  │
          │ to YOUR     │       │ pre-match  │  │
          │ moment      │       │ UI         │  │
          └──────┬──────┘       └──────┬─────┘  │
                 │                     │        │
                 └─────────────────────┴────────┴──→ next session
```

## Two wedge shapes, two algorithms

The team/formation recommendation work has different shapes for the
two primary personas. Both downstream of twin state; different
surfaces.

### Primary A — Sunday League captain (fixed squad, 11v11)
- Same shirt + roster across a season
- Formation is a **lineup decision** (4-2-3-1 vs 4-3-3)
- Recommendation: given squad attribute distribution, propose
  formation + lineup. Captain accepts or overrides.
- Surface: pre-match captain UI + the existing Formation-of-Week
  Telegram cron message

### Primary B — Kickabout organizer (rotating teams, 6/7/8-a-side)
- Each week teams mix based on confirmed signups
- Format (6v6, 7v7, 8v8) chosen by captain based on numbers + pitch
- Winner-stays-on rotation across the night
- Recommendation is **not formation** — it's a **Bibs Optimizer**:
  - **Inputs:** confirmed signups, format (players-per-side), each
    player's twin attributes, historical "who's played with whom"
  - **Output:** two balanced teams + position-per-player within each
    team, with an aggregate strength explanation ("Red 412, Blue
    408 — tightest split in 4 sessions")
  - **Rotation handling:** as games happen and the loser rotates,
    suggest who from the bench joins which team to maintain balance
- Surface: kickabout pre-session UI (the captain runs it on the
  night when signups close or when everyone arrives)

**Both surfaces feed the same downstream:** match starts → live
capture → peer ratings + goals → twin attributes shift. The
algorithm at the top of the loop differs; the bottom of the loop
is shared.

## Existing infrastructure to leverage

Audit done 2026-06-21. The codebase already has:

| Component | Where | What it does | Used in flywheel? |
|---|---|---|---|
| Peer-rating consensus | `src/server/routers/peer-rating.ts` `syncPeerRatingsToTwins()` | Median scores → attribute deltas via TwinService | ✅ yes, the ONE working loop |
| TwinService | `src/server/services/personalization/twin-service.ts` | Single funnel for twin mutations | ✅ peer-rating-consensus uses it; preview claim/drill don't (debt) |
| Twin tournament sim | `src/server/services/personalization/twin-sim.ts` + `/api/cron/twin-sim` | Overnight round-robin, writes prestige/XP via TwinService | ⚠️ isolated — no feedback to formation or drill |
| Squad ghost-match sim | `SquadDigitalTwinWidget` + `simulateGhostMatch` | Squad-level battle, writes back to DigitalTwin | ⚠️ behind 3D feature flags; no formation input |
| Preview sim (NEW) | `src/app/preview/[token]/sim/` | Per-player kickabout sim, writes deltas on claim | ⚠️ bypasses TwinService (v1 debt) |
| Daily drill widget | `DailyDrillWidget` | Picks weakest attr, fires `daily_drill` event via TwinService | ⚠️ hidden behind `PHASE_1_HIDDEN_WIDGET_IDS` + duplicated by preview drill |
| Preview drill (NEW) | `src/app/preview/[token]/drill/` | Same as widget but direct-write | ⚠️ duplicates the widget |
| Formation-of-Week cron | `/api/cron/formation-of-week` | Weekly Telegram message with deterministic formation | ⚠️ never consults twin state |
| TwinHeroCard | dashboard widget | Reads twin level/xp/events | ✅ read-only display |
| PostMatchReaction | dashboard widget | Shows last event's attribute deltas | ✅ read-only display, but only kicks in for fixed-squad matches |

## Flywheel gaps (the missing pieces)

1. **Formation/team-allocation is orthogonal to twin state.**
   No surface today derives lineup/teams from squad attribute
   distribution. This is the biggest miss — it's where the squad-level
   flywheel lives.
2. **Post-session analysis surface is missing.** Match → peer ratings
   → twin updates happens silently. Players only see the delta on
   their next preview visit, with no story attached. The chess.com
   equivalent of "you lost 12 rating points because…" doesn't exist.
3. **Drill duplication.** Preview-side `/drill` (direct-write) and
   in-app `DailyDrillWidget` (TwinService-routed) do the same thing.
   Pick one.
4. **Sim has no cross-session consequences.** Three sim engines, none
   feeds formation, drill picker, or peer-rating context.
5. **Tactics puzzles disconnected from lived experience.** Scaffold
   has one hardcoded scenario; the real version should pull from
   tagged scenarios that reference actual matches.

## Shipping order (post-Tuesday)

Each item in dependency order. Times are first-pass estimates.

| # | What | Time | Why this order |
|---|---|---|---|
| 1 | **Unify the twin write path.** Add `previewMode` flag in `TwinService.recordEvent` that skips Kite signing + moment rendering + notification dispatch but keeps event sourcing + attribute update + idempotency. Re-route preview sim claim + preview drill claim through it. | ~3h | Removes the dual-write debt I created in the chess.com pass. Single funnel = single truth. |
| 2 | **Post-session analysis page** at `/session/{id}/analysis/{token}`. Shows the player's session story: goals → peer ratings → attribute deltas → "where your card moved" → "what to drill next." | ~1 day | This is the missing emotional peak. Just-after-the-match is when the player is hot. |
| 3 | **`recommendFormation(squadId)` for Primary A (Sunday League).** Aggregate squad attribute distribution → propose formation + lineup. Wire into Formation-of-Week + pre-match captain UI. | ~1.5 days | Sunday-League captain wedge needs this. Formation-of-Week becomes consequential. |
| 4 | **`bibsOptimizer(squadId, signups, playersPerSide)` for Primary B (kickabout).** Balance two teams by aggregate twin strength + suggest positions per player. Handle winner-stays-on rotation. | ~2 days | The kickabout wedge needs THIS, not 11-a-side formation. Highest-impact for the Tuesday cohort. |
| 5 | **Drill picker biased toward squad-weakest + player-weakest.** Intersection of "your lowest" and "the squad's lowest" — creates squad-level momentum. | ~3h | Small tweak; high coherence payoff. The squad becomes a co-protagonist. |
| 6 | **Tactics puzzle tied to last session scenarios.** Replace the scaffold with a library of scenarios tagged to match contexts ("you conceded 3 on the left wing — here's what you should have done"). | ~1 week+ | Long tail. Puzzle becomes downstream of lived experience. |
| 7 | **Deduplicate drill flow.** Pick one path: preview-side `/drill` or in-app `DailyDrillWidget`. The other gets deleted. | ~1h | Coherence cleanup. Decision can wait until after #1 lands. |

## Design call to make explicitly

**Should formation/team-allocation be prescribed (algorithm picks) or
proposed (algorithm suggests, captain decides)?**

- Chess.com is prescribed (opponent matched by rating; you can't pick)
- Football is more like *proposed* — captains have authority in the
  WA group; an algorithm that prescribes will feel paternalistic
- Recommendation: **proposed-with-explanation.** Algorithm shows
  recommended teams/formation + the why (twin attributes, group
  averages, historical pairings). Captain accepts or overrides.
  The captain's authority is preserved; the algorithm gives them
  ammunition for the group chat ("the system says we should run
  4-2-3-1 because…").

This decision shapes #3 and #4 above.

## What's NOT in this loop (deliberately)

- **Strava integration** — separate piece of plumbing; verifies
  drill claims + moves PAC/PHY directly. Belongs in the
  "verified third-party proof" layer.
- **Coaching marketplace** — phase-2 monetisation layer; only
  relevant once the flywheel is producing real engagement signal.
- **Tournaments / championship ladder** — phase-2.
- **Onchain attestation** — durability infrastructure, not part of
  the engagement loop; happens behind the scenes when twin events
  fire.

## When to revisit

After Tuesday's session — review:
- What did the three players actually engage with?
- Did anyone return to /drill on day 2?
- Did anyone share a sim PNG to WhatsApp?
- Did the captain use the preview links to inform team allocation
  on the night (informally) before we even built the Bibs Optimizer?

Whatever Tuesday reveals reshapes the priority order above. The
shape of the flywheel above is the long-form bet — the order of
the builds should be driven by where Tuesday's signal is loudest.
