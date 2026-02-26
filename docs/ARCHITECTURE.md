# SportWarren Architecture

**Phygital Football Platform | Real World + Championship Manager Layer**

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

---

## Database Schema

### Core Tables

**users** - Wallet-based authentication
```
id, walletAddress, chain, name, email, createdAt
```

**player_profiles** - Player progression
```
id, userId, level, totalXP, seasonXP, totalMatches, totalGoals, totalAssists, reputationScore
```

**player_attributes** - FIFA-style ratings
```
id, profileId, attribute, rating, xp, xpToNext, maxRating, history
```

**squads** - Team management
```
id, name, shortName, founded, homeGround, treasuryBalance
```

**matches** - Match verification
```
id, homeSquadId, awaySquadId, homeScore, awayScore, submittedBy, status, matchDate
```

**match_verifications** - Consensus records
```
id, matchId, verifierId, verified, trustTier, createdAt
```

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

## API Layer (tRPC)

### Match Router
```typescript
match.submit({ homeSquadId, awaySquadId, homeScore, awayScore })
match.verify({ matchId, verified, homeScore?, awayScore? })
match.list({ status?, squadId?, limit?, offset? })
match.getById({ id })
```

### Player Router
```typescript
player.getProfile({ userId })
player.getForm({ userId, limit? })
player.getLeaderboard({ type?, attribute?, limit? })
player.applyXPGains({ matchId, gains[] }) // Admin only
```

### Squad Router
```typescript
squad.create({ name, shortName, homeGround? })
squad.list({ search?, limit?, offset? })
squad.getById({ id })
squad.join({ squadId })
squad.leave({ squadId })
squad.getMySquads()
```

---

## Verification Mechanic

**Consensus Model:**
1. Captain submits match result
2. Opposing captain verifies
3. Additional witnesses can verify
4. 3 verifications = confirmed
5. Discrepancy = disputed status

**Trust Tiers:**
- Bronze - New players
- Silver - Established players
- Gold - Verified captains
- Platinum - Reputable long-term users

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

### Squad Hooks
```typescript
const { squads } = useSquads(search);
const { squad, members, joinSquad, leaveSquad } = useSquadDetails(squadId);
const { memberships } = useMySquads();
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

**See Also:** [Features](./FEATURES.md) | [Roadmap](./ROADMAP.md) | [Development](./DEVELOPMENT.md)
