# Post-Tuesday retro — first user test

> **Test date:** Tuesday 2026-06-23 (kickabout cohort, Primary B).
> **Retro drafted:** 2026-07-08 — ~2 weeks after the test, retroactively.
> **Status:** ⚠️ SCAFFOLD — fields marked _[fill in]_ are un-captured.
> Fill these from memory/notes NOW before more time passes; every
> prioritisation decision in `flywheel.md` and `product-calibration.md`
> is waiting on the answers below.

## Why this doc exists

`VISION.md`, `product-calibration.md`, and `flywheel.md` all end with
"after Tuesday we'll learn X and re-order the roadmap." That signal was
never written down. Two weeks of work (perception engine, clubhouse,
Rive character) has happened since **without** the test's answers on
record — meaning the roadmap is being pulled by makeathon/contest
deadlines rather than by what the three players actually did.

This doc closes that loop. It is deliberately structured around the
**exact questions the source-of-truth docs said to ask**, not new ones.

---

## 1. The two PRIMARY signals (VISION.md → "How we measure success")

These are the only two signals the vision calls primary. Everything
else is "downstream noise" by its own words.

### 1a. Behavioural substitution — did the organizer stop maintaining the old system?
> _The strongest possible signal. Did the kickabout organizer stop
> keeping score in their head / in Notes / in the WhatsApp thread,
> because SportWarren now holds it?_

- **What we observed:** _[fill in]_
- **Evidence (a message, a screenshot, a direct quote):** _[fill in]_
- **Verdict:** ☐ Substituted ☐ Runs both in parallel ☐ Reverted to old system ☐ Unknown

### 1b. Unprompted sharing — did anyone screenshot a stat into the chat?
> _"Does anyone in the group screenshot a SportWarren stat into the
> WhatsApp chat unprompted?" Meaning is being created when they do._

- **What we observed:** _[fill in]_
- **What was shared (which stat/moment/card):** _[fill in]_
- **Prompted or unprompted:** _[fill in]_
- **Verdict:** ☐ Shared unprompted ☐ Shared when nudged ☐ No sharing ☐ Unknown

---

## 2. The flywheel "when to revisit" questions (flywheel.md)

Verbatim from `flywheel.md` → "When to revisit". Answer each:

- **What did the three players actually engage with?** _[fill in]_
- **Did anyone return to `/drill` on day 2?** _[fill in]_
- **Did anyone share a sim PNG to WhatsApp?** _[fill in]_
- **Did the captain use the preview links to inform team allocation on
  the night (informally), before the Bibs Optimizer existed?** _[fill in]_

---

## 3. The calibration questions (product-calibration.md → "Post-Tuesday review plan")

The Phase-1 slim (`PHASE_1_HIDDEN_WIDGET_IDS`) was framed as *a test*,
not a deletion. Answer these to decide per-cluster bring-back / sunset /
hard-delete:

- **What did test users engage with?** _[fill in]_
- **What did they ask about that's currently hidden?** (e.g. "can I
  trade players?", "does this have a wallet?" — a hidden feature
  revealing a real customer) _[fill in]_
- **What did they want that doesn't exist yet?** (net-new asks) _[fill in]_

### Per-cluster decision
For each hidden cluster, mark: **Bring back** / **Sunset** / **Hard delete**.

| Cluster (from PHASE_1_HIDDEN_WIDGET_IDS) | Anyone ask for it? | Decision |
|---|---|---|
| Web3 financial (event-feed) | _[fill in]_ | _[fill in]_ |
| Web3 governance (governance) | _[fill in]_ | _[fill in]_ |
| Web3 social (lens-social) | _[fill in]_ | _[fill in]_ |
| Geo gamification (nearby-squads, territory) | _[fill in]_ | _[fill in]_ |
| AI staff (staff-feed) | _[fill in]_ | _[fill in]_ |
| Coaching marketplace (coach-kite) | _[fill in]_ | _[fill in]_ |
| Squad analysis (squad-dynamics, scouting-report) | _[fill in]_ | _[fill in]_ |
| Gamification loops (weekly-challenges, sharpness-streak, daily-drill, post-match-reaction) | _[fill in]_ | _[fill in]_ |
| Training (training) | _[fill in]_ | _[fill in]_ |
| Comms (communication-hub) | _[fill in]_ | _[fill in]_ |

---

## 4. Secondary signals (product health — VISION.md)

Nice-to-have, but do not let these substitute for §1.

- **Logging cadence** (target: ≥1 session/week): _[fill in]_
- **Peer ratings coverage** (target: ≥60% of matches rated by ≥3 teammates): _[fill in]_
- **Week-4 retention** (group still active): _[fill in]_
- **Share rate** (stats/moments shared outside app): _[fill in]_

