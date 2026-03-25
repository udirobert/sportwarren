# SportWarren

**Phygital Football Management Platform** | Real matches, verified data, and Web3-native squad operations

SportWarren turns grassroots football into a Championship Manager-style experience where real-world match activity feeds progression, squad decisions, and treasury outcomes. It combines modern web tooling, backend services, AI assistants, messaging channels, and multi-network integrations.

---

## 🎯 Vision

SportWarren transforms amateur football with:
- **Real Match Verification** - Structured submissions, consensus checks, and oracle-assisted trust signals
- **Player Progression** - FIFA-style attributes that improve through real performance
- **Squad Management** - Team organization, tactics, treasury, and transfers
- **Championship Manager UX** - Familiar gameplay with verifiable digital ownership

**The Flywheel:** Real performance → Game rewards → Better tools/strategy → Improved real performance

---

## ⚡ Quick Start

```bash
git clone https://github.com/udirobert/sportwarren.git
cd sportwarren
npm install
cp .env.example .env.local

# Start PostgreSQL
brew services start postgresql@14
psql sportwarren < prisma/migrations/001_init.sql

npm run dev
```

**Frontend:** http://localhost:3000 | **API:** http://localhost:3000/api/trpc

---

## 📚 Documentation Index

| Document | Purpose |
|----------|---------|
| **[CORE.md](docs/CORE.md)** | Architecture, database schema, tech stack, features |
| **[BUILD.md](docs/BUILD.md)** | Development guide, deployment, testing, troubleshooting |
| **[CONTRACTS.md](docs/CONTRACTS.md)** | Deployed contracts, Chainlink oracles, integrations |
| **[GROWTH.md](docs/GROWTH.md)** | Roadmap, growth strategy, hackathon demo |
| **[TELEGRAM.md](docs/TELEGRAM.md)** | Telegram bot + Mini App architecture, commands, and integration flows |
| **[YELLOW_INTEGRATION.md](docs/YELLOW_INTEGRATION.md)** | Yellow Network integration details and operational notes |

---

## 🏗️ Architecture (High-Level)

```
┌─────────────────────────────────────────────────────────────────┐
│                    SportWarren Platform                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐      │
│  │   Algorand   │  │  Avalanche   │  │     Kite AI      │      │
│  │ (Sensor/XP)  │  │ (Governance) │  │ (Agent Economy)  │      │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘      │
│         └──────────────────┼───────────────────┘                │
│                            ▼                                    │
│              ┌─────────────────────────┐                        │
│              │   tRPC API Layer        │                        │
│              │   (Type-safe RPC)       │                        │
│              └───────────┬─────────────┘                        │
│                          │                                      │
│              ┌───────────┴───────────┐                          │
│              ▼                       ▼                          │
│  ┌─────────────────────┐  ┌─────────────────────┐              │
│  │   Prisma ORM        │  │   Unified Auth      │              │
│  │   (PostgreSQL)      │  │ (Multi-Chain)       │              │
│  └─────────────────────┘  └─────────────────────┘              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Key Features

### Core Platform
- **Smart Match Tracking** - Photo/voice capture, consensus verification, Chainlink CRE
- **Player Attributes** - FIFA-style ratings (pace, shooting, passing, defending, stamina, physical)
- **XP System** - Earn XP from verified matches, level up attributes
- **Squad Management** - Create squads, invite players, manage roster
- **Rivalries** - Track head-to-head records, derby bonuses
- **Leaderboards** - Rank by overall rating, goals, assists, matches

### Match Verification
- Both teams submit results independently
- Consensus required (3 verifications)
- Oracle-backed context (e.g., environmental/location signals) contributes to trust scoring
- Trust tiers affect verification weight
- On-chain settlement on Algorand

### Multi-Chain Infrastructure
- **Algorand:** Match verification, reputation (App ID: 756828208)
- **Avalanche Fuji:** Governance, DAO (Governor: `0x2e98aF...`)
- **Kite AI:** Agent identity, payments
- **Yellow Network:** Instant off-chain match fees, treasury, and transfers
- **Lens Network:** Social graph, highlight sharing
- **Telegram + TON:** Bot commands (`/start`, `/log`, `/stats`, `/fixtures`, `/treasury`, `/fee`), Mini App treasury top-ups, TON settlement worker with webhook delivery

### AI Staff Layer
- Multi-persona staff assistants (Agent, Scout, Coach, Physio, Analyst, Commercial)
- Context-aware responses using squad data, treasury signals, and recent decisions
- Provider abstraction with Venice AI primary + OpenAI fallback

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, Tailwind CSS, shadcn/ui |
| API | tRPC (type-safe RPC) |
| Database | PostgreSQL 15+ |
| ORM | Prisma 7 |
| State | TanStack Query, Zustand |
| Auth | Wallet signatures (algosdk, ethers) |
| AI | Venice AI, OpenAI fallback |
| Messaging | Telegram Bot API, Telegram Mini App, TON flows |
| Blockchains & Networks | Algorand, Avalanche, Kite AI, Lens, Yellow, TON |

---

## 🧪 Testing

```bash
# Run tests
npm run test

# Coverage
npm run test:coverage

# Build check
npm run build
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and build
5. Submit a PR

See [BUILD.md](docs/BUILD.md) for detailed guidelines.

---

## 📄 License

MIT License - see LICENSE file for details.

---

**Built with ❤️ for footballers everywhere.**

⚽ **SportWarren** | 🌐 **Built across web, AI, messaging, and multi-network rails**
