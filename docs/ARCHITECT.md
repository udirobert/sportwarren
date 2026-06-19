# SportWarren Architect

**Technical Blueprint — Championship Manager for real-world football**

SportWarren gives every grassroots match the depth of a management sim: pre-match previews, post-match peer ratings, and persistent player progression. This doc covers the match lifecycle, the peer consensus engine, and the autonomous agent infrastructure.

---

## The Match Lifecycle

Every match follows a consistent pipeline:

```
Match Scheduled → Pre-Match Preview → Live Match → Post-Match Ratings → Attribute Progression
```

| Phase | What Happens | User Surface |
|-------|-------------|--------------|
| **Pre-Match** | AI generates win probabilities, tactical breakdowns, and head-to-head comparisons. Autonomous squad agent may procure external intelligence on opponents. | `/match/preview` page, WhatsApp + Telegram preview card |
| **Live Match** | Real-time commentary delivered to squad WhatsApp groups. Match events (goals, cards, subs) logged through chat commands or Telegram Mini App. | WhatsApp group chat |
| **Post-Match** | Teammates rate each other's FIFA-style attributes. Consensus logic deduplicates and weights ratings. Result attested onchain. | WhatsApp prompts + Telegram dashboard |
| **Progression** | Player attributes evolve based on peer consensus and match history. XP earned for accurate ratings. Squad stats aggregate into season-long narratives. | PlayerIdentityCard (skin + twin, one component) |

### Match Briefing & Preview

The `/match/preview` page provides AI-generated pre-match intelligence:

- **Win probabilities** based on historical performance
- **Tactical breakdowns** and head-to-head comparisons
- **Opponent scouting** via Kite AI agents (on-demand or cron-triggered 22h before kickoff)

### Post-Match Reactions

After verified matches, players receive **PostMatchReaction** widgets:

- **XP gains** with animated counter
- **Attribute changes** with +/- indicators
- **Level-up celebrations** for milestone achievements

The reaction widget is the primary conversion surface for first-time users — it makes the value proposition tangible immediately after their first match.

---

## Daily Drills

Players complete daily training drills to boost their twin's attributes outside of match days.

### Drill Mechanics
- **Daily reset** at midnight UTC
- **Streak tracking** for consecutive days completed
- **Attribute boosts** applied via `TwinService.recordEvent({ kind: 'drill_completed' })`
- **Streak rewards** unlock premium features (3D twin, extended moments)

### Dashboard Integration
- `DailyDrillWidget` displays on `AdaptiveDashboard`
- Shows current streak, today's drill, and reward tier

---

## Peer Consensus Engine

The core gamification loop: after every match, players rate teammates on Pace, Shooting, Passing, Defending, and Physicality.

### Telegram Match Lifecycle (Zero-Friction)

The Telegram bot implements a fully automated post-match pipeline:

1. **Detection** — Bot intercepts casual chat ("we won 3-1") via regex + AI parser (confidence >= 0.75) before it reaches the general AI handler
2. **Logging** — Any linked squad member can log (not just captains). Draft confirmation via inline buttons.
3. **Verification** — Group reaction: Confirm/Dispute buttons posted to both squad group chats. Auto-verifies at 3+ confirms or 6h silence.
4. **XP Distribution** — `applyMatchXP` fires automatically on verification and after peer consensus closes (idempotent)
5. **Card Delivery** — Match result card (Satori PNG) sent to both groups as a photo after consensus

**Auto-Created Opponents:** When logging against an unknown squad, a placeholder `Squad` record is created with `isPlaceholder: true` so the match proceeds. The opponent can claim it later via the Mini App.

### WhatsApp Match Lifecycle (Group-Native)

WhatsApp mirrors the Telegram flow but lives entirely inside the squad group chat:

1. **Auto-link** — Marcus joins a group, matches the Champion's phone number to a squad record, and links automatically.
2. **Detection** — Regex + AI parser catches results from casual chat; posts confirm/dispute buttons to the group.
3. **Rating** — After consensus closes, Marcus DMs each player a signed rate link (no login required). A 2-hour cron nudges anyone who hasn't rated.
4. **Cards** — FIFA-style player cards posted back to the group once ratings are submitted.

### Rating Mechanics
- **Consensus Logic:** Uses **Median** scores to neutralize outliers and trolling.
- **Scout XP:** Raters earn "Scout XP" when their ratings align with the squad consensus — inaccurate raters lose influence over time.
- **Influence Weighting:** "Elite Scouts" have higher vote weight; "Rookies" or chronic outliers have their weight dampened.

### Match Verification Tiers
Results escalate from self-reported to cryptographically verified:

