# App integration triggers

The V3 card system is shipping as static artifacts (PNGs from the
satori renderer) but every card is *triggered by an event* somewhere
in the product. This doc maps each card type to:

- **Trigger** — the event that fires it
- **Surface** — where in the app/UI it shows up
- **Share** — how a user shares it externally
- **Notification** — what channel(s) ping the user (in-app /
  WhatsApp / Telegram / push)
- **Current state** — what exists vs what needs to be built

Use this when scoping the post-makeathon integration sprint. The
goal is a coherent moment-card lifecycle from trigger → render →
surface → share — none of the cards should feel "stranded" once
generated.

---

## Existing wire-up

The plumbing that ALREADY exists in production (don't rebuild):

| Service | Role |
|---|---|
| `TwinService.recordEvent({ kind, ... })` | Single entry point for every twin mutation. Hydrates state, applies event, persists diff + attestation, signs via Kite, **creates the Moment row**, dispatches notifications. |
| `moment-render-v2.ts` | satori pipeline. Resolves card kind → component from `CARDS` registry, renders to PNG, stores via storage adapter. Runs in cron every 6h on Hetzner. |
| `notify.ts` | Channel-tiered delivery. In-app bus + WhatsApp throttling (3/twin/day) + Telegram per-kind opt-in. Resolves chatId from `PlatformIdentity`/`SquadGroup`. |
| `SquadMomentsGallery.tsx` | In-app gallery — currently consumes the rendered PNGs. |
| `TwinSignalPreference` | Per-kind Telegram opt-in table. |
| `WhatsAppNotification` | Throttle tracking for WhatsApp sends. |

So every moment card is *already triggered, rendered, stored, and
delivered* via at least one channel. The gaps are around **share
affordances** and **net-new triggers** for the marketing templates.

---

## Moment cards

### record_broken

| | |
|---|---|
| **Trigger** | A `MatchStats` field on the player twin exceeds the previous high water mark (goals in a season, assists in a season, MVPs, etc.). Detected in `twin-appliers.ts` after attestation processing. |
| **Surface** | `SquadMomentsGallery` (recent), player profile timeline. |
| **Share** | Squad WhatsApp delivery (throttled), Telegram (if opted-in). **Gap: public share URL** — `/m/[shareSlug]` route per `post-submission-roadmap.md`. |
| **Notification** | In-app bus, WhatsApp (milestone-tier, counts against 3/day cap), Telegram if opted-in. |
| **Status** | Trigger + render + delivery: **shipped**. Public share URL: **deferred**. |

### level_up

| | |
|---|---|
| **Trigger** | XP threshold crossed in `computeLevel` after any attestation event. |
| **Surface** | Player profile (level prominent in identity card), gallery. |
| **Share** | Same as record_broken. |
| **Notification** | In-app bus + Telegram (opted-in). WhatsApp suppressed by default (small level-ups are noisy). |
| **Status** | Shipped. |

### season_end

| | |
|---|---|
| **Trigger** | `season.endSeason()` is called by `cron/season` when a season's `endDate` is reached. Fires `season_end` for every active twin in the squad. |
| **Surface** | Squad page (season recap section), all players' profiles. |
| **Share** | Captain can broadcast the squad-level card to the squad WhatsApp / Telegram. **Gap: "share season recap" button in the season recap section.** |
| **Notification** | Push to all squad members + Telegram (opted-in). |
| **Status** | Trigger + render: shipped. Captain-broadcast affordance: **build**. |

### twin_created

| | |
|---|---|
| **Trigger** | New `PlayerTwin` row created — either via `TwinService` directly or as side effect of squad import / join. |
| **Surface** | New player's profile (first moment in their timeline), captain's onboarding feed. |
| **Share** | **High-leverage** — when a player joins, this is the natural moment to share the recruitment artifact too. See `avatar-customization-roadmap.md` Phase B integration. |
| **Notification** | In-app for the new player only. Captain gets a "new member" notification (existing). |
| **Status** | Shipped. The avatar customization flow (post-makeathon) would attach to this trigger. |

### achievement

| | |
|---|---|
| **Trigger** | An achievement rule fires (first clean sheet, hat-trick, 10-match streak, etc.) — currently matched in `twin-appliers.ts` after match attestation. |
| **Surface** | Player profile + gallery. |
| **Share** | Standard channels. |
| **Notification** | Telegram opted-in by default. WhatsApp on high-tier only. |
| **Status** | Shipped. |

### sim_complete

| | |
|---|---|
| **Trigger** | `twin-sim.ts` overnight cron settles a round-robin tournament — `settleResults()` fires `sim_completed` per twin. |
| **Surface** | Squad page (sim results section), tournament tab. |
| **Share** | Captain-broadcast for big sim wins (≥podium). **Gap: same as season_end.** |
| **Notification** | Telegram only — sim wins are not WhatsApp-worthy. |
| **Status** | Shipped. |

### attestation_milestone

| | |
|---|---|
| **Trigger** | `Squad.attestationCount` (or `Player.attestationCount`) hits a milestone number (10, 25, 50, 100, 250, 500...). Detected in `twin-appliers.ts`. |
| **Surface** | Squad page (verification status section). |
| **Share** | Strong proof artifact for marketing — captain shares to squad, but also a great public/social proof piece. |
| **Notification** | All squad members in-app + Telegram opted-in. |
| **Status** | Shipped. |

### coaching_hired

| | |
|---|---|
| **Trigger** | `coaching.hireCoach()` is called — a captain hires a coach (paid action). Fires per-player `coaching_hired` for everyone the coach affects. |
| **Surface** | Player profile + coaching tab. |
| **Share** | Personal to the player — usually not broadcast. |
| **Notification** | In-app + Telegram opted-in. |
| **Status** | Shipped (phase 2 / behind `COACHING` flag). |

### coaching_expired

| | |
|---|---|
| **Trigger** | `cron/digital-twin` sweeps expired `CoachingEffect` rows and fires `coaching_expired` per twin. |
| **Surface** | Player profile timeline. |
| **Share** | Rarely shared — quiet farewell card. |
| **Notification** | In-app only by default. |
| **Status** | Shipped. |

### match_imported

| | |
|---|---|
| **Trigger** | `commitMatchHistoryImport()` from `squad-import.ts` creates one Moment per imported historical match. |
| **Surface** | Squad timeline (compact format, since many can be created at once). |
| **Share** | Single cards rarely; the *import event itself* (e.g. "Brockenhurst Rovers imported 47 matches") is more shareable. **Consider: bulk-import summary card.** |
| **Notification** | Captain only. |
| **Status** | Trigger + render: shipped. Bulk-import summary: **consider building**. |

---

## Marketing toolkit triggers

The 5 marketing templates that just propagated to V3 (in
`V3Marketing.tsx`) are *not yet* triggered by app events. This is
where the most product opportunity sits.

### Squad Recruitment (1080×1080 + 1080×1920 story)

| | |
|---|---|
| **Trigger** | Captain creates a squad OR captain opens the recruit-share UI in squad settings. |
| **Surface** | Onboarding success state (after `commitSquadImport`), "Recruit Players" tab in squad settings. |
| **Share** | "Copy invite link", "Share to WhatsApp/Telegram/Twitter/IG", "Download image". Includes squad-specific invite URL (`/join/[squadId]`) and squad/captain branding. |
| **Notification** | None directly — captain initiates the share. |
| **Status** | **Build.** Single highest-leverage integration. Tied to `post-submission-roadmap.md` (Section 2). |

### Squad of the Week

| | |
|---|---|
| **Trigger** | Weekly cron (Sundays) selects the top-performing squad by a metric blend (W/D/L ratio + GF/GA + attestation completion). |
| **Surface** | Email digest (if email signup), in-app feed, optional push notification. |
| **Share** | Captain of the winning squad gets a "Claim and share" button. Auto-DM to captain. |
| **Notification** | Push to captain + in-app banner. |
| **Status** | **Build.** Depends on weekly metrics aggregator (doesn't exist yet — needs to be a `cron/squad-of-the-week` route). |

### Captain Spotlight

| | |
|---|---|
| **Trigger** | Captain hits a meaningful milestone — 25 matches captained, 5 verified seasons, 50 players recruited, etc. Triggered like an achievement. |
| **Surface** | Captain's own profile (badge), squad page. |
| **Share** | Captain can broadcast. |
| **Notification** | Captain only — they decide whether to share. |
| **Status** | **Build.** Needs new achievement-rule entries in `twin-appliers.ts`. |

### Landing Hero (1920×1080)

| | |
|---|---|
| **Trigger** | N/A — used for website hero + OG meta tags. |
| **Surface** | `sportwarren.com` hero section, OG image for landing page. Possibly used in onboarding flow as a "trust" graphic. |
| **Share** | This IS the share asset itself for the website. |
| **Notification** | N/A. |
| **Status** | Marketing asset only. **Render variants once with up-to-date stats** (auto-updates monthly). |

### Feature Explainer

| | |
|---|---|
| **Trigger** | N/A — content marketing asset. |
| **Surface** | Landing page sections, social media posts, onboarding "what is SportWarren" splash. |
| **Share** | Manually shared by team. |
| **Notification** | N/A. |
| **Status** | Marketing asset only. Static. |

---

## Build sequence for post-makeathon

Ordered by leverage × effort:

1. **Moment share URLs (`/m/[shareSlug]`)** — ~1 day. Turns every existing production moment into an inbound funnel. Already specced in `post-submission-roadmap.md`.

2. **Squad Recruitment dynamic generation + onboarding share button** — ~1 day. Captain wedge multiplier.

3. **Avatar customization (item #5)** — ~4.5 days across 5 phases. Specced in `avatar-customization-roadmap.md`. Phase A (schema + render) unblocks everything.

4. **Squad of the Week weekly cron** — ~2 days. Needs a metrics aggregator + a captain-facing "claim and share" UI.

5. **Captain Spotlight achievement rules** — ~0.5 day. Adds a few entries to the achievement rules table; reuses existing achievement plumbing.

6. **Bulk match-imported summary card** — ~0.5 day. Single new card archetype + a render-after-import hook.

**Total post-makeathon scope: ~10 days of focused work.** Each is
independently shippable.

---

## Cross-cutting: notification policy

A consistent rule for new triggers (avoids alert fatigue):

- **In-app bus** — every moment, no exceptions. Cheap, expected.
- **Telegram** — opted-in per-kind via `TwinSignalPreference`.
  Default opt-ins on twin creation: `twin_created`, `level_up`,
  `sim_win`, `record_broken`.
- **WhatsApp** — milestone-tier only (record_broken,
  attestation_milestone every 10/25/50/100, season_end). Counts
  against the 3/twin/day cap.
- **Push** — captain-targeted broadcasts only (Squad of the Week,
  bulk import complete, season ended).
- **Email** — none yet. If added: weekly digest only.

---

## Open product questions

1. **Public share URL — auth-walled or fully public?** Lean fully
   public (the whole preservation thesis is "this is yours forever
   and shareable"). Caveat: opt-out for private squads.
2. **Captain-broadcast vs auto-broadcast for shareables?** Per-kind
   default. Squad of the Week → captain choice. attestation_milestone
   → auto squad-channel. record_broken → captain choice.
3. **Do we render the V3 cards at multiple sizes**, or one PNG with
   downscale? Current pipeline does multi-size at upload but
   moment-render-v2 only emits 600×400 landscape. Probably need a
   1080×1080 social variant for share URLs.
4. **Migration of existing PNGs**: 1,400 moments already rendered
   in v2 register. When V3 ships to production, do we re-render all
   historical moments or only forward? Recommendation: **only
   forward** — the V2 cards stay as historical record. V3 starts
   from a cutover date documented in the moment row.
