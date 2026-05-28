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
| **Progression** | Player attributes evolve based on peer consensus and match history. XP earned for accurate ratings. Squad stats aggregate into season-long narratives. | Squad profile + player cards |

---

## 🎯 Peer Consensus Engine

The core gamification loop: after every match, players rate teammates on Pace, Shooting, Passing, Defending, and Physicality.

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

## 🚀 Development Roadmap

| Phase | Milestone | Status |
|-------|-----------|--------|
| **Phase 1** | **Core Loop:** Match logging, Algorand verification, XP system. | ✅ 100% |
| **Phase 2** | **Agents & Economy:** Kite AI x402, Staff Office, Squad DAOs. | ✅ 100% |
| **Phase 3** | **Viral Features:** Territory control, Lens Social, Derby tracking. | ✅ 90% |
| **Phase 4** | **Immersive Evolution:** 3D Broadcast Engine, "Digital Twin" sim. | 🚀 Future |

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
