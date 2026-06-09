# SportWarren Architect

**Technical Blueprint — Championship Manager for real-world football**

SportWarren gamifies grassroots football by giving every match the depth of a management sim: pre-match previews, live commentary, post-match peer ratings, and persistent player progression. This doc covers how the platform works under the hood — the match lifecycle, the peer consensus engine, and the multi-chain infrastructure that powers autonomous squad agents.

---

## 🏗️ The Match Lifecycle

Every match in SportWarren follows a consistent pipeline:

```
Match Scheduled → Pre-Match Preview → Live Match → Post-Match Ratings → Attribute Progression
```

| Phase | What Happens | User Surface |
|-------|-------------|--------------|
| **Pre-Match** | AI generates win probabilities, tactical breakdowns, and head-to-head comparisons. Autonomous squad agent may procure external intelligence on opponents. | WhatsApp + Telegram preview card |
| **Live Match** | Real-time commentary delivered to squad WhatsApp groups. Match events (goals, cards, subs) logged through chat commands or Telegram Mini App. | WhatsApp group chat |
| **Post-Match** | Teammates rate each other's FIFA-style attributes. Consensus logic deduplicates and weights ratings. Result verified through Algorand attestation. | WhatsApp prompts + Telegram dashboard |
| **Progression** | Player attributes evolve based on peer consensus and match history. XP earned for accurate ratings. Squad stats aggregate into season-long narratives. | PlayerIdentityCard (skin + twin, one component) |

---

## 🎯 Peer Consensus Engine

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
- **Platinum:** Verified by the **Chainlink CRE** (Consensus, Reputation, and Environment) workflow (60% Location + 40% Weather).

---

## ⚡ Kite AI: Autonomous Squad Agents

Every squad in SportWarren gets an autonomous AI agent — a **Squad Manager** with its own Kite Passport identity, spending budget, and decision-making capability. Agents operate in the background so players never touch a wallet or a DEX.

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

---

## 🏗️ Multi-Chain Architecture

SportWarren assigns each network a strict, non-interchangeable role based on its technical strengths:

| Network | Product Responsibility | Why It Exists |
|---------|------------------------|---------------|
| **Kite AI** | Agent identity, x402 commerce, attestations | Purpose-built for autonomous agent economy and spending sessions. |
| **Algorand** | Match verification, reputation state | Fast, low-cost verification and durable football records. |
| **GOAT Network** | Squad governance, treasury, digital assets | Bitcoin-secured via BitVM2. Native x402 micropayments and ERC-8004 agent identity. |
| **TON** | Telegram-native wallet UX, rewards | Native fit for Telegram distribution and user treasury actions. |
| **Yellow** | Instant operational settlement | Operational liquidity without forcing every action into a slow on-chain path. |
| **Lens** | Social identity and distribution | Portable social graph for player and squad visibility. |

---

## 🟦 Algorand: Match State & Verification

Algorand stores verified match results and player reputation as durable on-chain records. The **MatchVerification** engine handles the transition from self-reported results to cryptographically confirmed outcomes, while the Peer Consensus Engine (described above) writes attribute updates as attestations.

---

## 🐐 GOAT Network: Governance & Assets

GOAT Network (Bitcoin L2) serves as the settlement layer for squad governance and high-value digital assets, secured via BitVM2.

### Key Contracts
- **SquadToken (ERC20 Votes):** Native governance token for squad DAO voting.
- **SquadGovernor:** Main governance logic (proposals, voting, execution).
- **AchievementNFT (ERC721):** Verifiable credentials for match milestones.
- **AgentEscrow:** Secure payment holding for agent marketplace integrations.
- **GoatReputation (ERC-8004):** On-chain agent identity and reputation registry.

### Why GOAT over Avalanche
- **Bitcoin-native security** via BitVM2 — athlete career data inherits Bitcoin's longevity.
- **Native x402 micropayments** and ERC-8004 agent identity for autonomous commerce.
- **Sustainable BTC yield** from sequencer fees for squad treasuries.

