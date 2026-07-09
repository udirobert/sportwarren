# Kickabout model — person, group, night, and the ephemeral team

> **Status:** architectural stance, 2026-07-09. Grounded in the current
> schema (`prisma/schema.prisma`), the kickabout seed
> (`scripts/seed-kickabout-session.ts`), and the Bibs Optimizer
> (`src/server/services/personalization/bibs-optimizer.ts`).
> **Audience:** anyone building a player-facing surface for the
> kickabout (Primary B) shape. Guides the build the way `flywheel.md`
> does — read before adding a "team" concept anywhere.

## The one principle

**Preserve three things — the person, the group, the night. A weekly
team is an ephemeral *view*, never a preserved entity.**

A "team" that existed for 90 minutes (Reds vs Blues, decided by bibs on
the night) is noise, not signal. What's worth keeping is the **co-play
graph** those teams generate: who played *with* and *against* whom. That
graph — attributed to people, accumulated across nights — is what powers
the Match-of-the-Day stat the vision bets on:

> "When Dave and Sami are on the same team, the win rate is 73%."

That stat is derived from ephemeral team memberships. The teams are the
*engine*; the graph is the preserved asset. So: **capture the edges,
don't build the nodes.**

## The four layers (only three are preserved)

| Layer | Entity | Preserved? | Teams appear as… | Privacy default |
|---|---|---|---|---|
| **Person** | `User` + `PlayerTwin` | ✅ permanent, portable | *never as teams* — as co-play stats ("best paired with Sami", "sessions: 12") | private; player opts into `/player/{handle}` via `User.discoverable`, **independent of any group** |
| **Group** (the crew) | `Squad` | ✅ permanent container | roster of *people* + aggregates + session history; no teams | `Squad.visibility` — `group_only` is the natural resting state for a kickabout |
| **Night** (the session) | `Session` | ✅ permanent episode | the *frame* of the night's story ("Reds 4–3 Blues, Dave MOTM"), then dissolve | shareable per-night via a session share token (mirror the preview-token model) — **without** exposing the whole group |
| **Team** (Red/Blue) | *none* — in-memory `BibsResult` | ❌ transient | prominent **only** in the live Bibs Optimizer on the night | no privacy setting — it isn't an entity |

**Do not** give a weekly team a page, a handle, a name, or accumulating
stats. If you feel the urge to `model Team {}`, re-read this section.

## "The group is the people, not the team" — regular vs drop-in

A random-mix kickabout (e.g. the London group) has *fuzzy* membership.
Two concepts must stay distinct:

- **`SessionAttendee` = "who played."** Source of truth for a night. A
  one-time drop-in gets a `SessionAttendee` row **and a `PlayerTwin`**,
  so their record accrues from game one — even if they never return.
- **`SquadMember` = "who's a regular."** The group roster. A drop-in
  does **not** auto-promote to `SquadMember`; that's a separate
  threshold (e.g. N appearances), decided later.

Consequence for surfaces: the **group page** roster = regulars
(`SquadMember`); the **session page** roster = who actually showed up
(`SessionAttendee`). Never conflate them.

## Public vs private — the rule

Default private is correct for a kickabout. The three privacy dials are
**decoupled** (already shipped — see AGENTS.md "Privacy gradient"):

1. **Person** — `User.discoverable` gates `/player/{handle}`. A lad in a
   **private** kickabout can still publish **his own** card. Independent
   of the group.
2. **Group** — `Squad.visibility` (`private` → `group_only` → `public`)
   gates `/squad/{shortName}`. `group_only` = crew sees each other, not
   the open web.
3. **Night** — a session recap ("Tuesday: Reds 4, Blues 3, Dave MOTM")
   is the screenshot-into-WhatsApp artifact. Share it via a per-session
   token, **not** by making the whole group public.

The intersection (group `public` AND player `discoverable`) is the
future scout surface. Nothing else exposes a player to the open web.

**Phone numbers stay captain-only** (AGENTS.md hard rule). Extra
important with rotating strangers: someone who played once must never
see the crew's contact list. Audit every kickabout surface against this.

## The schema already holds the co-play graph — the gap is the write path

**No new model is needed.** The edges are already relationally
capturable (this is why we do NOT add `SessionTeam`):

| Field | Model | Holds |
|---|---|---|
| `sessionId` | `Match` | links each game to a night (`Session.matches` is a list — many games per night) |
| `teamAssignments` `Json?` | `Match` | `{"home": [profileId…], "away": [profileId…]}` — "which players were on which team for this match" (denormalized convenience) |
| `teamSide` `String?` | `PlayerMatchStats` | `'home'` / `'away'` per player — **the queryable truth** for the co-play graph |
| `homeScore` / `awayScore` | `Match` | the result that turns a co-play edge into a win/loss |

### The derived stat (no schema change)

"Dave + Sami on the same team, win rate" is a self-join on
`PlayerMatchStats.teamSide` — no JSON parsing, no new table:

```sql
-- games where profile A and profile B were on the SAME side,
-- and whether that side won
SELECT m.id,
       pa.team_side AS side,
       CASE WHEN pa.team_side = 'home'
            THEN m.home_score > m.away_score
            ELSE m.away_score > m.home_score END AS won
FROM player_match_stats pa
JOIN player_match_stats pb
  ON pa.match_id = pb.match_id
 AND pa.team_side = pb.team_side      -- same team
 AND pa.profile_id <> pb.profile_id
JOIN matches m ON m.id = pa.match_id
WHERE pa.profile_id = :daveProfileId
  AND pb.profile_id = :samiProfileId;
```

Swap `pa.team_side = pb.team_side` for `<>` to get the rivalry stat
("Dave vs Tom, head-to-head"). Both are the same substrate.

### The actual gap

The kickabout seed collapses a whole night into **one synthetic
summary `Match`** with `teamAssignments` unpopulated and no per-player
`teamSide`. So the raw material for the co-play stat isn't being
written. The fix lives entirely in the **write path**, not the schema:

- **Minimum (per-session split):** on session end, write `teamSide` on
  each `PlayerMatchStats` row and populate `Match.teamAssignments` from
  the Bibs allocation. One match per night. Loses mid-night reshuffles.
- **High-fidelity (per-game):** winner-stays-on reshuffles teams between
  games, so accurate co-play needs one `Match` row per short game
  (`sessionId` links them). Heavier to log.

**Recommendation:** ship the per-session split first; upgrade to
per-game only if a group asks or the co-play stat visibly misreads a
winner-stays-on night. Don't build per-game logging on spec.

## What this means for the next tests

- **London (Sunday, first contact):** *none* of the co-play machinery is
  needed. First contact only exercises the **person** layer — pre-seeded
  card + preview, "it already knows you." Build nothing here for Sunday.
- **After the wedge is confirmed:** the co-play write-path fix is the
  first retention-layer build, because the MOTD stat is the vision's
  single most screenshotable artifact and the graph is already
  half-built in the schema.

## Related

- `docs/VISION.md` — Primary B, "the group is the people, not the team",
  the Match-of-the-Day stat.
- `docs/flywheel.md` — Bibs Optimizer (team allocation), post-session
  analysis, the closed loop.
- `AGENTS.md` — privacy gradient, two-URLs-per-player, phone-number rule.
- `scripts/seed-kickabout-session.ts` — where the write-path gap lives.
