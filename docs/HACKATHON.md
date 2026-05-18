# Kite AI Hackathon · SportWarren

SportWarren is a first-class participant in the **Kite Agentic Economy**, utilizing purposeful agent infrastructure to bridge real-world football performance with verifiable on-chain identity and autonomous commerce.

## ⚡ Prize Track: Agentic Commerce (x402)

We implement the full **x402 protocol** loop for autonomous agent-to-agent payments.

### The Agent Narrative
Every squad in SportWarren is managed by an autonomous **Squad Manager Twin**—a Kite Passport-backed agent that operates on the squad's behalf. This agent is authorized to spend a USDC budget (defined by the squad) to procure services from other agents in the marketplace.

### 1. Autonomous Scouting (x402 Loop)
When a user requests a scouting report via WhatsApp, the following flow occurs:
1. **Request:** `whatsapp-agent.ts` parses the intent and calls `kiteAIService.executePaidRequest`.
2. **Challenge:** The Scout Agent endpoint (`/api/x402/scout`) returns a **402 Payment Required** status with the x402 requirements (0.50 USDC on Kite Testnet).
3. **Settlement:** The Squad Manager Agent signs a `transferWithAuthorization` (EIP-3009) and re-issues the request with an `X-Payment` header.
4. **Facilitator:** The Scout Agent settles the payment via the **Pieverse Facilitator** on the Kite Chain.
5. **Attestation:** Both agents record the transaction as a signed **Attestation** on the Kite Chain.

### 1b. Autonomous Pre-Match Scouting (Cron Loop)
This is the **"minimal human involvement"** proof. A cron job (`/api/cron/auto-scout`) runs every 6 hours and:

1. **Discovery:** Finds upcoming matches scheduled **22–26 hours** from now.
2. **Autonomous Action:** For each squad, the squad's manager agent automatically commissions a paid x402 scouting report on the opponent — **no human command required**.
3. **Proactive Delivery:** The scout report is pushed directly to all WhatsApp-linked squad members with the tx hash and KiteScan link.
4. **Idempotency:** Each match is only auto-scouted once (tracked via `match.agentInsights.auto_scout_complete`).

This transforms the agent from reactive ("user asks → agent pays") to **proactive** ("agent anticipates need → agent scouts → agent delivers").

### 2. Reputation-Aware Delegation
Hiring an agent (e.g., a specialist coach) is gated by a **reputation threshold**. Our `hireAgent` service only authorizes spending sessions for agents with a Kite Reputation ≥ 400/1000. This demonstrates a "trust but verify" model for autonomous spending.

---

## 🛰️ Key Primitives Used

| Primitive | Implementation in SportWarren |
|-----------|-------------------------------|
| **Kite Agent Passport** | Every `PlayerTwin` and `SquadManager` has a unique Passport ID on Kite Testnet. |
| **x402 Protocol** | Native USDC settlements for scout reports and match verification services. |
| **Spending Sessions** | Backend enforcement of per-tx and total budgets for autonomous agents. |
| **Proof of Liveness** | Real-time "Ping" checks integrated into the Player Profile UI to verify agent activity. |
| **Attestations** | Cryptographically signed records of all agent actions, match results, and reputation movements. |

---

## 🛠️ Verification for Judges

### Live Demo (WhatsApp)
Text `scout Liverpool` to **+1 (201) 534-5384**.
You will receive a tactical brief enriched with your squad's real match data (if available), a link to the **KiteScan** explorer showing the on-chain settlement, and your remaining daily scout budget.

Additional self-serve commands for judges:
- `scouts` — browse your last 5 scouting reports with dates and explorer links
- `budget` — view daily scout budget with a visual progress bar and spend breakdown
- `status` — squad agent analytics (interactions, success rate, total spend)

### On-Chain Proofs
- **Network:** Kite Testnet (Chain ID 2368)
- **Explorer:** [testnet.kitescan.ai](https://testnet.kitescan.ai)
- **Asset:** USDC (`0x0fF5393387ad2f9f691FD6Fd28e07E3969e27e63`)
- **Facilitator:** Pieverse (`0x12343e649e6b2b2b77649DFAb88f103c02F3C78b`)

### Code Highlights
- `src/server/services/blockchain/x402-client.ts`: Canonical x402 client implementation.
- `src/app/api/x402/scout/route.ts`: A service-provider agent endpoint that charges USDC for AI inference.
- `src/server/services/ai/kite.ts`: The bridge between local squad logic and the Kite Agentic Economy.
