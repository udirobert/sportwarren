# SportWarren Core

**Phygital Football Platform | Championship Manager across Telegram, Web, and a role-specific multi-chain stack**

> **Platform Principle:** SportWarren uses multiple networks with strict responsibilities. No chain is interchangeable; each one exists because it owns a distinct product capability.

---

## Vision

SportWarren creates a **parallel season** where your real Sunday league matches drive a Championship Manager-style game layer.

**The Flywheel:** Real performance → Game rewards → Better tools/strategy → Improved real performance

```
Real World Match                    SportWarren Layer
────────────────                    ─────────────────
Play 90 minutes        →            Result verified on-chain
Score 2 goals          →            Shooting XP + Attribute boost
Win 3-2 vs rivals      →            Derby victory + Form boost
Team coordination      →            Squad chemistry + Morale
```

---

## Core Loop

### MVP Flow
1. **Match Submission** - Captain submits result with score
2. **Verification** - Opposing team + witnesses verify
3. **Consensus** - 3 verifications = match confirmed
4. **XP Distribution** - Players earn attribute XP
5. **Leaderboards** - Rankings updated, rivalries formed

### Current Product Scope

SportWarren's current MVP scope is the **Championship Manager-style squad loop, Telegram-first**:

| Primitive | Description | Status |
|-----------|-------------|--------|
| Match Tracking | Log results, events, verification | ✅ Complete |
| Game Simulation | AI-powered match prediction engine | ✅ Complete |
| Tactics/Strategy | Formation, instructions, lineups | ✅ Complete |
| Payments | Multi-network treasury, fees, rewards, and agent settlements | ✅ Complete |
| XP System | Player progression, reputation | ✅ Complete |
| AI Staff | 5 agents (Scout, Coach, Physio, etc.) | ✅ Complete |

**Telegram is a primary distribution surface. TON owns Telegram-native wallet flows, while Algorand, Avalanche, Kite, Yellow, and Lens each handle separate responsibilities.**

### Out of Scope (Future Build)

The following features exist in code but are **not part of the current core product**:

- **Prediction Markets** (`/predict`, `server/services/prediction/`) — Speculative feature, not CM-style core loop
- **Advanced DAO Governance** — Beyond basic treasury operations

These should not displace the primary CM-style loop during consolidation, hackathon judging, or roadmap prioritization.

## Chain Responsibility Model

SportWarren keeps all supported networks because each one maps to a different part of the product:

| Network | Product Responsibility | Why It Exists |
|---------|------------------------|---------------|
| **Algorand** | Match verification, reputation state, and proof-backed player progression | Fast, low-cost verification and durable football records |
| **Avalanche** | Squad governance, treasury policy, digital assets, and escrow contracts | Strong EVM tooling for programmable squad coordination |
| **Kite AI** | Agent identity, paid agent actions, attestations, and autonomous economy | Purpose-built infrastructure for agent passports and agent commerce |
| **Yellow** | Instant settlement rail for treasury movement and match-fee coordination | Operational liquidity without forcing every action into a slower on-chain path |
| **TON** | Telegram-native wallet UX, top-ups, rewards, and Mini App payments | Native fit for Telegram distribution and user treasury actions |
| **Lens** | Social identity, highlights, and community distribution | Portable social graph for player and squad visibility |

This is not a fallback stack. It is a responsibility-partitioned architecture where the app layer coordinates purpose-built networks instead of forcing one chain to do everything.

### Weekly Cycle

| Day | Real World | SportWarren Layer |
|-----|-----------|-------------------|
| Mon-Wed | Training, fitness | Stamina regen, training mini-games |
| Thu-Fri | Squad coordination | Tactics setup, scout reports |
| Sat/Sun | **MATCH DAY** | Live tracking, verification |
| Mon | Rest, recover | Results finalized, XP/rewards distributed |

---

## System Architecture

### Telegram-First Distribution