---

## 🎮 Formation Playground & Counter-Play Loop

The Formation Playground is the primary user acquisition surface — an interactive pitch editor that doubles as a viral growth engine.

### Architecture
- **FormationPlayground** — Client component with 4 flow states: `build`, `challenge_received`, `counter_setup`, `result`
- **PitchCanvas** — DOM-based pitch renderer with framer-motion animations (tactics mode)
- **MatchEnginePreview** — Tick-based match simulation with physics, passing, GK saves (simulation mode)
- **ExportPanel** — PNG export (html-to-image), Web Share API, WebM video recording (MediaRecorder)

### Counter-Play Viral Loop
```
User A builds formation → shares challenge URL (vs_f, vs_s, vs_c, vs_n params)
    ↓
User B opens URL → sees ChallengeOverlay ("Countering your 4-3-3")
    ↓
User B clicks "Counter with 4-5-1" → simulation runs
    ↓
MatchResultCard renders (score, goals, possession, Rematch/Share/Challenge Back)
    ↓
User B clicks "Challenge Back" → new URL copied → loop restarts
```

### Tactical Counter Engine
`suggestCounterFormation()` maps each formation to a tactically sound counter (e.g., 4-3-3 → 4-5-1, compact mid blocks width). Auto-suggested when a challenge is received.

### Social Previews
`/api/og/formation` generates 1200x630 OG images with pitch visualization and player dots for social sharing previews.

---

## 🌊 Viral Squad Formation Sharing

The viral recruitment loop transforms formation building into a shareable artifact that drives organic user acquisition. One user's squad setup drives N new signups through personalized claim links.

### The Viral Loop
```
User uploads team photos in formation → exports PNG with claim link → shares via WhatsApp
    ↓
Teammates see formation image with their photos → click claim link
    ↓
Teammates claim positions and signup → upload their own avatar → cycle repeats
```

### Architecture

**Phase 1: Avatar Upload Infrastructure**
- `useAvatarUpload` hook — File validation (JPEG/PNG/WebP, 5MB max), preview generation, base64 encoding
- `PendingPersonaContext` — Stores avatar base64 + mime type in localStorage (24h TTL)
- `PlayerCardPreview` — Camera icon UI on landing card, avatar preview replaces initials
- Onboarding flow — Reconstructs avatar data URL from persona context, uploads via `updateProfile` mutation

**Phase 2: Formation Playground Avatar Integration**
- Avatar upload buttons next to each player name input (when personalization unlocked)
- Avatars stored in `usePitchPersonalization` hook, persisted per-formation in localStorage
- `PitchCanvas` already wired to display avatars from `personalization.avatars` array
- Avatars included in PNG exports via html-to-image

**Phase 3: Shareable Formation Image Generation**
- `ExportPanel` enhanced to create tactical share with claim link via `/api/tactics/share`
- Share text includes claim URL: "Tonight's 5v5 4-3-3 setup. Claim your spot: [url]"
- PNG export includes avatars, formation layout, player names
- Web Share API (mobile) or clipboard fallback (desktop)

**Phase 4: Enhanced Claim Flow**
- Teammates click claim link → `/play/[slug]` page shows formation with claimed positions
- `ClaimablePitch` component — Enter name, claim position, creates `ShareClaimRecord`
- `PendingClaimContext` — Bridges anonymous claim to authenticated profile (stores slug, position, token)
- Onboarding auto-prefills from claim context, avatar upload available during personalization

### Data Flow
```
FormationPlayground (avatars + names)
    ↓
POST /api/tactics/share → creates TacticalPlanShare with slug
    ↓
ExportPanel exports PNG + includes claim URL in share text
    ↓
User shares via WhatsApp → teammate clicks link
    ↓
/play/[slug] → ClaimablePitch → teammate claims position
    ↓
OnboardingFlow consumes PendingClaimContext → profile created with claimed role
```

