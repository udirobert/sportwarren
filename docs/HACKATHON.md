# Kite AI Hackathon · SportWarren

SportWarren is a first-class participant in the **Kite Agentic Economy**, utilizing purposeful agent infrastructure to bridge real-world football performance with verifiable on-chain identity and autonomous commerce.

---

## ⚡ Prize Track: Agentic Behavior (x402)

SportWarren implements three Kite flows:

1. **Internal squad autonomy (WhatsApp / cron):** Scout reports via `createPlatformSettlement()` — EIP-3009 sign + Pieverse facilitator (`exact` / `eip155:2368` / v2). Real KiteScan tx when the facilitator accepts; otherwise an honest off-chain `internal-scout-*` receipt.
2. **Judge on-chain proof (WhatsApp `kite-proof`):** Kite Passport (`kpass`) pays a **Kite-listed** x402 merchant — default **[Weather · hugen](https://weather.hugen.tokyo/weather/current?city=London)** (~$0.01 USDC on Base). Listed in Passport discovery (`ksearch services list`); **never** rely on `x402.dev.gokite.ai` in production (often fails DNS on servers).
3. **External agent commerce:** `POST /api/x402/scout` — paid service for external agents; same Pieverse settlement on inbound `X-Payment`.

### The Narrative
Every squad in SportWarren is managed by an autonomous **Squad Manager Twin**—a Kite Passport-backed agent that operates on the squad's behalf. It is authorized to spend a USDC budget to procure services from other agents in the marketplace.

### 1. WhatsApp Scouting (Internal Autonomy)
When a linked WhatsApp user runs `scout Liverpool`:

1. **Intent:** Marcus resolves the message and checks linked identity + autonomy policy.
2. **Budget guards:** Per-user and per-squad daily scout limits.
3. **Settlement:** Platform wallet signs EIP-3009 and submits to `https://facilitator.pieverse.io/v2/settle`.
4. **Scout service:** Shared scout-report service persists a `scout_report` attestation.
5. **Receipt:** KiteScan link when `txHash` is on-chain; otherwise `internal-scout-*` with clear labeling.

`kpass agent:session execute` is **not** used for our own API host (`payment_target_forbidden` by design).

### 2. Judge On-Chain Proof (`kite-proof`)
Text **`kite-proof`** to WhatsApp **+1 (201) 534-5384** (or run `pnpm exec tsx scripts/kite-onchain-proof.ts` on the server):

1. Active Kite Passport session on the server (`kpass`).
2. Pays a discovery-listed Weather API (**Base** USDC, not only Kite testnet).
3. Returns JSON weather + facilitator proof (explorer link depends on chain — Base vs Kite).

**Fund Passport:** add enough **Base** USDC for the demo (~$0.05) via the Passport dashboard; `x402.dev.gokite.ai` is not used — it commonly returns `ENOTFOUND` in production DNS.

### 3. External x402 Scout Endpoint
`POST https://api.sportwarren.com/api/x402/scout`:

1. **Challenge:** `402 Payment Required` with `exact` / `eip155:2368` requirements.
2. **Payment:** External agent submits `X-Payment` / `PAYMENT-SIGNATURE`.
3. **Facilitator:** Route settles via Pieverse before generating work.

### 4. Economic Hardening (Spending Guards)
Dual spending caps at every entry point (`KITE_SCOUT_MAX_USDC`, `KITE_SCOUT_MAX_USDC_SQUAD`, `KITE_DAILY_PAYOUT_BUDGET_USDC`). Use `budget` on WhatsApp to inspect limits.

### 5. Proactive Autonomy (Cron)
`/api/cron/auto-scout` commissions opponent scouts 22–26h before kickoff without human commands.

---

## Kite Passport (Production Server)

Configured on Hetzner (`snel-bot`) at `/home/deploy/.kpass/bin/kpass`; config symlinked from `/opt/sportwarren-api/shared/.kite-passport`.

| Item | Value |
|------|--------|
| Account | `papaandthejimjams@gmail.com` |
| Agent ID | `agent_019e42a0-7033-74a4-8f9e-346cacbc505d` (`squad_manager`) |
| Session ID | `agent_session_019e42a1-b809-7aee-a4fc-8335653c7796` |
| Session budget | Approve with **≥ 0.02 USDC per tx** (Weather charges ~$0.01 on Base) and fund **Base** USDC in the Passport wallet. |

**Production x402 env (required):**

```bash
KITE_X402_VERSION=2
KITE_X402_SCHEME=exact
KITE_X402_NETWORK=eip155:2368
KITE_X402_SIMULATE=false   # must NOT be true in production
KITE_DEMO_SERVICE_URL=https://weather.hugen.tokyo/weather/current?city=London
KITE_DEMO_MAX_USDC=0.02
```

Do **not** point `KITE_SCOUT_SERVICE_URL` at `api.sportwarren.com` for kpass — use internal settlement or a catalog merchant.

---

## Lessons Learned

- **Facilitator ≠ Passport advertisement.** Pieverse registers `exact` / `eip155:2368` / v2. Passport catalog services may still return `gokite-aa`; map at settlement time.
- **Passport host allowlisting.** `kpass agent:session execute` only pays discovered merchants — not your own API.
- **Honest receipts.** KiteScan links only when a real `txHash` exists.
- **Build locally, deploy lightweight.** `pnpm run deploy:runtime:build` → `scripts/deploy-hetzner.sh`.

---

## 🛠️ Verification for Judges

### Live Demo (WhatsApp)
Text **+1 (201) 534-5384**:

| Command | What it proves |
|---------|----------------|
| `kite-proof` | Passport → Kite-listed x402 service → on-chain payment |
| `scout Liverpool` | Internal scout + facilitator settlement attempt |
| `trigger-auto-scout` | Autonomous pre-match scout demo |
| `attestations` | Recent receipts + KiteScan links |
| `budget` | Daily spend caps |

### On-Chain Proofs
- **Network:** Kite Testnet (Chain ID 2368)
- **Explorer:** [testnet.kitescan.ai](https://testnet.kitescan.ai)
- **Asset:** USDC `0x0fF5393387ad2f9f691FD6Fd28e07E3969e27e63`
- **Facilitator:** `0x12343e649e6b2b2b77649DFAb88f103c02F3C78b` @ [facilitator.pieverse.io](https://facilitator.pieverse.io)

### CLI (on server)
```bash
kpass status --output json
pnpm exec tsx scripts/kite-onchain-proof.ts
pnpm run kite:x402:preflight
```

---

## 🏗️ Technical Blueprint
See **[ARCHITECT.md](./ARCHITECT.md)** for multi-chain strategy.