- **Bronze:** Self-reported by one captain.
- **Silver:** Both captains confirm.
- **Gold:** Both confirm + media evidence.

---

## App Routes

| Route | Purpose |
|-------|---------|
| `/` | Landing page with FormationPlayground + Import CTA |
| `/play/[slug]` | Claim formation position (viral entry) |
| `/join/[squadId]` | Join squad from invite or claim imported spot (`?player=` param) |
| `/match` | Match center (logging, history) |
| `/match/preview` | Pre-match AI briefing |
| `/match/[id]/rate` | Peer rating interface |
| `/squad` | Squad management |
| `/coaching` | Coaching marketplace |
| `/stats` | Season overview + stats |
| `/reputation` | Reputation page |
| `/leaderboard` | Global leaderboards |
| `/profile` | Player identity card |
| `/settings` | Signal preferences, wallet |
| `/analytics` | Admin analytics dashboard |

---

## Kite AI: Autonomous Squad Agents

Every squad in SportWarren gets an autonomous AI agent — a **Squad Manager** with its own Kite Passport identity, spending budget, and decision-making capability.

### What Agents Do
- Scout opponents before matches (cron-triggered 22h before kickoff, or on-demand via WhatsApp)
- Discover and pay for intelligence services from the Kite x402 marketplace
- Manage squad budgets within user-delegated limits
- Record every action as a cryptographically signed attestation

### Agentic Commerce (x402)
SportWarren is a first-class participant in the Kite Agentic Economy.

- **Outbound:** Squad agents autonomously procure paid services using Kite Passport sessions.
- **Inbound:** External agents can pay SportWarren for scouting reports via `/api/x402/scout`.
- **Settlement:** USDC payments settle on Base through Kite Passport routing, with verifiable transaction hashes.

### Budget Guards
| Guard | Limit | Scope |
|-------|-------|-------|
| Per-user daily | `KITE_SCOUT_MAX_USDC` (default $0.50) | Individual player |
| Per-squad daily | `KITE_SCOUT_MAX_USDC_SQUAD` (default $2.50) | Shared across squad members |
| Platform payout | `KITE_DAILY_PAYOUT_BUDGET_USDC` (default $200) | Total agent-initiated spending |

### x402 Client Architecture

The `x402-client.ts` module implements a **dual-network routing** strategy — settlement requests resolve to either **Kite chain** (`eip155:2368`) or **GOAT Network** (`eip155:48816` / `eip155:2345`) based on the target network string.

The payment flow for any x402 service call:

1. **Probe** — `GET`/`POST` request to the service URL with no payment header
2. **402 Challenge** — Service responds `402 Payment Required` with `PaymentRequirements`
3. **Route selection** — `resolveX402Config()` picks the right facilitator chain
4. **Signing** — Platform wallet signs an EIP-3009 `TransferWithAuthorization` (or Kite Passport handles it for external merchants)
5. **Settlement** — Signed envelope posted to the facilitator's `/v2/settle` endpoint
6. **Access** — Paid request re-sent with `X-PAYMENT` + `PAYMENT-SIGNATURE` headers

### x402 Service Endpoints

SportWarren operates two x402 merchant endpoints that external agents can pay to call:

| Endpoint | Price | What It Does |
|----------|-------|-------------|
| `POST /api/x402/scout` | 0.005 USDC | Generates AI scouting report, persists attestation, returns report + settlement tx |
| `POST /api/x402/verify-match` | 0.10 USDC | Verifies match data against database, returns signed attestation hash |

Both endpoints:
- Return `402` with `PaymentRequirements` when no payment header is present
- Accept `X-PAYMENT` or `PAYMENT-SIGNATURE` headers (v1/v2 compatible)
- Settle via the Pieverse facilitator on Kite chain by default
- Fall back to simulation mode when `KITE_X402_SIMULATE=true`

> **Note:** The match verification flow currently writes attestations directly to the database rather than routing through the x402 endpoint. See [`GOAT_STRATEGY.md`](./GOAT_STRATEGY.md) for the deferred work item to make this the canonical path.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16, Tailwind CSS, shadcn/ui |
| **State** | TanStack Query, React Context |
| **API** | tRPC (type-safe RPC) |
| **Database** | PostgreSQL 15, Prisma 7 |
| **Auth** | Multi-chain wallet signatures |
| **Blockchain** | Attestation infrastructure (Kite, GOAT Network) via TwinService |

---

**See Also:** [FORMATIONS.md](./FORMATIONS.md) (viral loop & playground) | [ONBOARDING.md](./ONBOARDING.md) (persona-first flow) | [GOAT_STRATEGY.md](./GOAT_STRATEGY.md) (deferred x402 work) | [BUILD.md](./BUILD.md) (deployment & ops)
