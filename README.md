# SportWarren

**Generalizable CRE Pattern for Phygital Verification** | Sports is Our Demo

A next-generation football management platform built with Next.js and PostgreSQL, featuring real match verification, player progression, and squad management.

---

## 🎯 The Real Product: Reusable CRE Architecture

**SportWarren demonstrates a generalizable Chainlink CRE pattern for multi-source real-world verification.** While we use amateur football as our demo use case, the weighted consensus engine applies to insurance, supply chain, disaster relief, and event verification:

| Use Case | Oracle A | Oracle B | Consensus Logic |
|----------|----------|----------|-----------------|
| **Sports (Our Demo)** | Weather | Location (stadium) | Verify match occurred |
| **Insurance Claims** | Weather data | Property records | Auto-payout on damage |
| **Pharma Supply Chain** | Temperature | GPS location | Invalidate if temp exceeded |
| **Event Verification** | Identity (WorldID) | Attendance | Verify unique human |
| **Disaster Relief** | Satellite | Ground sensors | Allocate aid by confidence |

**The architecture is the product. Sports is just our demo.**

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

## 🏆 Chainlink CRE Hackathon Submission

### 🚨 The Problem: "The Phygital Trust Gap"
Real-world amateur sports lack an immutable, trustless record of truth. Matches are often disputed, and player performance data (XP) is centralized and easy to manipulate. Captains often disagree on match outcomes, and verification typically requires centralized human oversight or brittle oracle calls.

### ⚽ The Solution: "Sovereign Phygital Engine"
SportWarren provides a "Parallel Season" where every real-world match is verified by a decentralized consensus engine. Players earn XP, attributes, and rewards that are secured on-chain (Algorand/Avalanche), with **Sovereign Agentic Inference** (Venice AI) providing the tactical narrative layer.

### 🛠 How we used Chainlink Oracles & CRE
We used the **Chainlink Runtime Environment (CRE)** to collapse the complexity of multi-modal real-world data and AI-driven inference into a single, verifiable confidence score for every match.

1.  **Orchestration (Parallel Actions)**:
    *   **Action A (Weather)**: Uses OpenWeatherMap API to fetch conditions at the match's precise $GPS + timestamp$.
    *   **Action B (Location)**: Uses Google Maps to verify if coordinates match a registered stadium or pitch.
    *   **Action C (Inference)**: Calls **Venice AI** (Sovereign LLM) to synthesize Phygital data into a "Captain's Report."
2.  **Weighted Consensus (Computation)**:
    *   A weighted algorithm ($60\%$ Location / $40\%$ Weather) computes a **"Phygital Confidence Score"**.
    *   *Result:* A match played at a stadium during verified weather conditions receives a high trust score, automatically promoting the record to the "Platinum" on-chain tier.
3.  **Autonomous Narrative**: The Agent Captains (Kite Invicta & Neon Strikers) use **Llama-3.1 via Venice AI** to "decide" if a match result is valid, providing an expert tactical bridge between raw data and player rewards.
4.  **Traceability**: Every verification generates a unique `workflowId` (e.g., `cre_mw_pibhj`) that is persisted in our PostgreSQL DB and cross-referenced with Algorand transaction logs.

### 🧪 Proof of Verification
Run our CRE consensus logic proof:
```bash
npx tsx scripts/test-cre-logic.ts
```

### 🔗 Public Repo & Contracts
*   **Main Repo**: [udirobert/sportwarren](https://github.com/udirobert/sportwarren)
*   **CRE Workflow Code**: `server/services/blockchain/cre/match-verification.ts`
*   **Verification UI**: `src/components/match/MatchConsensus.tsx`

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
