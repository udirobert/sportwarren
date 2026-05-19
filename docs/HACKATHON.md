# Kite AI Hackathon · SportWarren

SportWarren is a first-class participant in the **Kite Agentic Economy**, utilizing purposeful agent infrastructure to bridge real-world football performance with verifiable on-chain identity and autonomous commerce.

---

## ⚡ Prize Track: Agentic Behavior (x402)

SportWarren implements two related Kite flows:

1. **Internal squad autonomy:** WhatsApp and cron commands generate scout reports through SportWarren's shared scout service, enforce budget limits, and record Kite-labeled SportWarren attestation receipts.
2. **External agent commerce:** `/api/x402/scout` remains a paid service endpoint that returns `402 Payment Required` and accepts x402 payment payloads for external agents and allowlisted merchant flows.

### The Narrative
Every squad in SportWarren is managed by an autonomous **Squad Manager Twin**—a Kite Passport-backed agent that operates on the squad's behalf. It is authorized to spend a USDC budget to procure services from other agents in the marketplace.

### 1. WhatsApp Scouting (Internal Autonomy)
When a linked WhatsApp user runs `scout Liverpool`, the following flow occurs:

1. **Intent:** Marcus resolves the message to the `scout` command and checks the user's linked SportWarren identity.
2. **Autonomy policy:** The squad's autonomy level decides whether scouting is allowed or needs confirmation.
3. **Budget guards:** Per-user and per-squad daily scout limits are enforced before work is produced.
4. **Scout service:** The shared scout-report service generates the report, enriches it with stored match context when available, and persists a `scout_report` attestation.
5. **Receipt:** WhatsApp returns a compact SportWarren receipt id such as `internal-scout-...`. This is an application attestation receipt, not a KiteScan transaction hash.

This path is intentionally not routed through Kite Passport payment execution because Passport rejects non-discovered merchant hosts. Paying our own API host from our own backend created a confusing loop and failed with `payment_target_forbidden`.

### 2. External x402 Scout Endpoint
The public paid service is still available at `/api/x402/scout`:

1. **Challenge:** A request without payment receives `402 Payment Required`.
2. **Payment payload:** A supported external agent submits `X-Payment` or `PAYMENT-SIGNATURE`.
3. **Facilitator:** The route settles the payload through the configured Kite facilitator.
4. **Work:** Only after settlement does the scout-report service generate and persist the report.

This is the correct surface for x402 interoperability. The WhatsApp product path uses internal receipts for UX reliability; external agents use the paid x402 route.

### 3. Economic Hardening (Spending Guards)
The scout economy enforces a **dual spending cap** at every entry point:

1. **Per-user daily limit** (`KITE_SCOUT_MAX_USDC`, default 0.50 USDC/player/day) — prevents a single player from draining budget. Development users can be raised via `KITE_SCOUT_DEV_USER_IDS` and `KITE_SCOUT_DEV_MAX_USDC`.
2. **Per-squad daily limit** (`KITE_SCOUT_MAX_USDC_SQUAD`, default 2.50 USDC/squad/day) — 5 players on the same squad share one pool. Both guards are checked in the WhatsApp agent **and** the direct `/api/x402/scout` route — no bypass path.
3. **Platform payout budget** (`KITE_DAILY_PAYOUT_BUDGET_USDC`, default 200 USDC/day) — caps total agent-initiated payouts.

Use the `budget` WhatsApp command to see your current consumption and remaining allowance.

### 4. Proactive Autonomy (The Cron Loop)
This is our proof of **"minimal human involvement."** A cron job (`/api/cron/auto-scout`) runs every 6 hours:
1. **Discovery:** Finds matches scheduled **22–26 hours** from now.
2. **Autonomous Action:** The squad manager agent commissions a scouting report on the opponent — **no human command required**.
3. **Cohesive Delivery:** The report is pushed to both WhatsApp and Telegram groups simultaneously with receipt references.

---

## Lessons Learned

- **Passport host allowlisting matters.** `kpass agent:session execute` is for supported merchant hosts discovered by Kite Passport. It should not be used to pay the same backend that is invoking it.
- **x402 scheme details are version-sensitive.** Kite Passport currently expects `x402Version=1`, `scheme=gokite-aa`, and `network=kite-testnet` for the supported Passport path.
- **Receipts need honest labels.** A SportWarren attestation id is useful in WhatsApp, but it should not be presented as a KiteScan transaction. Real chain transactions should link to KiteScan only when a tx hash exists.
- **Production schema drift shows up as product failures.** Selecting `squad: true` caused Prisma to request an unmigrated `squads.logo` column. Scout code now selects only the fields it needs.
- **Build locally, deploy lightweight.** Hetzner receives a standalone artifact and PM2 restart; Kite Passport config lives in `/opt/sportwarren-api/shared/.kite-passport`, not in git or the artifact.

---

## 🛠️ Verification for Judges

### Live Demo (WhatsApp)
Text any of these commands to **+1 (201) 534-5384**:
- `scout Liverpool` — Triggers an autonomous AI scouting report and SportWarren attestation receipt.
- `trigger-auto-scout` — **Demo:** Forces the autonomous 24h pre-match scout to fire now.
- `attestations` — View recent agent actions, receipt ids, and KiteScan links when a transaction hash exists.
- `budget` — See your daily agent spending limit and current consumption.

### On-Chain Proofs
- **Network:** Kite Testnet (Chain ID 2368)
- **Explorer:** [testnet.kitescan.ai](https://testnet.kitescan.ai)
- **Asset:** USDC (`0x0fF5393387ad2f9f691FD6Fd28e07E3969e27e63`)
- **Passport CLI:** Used for allowlisted external x402 execution via `kpass agent:session execute`.

---

## 🏗️ Technical Blueprint
For a deep dive into our multi-chain strategy (Algorand, Avalanche, Kite, TON, Yellow, Lens), see **[ARCHITECT.md](./ARCHITECT.md)**.
