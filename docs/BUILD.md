# SportWarren Build & Operations

**Development, Deployment & Runtime Management**

---

## 🛠️ Quick Start

### Prerequisites
- **Node.js 18+**, **PostgreSQL 14+**, **Redis 6+** (optional)
- **GitHub CLI**: `gh auth login`

### Installation
```bash
git clone https://github.com/udirobert/sportwarren.git
cd sportwarren
pnpm install
cp .env.example .env.local

# Database Setup
brew services start postgresql@14
psql postgres -c "CREATE DATABASE sportwarren;"
pnpm prisma migrate deploy
pnpm prisma generate

pnpm run dev
```

**Local URLs:** Frontend: http://localhost:3000 | API: http://localhost:3000/api/trpc

---

## ⚙️ Environment Configuration

SportWarren uses a role-specific multi-chain system. Fallback **Simulation Mode** is active if keys are missing.

### Core Variables
- `DATABASE_URL`: PostgreSQL connection string.
- `WEB3_PRIVATE_KEY`: Platform wallet for x402 settlements on Kite.
- `TELEGRAM_BOT_TOKEN`: Token from BotFather.
- `KAPSO_API_KEY`: For WhatsApp delivery.
- `CRON_SECRET`: Bearer token for `/api/cron/*` endpoints. Required.
- `RATE_TOKEN_SECRET`: Signs WhatsApp rate links. Falls back to `CRON_SECRET` if unset.

### Cron Endpoints
| Endpoint | Schedule | Purpose |
|----------|----------|---------|
| `/api/cron/verification-expiry` | Every 15 min | Expires unverified pending matches |
| `/api/cron/consensus` | Every 15 min | Closes expired rating windows |
| `/api/cron/rating-reminders` | Every 2h | DMs players who haven't rated teammates |
| `/api/cron/moment-render` | Every 6h | Generates PNG renders for unrendered moments |
| `/api/cron/twin-sim` | Daily | Runs overnight round-robin tournaments |
| `/api/cron/digital-twin` | Daily | Sweeps expired coaching effects, fires events |
| `/api/cron/season` | Daily | Auto-ends seasons past endDate |

All require `Authorization: Bearer <CRON_SECRET>`.

### REST API Routes (Import)
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/import/squad` | POST | Create squad + placeholder users + invite links from CSV/TSV |
| `/api/import/matches/[squadId]` | POST | Import match history as Moment rows for an existing squad |
| `/api/import/claim/[squadId]` | GET | Look up pending imported player by name (for claim flow) |
| `/api/import/claim/[squadId]` | POST | Claim an imported placeholder spot (transfer records) |

### tRPC Routers
| Router | Purpose |
|--------|---------|
| `player.ts` | Player identity, profile, avatar, admin adjustments |
| `squad.ts` | Squad management, members, invites |
| `match.ts` | Match logging, verification, history |
| `peer-rating.ts` | Peer consensus engine, rating submission |
| `tournament.ts` | Seasons, twin sims, leaderboards |
| `coaching.ts` | Coaching marketplace, hire/cancel effects |
| `communication.ts` | Signal preferences, notifications |
| `agent.ts` | Kite AI agent integration, attestations |
| `market.ts` | Transfer market |
| `auth.ts` | Authentication, session management |
| `lens.ts` | Lens Protocol integration |
| `memory.ts` | Agent memory service |

### Chain Responsibility Matrix
| Network | Responsibility | Key Variables |
|---------|----------------|---------------|
| **Kite AI** | Agents & Commerce | `KITE_API_KEY`, `WEB3_PRIVATE_KEY`, `KITE_SCOUT_PRICE_USDC`, `KITE_SCOUT_MAX_USDC`, `KITE_SCOUT_MAX_USDC_SQUAD` |
| **Algorand** | Verification | `DEPLOYER_MNEMONIC`, `ALGORAND_APP_ID` |
| **GOAT Network** | Governance, ERC-8004 agent identity, x402 settlement | `GOAT_PRIVATE_KEY`, `GOAT_CHAIN_ID`, `GOAT_RPC_URL`, `GOAT_IDENTITY_REGISTRY_ADDRESS`, `GOAT_REPUTATION_REGISTRY_ADDRESS`, `GOAT_FACILITATOR_URL`, `GOAT_USDC_ADDRESS` |
| **TON** | Telegram Wallet | `TONCENTER_API_KEY` |

### x402 / Agentic Commerce Variables
| Variable | Default | Purpose |
|----------|---------|---------|
| `WEB3_PRIVATE_KEY` | — | Platform wallet for EIP-3009 signing (Kite chain) |
| `KITE_X402_VERSION` | `2` | x402 protocol version |
| `KITE_FACILITATOR_URL` | `https://facilitator.pieverse.io` | Settlement facilitator endpoint |
| `KITE_X402_SIMULATE` | `false` | Enable simulation mode (no real settlement) |
| `KITE_SCOUT_PRICE_USDC` | `0.005` | Price per scout report |
| `KITE_SCOUT_MAX_USDC` | `0.50` | Per-user daily scout budget |
| `GOAT_FACILITATOR_URL` | auto-detected (mainnet/testnet) | GOAT Network settlement facilitator |
| `GOAT_X402_NETWORK` | `eip155:48816` | GOAT Network identifier for x402 routing |

