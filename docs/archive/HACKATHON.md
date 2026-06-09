# Kite AI Hackathon · SportWarren

> **Track 1: Agentic Commerce** — Autonomous AI agents that discover services, execute USDC payments via x402, and operate with programmable constraints.

---

## What SportWarren Does

SportWarren is an **autonomous squad management platform** for amateur football teams. Every squad gets a **Squad Manager Twin** — a Kite Passport-backed AI agent that independently scouts opponents, procures tactical intelligence from the Kite x402 marketplace, and manages spending within user-delegated budgets.

Players interact entirely through **WhatsApp** — no app downloads, no wallets to manage, no crypto knowledge required. The agent handles discovery, payment, and settlement autonomously.

---

## Judging Criteria Mapping

| Criterion | How SportWarren Delivers |
|-----------|--------------------------|
| **Agent Autonomy** | Cron-based pre-match scouting (22h before kickoff), zero human trigger. WhatsApp commands for on-demand scouts. Agent holds its own Kite Passport spending session. |
| **Real-World Applicability** | Live production system on Hetzner. Real WhatsApp number anyone can text. Solves actual problem: amateur teams can't afford scouts. |
| **Developer Experience** | Text a WhatsApp number → get results. No setup, no wallet, no CLI. Docs + CLI tools for power users. |
| **Novelty/Creativity** | WhatsApp as agentic UX (2B+ users, zero onboarding friction). Football scouting via paid AI marketplace. Budget delegation via Kite Passport sessions. |

---

## Three Kite Integration Paths

### 1. Agent Pays Marketplace (kite-proof) — LIVE ON-CHAIN

The Squad Manager agent autonomously discovers and pays x402 services from the Kite catalog using Kite Passport.

**Flow:** Agent → `kpass agent:session execute` → Kite-listed merchant → USDC settlement → verifiable tx

**Proof:** Text `kite-proof` to WhatsApp → returns Basescan link to real USDC payment.

