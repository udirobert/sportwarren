# SportWarren Architect

**Technical Blueprint for a Phygital Football Platform**

SportWarren coordinates a role-specific multi-chain stack to bridge real-world football performance with verifiable on-chain identity and autonomous commerce.

---

## 🏗️ System Architecture

### Multi-Chain Responsibility Model
SportWarren assigns each network a strict, non-interchangeable role based on its technical strengths:

| Network | Product Responsibility | Why It Exists |
|---------|------------------------|---------------|
| **Kite AI** | Agent identity, x402 commerce, attestations | Purpose-built for autonomous agent economy and spending sessions. |
| **Algorand** | Match verification, reputation state | Fast, low-cost verification and durable football records. |
| **Avalanche** | Squad governance, treasury, digital assets | Strong EVM tooling for programmable squad coordination and escrow. |
| **TON** | Telegram-native wallet UX, rewards | Native fit for Telegram distribution and user treasury actions. |
| **Yellow** | Instant operational settlement | Operational liquidity without forcing every action into a slow on-chain path. |
| **Lens** | Social identity and distribution | Portable social graph for player and squad visibility. |

---

## ⚡ Kite AI: The Agentic Economy

SportWarren is a first-class participant in the Kite Agentic Economy. Every **Squad Manager** and **Player Twin** is an autonomous agent with a unique Kite Passport ID.

### x402 Protocol Implementation
We use the **x402 (Payment Required)** protocol for autonomous agent-to-agent commerce.

- **Autonomous Spending:** Squad manager agents are authorized via `KiteSession` budgets to procure external services.
- **Settlement:** External paid services use Kite Passport/x402 execution and facilitator settlement on Kite Testnet when the merchant host is supported by Passport discovery.
- **Attestations:** Every action (match result, scout report, wage payment) is recorded as a cryptographically signed attestation with a valid schema type (`player` | `squad` | `match` | `agent`).
- **Internal Scout Path:** WhatsApp and cron scout commands call the shared `createScoutReport` service directly, enforce budgets, and persist a SportWarren attestation receipt. The public `/api/x402/scout` route remains the external paid x402 surface.

### Receipt Model
SportWarren distinguishes two receipt types:

1. **SportWarren attestation receipts** — compact ids such as `internal-scout-...`, used for internal autonomous actions where no external payment transaction is created.
2. **Kite transaction receipts** — real tx hashes from direct Kite transfers or supported x402 settlements, safe to link to KiteScan.

The product should not label internal attestation ids as KiteScan transactions.

### Economic Guards
The x402 scout economy enforces a **dual spending cap** to prevent abuse:

1. **Per-user daily limit** — `KITE_SCOUT_MAX_USDC` (default 0.50 USDC/player/day). Every `/api/x402/scout` call enforces this via Redis-backed counters.
2. **Per-squad daily limit** — `KITE_SCOUT_MAX_USDC_SQUAD` (default 2.50 USDC/squad/day). Shared across all squad members — 5 players on the same squad share one pool.
3. **Platform payout budget** — `KITE_DAILY_PAYOUT_BUDGET_USDC` (default 200 USDC/day). Cap on total agent-initiated payouts.

The user and squad guards are checked in the WhatsApp agent scout handler and the direct `/api/x402/scout` route, so no scout path bypasses the budget model.

---

## 🟦 Algorand: Match Consensus & Peer Ratings

The **MatchVerification** engine handles the transition from "reported" to "verified" results, while **Peer Ratings** capture what the stat sheet misses.

### 1. Match Verification Tiers
- **Bronze:** Self-reported.
- **Silver:** Both captains confirm.
- **Gold:** Both confirm + media evidence.
- **Platinum:** Verified by the **Chainlink CRE** (Consensus, Reputation, and Environment) workflow (60% Location + 40% Weather).

### 2. Peer Attribute Ratings (Crowdsourced XP)
After every match, players rate teammates' attributes (Pace, Shooting, etc.).
- **Consensus Logic:** Uses **Median** scores to prevent outliers/trolling.
- **Scout Reputation:** Raters earn "Scout XP" when their ratings align with the squad consensus.
- **Influence Weighting:** "Elite Scouts" have higher vote weight; "Rookies" or outliers have their weight dampened.

---

## 🔺 Avalanche: Governance & Assets

Avalanche Fuji serves as the settlement layer for squad governance and high-value digital assets.

### Key Contracts
- **SquadToken (ERC20 Votes):** Native governance token for squad DAO voting.
- **SquadGovernor:** Main governance logic (proposals, voting, execution).
- **AchievementNFT (ERC721):** Verifiable credentials for match milestones.
- **AgentEscrow:** Secure payment holding for agent marketplace integrations.

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
| **Blockchains** | Kite (Lead), Algorand, Avalanche, TON, Yellow, Lens |
