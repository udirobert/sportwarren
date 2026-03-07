# SportWarren Architecture

**Phygital Football Platform | Real World + Championship Manager Layer**

**Last Updated:** March 2026

---

## Vision: Championship Manager Meets Pokémon Go

SportWarren creates a **parallel season** where your real Sunday league matches drive a Championship Manager-style game layer.

```
Real World Match                    SportWarren Layer
────────────────                    ─────────────────
Play 90 minutes        →            Result verified on-chain
Score 2 goals          →            Shooting XP + Attribute boost
Win 3-2 vs rivals      →            Derby victory + Form boost
Team coordination      →            Squad chemistry + Morale
Physical fitness       →            Stamina regen rate

←───────────────────────────────────
Agent suggests tactics for next match
Scout recommends formation change
Rivalry rematch scheduled
Treasury reward distributed
```

**The Flywheel:** Real performance → Game rewards → Better tools/strategy → Improved real performance

---

## Core Loop: Match Verification → XP → Engagement

### MVP Flow
1. **Match Submission** - Captain submits result with score
2. **Verification** - Opposing team + witnesses verify
3. **Consensus** - 3 verifications = match confirmed
4. **XP Distribution** - Players earn attribute XP
5. **Leaderboards** - Rankings updated, rivalries formed

### Weekly Cycle

| Day | Real World | SportWarren Layer |
|-----|-----------|-------------------|
| Mon-Wed | Training, fitness | Stamina regen, training mini-games |
| Thu-Fri | Squad coordination | Tactics setup, scout reports |
| Sat/Sun | **MATCH DAY** | Live tracking, verification |
| Mon | Rest, recover | Results finalized, XP/rewards distributed |

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                      Next.js 14 Application                          │
├─────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐          │
│  │   Match      │  │   Squad      │  │   Championship   │          │
│  │   Capture    │  │   Management │  │   Manager Layer  │          │
│  │              │  │              │  │                  │          │
│  │ • Photo/voice│  │ • DAO votes  │  │ • Tactics        │          │
│  │ • Consensus  │  │ • Transfers  │  │ • Scout reports  │          │
│  │ • Verification│ │ • Treasury   │  │ • Form tracking  │          │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘          │
│         │                  │                   │                    │
│         └──────────────────┼───────────────────┘                    │
│                            ▼                                        │
│              ┌─────────────────────────┐                            │
│              │   tRPC API Layer        │                            │
│              │   (Type-safe RPC)       │                            │
│              └───────────┬─────────────┘                            │
│                          │                                          │
│              ┌───────────┴───────────┐                              │
│              ▼                       ▼                              │
│  ┌─────────────────────┐  ┌─────────────────────┐                  │
│  │   Prisma ORM        │  │   Wallet Auth       │                  │
│  │   (PostgreSQL)      │  │   (algosdk)         │                  │
│  └──────────┬──────────┘  └─────────────────────┘                  │
│             │                                                       │
│  ┌──────────┴──────────┐                                           │
│  │   PostgreSQL        │                                           │
│  │   • Users           │                                           │
│  │   • Matches         │                                           │
│  │   • Player Stats    │                                           │
│  │   • Squads          │                                           │
│  │   • Tactics         │                                           │
│  │   • Treasury        │                                           │
│  │   • Transfers       │                                           │
│  └─────────────────────┘                                           │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, Tailwind, shadcn/ui |
| State | Zustand, TanStack Query (React Query) |
| API | tRPC (type-safe RPC) |
| Database | PostgreSQL 14+ |
| ORM | Prisma 7 |
| Auth | Wallet signatures (algosdk) |
| Wallets | Pera, Defly (Algorand) |
| On-Chain | Algorand Testnet (Match Verification) |
| Social | Lens Network (Social Highlights) |
| Oracles | Chainlink CRE (Runtime Environment) |
| Verification | OpenWeatherMap + Google Maps (Geofencing) |

---

## Database Schema

### User & Authentication

**users** - Wallet-based authentication
```
id, walletAddress, chain, name, email, avatar, position
createdAt, updatedAt
```

### Player Profile & Attributes

**player_profiles** - Player progression
```
id, userId, level, totalXP, seasonXP
totalMatches, totalGoals, totalAssists
reputationScore
createdAt, updatedAt
```