The x402 client resolves settlement routes via `resolveX402Config()` — it uses Kite chain (`eip155:2368`) by default and switches to GOAT Network when the target network matches `eip155:2345` or `eip155:48816`. See [`GOAT_STRATEGY.md`](./GOAT_STRATEGY.md) for the full strategy and deferred work items.

---

## 🚀 Deployment

### Vercel (Frontend & Serverless)
Ideal for the web UI and non-intensive API routes.
```bash
vercel --prod
```

### Hetzner (API-Only Backend)
For the production API backend, we deploy an **API-only artifact** to Hetzner via PM2. The frontend is served by Vercel (www.sportwarren.com), while Hetzner runs only the backend API routes, tRPC endpoints, workers, and cron jobs.

#### Architecture
- **Vercel**: Frontend (Next.js pages, React components, SSR/ISR) → www.sportwarren.com
- **Hetzner**: Backend API only (tRPC, REST, workers, cron, database) → api.sportwarren.com

#### 1. Build API-Only Artifact
```bash
bash scripts/build-runtime-artifact.sh
# Produces artifacts/sportwarren-api-TIMESTAMP.tar.gz
```

The build script:
1. Builds the full Next.js app (required for API route compilation)
2. Prunes frontend bloat from the standalone output:
   - Removes `.next/static` (JS/CSS bundles - Vercel handles this)
   - Removes `public/` (frontend assets - Vercel handles this)
   - Removes all app routes except `api/` directory
   - Removes pages router output (legacy pages)
   - Removes middleware, image optimizer, and frontend manifests
3. Bundles only the API server with Prisma schema and deploy scripts

**Result:** ~20-30MB artifact (vs ~121MB full app), ~5min build time (vs ~38min).

#### 2. Deploy Release
The full pipeline (build + migrate + upload + deploy) is automated:
```bash
bash scripts/deploy-hetzner.sh
```
Migrations run from the build machine against the remote database before uploading. The deploy script unpacks the release, symlinks shared `.env` and `storage`, and restarts PM2.

#### 3. PM2 Management
The `ecosystem.config.cjs` runs the Next.js standalone server on port `5200`. The server only responds to API routes (`/api/*`, `/trpc/*`). Frontend requests are handled by Vercel. Use `pm2 status` and `pm2 logs` for monitoring.

---

## 🧪 Testing & Validation

```bash
# Unit & Integration
pnpm run test

# Production Build Check
pnpm run build
```

**Known Warnings:** Deprecated `punycode` and missing Redis are non-fatal; the system handles them gracefully.

---

## 🎨 UX Principle

**"Tactics before Tasks"**: Every user flow should answer "How do we win?" before asking "What happened?".

- Landing page leads with Tactical Simulation and Match Preview, not match logging
- Onboarding guides users toward tactical setup before operational tasks
- Match Center defaults to preview mode, with capture secondary

---

**See Also:** [ARCHITECT.md](./ARCHITECT.md) | [PLATFORMS.md](./PLATFORMS.md)