---

## 5. Decisions coming out of this retro

> The whole point of the retro is that the answers above **re-order the
> build queue.** Record the concrete decisions here.

1. **Re-ordered flywheel priority:** _[fill in — e.g. "verification
   layer before formation because ___"]_
2. **Perception/clubhouse scope call:** see the keep/cut/reframe
   checklist in §5.2 below.
3. **Phase-1 hidden clusters to bring back / delete:** _[fill in]_
4. **Contest-driven work (Rive character):** _[keep as showcase / fold
   into product / park]_

### 5.2 Perception / clubhouse drift — keep / cut / reframe checklist

Source: `docs/perception-clubhouse-audit-2026-07-08.md`. The audit found
the perception **engine** (scenarios, aggregation, doctrine, commentary)
soundly on-vision — **keep it, not in question here.** The drift is in
the clubhouse **packaging**. Each row below is a product call, not a bug.

The **filter** (from `VISION.md`): peer consensus that helps the group
remember = keep; a mechanic that exists to provoke virality or reward
activity-volume = cut or reframe. "Reframe" = keep the on-vision content,
strip the viral/gamified wrapper.

The **recommended** column is a proposal to confirm or overturn with
Tuesday's cohort signal (§1–§2) — *did anyone actually share, compare,
or chase a tier?* — not a decision already made.

| # | Mechanic | Location | Recommended | Your call |
|---|---|---|---|---|
| D2 | `LiveActivityFeed` live ticker (currently non-functional — see audit note; no `squad-update` handler on live server) | `clubhouse/LiveActivityFeed.tsx` | **Cut** unless cohort explicitly wanted a live feed. If keep → wire the handler in `server/services/socket.ts` (one home). | _[ ]_ |
| D1 | "⚡ Compare" wa.me challenge — "What's your number?" vanity rating comparison | `squad/page.tsx:776-777,835-853` | **Cut** — clearest "Instagram for football" loop; preserves nothing. | _[ ]_ |
| D3 | Hot-take "⚡ Share" wrapping consensus in "whats your number?" | `squad/page.tsx:338-349,688-708` | **Reframe** — keep sharing the doctrine as a *keepsake/record*; drop the challenge framing. | _[ ]_ |
| D4 | Engagement leaderboards: "Most active rater", "Drilled today", "Tier 3 unlocked" | `squad/page.tsx:382-413` | **Cut** the activity-volume tiles; **keep** "Top of the pile" (overall rating — record-based). | _[ ]_ |
| D5 | Tier escalation gating attribute bars (rate 10) + hot takes (rate 20) | `preview/[token]/page.tsx:14-19`; `PreviewCardDashboard.tsx:124-128` | **Reframe** — keep the sanctioned rate-5 reciprocity gate; drop the 10/20 unlock-bait. | _[ ]_ |
| D6 | `🔥` tier-unlock Telegram pushes | `perception/nudges.ts:26-42,76-80` | **Reframe/Cut** — mostly falls away with D5; at most one transactional "your card's ready". | _[ ]_ |
| D7 | "What if I…" projection sliders (IKEA-effect sandbox) | `PreviewCardDashboard.tsx:532-686` | **Keep (low priority)** — non-persistent, labelled, doesn't break stats-immutability. Monitor. | _[ ]_ |
| D8 | "Hot take / spicy" peek-headline packaging | `preview/[token]/_actions.ts:139-141` | **Reframe** — keep the consensus peek; soften copy from gossip register to neutral peer-consensus. | _[ ]_ |

**Once decided:** anything marked Cut/Reframe becomes a follow-up task.
None of it is touched until this checklist is signed off — these are
product decisions, deliberately not pre-empted in code.

---

## Appendix — what actually shipped between the test and this retro

For context when reading the engagement answers above. Commits
2026-06-22 → 2026-06-24 (then quiet, with uncommitted WIP):

- Perception "hot-take engine" (`src/server/services/perception/`) +
  peer-consensus doctrine aggregation
- Clubhouse squad home at `/preview/[token]/squad` + `LiveActivityFeed`
- Captain tactical doctrine page + share-to-WhatsApp PNG
- Strava OAuth connect **scaffold** (still honor-system for drills)
- Two-URL doctrine hardened; handle-collision fail-soft
- V4 dark-stadium primitive library
- **In-flight, uncommitted:** V3Pitch / V3Reveal, Rive interactive
  character (contest deadline was Jul 2), socket transport changes,
  before/after attribute snapshot