| Detail | Value |
|--------|-------|
| Agent ID | `agent_019e42a0-7033-74a4-8f9e-346cacbc505d` |
| Session | `agent_session_019e4483-4fd5-7c54-a5a8-cde03869f5bb` |
| Budget | $0.50/tx, $5 total, expires 2026-06-19 |
| Wallet | `0xE0c1BF58DC20DE1e0493Efc0250dBbA34658dfeF` |
| Demo merchant | Weather API (Kite discovery-listed, ~$0.01/call) |
| Settlement chain | Base (via Kite Passport routing) |
| Verify | [basescan.org/tx/0x5552d709...](https://basescan.org/tx/0x5552d70914b3dec7a78912cd6e08d9db6530e1b95351f0826b88c7e194ff8857) |

### 2. Internal Scout Settlement (WhatsApp `scout`)

Platform wallet signs EIP-3009 `TransferWithAuthorization` and submits to Pieverse facilitator on Kite chain (eip155:2368). Falls back to off-chain attestation when facilitator hasn't registered the scheme — honest labeling in receipts.

**Flow:** User texts `scout Chelsea` → AI generates report → platform attempts Kite settlement → persists attestation

### 3. External Agent Commerce (`/api/x402/scout`)

SportWarren itself is an x402 merchant. External agents can pay to receive scouting reports:

`POST https://api.sportwarren.com/api/x402/scout` → 402 challenge → agent pays → facilitator settles → report delivered.

---

## Live Demo

### WhatsApp (Primary UX)
Text **+1 (201) 534-5384**:

| Command | What It Proves |
|---------|----------------|
| `kite-proof` | Agent pays Kite-listed service → real USDC tx with explorer link |
| `scout Liverpool` | Autonomous scout with budget guards + settlement attempt |
| `trigger-auto-scout` | Proactive pre-match autonomy (no human trigger) |
| `budget` | Programmable spending constraints (per-user, per-squad, daily) |
| `attestations` | All settlement receipts with tx links |
| `help` | Full command reference |

### Web App
- **Production:** https://api.sportwarren.com
- **Telegram Mini-App:** Squad management + matchmaking UI

### Verified On-Chain Transactions
- `0x5552d70914b3dec7a78912cd6e08d9db6530e1b95351f0826b88c7e194ff8857` — [Basescan](https://basescan.org/tx/0x5552d70914b3dec7a78912cd6e08d9db6530e1b95351f0826b88c7e194ff8857)
- `0xf81d9544dc48ff92ed685499a128a773f44fc1c8606ba5227fb19ea15ab9fa11` — [Basescan](https://basescan.org/tx/0xf81d9544dc48ff92ed685499a128a773f44fc1c8606ba5227fb19ea15ab9fa11)
- `0x2c8a288467fe8539d916bd8ce9b02fb15ebc1d245d5071e32394f554fc1770ba` — [Basescan](https://basescan.org/tx/0x2c8a288467fe8539d916bd8ce9b02fb15ebc1d245d5071e32394f554fc1770ba)

---

## Kite Stack Usage

| Kite Component | How We Use It |
|----------------|---------------|
| **Kite Passport** | Agent identity, spending sessions, passkey-approved delegation |
| **x402 Protocol** | Payment negotiation (402 → pay → access) for both inbound and outbound |
| **Service Discovery** | `ksearch services list` to find payable APIs |
| **USDC Settlement** | Real stablecoin payments through Passport's routing |
| **Spending Constraints** | `max_amount_per_tx`, `max_total_amount`, TTL, asset restrictions |
| **Pieverse Facilitator** | EIP-3009 settlement for platform-internal payments (Kite chain 2368) |

---

## Architecture

```
WhatsApp User
     │
     ▼
┌─────────────────────────────────────────┐
│  SportWarren Agent (Marcus)             │
│  ├── Intent resolver (NLU)              │
│  ├── Budget guards (per-user, squad)    │
│  ├── Kite Passport session ($0.50/tx)   │
│  └── Cron scheduler (auto-scout 22h)    │
└──────────────┬──────────────────────────┘
               │
       ┌───────┼───────┐
       ▼       ▼       ▼
  ┌────────┐ ┌──────┐ ┌─────────────┐
  │ kpass  │ │ EIP- │ │ /api/x402/  │
  │execute │ │ 3009 │ │ scout       │
  │(outbound)│sign  │ │ (inbound)   │
  └────┬───┘ └──┬──┘ └──────┬──────┘
       │        │            │
       ▼        ▼            ▼
  ┌────────┐ ┌──────────┐ ┌──────────┐
  │ Kite   │ │ Pieverse │ │ External │
  │Catalog │ │Facilitator│ │ Agents   │
  │Merchant│ │(Kite 2368)│ │  pay us  │
  └────────┘ └──────────┘ └──────────┘
       │
       ▼
  Base USDC Settlement (verifiable on Basescan)
```

---

## Autonomous Behavior Examples

1. **Pre-match auto-scout:** Cron fires 22h before kickoff → agent checks budget → pays for intelligence → delivers report to WhatsApp group — zero human involvement.
2. **Budget enforcement:** Agent refuses to over-spend even if user demands it. `max_amount_per_tx` and daily caps are hard limits.
3. **Service discovery:** Agent can browse Kite catalog (`ksearch`) and select optimal price/quality service without user guidance.
4. **Multi-squad isolation:** Each squad's agent session is independent — spending in one squad never affects another.

---

## Tech Stack

- **Runtime:** Next.js 16 (App Router) + standalone server on Hetzner
- **AI:** OpenAI GPT-4o for NLU + scout report generation
- **Database:** PostgreSQL via Prisma
- **Messaging:** WhatsApp Business API (Twilio)
- **Payments:** Kite Passport CLI, x402 protocol, EIP-3009
- **Deployment:** PM2 + custom build pipeline (`scripts/deploy-hetzner.sh`)

---

## Kite Passport Configuration

| Item | Value |
|------|-------|
| Account | `papaandthejimjams@gmail.com` |
| Agent | `agent_019e42a0-7033-74a4-8f9e-346cacbc505d` (type: `squad_manager`) |
| Active Session | `agent_session_019e4483-4fd5-7c54-a5a8-cde03869f5bb` |
| Per-tx limit | $0.50 USDC |
| Total budget | $5 USDC |
| Expires | 2026-06-19 |
| Wallet | `0xE0c1BF58DC20DE1e0493Efc0250dBbA34658dfeF` (Kite chain 2366) |

---

## Repository

- **Source:** GitHub (private during hackathon)
- **Production:** https://api.sportwarren.com
- **Health:** https://api.sportwarren.com/api/health
