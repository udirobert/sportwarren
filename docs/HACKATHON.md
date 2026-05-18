# Kite AI Hackathon · SportWarren

SportWarren is a first-class participant in the **Kite Agentic Economy**, utilizing purposeful agent infrastructure to bridge real-world football performance with verifiable on-chain identity and autonomous commerce.

---

## ⚡ Prize Track: Agentic Behavior (x402)

We implement the full **x402 protocol** loop for autonomous agent-to-agent payments.

### The Narrative
Every squad in SportWarren is managed by an autonomous **Squad Manager Twin**—a Kite Passport-backed agent that operates on the squad's behalf. It is authorized to spend a USDC budget to procure services from other agents in the marketplace.

### 1. Autonomous Scouting (x402 Loop)
When a user requests a scouting report, the following flow occurs:
1. **Challenge:** The Scout Agent (`/api/x402/scout`) returns a **402 Payment Required** status.
2. **Settlement:** The Squad Manager Agent signs a `transferWithAuthorization` and re-issues the request with an `X-Payment` header.
3. **Facilitator:** The Scout Agent settles the payment via the **Pieverse Facilitator** on the Kite Chain.
4. **Attestation:** Both agents record a signed **Attestation** on the Kite Chain.

### 3. **Economic Hardening** (Spending Guards)
The scout economy enforces a **dual spending cap** at every entry point:

1. **Per-user daily limit** (`KITE_SCOUT_MAX_USDC`, default 0.50 USDC/player/day) — prevents a single player from draining budget.
2. **Per-squad daily limit** (`KITE_SCOUT_MAX_USDC_SQUAD`, default 2.50 USDC/squad/day) — 5 players on the same squad share one pool. Both guards are checked in the WhatsApp agent **and** the direct `/api/x402/scout` route — no bypass path.
3. **Platform payout budget** (`KITE_DAILY_PAYOUT_BUDGET_USDC`, default 200 USDC/day) — caps total agent-initiated payouts.

Use the `budget` WhatsApp command to see your current consumption and remaining allowance.

### 2. **Proactive Autonomy** (The Cron Loop)
This is our proof of **"minimal human involvement."** A cron job (`/api/cron/auto-scout`) runs every 6 hours:
1. **Discovery:** Finds matches scheduled **22–26 hours** from now.
2. **Autonomous Action:** The squad manager agent commissions a paid x402 scouting report on the opponent — **no human command required**.
3. **Cohesive Delivery:** The report is pushed to both WhatsApp and Telegram groups simultaneously with on-chain receipts.

---

## 🛠️ Verification for Judges

### Live Demo (WhatsApp)
Text any of these commands to **+1 (201) 534-5384**:
- `scout Liverpool` — Triggers a paid x402 AI scouting report.
- `trigger-auto-scout` — **Demo:** Forces the autonomous 24h pre-match scout to fire now.
- `attestations` — View your recent on-chain agent actions and KiteScan links.
- `budget` — See your daily agent spending limit and current consumption.

### On-Chain Proofs
- **Network:** Kite Testnet (Chain ID 2368)
- **Explorer:** [testnet.kitescan.ai](https://testnet.kitescan.ai)
- **Asset:** USDC (`0x0fF5393387ad2f9f691FD6Fd28e07E3969e27e63`)

---

## 🏗️ Technical Blueprint
For a deep dive into our multi-chain strategy (Algorand, Avalanche, Kite, TON, Yellow, Lens), see **[ARCHITECT.md](./ARCHITECT.md)**.
