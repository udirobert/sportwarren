# Perception + Clubhouse audit — drift & PII check

> **Date:** 2026-07-08
> **Scope:** the perception "hot-take engine" + clubhouse surfaces
> shipped 2026-06-22 → 06-24, audited against two AGENTS.md hard rules:
> (1) phone numbers never appear on player-facing surfaces; (2) not a
> social network / not gamification.
> **Method:** full read of the perception service, clubhouse feed, and
> all consuming player surfaces. Findings verified against source.

## Resolution status (2026-07-08)

- ✅ **RULE 1 finding (broadcast gate) — FIXED.** `session/broadcast/.../page.tsx`
  now requires an actual `captain` membership of the *session's* squad;
  the `?? organizer.squads[0]` fallback is gone.
- ✅ **D2 (socket room) — FIXED.** `join-squad` is now membership-gated:
  the client sends the preview token, and the running server
  (`server/services/socket.ts`, prisma-injected via `server/index.ts`)
  verifies squad membership before joining, failing closed. Same guard
  mirrored into the dead duplicate `src/server/services/socket.ts` so it
  can't be promoted as an insecure copy. Verified via `pnpm typecheck`
  (0 errors in touched files).
- ⏳ **D1, D3–D8 (drift mechanics) — deferred to the retro** as an
  explicit keep/cut/reframe checklist (`docs/post-tuesday-retro.md` §5.2).
- ✅ **Duplicate `SocketService` — RESOLVED.** The dead
  `src/server/services/socket.ts` (imported nowhere) was deleted; the
  live server `server/services/socket.ts` is now the single home.

> **⚠️ Finding surfaced during reconciliation — `LiveActivityFeed` is
> currently non-functional.** The client (`PreviewQuizFlow`) emits
> `squad-update` after a perception, but the *live* server
> (`server/services/socket.ts`) has **no `socket.on('squad-update')`
> handler** — only the now-deleted duplicate did. So live rebroadcast is
> a no-op today; the feed only shows the server-rendered initial batch.
> **Deliberately not wired**, because the feed's fate (D2) is a retro
> keep/cut decision. If the retro **keeps** the feed, add a
> `squad-update` handler (calling `broadcastSquadUpdate`) to
> `server/services/socket.ts` — the single home, not a new duplicate.

## TL;DR

- **The perception *engine* is on-vision.** Scenario design, aggregation,
  doctrine, and match commentary are genuine peer-consensus preservation
  — anonymized by construction, explicitly anti-gossip. This is the
  vision's "attributes reflect what your peers actually see," done right.
- **The drift is in the clubhouse *packaging*** — the live activity feed,
  the "what's your number?" wa.me challenge loops, and the activity-volume
  leaderboards import social-network + gamification mechanics the vision
  explicitly rejects.
- **One real PII leak** (RULE 1): the broadcast page's auth gate has a
  fallback that lets a non-captain squad member load every teammate's
  WhatsApp number. **Fix this first — it's a hard-rule violation.**

---

## RULE 1 — phone / PII exposure

Every genuinely player-facing surface (preview, dashboard, quiz,
clubhouse squad page, live feed, analysis, recap, OG card/doctrine
routes) is **clean**: none selects `platformIdentities` / `platformUserId`;
the socket payload carries first names, not phones. Confirmed by tracing
each Prisma `select`/`include`.

### 🔴 HIGH — broadcast gate fallback leaks phones to non-captains

`src/app/session/broadcast/[sessionId]/[organizerToken]/page.tsx`

```
:43  const captainMembership = organizer.squads.find((m) => m.role === 'captain') ?? organizer.squads[0];
:44  if (!captainMembership) notFound();
...
:72  if (session.squad.id !== captainMembership.squadId) notFound();
```

The broadcast page is the *only* surface allowed to render phone numbers
(line 58 includes WhatsApp `platformIdentities`, line 137 reads
`platformUserId` into `phone`, passed to `BroadcastClient`). But the
`?? organizer.squads[0]` fallback means a user who is **not a captain of
any squad** still resolves to their first membership.

**Failure scenario:** the `organizerToken` in the URL is a `walletAddress`
— which *is* every player's own preview token, handed to them in their
preview link. A regular (non-captain) squad member takes their own
`walletAddress`, guesses/knows the `sessionId`, and opens
`/session/broadcast/{sessionId}/{ownWalletAddress}`. Their `squads[0]` is
the session's squad, so the `!==` check on line 72 passes and
`BroadcastClient` receives every teammate's WhatsApp number.

