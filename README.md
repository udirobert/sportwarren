# SportWarren

**Tactical Football Command Center** | Real matches, peer ratings, and Web3-native squad operations

SportWarren turns grassroots football into a Championship Manager-style experience where real-world match activity feeds tactical simulation, squad progression, and peer-vetted reputation. It combines modern web tooling, AI-driven scouting, and multi-network integrations across Web and Telegram.

---

## 🎯 Vision

SportWarren transforms amateur football with:
- **Tactical Simulation** - Immersive match previews, scouting reports, and AI-driven coaching insights
- **Peer-Vetted Reputation** - FIFA-style attributes that improve through real performance and peer consensus ratings
- **Real Match Verification** - Structured submissions, consensus checks, and oracle-assisted trust signals
- **Squad Management** - Team organization, tactical DNA, brand kit personalization, and treasury management
- **Championship Manager UX** - Experience-first gameplay focused on "How do we win?" before "What happened?"

**The Flywheel:** Tactical Prep → Real Performance → Peer Rating → Attribute Growth → Strategy Refinement

---

## ⚡ Quick Start

```bash
git clone https://github.com/udirobert/sportwarren.git
cd sportwarren
npm install
cp .env.example .env.local

# Required for encrypted squad media (generate a 32-byte base64 key)
# openssl rand -base64 32
echo "MEDIA_MASTER_KEY=$(openssl rand -base64 32)" >> .env.local

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
| **[UX_REFOCUS.md](docs/UX_REFOCUS.md)** | Strategy for prioritizing tactical experience over match logging |
| **[PEER_RATINGS.md](docs/PEER_RATINGS.md)** | Peer consensus engine, MOTM voting, and Scout reputation progression |
| **[TELEGRAM.md](docs/TELEGRAM.md)** | Telegram bot + Mini App architecture, tactical notifications, and TON integration |
| **[SOCIAL.md](docs/SOCIAL.md)** | Private squad media sharing and Lens integration |
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
│  │   (PostgreSQL)      │  │ (Privy v3/Wagmi v2) │              │
│  └─────────────────────┘  └─────────────────────┘              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Key Features

### Tactical Experience
- **Match Preview Engine** - Interactive PitchCanvas visualization with scouting reports and win probabilities
- **AI Staff Insights** - Pre-match tactical briefings from the Coach Kite persona (AI Scout, Coach, Physio)
- **Tactical DNA** - Personalize your squad's brand kit (colors/nickname) and formation before every match
- **Match Hype Notifications** - Automated Telegram briefings delivered 1 hour before kick-off

### Peer Ratings & Reputation
- **Peer Consensus Engine** - Post-match teammate evaluations for Attack, Defense, Pace, and Stamina
- **Scout Reputation** - Earn XP and level up your "Scout Tier" through accurate and consistent ratings
- **Man of the Match (MOTM)** - Cast votes to award bonus XP and prestige to top performers
- **Dynamic Attributes** - FIFA-style ratings that evolve based on real-world performance and peer vetted data

### Real Match Verification
- Both teams submit results independently with consensus-required verification (3 checks)
- Oracle-backed context (environmental/location signals) contributes to trust scoring
- On-chain settlement on Algorand and TON

### Multi-Chain Infrastructure
- **Algorand:** Match verification, reputation tracking (App ID: 756828208)
- **Avalanche Amoy:** Governance, DAO and treasury operations
- **Kite AI:** Agent identity and autonomous economy
- **Yellow Network:** Instant off-chain match fees and treasury settlements
- **Telegram + TON:** Full Mini App tactical parity, bot commands, and TON settlement worker

### AI Staff Layer
- Multi-persona staff assistants (Agent, Scout, Coach, Physio, Analyst, Commercial)
- Context-aware responses using squad data, treasury signals, and recent decisions
- Provider abstraction with Venice AI primary + OpenAI fallback

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14.2.3, Tailwind CSS, shadcn/ui |
| API | tRPC (type-safe RPC) |
| Database | PostgreSQL 15+ |
| ORM | Prisma 7.4.1 |
| State | TanStack Query, Zustand |
| Auth | Privy v3 + Wagmi v2 bridge (unified wallets) |
| AI | Venice AI primary + OpenAI fallback |
| Messaging | Telegram Bot API, Telegram Mini App (TMA), TON flows |
| Networks | Algorand, Avalanche, Kite AI, Yellow, TON, Lens |

---

## 🧪 Testing

```bash
# Run tests
npm run test

# Build check (local production verification)
DISABLE_SENTRY_BUILD=true NODE_OPTIONS='--max-old-space-size=4096' npm run build
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

⚽ **SportWarren** | 🌐 **Tactical home for grassroots football**