**player_attributes** - FIFA-style ratings (0-99)
```
id, profileId, attribute, rating, xp, xpToNext, maxRating
history (array of last 5 ratings)
updatedAt
```

**form_entries** - Match form tracking
```
id, profileId, matchId, rating, formValue
createdAt
```

### Squad Management

**squads** - Team management
```
id, name, shortName, founded, homeGround, treasuryBalance
tacticsId, treasuryId
createdAt, updatedAt
```

**squad_members** - Squad membership
```
id, squadId, userId, role (captain/vice_captain/player)
joinedAt
```

**squad_tactics** - Team tactics ⭐ NEW
```
id, squadId, formation, playStyle
instructions (JSON), setPieces (JSON)
createdAt, updatedAt
```

**squad_treasury** - Squad finances ⭐ NEW
```
id, squadId, balance, budgets (JSON)
createdAt, updatedAt
```

**treasury_transactions** - Transaction audit trail ⭐ NEW
```
id, treasuryId, type (income/expense), category
amount, description, txHash, verified
createdAt
```

**transfer_offers** - Player transfer market ⭐ NEW
```
id, fromSquadId, toSquadId, playerId
offerType (permanent/loan), amount, loanDuration
status (pending/accepted/rejected/cancelled)
expiresAt, createdAt, updatedAt
```

### Match Verification

**matches** - Match records
```
id, homeSquadId, awaySquadId, homeScore, awayScore
submittedBy, status (pending/verified/disputed/finalized)
matchDate, latitude, longitude
weatherVerified, locationVerified
verificationDetails (JSON) // CRE result: confidence, weather source, geofencing
txId (Algorand transaction)
createdAt, updatedAt
```

**match_verifications** - Consensus records
```
id, matchId, verifierId, verified, homeScore, awayScore
trustTier (bronze/silver/gold/platinum)
createdAt
```

**player_match_stats** - Individual match performance
```
id, matchId, profileId
goals, assists, cleanSheet, rating, minutesPlayed, xpEarned
createdAt
```

**xp_gains** - XP audit trail
```
id, matchId, profileId
baseXP, bonusXP, totalXP
source, description, attributeBreakdown (JSON)
createdAt
```

### Achievements

**achievements** - Achievement definitions
```
id, type, title, description, requirement (JSON), xpReward
createdAt
```

**player_achievements** - Unlocked achievements
```
id, profileId, achievementId, unlockedAt
```

### AI Agents

**ai_agents** - Kite AI agent registry
```
id, agentId, passportId, name, type
description, reputation, capabilities
createdAt, updatedAt
```

---

## API Layer (tRPC)

### Match Router
```typescript
match.submit({ homeSquadId, awaySquadId, homeScore, awayScore, matchDate, latitude?, longitude? })
match.verify({ matchId, verified, homeScore?, awayScore? })
match.list({ status?, squadId?, limit?, offset? })
match.getById({ id }) // Returns rich creResult metadata
```

### Player Router
```typescript
player.getProfile({ userId })
player.getForm({ userId, limit? })
player.getLeaderboard({ type?, attribute?, limit? })
player.getAiInsights({ userId }) // Coach Kite Tactical Advice
player.getTrainingData({ userId }) // Fitness Agent & Activity
player.syncActivity({ userId, type, duration, ... }) // Health Sync
player.chatWithCoach({ userId, message, context? }) // Conversational AI
player.applyXPGains({ matchId, gains[] }) // Admin only
```

### Squad Router ⭐ UPDATED March 2026
```typescript
// Squad Management
squad.create({ name, shortName, homeGround? })
squad.list({ search?, limit?, offset? })
squad.getById({ id })
squad.join({ squadId })
squad.leave({ squadId })
squad.getMySquads()
squad.getNearbySquads({ latitude, longitude, radiusKm? })

// Matchmaking & Governance
squad.createChallenge({ toSquadId, proposedDate, pitchId?, message? })
squad.respondToChallenge({ challengeId, action: 'accept' | 'reject' })
squad.getProposals({ squadId })
squad.voteOnProposal({ proposalId, vote: 'yes' | 'no' | 'abstain' })
squad.executeProposal({ proposalId })
squad.getTerritory({ squadId }) // Pitch dominance

// Tactics
squad.getTactics({ squadId })
squad.saveTactics({ squadId, formation, playStyle, instructions?, setPieces? })

// Treasury
squad.getTreasury({ squadId })
squad.depositToTreasury({ squadId, amount, description? })
squad.withdrawFromTreasury({ squadId, amount, reason, category })

// Transfers
squad.getTransferOffers({ squadId, type: 'incoming' | 'outgoing' })
squad.createTransferOffer({ toSquadId, playerId, offerType, amount, loanDuration? })
squad.respondToTransferOffer({ offerId, accept })
squad.cancelTransferOffer({ offerId })
```

