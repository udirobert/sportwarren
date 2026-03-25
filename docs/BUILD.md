# SportWarren Build Guide

**Development, Deployment & Operations**

---

## Quick Start

### Prerequisites
- **Node.js 18+**, **PostgreSQL 14+**, **Redis 6+** (optional for caching)
- **GitHub CLI**: `gh auth login`

### Installation
```bash
git clone https://github.com/udirobert/sportwarren.git
cd sportwarren
npm install
cp .env.example .env.local

# Start PostgreSQL
brew services start postgresql@14
psql postgres -c "CREATE DATABASE sportwarren;"
psql sportwarren < prisma/migrations/001_init.sql

# Generate Prisma client
npx prisma generate

npm run dev
```

**Local URLs:** Frontend: http://localhost:3000 | API: http://localhost:3000/api/trpc

---

## Environment Configuration

### Core Variables
```env
NODE_ENV=development
DATABASE_URL=postgresql://localhost:5432/sportwarren?sslmode=verify-full

# Algorand
ALGORAND_NETWORK=testnet
NEXT_PUBLIC_ALGORAND_NODE_URL=https://testnet-api.algonode.cloud
NEXT_PUBLIC_ALGORAND_INDEXER_URL=https://testnet-idx.algonode.cloud
DEPLOYER_MNEMONIC="your 25-word mnemonic"
ALGORAND_MATCH_VERIFICATION_APP_ID=756828208

# Avalanche
AVALANCHE_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
AVALANCHE_PRIVATE_KEY=your_private_key
AVALANCHE_CHAIN_ID=43113

# WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-project-id

# Optional: Sentry for error monitoring
SENTRY_DSN=https://your-sentry-dsn
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn

# Communications
TELEGRAM_BOT_TOKEN=123456:bot-token
TELEGRAM_BOT_USERNAME=sportwarrenbot           # without @
# Optional: webhook mode (otherwise polling is used)
TELEGRAM_WEBHOOK_URL=https://api.sportwarren.com

# TON Rail (Telegram Mini App + treasury top-ups)
TON_TREASURY_WALLET_ADDRESS=EQ...              # squad default vault (optional)
TONCENTER_API_KEY=your-toncenter-key           # improves reliability; uses public quota if unset
TON_SETTLEMENT_POLL_INTERVAL_MS=60000          # optional; default 60000
```

### Simulation Mode
If blockchain keys are missing, the system falls back to **Simulation Mode**:
- ChainlinkService provides simulated weather/location data
- Algorand posting is skipped (database verification continues)
- Set `ALGORAND_MATCH_VERIFICATION_APP_ID=0` to disable on-chain posting

---

## Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── api/trpc/       # tRPC endpoint
│   ├── dashboard/      # Dashboard pages
│   ├── match/          # Match pages
│   ├── squad/          # Squad pages
│   └── settings/       # Settings pages
├── components/          # React components
├── hooks/              # tRPC-based hooks
│   ├── match/          # useMatchVerification, useMatchDetails
│   ├── player/         # usePlayerAttributes, usePlayerForm
│   └── squad/          # useSquads, useSquadDetails
├── lib/                # Utilities
│   ├── auth/           # Wallet auth
│   ├── db.ts           # Prisma client
│   └── trpc-*.ts       # tRPC client/provider
└── types/              # TypeScript types

server/
├── trpc.ts             # tRPC setup, auth middleware
├── root.ts             # Root router
└── routers/            # match.ts, player.ts, squad.ts
```

---

## Database

### Schema Location
- **Prisma Schema:** `prisma/schema.prisma`
- **SQL Migrations:** `prisma/migrations/`

### Running Migrations
```bash
# Apply migration
psql sportwarren < prisma/migrations/001_init.sql

# Generate Prisma client
npx prisma generate
```

### Connection Pooling (Production)
For serverless environments (Vercel/Neon):
- Use `directUrl` for migrations
- Enable connection pooling (PgBouncer for Supabase)
- Set `pool_timeout` and `connection_limit` appropriately

---

## API Layer (tRPC)

### Using tRPC in Components
```typescript
import { trpc } from '@/lib/trpc-client';

// Query
const { data, isLoading } = trpc.match.list.useQuery({ limit: 10 });

// Mutation
const mutation = trpc.match.submit.useMutation();
await mutation.mutateAsync({ homeSquadId, awaySquadId, homeScore, awayScore });
```

### Auth Headers
```
x-wallet-address: ALGO_ADDRESS
x-chain: algorand|avalanche|lens
x-wallet-signature: BASE64_SIGNATURE (Algorand) or 0x... hex (EVM)
x-auth-message: MESSAGE
x-auth-timestamp: TIMESTAMP
```

**Note:** Signatures expire after ~5 minutes; UI prompts re-verification.

---

## Testing

```bash
# Frontend (Vitest)
npm run test

