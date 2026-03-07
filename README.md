# SportWarren

**Championship Manager Meets Web3** | Football platform with on-chain match verification

A next-generation football management platform built with Next.js and PostgreSQL, featuring real match verification, player progression, and squad management.

---

## 🎯 Vision

SportWarren transforms amateur football with:
- **Real Match Verification** - On-chain verified Sunday league matches
- **Player Progression** - FIFA-style attributes that improve with real performance
- **Squad Management** - Team organization, tactics, and rivalries
- **Championship Manager UX** - Familiar gameplay, Web3 ownership

Built for footballers who want ownership, transparency, and global recognition.

---

## ⚡ Quick Start

```bash
git clone https://github.com/udirobert/sportwarren.git
cd sportwarren
npm install
cp .env.example .env.local

# Start PostgreSQL
brew services start postgresql@14

# Run database migration
psql sportwarren < prisma/migrations/001_init.sql

npm run dev
```

**Frontend:** http://localhost:3000 | **tRPC API:** http://localhost:3000/api/trpc

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    SportWarren Platform                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐      │
│  │   Algorand   │  │  Avalanche   │  │     Kite AI      │      │
│  │ (Sensor/XP)  │  │ (Governance) │  │ (Agent Economy)  │      │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘      │
│         │                  │                   │                │
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
│  │   (PostgreSQL)      │  │ (Privy/Multi-Chain) │              │
│  └─────────────────────┘  └─────────────────────┘              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| **[Architecture](docs/ARCHITECTURE.md)** | System design, database schema, tech stack |
| **[Development](docs/DEVELOPMENT.md)** | Getting started, deployment, contributing |
| **[Features](docs/FEATURES.md)** | Platform features, AI analytics |
| **[Roadmap](docs/ROADMAP.md)** | Development phases, success metrics |

---

## 🚀 Key Features

### Core Platform
- **Smart Match Tracking** - Photo/voice capture, consensus verification
- **Player Attributes** - FIFA-style ratings (pace, shooting, passing, etc.)
- **XP System** - Earn XP from verified matches, level up attributes
- **Squad Management** - Create squads, invite players, manage roster
- **Rivalries** - Track head-to-head records, derby bonuses
- **Leaderboards** - Rank by overall rating, goals, assists, matches

### Match Verification
- Both teams submit results independently
- Consensus required (3 verifications)
- Trust tiers affect verification weight
- Disputed matches escalated for arbitration

### Wallet Authentication
- Algorand wallet integration (Pera, Defly)
- Signature-based authentication
- Automatic user/profile creation
- Development mode for easy testing

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, Tailwind CSS, shadcn/ui |
| API | tRPC (type-safe RPC) |
| Database | PostgreSQL 15+ |
| ORM | Prisma 7 |
| State | TanStack Query, Zustand |
| Auth | Privy (Social + Multi-Chain Wallets) |
| Blockchains | Algorand (XP), Avalanche (DAO), Kite AI (Agents), Lens Network (Social) |

---

## 📁 Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── api/trpc/       # tRPC API endpoint
│   ├── match/          # Match pages
│   ├── squad/          # Squad pages
│   └── ...
├── components/          # React components
├── hooks/              # tRPC-based React hooks
│   ├── match/          # useMatchVerification, useMatchDetails
│   ├── player/         # usePlayerAttributes, usePlayerForm
│   └── squad/          # useSquads, useSquadDetails
├── lib/                # Utilities
│   ├── auth/           # Wallet signature verification
│   ├── db.ts           # Prisma client
│   └── trpc-*.ts       # tRPC client/provider
├── server/             # tRPC server
│   ├── trpc.ts         # tRPC setup, auth middleware
│   ├── root.ts         # Root router
│   └── routers/        # match.ts, player.ts, squad.ts
└── types/              # TypeScript types
```

---

## 🗄️ Database Schema

### Core Tables
- **users** - Wallet-based authentication
- **player_profiles** - XP, level, career stats
- **player_attributes** - FIFA-style ratings (pace, shooting, etc.)
- **squads** - Team management
- **squad_members** - Squad membership
- **matches** - Match verification
- **match_verifications** - Consensus records
- **xp_gains** - Audit trail for all XP transactions
- **form_entries** - Match ratings and form

See `prisma/schema.prisma` and `prisma/migrations/001_init.sql` for full schema.

---

## 🔐 Authentication

### Wallet-Based Auth Flow
### Multi-Chain Auth Flow (Privy)
1. User logs in via Social (Google/Apple) or Wallet
2. Privy provisions/connects Algorand and EVM (Avalanche/Kite) addresses
3. Identity is unified under a single SportWarren Profile in PostgreSQL
4. App handles cross-chain routing based on feature (e.g., Match XP on Algorand, DAO on Avalanche, Agent Fees on Kite, Highlights on Lens Network)

### Development Mode
In development, signature verification is skipped for easier testing. Set `NODE_ENV=development` in `.env.local`.

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

## 🚀 Deployment

### Production Checklist
- [ ] PostgreSQL database provisioned
- [ ] Database migrations applied
- [ ] Environment variables configured
- [ ] Wallet signature verification enabled
- [ ] SSL certificates configured
- [ ] Monitoring enabled (Sentry recommended)

### Vercel Deployment
```bash
npm run build
vercel --prod
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and build
5. Submit a PR

See [Development Guide](docs/DEVELOPMENT.md) for detailed guidelines.

---

## 📄 License

MIT License - see LICENSE file for details.

---

**Built with ❤️ for footballers everywhere.**