AGENTS.md scopes phone rendering to *"the captain's broadcast UI, gated
by organizer token."* The fallback breaks that gate. **Fix:** require an
actual captain (or organizer role) membership of the session's squad —
drop the `?? organizer.squads[0]` fallback and check role against the
*session's* squad specifically.

---

## RULE 2 — social-network / gamification drift

### On-vision (peer-consensus / preservation) — keep as-is

| Surface | Why it's on-vision |
|---|---|
| `perception/scenarios.ts` | Every option is a football choice; aggregate-display-only; explicitly "never 'Pete said you'd miscontrol'". Sanctioned peer-consensus. |
| `perception/aggregate.ts` | Anonymized by design — "no rater or target identities leak". Pure consensus math. |
| `perception/match-commentary.ts` | Deterministic, reflects players' own ratings back; no LLM hallucination. Preservation-serving. |
| `PerceptionBars.tsx` | Presentational consensus bars. |
| Doctrine block (`squad/page.tsx`) + OG doctrine route | Position-anonymized "what the group says by role", no names. Captain-gated on the OG route. |
| Recap reciprocity gate (rate-5-to-unlock) | The AGENTS.md-sanctioned SubmitHub loop, scoped to `match.sessionId`. |
| `V3Pitch` / `V3Reveal` | Neutral presentational primitives. |

### Drift — decide keep / cut / reframe in the retro

| # | Finding | Severity | Location |
|---|---|---|---|
| D1 | **"⚡ Compare" wa.me challenge** — `"...Overall: {overall} · {position}. What's your number?"` — a vanity rating-comparison viral loop between individuals. Preserves nothing; pure "Instagram for football." | 🔴 High | `preview/[token]/squad/page.tsx:776-777,835-853` |
| D2 | **`LiveActivityFeed`** — a real-time activity ticker (pop-in animation, "just now / Xs ago"). Canonical social-network surface. Compounded by an **unauthenticated** socket room: `join-squad` joins any caller with no token check, so anyone with a `squadId` receives live first-name activity. | 🟠 Med | `components/clubhouse/LiveActivityFeed.tsx`; `server/services/socket.ts:28-38` |
| D3 | **Hot-take "⚡ Share"** — on-vision consensus content wrapped in a `"whats your number?"` viral acquisition loop. | 🟠 Med | `preview/[token]/squad/page.tsx:338-349,688-708` |
| D4 | **Engagement leaderboards** — "Most active rater", "Drilled today", "Tier 3 unlocked" rank *activity volume*, not the record. Rewarding volume is gamification-for-its-own-sake. | 🟠 Med | `preview/[token]/squad/page.tsx:382-413` |
| D5 | **Tier escalation** — gating attribute bars (rate 10) and hot takes (rate 20) behind rating volume is unlock-bait beyond the sanctioned rate-5 reciprocity. | 🟠 Med | `preview/[token]/page.tsx:14-19`; `PreviewCardDashboard.tsx:124-128` |
| D6 | **`nudges.ts`** — Telegram `🔥` tier-unlock pushes; re-engagement notification-bait. | 🟡 Low-Med | `perception/nudges.ts:26-42,76-80` |
| D7 | **"What if I…" projection sliders** — IKEA-effect vanity sandbox. Mitigated: non-persistent, labelled "just projections", doesn't violate stats-are-never-self-editable. | 🟡 Low | `PreviewCardDashboard.tsx:532-686` |
| D8 | **"Hot take / spicy" peek headlines** — consensus core, but the packaging tilts the register toward gossip/virality. | 🟡 Low | `preview/[token]/_actions.ts:139-141` |

---

## Recommendation

The line the vision draws: **peer consensus that helps the group remember
= keep; mechanics that exist to provoke virality or reward activity volume
= cut.** By that test:

1. **Fix RULE 1 finding immediately** — it's a PII leak, non-negotiable.
2. **Authenticate the socket room** (D2) regardless of the feed decision —
   an open `squad:{id}` subscription is a data-exposure issue on its own.
3. **Retro decides D1–D8.** The strongest candidates for cutting are the
   "what's your number?" challenge loops (D1, D3) and the activity-volume
   leaderboards (D4) — these are the clearest "Instagram for football"
   mechanics. Reframe rather than delete where the *content* is consensus
   (D3, D8): keep the doctrine, drop the viral packaging.
4. **The engine stays.** Don't let the packaging critique bleed into the
   perception service — scenarios/aggregate/commentary are exactly the
   preservation surface the vision asks for.