### Social & Auth (Express Endpoints)
```typescript
POST /api/lens/challenge // SIWL challenge generation
POST /api/lens/authenticate // SIWL signature verification
POST /api/lens/post // Publication to Lens feed
GET /api/lens/balance // Lens Network balance
```

**Total Endpoints:** 30+ (16 squad + 4 match + 8 player + Express APIs)

---

## Authentication Flow

```
1. User connects wallet
        ↓
2. Client generates auth message + timestamp
        ↓
3. User signs message
        ↓
4. Client sends: address + chain + signature + message + timestamp
        ↓
5. Server verifies signature with algosdk
        ↓
6. Server finds or creates user record
        ↓
7. Server returns session (via headers)
```

### Security
- Signatures expire after 5 minutes
- Message format validated
- Address recovered from signature
- Development mode allows bypass

---

## Verification Mechanic

**Trust Mechanic: Chainlink CRE**
The platform uses a 3-phase verification workflow:
1. **Orchestration**: Parallel fetching of weather (One Call API) and location (Reverse Geocoding).
2. **Consensus**: Weighing results to generate a confidence score (threshold: 60%).
   - *Location (60%)*: Stadium/Pitch detection via Geofencing.
   - *Weather (40%)*: Conditions matching (Historical vs. Current).
3. **Settlement**: Match record is hashed and committed to Algorand Testnet.

**Trust Tiers:**
- Bronze - New players
- Silver - Established players
- Gold - Verified captains
- Platinum - Chainlink CRE Verified (Automatic)

**Anti-Fraud:**
- Both teams must verify
- Reputation scores affect weight
- Disputed matches require arbitration

---

## Frontend Hooks

### Match Hooks
```typescript
const { matches, submitMatchResult, verifyMatch } = useMatchVerification(squadId);
const { match, loading } = useMatchDetails(matchId);
```

### Player Hooks
```typescript
const { attributes, getAttributeProgress } = usePlayerAttributes(userId);
const { form } = usePlayerForm(userId, limit);
const { leaderboard } = useLeaderboard(type, attribute, limit);
```

### Squad Hooks ⭐ UPDATED March 2026
```typescript
const { squads } = useSquads(search);
const { squad, members, joinSquad, leaveSquad } = useSquadDetails(squadId);
const { memberships } = useMySquads();

// Tactics
const { tactics, updateFormation, saveTactics, hasChanges } = useTactics(squadId);

// Transfers
const { incomingOffers, outgoingOffers, makeOffer, respondToOffer } = useTransfers(squadId);

// Treasury
const { treasury, deposit, withdraw } = useTreasury(squadId);
```

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

## Development Progress

### March 2026 - Chainlink CRE & Phygital Trust ✅
- **Workflow:** Implemented Chainlink Runtime Environment (CRE) pattern for match verification.
- **Data:** Integrated OpenWeatherMap OneCall (Historical) and Google Maps Place API.
- **UI:** Real-time "Verification Engine" logs in `MatchConsensusPanel`.
- **Database:** Added `verificationDetails` JSON field to persisted Match model.

### March 2026 - Full Stack Integration ✅
- **Database:** 4 new models (squad_tactics, squad_treasury, treasury_transactions, transfer_offers)
- **Backend:** 9 new tRPC endpoints for squad management
- **Frontend:** All squad hooks converted from mock to real API
- **Build:** Passing with 19 routes

### Previous Milestones
- **Phase 3:** Player attributes system (FIFA-style ratings, XP, form)
- **Phase 4:** Squad management UI (tactics, transfers, treasury, rivalries)

---

**See Also:** [Features](./FEATURES.md) | [Roadmap](./ROADMAP.md) | [Development](./DEVELOPMENT.md)