```
┌─────────────────────────────────────────────────────────────────────┐
│                     TELEGRAM LAYER (Primary)                         │
├─────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────────┐  ┌─────────────────┐   │
│  │  Bot Commands    │  │  Mini App        │  │  Inline Queries │   │
│  │  /log /stats     │  │  Full CM UI      │  │  Quick actions  │   │
│  │  /fixtures /fee  │  │  Squad+Match+XP  │  │  Share results  │   │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬────────┘   │
│           └─────────────────────┼─────────────────────┘            │
│                                 ▼                                   │
│              ┌─────────────────────────────────┐                   │
│              │   TON Connect + Treasury        │                   │
│              │   (Payments, Fees, Rewards)     │                   │
│              └─────────────────┬───────────────┘                   │
└────────────────────────────────┼────────────────────────────────────┘
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      BACKEND (Shared Primitives)                     │
├─────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐          │
│  │   Match      │  │   Squad      │  │   AI Staff       │          │
│  │   Router     │  │   Router     │  │   (5 Agents)     │          │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘          │
│         └──────────────────┼───────────────────┘                    │
│                            ▼                                        │
│              ┌─────────────────────────┐                            │
│              │   tRPC API Layer        │                            │
│              └───────────┬─────────────┘                            │
│                          │                                          │
│              ┌───────────┴───────────┐                              │
│              ▼                       ▼                              │
│  ┌─────────────────────┐  ┌─────────────────────┐                  │
│  │   Prisma ORM        │  │   Simulation Engine │                  │
│  │   (PostgreSQL)      │  │   (Match Prediction)│                  │
│  └──────────┬──────────┘  └─────────────────────┘                  │
│             │                                                       │
│  ┌──────────┴──────────┐                                           │
│  │   PostgreSQL        │                                           │
│  └─────────────────────┘                                           │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Domain Boundaries

**UI Layer (`src/app`, `src/components`)**
- Stateless rendering and composition only
- No direct data fetching except via hooks

**Hooks Layer (`src/hooks`)**
- All data fetching, caching, and mutation orchestration
- Shared query keys + explicit invalidation rules

**Domain Logic (`src/lib`)**
- Pure functions: calculations, simulation engines, formatting
- No React or network calls

**Server (`server/`, `src/server/routers`)**
- Auth gating, validation, and persistence
- Enforces permissions and verification server-side

**Dependency Direction:** `UI → Hooks → Server/Domain` (never the reverse)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, Tailwind CSS, shadcn/ui |
| State | Zustand, TanStack Query |
| API | tRPC (type-safe RPC) |
| Database | PostgreSQL 15+ |
| ORM | Prisma 7 |
| Auth | Wallet signatures (algosdk, ethers) |
| Blockchains | Algorand (verification/reputation), Avalanche (governance/assets), Kite AI (agent economy), Yellow (settlement rail), TON (Telegram treasury UX), Lens (social distribution) |

---

## Database Schema

### Core Tables

**users** - Wallet authentication
```
id, walletAddress, chain, name, email, avatar, position
createdAt, updatedAt
```

**player_profiles** - Player progression
```
id, userId, level, totalXP, seasonXP
totalMatches, totalGoals, totalAssists, reputationScore
createdAt, updatedAt
```

**player_attributes** - FIFA-style ratings (0-99)
```
id, profileId, attribute, rating, xp, xpToNext, maxRating
history (array of last 5 ratings)
updatedAt
```

**squads** - Team management
```
id, name, shortName, founded, homeGround, treasuryBalance
tacticsId, treasuryId
createdAt, updatedAt
```

**squad_members** - Membership
```
id, squadId, userId, role (captain/vice_captain/player)
joinedAt
```

**matches** - Match records
```
id, homeSquadId, awaySquadId, homeScore, awayScore
submittedBy, status (pending/verified/disputed/finalized)
matchDate, latitude, longitude
weatherVerified, locationVerified
verificationDetails (JSON), txId, yellowFeeSessionId, yellowFeeSettledAt
createdAt, updatedAt
```

**match_verifications** - Consensus records
```
id, matchId, verifierId, verified, homeScore, awayScore
trustTier (bronze/silver/gold/platinum)
createdAt
```

**squad_tactics** - Team tactics
```
id, squadId, formation, playStyle
instructions (JSON), setPieces (JSON)
createdAt, updatedAt
```

**squad_treasury** - Squad finances
```
id, squadId, balance, budgets (JSON), yellowSessionId
createdAt, updatedAt
```

**transfer_offers** - Player market
```
id, fromSquadId, toSquadId, playerId
offerType (permanent/loan), amount, loanDuration
status, expiresAt, yellowSessionId, createdAt, updatedAt
```

---

## API Layer (tRPC)

### Match Router
```typescript
match.submit({ homeSquadId, awaySquadId, homeScore, awayScore, matchDate, lat?, lng?, yellowSettlement? })
match.verify({ matchId, verified, homeScore?, awayScore? })
match.settleFeeSession({ matchId, yellowSettlement })
match.list({ status?, squadId?, limit?, offset? })
match.getById({ id })
match.preview({ homeSquadId, awaySquadId }) // Shadow Engine
```

### Player Router
```typescript
player.getProfile({ userId })
player.getForm({ userId, limit? })
player.getLeaderboard({ type?, attribute?, limit? })
player.getAiInsights({ userId })
player.syncActivity({ userId, type, duration, ... })
player.chatWithCoach({ userId, message, context? })
```

### Squad Router
```typescript
// Management
squad.create({ name, shortName, homeGround? })
squad.list({ search?, limit?, offset? })
squad.getById({ id })
squad.join({ squadId })
squad.leave({ squadId })
squad.getMySquads()

