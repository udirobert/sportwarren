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
npm install
cp .env.example .env.local

# Database Setup
brew services start postgresql@14
psql postgres -c "CREATE DATABASE sportwarren;"
psql sportwarren < prisma/migrations/001_init.sql
npx prisma generate

npm run dev
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

### Chain Responsibility Matrix
| Network | Responsibility | Key Variables |
|---------|----------------|---------------|
| **Kite AI** | Agents & Commerce | `KITE_API_KEY`, `WEB3_PRIVATE_KEY`, `KITE_SCOUT_PRICE_USDC`, `KITE_SCOUT_MAX_USDC`, `KITE_SCOUT_MAX_USDC_SQUAD` |
| **Algorand** | Verification | `DEPLOYER_MNEMONIC`, `ALGORAND_APP_ID` |
| **Avalanche** | Governance | `AVALANCHE_PRIVATE_KEY` |
| **TON** | Telegram Wallet | `TONCENTER_API_KEY` |

---

## 🚀 Deployment

### Vercel (Frontend & Serverless)
Ideal for the web UI and non-intensive API routes.
```bash
vercel --prod
```

### Hetzner (Standalone Runtime)
For the long-term production API, we use a lean **runtime-only artifact** on Hetzner via PM2. This avoids keeping the full source code on the server.

For detailed server bootstrap, PM2 gotchas, and release management, see **[DEPLOY_HETZNER_RUNTIME.md](./DEPLOY_HETZNER_RUNTIME.md)**.

#### 1. Build Artifact
```bash
npm run deploy:runtime:build
# Produces artifacts/sportwarren-runtime-TIMESTAMP.tar.gz
```

#### 2. Deploy Release
Upload the artifact to the server and run the deploy script:
```bash
bash scripts/deploy-runtime-release.sh /path/to/sportwarren-runtime-*.tar.gz
```
The script unpacks the release, symlinks shared `.env` and `storage`, and restarts PM2.

#### 3. PM2 Management
The `ecosystem.config.cjs` runs the Next.js standalone server on port `5200`. Use `pm2 status` and `pm2 logs` for monitoring.

---

## 🧪 Testing & Validation

```bash
# Unit & Integration
npm run test

# Production Build Check
npm run build
```

**Known Warnings:** Deprecated `punycode` and missing Redis are non-fatal; the system handles them gracefully.

---

**See Also:** [ARCHITECT.md](./ARCHITECT.md) | [PLATFORMS.md](./PLATFORMS.md) | [HACKATHON.md](./HACKATHON.md)