# Coverage
npm run test:coverage

# Build check
npm run build
```

### Test Coverage
- **AgentContext reducer:** 11 tests (all actions, isolation, provider guard)
- **useAgentAlerts rules:** 9 tests (thresholds, empty states, memoisation)

---

## Deployment

### Production Checklist
- [ ] Database provisioned and migrated
- [ ] Environment variables configured (see `.env.production.example`)
- [ ] Wallet signature verification enabled
- [ ] SSL certificates configured
- [ ] Sentry monitoring enabled
- [ ] Connection pooling configured (if serverless)

### Vercel Deployment
```bash
npm run build
vercel --prod
```

### Environment Variables (Production)
```env
# Required
DATABASE_URL=postgresql://... (with sslmode=verify-full)
ALGORAND_MATCH_VERIFICATION_APP_ID=756828208
DEPLOYER_MNEMONIC="25-word mnemonic"
AVALANCHE_PRIVATE_KEY=0x...
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=...
TELEGRAM_BOT_TOKEN=123456:bot-token
TELEGRAM_BOT_USERNAME=sportwarrenbot
TELEGRAM_WEBHOOK_URL=https://api.sportwarren.com
TONCENTER_API_KEY=your-toncenter-key

# Recommended
SENTRY_DSN=https://...
NEXT_PUBLIC_SENTRY_DSN=https://...
REDIS_URL=redis://... (for caching)
TON_TREASURY_WALLET_ADDRESS=EQ...  # fallback vault for squads without one set
TON_SETTLEMENT_POLL_INTERVAL_MS=60000
```

---

## Troubleshooting

### Build fails
```bash
rm -rf node_modules .next && npm install
```

### Database connection
```bash
# Check PostgreSQL is running
brew services list | grep postgresql
pg_isready
```

### Prisma issues
```bash
npx prisma generate
```

### Redis not running (cache errors)
```bash
brew services start redis
# Server continues without cache if Redis is unavailable
```

### Known warnings (non-fatal)
- `⚠️ Invalid Algorand mnemonic` — set valid `DEPLOYER_MNEMONIC`; on-chain deployments skipped otherwise
- `[ioredis] ECONNREFUSED` — Redis not running; start with `brew services start redis`
- `punycode module deprecated` — Node.js v22 warning from transitive dependency; safe to ignore

---

## Contributing

### Guidelines
1. **TypeScript** - Strict mode, proper types
2. **tRPC** - All API calls through tRPC
3. **Conventional Commits** - `feat:`, `fix:`, `chore:`
4. **Mobile Responsive** - Test on devices

### PR Process
1. Fork + feature branch
2. Implement with tests
3. Update docs if needed
4. `npm run lint && npm run build`
5. Submit PR

---

## Production Readiness

### ✅ Resolved Blockers
- **Database Connection:** Production guards in `db.ts`, connection pooling optimized
- **Wallet Signatures:** Real client-side signing with server verification via `/api/auth/challenge`
- **Environment Variables:** Audited in `.env.example`, deep health checks in `/api/health`
- **Guest Migration:** Progress persists through wallet connect with migration prompt
- **Error Monitoring:** Sentry integrated (requires `SENTRY_DSN`)

### 🟡 Beta Hardening
- **Journey Clarity:** Landing (`/`) marketing-only; operational flows in `/dashboard`
- **Affordance Integrity:** All clickable elements have clear actions
- **Layout Density:** Consistent spacing, headers, card rhythms
- **Role Clarity:** Member vs Captain actions enforced server-side

### 🔵 Nice-to-Have
- Toast notifications, mobile performance pass, season stats infographics, kit customization, CI/CD pipeline.

---

## Routes & Navigation

**Active Routes:** `/` (Landing), `/dashboard`, `/match`, `/squad`, `/reputation`, `/stats`, `/analytics`, `/community`, `/settings`.

**Redirected Routes:** `/verification` → `/match`, `/rivalries` → `/match`, `/challenges` → `/squad`, `/achievements` → `/reputation`.

---

## Security Notes

- Never expose mainnet private keys in `.env` files
- Use separate wallets for testnet and mainnet
- Rotate keys if accidentally committed to git
- Signatures expire after 5 minutes

---

**See Also:** [CORE.md](./CORE.md) | [CONTRACTS.md](./CONTRACTS.md) | [GROWTH.md](./GROWTH.md)