// Governance
squad.createChallenge({ toSquadId, proposedDate, message? })
squad.respondToChallenge({ challengeId, action })
squad.voteOnProposal({ proposalId, vote })

// Tactics
squad.getTactics({ squadId })
squad.saveTactics({ squadId, formation, playStyle, instructions? })

// Treasury
squad.getTreasury({ squadId })
squad.depositToTreasury({ squadId, amount, description?, yellowSettlement? })
squad.withdrawFromTreasury({ squadId, amount, reason, category, yellowSettlement? })

// Transfers
squad.getTransferOffers({ squadId, type })
squad.createTransferOffer({ toSquadId, playerId, offerType, amount, yellowSettlement? })
squad.respondToTransferOffer({ offerId, accept, yellowSettlement? })
squad.cancelTransferOffer({ offerId, yellowSettlement? })
```

---

## Authentication Flow

```
1. User connects wallet → 2. Client generates auth message → 3. User signs → 4. Client sends headers → 5. Server verifies signature → 6. Server creates/returns user → 7. Session returned
```

**Security:** Signatures expire after 5 minutes, message format validated, address recovered from signature.

---

## Verification Mechanic

**Chainlink CRE Workflow:**
1. **Orchestration**: Parallel fetching of weather (OpenWeatherMap) and location (Google Maps)
2. **Consensus**: Weighted scoring (60% location + 40% weather) → confidence score
3. **Settlement**: Match record hashed and committed to Algorand Testnet

**Trust Tiers:** Bronze (self-reported) → Silver (both confirm) → Gold (both + media) → Platinum (CRE verified).

**Anti-Fraud:** Both teams must verify, reputation scores affect weight, disputed matches require arbitration.

---

## Features Summary

**✅ Complete:** Match Verification, Player Attributes, Squad Management, Staff Room (5 AI agents), Cross-staff Context, On-chain Approval Gates, Notification Feed, Training Center, Matchmaking & Territory, Lens Social, Shadow Match Engine, Player Valuation, Automated Treasury Loop.

**🟡 Partial:** Platform Connections (UI complete, OAuth pending), Blockchain (90% - unified wallet pending).

---

## The Viral Loop

```
1. Play real match
        ↓
2. Log in SportWarren (both teams confirm)
        ↓
3. Stats update, attributes improve, share highlight
        ↓
4. Teammates see progress, rivals see challenge
        ↓
5. "We need to beat them" / "I want that for my squad"
        ↓
6. New match arranged, new users onboarded
        ↓
7. Season builds, rivalries form, stakes increase
        ↓
8. Repeat with deeper engagement
```

---

**See Also:** [BUILD.md](./BUILD.md) | [CONTRACTS.md](./CONTRACTS.md) | [GROWTH.md](./GROWTH.md)