### Viral Conversion Tracking
Key analytics events to measure loop effectiveness:
- `formation_shared` — User creates tactical share
- `claim_link_clicked` — Teammate opens claim page
- `claim_position_completed` — Teammate claims a position
- `signup_from_share` — Teammate completes signup from claim flow

### Storage & Persistence
- **PendingPersonaContext** — localStorage, 24h TTL, includes avatar base64
- **PendingClaimContext** — localStorage, base64-encoded JSON, includes share slug + claim token
- **TacticalPlanShare** — PostgreSQL, fingerprint-based deduplication, tracks view/copy counts
- **ShareClaimRecord** — PostgreSQL, one claim per position per share, prevents double-claims

---

## 🚀 Development Roadmap

| Phase | Milestone | Status |
|-------|-----------|--------|
| **Phase 1** | **Core Loop:** Match logging, Algorand verification, XP system. | ✅ 100% |
| **Phase 2** | **Agents & Economy:** Kite AI x402, Staff Office, Squad DAOs. | ✅ 100% |
| **Phase 3** | **Viral Features:** Formation playground, counter-play loop, Lens Social, Derby tracking. | ✅ 100% |
| **Phase 3b** | **WhatsApp Engagement:** Auto-link, RSVP reply, scout lists, rating reminders DM, rate-token auth, player cards. | ✅ 100% |
| **Phase 3c** | **Viral Squad Formation Sharing:** Avatar upload infrastructure, formation playground avatar integration, shareable formation image generation, enhanced claim flow with avatar selection. | ✅ 100% (2026-06-09) |
| **Phase 4** | **Immersive Evolution:** Unified player identity (avatar = skin, twin = brain), moment renders, 3D broadcast tier. | 🟡 PR 1+2 done (schema, appliers, TwinService orchestrator, notify, moments, image, storage adapter); PR 3-7 pending |

### Immediate Next Steps (Post-Deploy)

**This Week:**
1. **Deploy to production** — Push viral loop to Hetzner, verify health check passes
2. **End-to-end testing** — Create formation → upload avatars → share via WhatsApp → claim position → complete signup
3. **Add viral conversion analytics** — Track `formation_shared`, `claim_link_clicked`, `claim_position_completed`, `signup_from_share`
4. **Monitor production** — Watch for errors, performance issues, user drop-off points

**Next 2 Weeks:**
1. **A/B test share copy** — Test different messages: "Claim your spot" vs "Join the squad" vs personalized "John needs you at striker"
2. **Mobile UX polish** — Optimize share sheet and avatar upload for iOS/Android
3. **Gather user feedback** — Survey early users on the sharing experience

**Next Month:**
1. **Phase 5: Fluid Squad Composition Insights** — Analytics showing "When X plays with Y, win rate +15%" or "Your best formation is 4-3-3 with these players"
2. **Performance optimization** — Lazy load avatar uploads, better image compression, CDN for shared images
3. **Gamification** — Badges for "Squad Builder" (shared 5 formations), "Recruiter" (10 signups from your shares)

### Strategic Questions to Answer
- Are users actually sharing formations? (Check analytics after 1 week)
- What's the conversion rate from share → claim → signup?
- Which positions get claimed fastest? (Striker? GK?)
- Do squads with avatars get more shares?

### On-Chain Deployment Status
- **Algorand contracts** — ✅ Functional (MatchVerification, ReputationSystem, SquadDAO, GlobalChallenges)
- **GOAT Network** — 🟡 Architecture ready, deployment stub exists, awaiting SquadToken/AgentEscrow implementation
- **Priority** — Focus on core user loop validation before expanding on-chain features

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16, Tailwind CSS, shadcn/ui |
| **State** | TanStack Query, React Context |
| **API** | tRPC (type-safe RPC) |
| **Database** | PostgreSQL 15, Prisma 7 |
| **Auth** | Multi-chain wallet signatures |
| **Blockchains** | Kite (Lead), Algorand, GOAT Network, TON, Yellow, Lens |
