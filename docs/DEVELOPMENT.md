# SportWarren Development Guide

## Quick Start

### Prerequisites
- **Node.js 18+**, **PostgreSQL 14+**, **Redis 6+**
- **Algorand Sandbox** (local dev)
- **Foundry**: `curl -L https://foundry.paradigm.xyz | bash`

### Installation
```bash
git clone https://github.com/your-org/sportwarren.git
cd sportwarren
npm install
cp .env.example .env
npm run setup:analytics
npm run dev
```

**Local URLs:** Frontend:3000 | API:4000 | Analytics:5001

---

## Environment Configuration

```env
# Core
NODE_ENV=development
DATABASE_URL=postgresql://user:pass@localhost:5432/sportwarren
REDIS_URL=redis://localhost:6379
AUTH0_DOMAIN=your-domain.auth0.com
JWT_SECRET=your-secret

# Algorand (FIFA)
ALGORAND_NETWORK=testnet
ALGORAND_NODE_URL=https://testnet-api.algonode.cloud
ALGORAND_PRIVATE_KEY=your-mnemonic

# Avalanche (Agents)
AVALANCHE_NETWORK=fuji
AVALANCHE_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
AVALANCHE_PRIVATE_KEY=your-key

# AI
OPENAI_API_KEY=sk-key
ROBOFLOW_API_KEY=your-key
```

---

## Smart Contract Development

### Algorand (TEAL)
```bash
# Local
npm run deploy:contracts:algorand:local
# Testnet
npm run deploy:contracts:algorand:testnet
# Mainnet
npm run deploy:contracts:algorand:mainnet
```

### Avalanche (Solidity + Foundry)
```bash
# Test
forge test
# Deploy Fuji
npm run deploy:contracts:avalanche:fuji
# Deploy Mainnet
npm run deploy:contracts:avalanche:mainnet
```

### Both Chains
```bash
npm run deploy:contracts:testnet
npm run deploy:contracts:mainnet
npm run verify:contracts
```

---

## Deployment

### Frontend (Next.js)
**Vercel (Recommended):**
```bash
npm run build && vercel --prod
```

**Alternatives:** Netlify, AWS Amplify

### Backend & Database
- **Database:** Supabase or self-hosted PostgreSQL
- **API:** Next.js API Routes (migrating from Express)
- **Redis:** Redis Cloud or self-hosted

### Production Checklist
- [ ] Database migrated
- [ ] Smart contracts on mainnet
- [ ] Environment variables set
- [ ] SSL certificates configured
- [ ] Monitoring enabled (Sentry/Datadog)

---

## Testing

```bash
# Frontend (Vitest)
npm run test

# Contracts
forge test              # Avalanche
npm run test:contracts  # All

# Coverage
npm run test:coverage
```

---

## Contributing

### Guidelines
1. **TypeScript** - Strict mode, proper types
2. **Tests Required** - Vitest (frontend), Foundry (contracts)
3. **Conventional Commits** - `feat:`, `fix:`, `chore:`
4. **Mobile Responsive** - Test on devices
5. **Dual-Chain** - Works with both chains

### PR Process
1. Fork + feature branch
2. Implement with tests
3. Update docs if needed
4. `npm run lint`
5. Submit PR

---

## Troubleshooting

**Build fails:**
```bash
rm -rf node_modules .next && npm install
```

**Algorand SDK:** Use v3.x `FromObject` functions, camelCase properties

**Avalanche deploy:** Check AVAX balance, verify RPC URL

---

**See Also:** [Architecture](./ARCHITECTURE.md) | [Roadmap](./ROADMAP.md) | [Features](./FEATURES.md)
