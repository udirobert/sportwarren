# SportWarren Development Guide

## Quick Start

### Prerequisites
- **Node.js 18+**, **PostgreSQL 14+**
- **GitHub CLI** (for auth): `gh auth login`

### Installation
```bash
git clone https://github.com/udirobert/sportwarren.git
cd sportwarren
npm install
cp .env.example .env.local

# Set up PostgreSQL database
brew services start postgresql@14
psql postgres -c "CREATE DATABASE sportwarren;"
psql sportwarren < prisma/migrations/001_init.sql

npm run dev
```

**Local URLs:** Frontend: http://localhost:3000 | API: http://localhost:3000/api/trpc

---

## Environment Configuration

```env
# Core
NODE_ENV=development
DATABASE_URL=postgresql://localhost:5432/sportwarren

# Algorand
NEXT_PUBLIC_ALGORAND_NODE_URL=https://testnet-api.algonode.cloud
NEXT_PUBLIC_ALGORAND_INDEXER_URL=https://testnet-idx.algonode.cloud

# Avalanche
NEXT_PUBLIC_AVALANCHE_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc

# WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-project-id
```

---

## Database

### Schema
We use **Prisma** with **PostgreSQL**. The schema is in `prisma/schema.prisma`.

### Key Tables
- `users` - Wallet-based authentication
- `player_profiles` - XP, level, stats
- `player_attributes` - FIFA-style ratings
- `squads` - Team management
- `matches` - Match verification
- `match_verifications` - Consensus records
- `xp_gains` - Audit trail

### Running Migrations
```bash
# Apply SQL migration
psql sportwarren < prisma/migrations/001_init.sql

# Generate Prisma client
npx prisma generate
```

---

## API Layer (tRPC)

We use **tRPC** for type-safe API calls.

### Routers
| Router | Procedures |
|--------|-----------|
| `match` | submit, verify, list, getById |
| `player` | getProfile, getForm, getLeaderboard |
| `squad` | create, list, getById, join, leave |

### Using tRPC in Components
```typescript
import { trpc } from '@/lib/trpc-client';

// Query
const { data, isLoading } = trpc.match.list.useQuery({ limit: 10 });

// Mutation
const mutation = trpc.match.submit.useMutation();
await mutation.mutateAsync({ homeSquadId, awaySquadId, homeScore, awayScore });
```

---

## Authentication

### Wallet-Based Auth
1. User connects wallet (Pera, Defly, etc.)
2. Client generates auth message with timestamp
3. User signs message
4. Server verifies signature using algosdk
5. Server creates/returns user record

### Auth Headers
```
x-wallet-address: ALGO_ADDRESS
x-chain: algorand|avalanche
x-wallet-signature: BASE64_SIGNATURE
x-auth-message: MESSAGE
x-auth-timestamp: TIMESTAMP
```

### Development Mode
In development, signature verification is skipped for easier testing.

---

## Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── api/trpc/       # tRPC API endpoint
│   ├── match/          # Match pages
│   ├── squad/          # Squad pages
│   └── ...
├── components/          # React components
├── hooks/              # Custom React hooks
│   ├── match/          # Match hooks (tRPC-based)
│   ├── player/         # Player hooks (tRPC-based)
│   └── squad/          # Squad hooks (tRPC-based)
├── lib/                # Utilities
│   ├── auth/           # Wallet auth
│   ├── db.ts           # Prisma client
│   ├── trpc-client.ts  # tRPC client
│   └── trpc-provider.tsx
├── server/             # tRPC server
│   ├── trpc.ts         # tRPC setup
│   ├── root.ts         # Root router
│   └── routers/        # API routers
└── types/              # TypeScript types
```

---

## Testing

```bash
# Frontend (Vitest)
npm run test

# Coverage
npm run test:coverage
```

---

## Deployment

### Production Checklist
- [ ] Database migrated
- [ ] Environment variables set
- [ ] Wallet signature verification enabled
- [ ] SSL certificates configured
- [ ] Monitoring enabled

### Vercel Deployment
```bash
npm run build
vercel --prod
```

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

## Troubleshooting

**Build fails:**
```bash
rm -rf node_modules .next && npm install
```

**Database connection:**
```bash
# Check PostgreSQL is running
brew services list | grep postgresql
pg_isready
```

**Prisma issues:**
```bash
npx prisma generate
```

---

**See Also:** [Architecture](./ARCHITECTURE.md) | [Roadmap](./ROADMAP.md) | [Features](./FEATURES.md)
