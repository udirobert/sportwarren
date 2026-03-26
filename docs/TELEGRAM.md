# SportWarren Telegram Integration

**Championship Manager in Telegram, powered by TON**

> Target: TON AI Hackathon — User-Facing AI Agents Track ($10,000)

---

## Executive Summary

SportWarren brings the Championship Manager experience to Telegram as an AI-powered squad management assistant. Users interact with their football squad through bot commands and a Mini App, with TON handling payments and on-chain verification.

**Hackathon Positioning:**
- **Track:** User-Facing AI Agents
- **Core Value:** AI agents that help users manage real-world football squads inside Telegram
- **TON Integration:** Treasury payments, match fee settlements, reward distribution

---

## Identity Architecture: Full Cross-Surface Coherence

**Yes, the Telegram Mini App and web app are fully connected.**

A user can link their Telegram account to their existing EVM/Algorand/Lens identity and manage the same squad, matches, XP, and treasury across both surfaces.

### How It Works

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         UNIFIED USER IDENTITY                            │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   User (id: "cuid123")                                                   │
│   ├── walletAddress: "0xABC..." or "ALGO..."                            │
│   ├── chain: "avalanche" | "algorand" | "lens"                          │
│   │                                                                      │
│   ├── PlayerProfile (1:1)                                                │
│   │   ├── level, totalXP, seasonXP                                      │
│   │   └── attributes (pace, shooting, etc.)                             │
│   │                                                                      │
│   ├── SquadMember[] (many squads)                                        │
│   │   └── squadId, role (captain/player)                                │
│   │                                                                      │
│   └── PlatformConnection[] ← TELEGRAM LINK                               │
│       ├── platform: "telegram"                                           │
│       ├── chatId: Telegram chat ID                                       │
│       ├── platformUserId: Telegram user ID                               │
│       ├── userId: SAME SportWarren user                                  │
│       └── squadId: SAME squad                                            │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### Linking Flow

1. **Web:** User signs in with EVM/Algorand wallet → `User` created
2. **Web:** User creates/joins squad → `SquadMember` links user ↔ squad
3. **Web:** Captain goes to Settings → "Connect Telegram" → generates `linkToken`
4. **Telegram:** User opens deep link → Bot receives `/start connect_<token>`
5. **Bot:** `connectTelegramChatByToken()` links Telegram to SAME user + squad
6. **Mini App:** Opens with `miniAppToken` → resolves to SAME identity

### Same Data, Both Surfaces

| Action | Web App | Telegram | Same Record? |
|--------|---------|----------|--------------|
| View squad | `/squad` page | Mini App Squad tab | ✅ Same `Squad` |
| Submit match | `/match` page | `/log` command | ✅ Same `Match` |
| Verify match | MatchConsensusPanel | Mini App Match tab | ✅ Same `MatchVerification` |
| View XP | Profile page | Mini App Profile tab | ✅ Same `PlayerProfile` |
| Top-up treasury | Web Treasury | Mini App Treasury | ✅ Same `SquadTreasury` |
| AI Staff chat | StaffRoom | `/ask` command | ✅ Same `agent.ts` router |

### Mini App Context (Enhanced)

The `/api/telegram/mini-app/context` endpoint now returns the full CM data:

```typescript
interface TelegramMiniAppContext {
  squadId: string;
  squadName: string;
  userId: string;           // Linked SportWarren user
  
  player: {                 // Full player profile
    id, name, position,
    level, totalXP, seasonXP,
    sharpness, reputationScore,
    stats: { matches, goals, assists },
    attributes: [{ attribute, rating, xp, xpToNext }]
  };
  
  squad: {                  // Squad with members
    id, name, shortName, homeGround,
    memberCount,
    members: [{ userId, name, role, position }],
    form: ['W', 'W', 'D', 'L', 'W']  // Last 5 results
  };
  
  matches: {
    pending: [...],         // Need verification
    recent: [...]           // Settled matches
  };
  
  treasury: { ... };        // Existing
  ton: { ... };             // Existing
}
```

---

## Current State Assessment

### What's Built

| Component | Status | Notes |
|-----------|--------|-------|
| Bot Commands | ✅ Working | `/log`, `/stats`, `/fixtures`, `/fee`, `/treasury`, `/help` |
| Squad Linking | ✅ Working | Deep link from web Settings → Telegram chat |
| Match Logging | ✅ Working | Natural language parsing: "4-2 win vs Red Lions" |
| Treasury Mini App | ✅ Working | TON Connect, top-up flow, pending reconciliation |
| Stats Queries | ✅ Working | Player + squad stats from linked chat |
| Fee Proposals | ✅ Working | Captain proposes match fee from treasury |

### Implementation Status ✅

| Feature | Priority | Status |
|---------|----------|--------|
| Squad Dashboard | P1 | ✅ Built — `TelegramSquadDashboard.tsx` |
| Match Center | P1 | ✅ Built — `TelegramMatchCenter.tsx` |
| Player Profile + XP | P1 | ✅ Built — `TelegramPlayerProfile.tsx` |
| Treasury + TON | P1 | ✅ Built — `TelegramTreasuryTab.tsx` |
| Mini App Shell | P1 | ✅ Built — `TelegramMiniAppShell.tsx` with 4-tab navigation |
| Match Submit API | P1 | ✅ Built — `/api/telegram/mini-app/match/submit` |
| Match Verify API | P1 | ✅ Built — `/api/telegram/mini-app/match/verify` |
| AI Staff Chat | P2 | ✅ Built — `/ask` command + `/api/telegram/mini-app/ask` |
| Enhanced Context | P1 | ✅ Built — Full player, squad, matches data in context |

**Status:** Mini App is now a full CM experience with 4 tabs: Squad, Match, Profile, Treasury.

---

## Target Architecture

### Telegram as Primary Surface

```
┌─────────────────────────────────────────────────────────────────┐
│                    TELEGRAM MINI APP                            │
│                    (Full CM Experience)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐           │
│  │  Squad  │  │  Match  │  │ Player  │  │Treasury │           │
│  │Dashboard│  │ Center  │  │ Profile │  │  + TON  │           │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘           │
│       │            │            │            │                 │
│       └────────────┴────────────┴────────────┘                 │
│                          │                                     │
│              ┌───────────┴───────────┐                         │
│              │   AI Staff Agents     │                         │
│              │   (Scout, Coach, etc) │                         │
│              └───────────────────────┘                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BOT COMMANDS (Quick Actions)                 │
├─────────────────────────────────────────────────────────────────┤
│  /log 4-2 win vs Lions    →  Submit match for verification     │
│  /stats Marcus            →  Player stats snapshot             │
│  /fixtures                →  Upcoming matches                  │
│  /fee abc123 2            →  Propose match fee (2 TON)         │
│  /treasury                →  Open Mini App treasury tab        │
│  /tactics                 →  Open Mini App tactics tab         │
│  /ask Coach about fitness →  AI Staff query                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    TON LAYER (Payments + Trust)                 │
├─────────────────────────────────────────────────────────────────┤
│  • TON Connect wallet binding                                   │
│  • Treasury top-ups (pending → verified)                        │
│  • Match fee settlements                                        │
│  • XP reward distribution                                       │
│  • On-chain verification anchoring                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## Mini App Screen Design

### 1. Squad Dashboard (Home)

**Purpose:** At-a-glance squad status, the CM "office desk" view.

```
┌────────────────────────────────────────┐
│ ⚽ Sunday Legends                    ⚙ │
│ ────────────────────────────────────── │
│                                        │
│ ┌──────────────┐  ┌──────────────┐    │
│ │   FORM       │  │   NEXT MATCH │    │
│ │   W W D L W  │  │   vs Lions   │    │
│ │   5th place  │  │   Sun 3pm    │    │
│ └──────────────┘  └──────────────┘    │
│                                        │
│ ┌──────────────┐  ┌──────────────┐    │
│ │   TREASURY   │  │   PENDING    │    │
│ │   45.2 TON   │  │   2 matches  │    │
│ │   ↑ 12 TON   │  │   need verify│    │
│ └──────────────┘  └──────────────┘    │
│                                        │
│ ┌────────────────────────────────────┐ │
│ │ 🤖 AI Staff Alert                  │ │
│ │ "Marcus needs rest before Sunday"  │ │
│ └────────────────────────────────────┘ │
│                                        │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  🏠 Squad  ⚽ Match  👤 Profile  💰 TON │
└────────────────────────────────────────┘
```

**Data Sources:**
- `squad.getById` — Squad info
- `match.list` — Recent form, pending verifications
- `squad.getTreasury` — Balance, pending top-ups
- `player.getAiInsights` — Staff alerts

### 2. Match Center

**Purpose:** Submit results, verify opponents, view XP gains.

```
┌────────────────────────────────────────┐
│ ← Match Center                         │
│ ────────────────────────────────────── │
│                                        │
│ ┌────────────────────────────────────┐ │
│ │  📝 LOG NEW MATCH                  │ │
│ │                                    │ │
│ │  Opponent: [  Red Lions       ▼]  │ │
│ │                                    │ │
│ │  Score:  [ 4 ] - [ 2 ]            │ │
│ │                                    │ │
│ │  [    Submit for Verification   ] │ │
│ └────────────────────────────────────┘ │
│                                        │
│ PENDING VERIFICATION (2)               │
│ ┌────────────────────────────────────┐ │
│ │ vs Park Rangers  3-1  ⏳ 1/3      │ │
│ │ [Verify] [Dispute]                │ │
│ └────────────────────────────────────┘ │
│ ┌────────────────────────────────────┐ │
│ │ vs City FC       2-2  ⏳ 2/3      │ │
│ │ Awaiting their verification       │ │
│ └────────────────────────────────────┘ │
│                                        │
│ RECENT SETTLED                         │
│ ┌────────────────────────────────────┐ │
│ │ vs Lions  4-2 ✅  +120 XP         │ │
│ └────────────────────────────────────┘ │
│                                        │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  🏠 Squad  ⚽ Match  👤 Profile  💰 TON │
└────────────────────────────────────────┘
```

**Data Sources:**
- `match.submit` — Create match
- `match.verify` — Confirm/dispute
- `match.list({ status: 'pending' })` — Verification queue
- `player.finalizeMatchXP` — XP results

### 3. Player Profile

**Purpose:** Your CM player card with attributes, XP, form.

```
┌────────────────────────────────────────┐
│ ← Player Profile                       │
│ ────────────────────────────────────── │
│                                        │
│        ┌──────────────┐                │
│        │     👤       │                │
│        │   Marcus T   │                │
│        │   ⭐ 78 OVR  │                │
│        │   MF • Lvl 4 │                │
│        └──────────────┘                │
│                                        │
│ ATTRIBUTES                             │
│ ┌────────────────────────────────────┐ │
│ │ Pace      ████████░░  78          │ │
│ │ Shooting  ██████░░░░  62  ↑2      │ │
│ │ Passing   █████████░  85          │ │
│ │ Dribbling ███████░░░  72          │ │
│ │ Defense   ████░░░░░░  42          │ │
│ │ Physical  ██████░░░░  65          │ │
│ └────────────────────────────────────┘ │
│                                        │
│ SEASON STATS                           │
│ ┌──────────┐ ┌──────────┐ ┌─────────┐ │
│ │ 12 games │ │ 8 goals  │ │ 5 assts │ │
│ └──────────┘ └──────────┘ └─────────┘ │
│                                        │
│ FORM: ⚽⚽🅰️⚽⬜  (Last 5 matches)       │
│                                        │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  🏠 Squad  ⚽ Match  👤 Profile  💰 TON │
└────────────────────────────────────────┘
```

**Data Sources:**
- `player.getProfile` — Core stats
- `player.getAttributes` — FIFA-style ratings
- `player.getForm` — Recent performance

### 4. Treasury (Existing, Enhanced)

**Purpose:** TON wallet operations, fees, rewards.

```
┌────────────────────────────────────────┐
│ ← Treasury                             │
│ ────────────────────────────────────── │
│                                        │
│ ┌────────────────────────────────────┐ │
│ │      💎 SQUAD BALANCE              │ │
│ │         45.2 TON                   │ │
│ │      ≈ $135.60 USD                 │ │
│ └────────────────────────────────────┘ │
│                                        │
│ [  Connect TON Wallet  ]  ← TON Connect│
│                                        │
│ QUICK TOP-UP                           │
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐          │
│ │ 1  │ │ 2  │ │ 5  │ │ 10 │  TON     │
│ └────┘ └────┘ └────┘ └────┘          │
│                                        │
│ [    Submit TON Top-Up    ]           │
│                                        │
│ PENDING (2)                            │
│ ┌────────────────────────────────────┐ │
│ │ +5 TON  ⏳ Awaiting on-chain       │ │
│ │ +2 TON  ⏳ Awaiting on-chain       │ │
│ └────────────────────────────────────┘ │
│                                        │
│ RECENT ACTIVITY                        │
│ ┌────────────────────────────────────┐ │
│ │ -1 TON  Match fee vs Lions    ✅  │ │
│ │ +10 TON Top-up from @marcus   ✅  │ │
│ └────────────────────────────────────┘ │
│                                        │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  🏠 Squad  ⚽ Match  👤 Profile  💰 TON │
└────────────────────────────────────────┘
```

**Data Sources:**
- `squad.getTreasury` — Balance, transactions
- `/api/telegram/mini-app/context` — Existing endpoint
- `/api/telegram/mini-app/top-up` — Existing endpoint

---

## AI Agent Integration

### Staff Room in Telegram

The 5 AI staff agents should be accessible via:

1. **Bot command:** `/ask Coach about fitness levels`
2. **Mini App tab:** Chat interface with agent selector
3. **Proactive alerts:** AI-generated notifications in squad dashboard

### Agent Capabilities

| Agent | Function | Example Query |
|-------|----------|---------------|
| **Scout** | Opponent analysis | "What's Lions' weakness?" |
| **Coach** | Tactics advice | "Should we play counter vs City?" |
| **Physio** | Fitness management | "Who needs rest this week?" |
| **Analyst** | Performance data | "Show my shooting stats trend" |
| **Commercial** | Treasury ops | "Can we afford a 5 TON match fee?" |

### Implementation

Existing `agent.ts` router already handles AI queries. Wire to:
- New `/ask` bot command
- Mini App chat component (reuse `StaffRoom` from web)

---

## Bot Commands (Complete List)

| Command | Description | Status |
|---------|-------------|--------|
| `/start` | Link Telegram to squad | ✅ Built |
| `/log <result>` | Submit match result | ✅ Built |
| `/stats [player]` | View stats | ✅ Built |
| `/fixtures` | Upcoming matches | ✅ Built |
| `/fee <matchId> [amount]` | Propose match fee | ✅ Built |
| `/treasury` | Open Mini App treasury | ✅ Built |
| `/tactics` | Open Mini App tactics | 🔨 New |
| `/profile` | Open Mini App profile | 🔨 New |
| `/ask <agent> <query>` | AI staff query | 🔨 New |
| `/help` | Show commands | ✅ Built |

---

## Implementation Status

### ✅ Phase 1: Mini App Shell — COMPLETE

**Built Components:**
```
src/components/telegram/
├── TelegramMiniAppShell.tsx        # 4-tab navigation with haptic feedback
├── TelegramSquadDashboard.tsx      # Form, treasury summary, AI insights
├── TelegramMatchCenter.tsx         # Submit/verify matches, XP tracking
├── TelegramPlayerProfile.tsx       # FIFA-style attributes, progression
├── TelegramTreasuryTab.tsx         # TON Connect, top-ups, transactions
├── TelegramMiniAppProviders.tsx    # TON Connect provider
└── index.ts                        # Clean exports
```

### ✅ Phase 2: Match Flow — COMPLETE

**API Endpoints:**
```
src/app/api/telegram/mini-app/
├── context/route.ts      # Enhanced: player, squad, matches, treasury
├── session/route.ts      # NEW: Telegram initData bootstrap → miniApp token
├── match/submit/route.ts # Submit match for verification
├── match/verify/route.ts # Verify/dispute matches
├── top-up/route.ts       # TON treasury top-ups
└── ask/route.ts          # AI Staff queries
```

**Production Notes:**
- Match submission, verification consensus, Yellow fee handling, and post-verification rewards now run through shared services in `src/server/services/match-workflow.ts`.
- Telegram bot match logs and the Mini App now reuse the same core submission path instead of maintaining separate match-finalization logic.
- XP summaries in the Mini App are real data from `XPGain` records; they appear when verified matches have attached `PlayerMatchStats` (seeded automatically by the workflow).
- UI now includes Trust Scores, Consensus Progress, and Technical Verification Logs mirroring the core web components.
- Mini App now bootstraps sessions directly from Telegram `initData` (`/api/telegram/mini-app/session`) and no longer requires a pre-generated token to start.
- First-time Telegram users can create or join squads inside the Mini App via onboarding routes:
  - `GET /api/telegram/mini-app/onboarding/squads`
  - `POST /api/telegram/mini-app/onboarding/squad/create`
  - `POST /api/telegram/mini-app/onboarding/squad/join`

### ✅ Phase 3: AI Staff — COMPLETE

**Bot Commands Added:**
- `/ask Coach what formation should we use?`
- `/ask Scout analyze Red Lions`
- `/ask Physio who needs rest?`
- `/ask Analyst show my stats`

**Implementation:** Venice AI (primary) + OpenAI (fallback) with squad-aware context.

### ✅ Phase 4: Polish — COMPLETE

**Telegram-Native Features:**
- Haptic feedback on all interactions
- Dark theme matching Telegram
- Tab badges for pending items
- Pull-to-refresh support
- Loading/error states with retry
- Safe area handling for iOS

---

## API Endpoints

### Existing (Reuse)

| Endpoint | Purpose |
|----------|---------|
| `GET /api/telegram/mini-app/context` | Load squad context |
| `POST /api/telegram/mini-app/top-up` | Submit TON top-up |

### New (Required)

| Endpoint | Purpose |
|----------|---------|
| `GET /api/telegram/mini-app/squad` | Squad dashboard data |
| `GET /api/telegram/mini-app/matches` | Match center data |
| `POST /api/telegram/mini-app/match/submit` | Submit match |
| `POST /api/telegram/mini-app/match/verify` | Verify match |
| `GET /api/telegram/mini-app/profile` | Player profile data |
| `POST /api/telegram/mini-app/ask` | AI staff query |

**Alternative:** Use tRPC directly in Mini App (preferred for type safety).

---

## Hackathon Judging Alignment

| Criteria | Weight | How We Score |
|----------|--------|--------------|
| **Product Quality** | 25% | Full CM experience in Telegram, not just a wallet |
| **Technical Execution** | 25% | tRPC type safety, shared primitives, clean architecture |
| **Ecosystem Value** | 25% | TON payments for real-world football operations |
| **User Potential** | 25% | 1B+ Telegram users, grassroots football market |

### Demo Script (3 min)

1. **Open Telegram** → Start bot → Link to squad (30s)
2. **Squad Dashboard** → Show form, treasury, AI alert (30s)
3. **Log Match** → `/log 4-2 win vs Lions` → Confirm (30s)
4. **Verify Match** → Open Mini App → Verify pending (30s)
5. **XP Gains** → Show player profile, attribute increases (30s)
6. **TON Treasury** → Top-up with TON Connect (30s)

---

## File Structure

```
src/
├── app/
│   └── telegram/
│       └── mini-app/
│           ├── page.tsx                    # Entry point
│           └── layout.tsx                  # Telegram providers
├── components/
│   └── telegram/
│       ├── TelegramMiniAppProviders.tsx    # Existing
│       ├── TelegramMiniAppShell.tsx        # New: Tab navigation
│       ├── TelegramSquadDashboard.tsx      # New: Home tab
│       ├── TelegramMatchCenter.tsx         # New: Match tab
│       ├── TelegramPlayerProfile.tsx       # New: Profile tab
│       └── TelegramTreasuryMiniApp.tsx     # Existing: Treasury tab
server/
└── services/
    └── communication/
        ├── telegram.ts                     # Bot service (enhance)
        ├── telegram-match-parser.ts        # Existing
        └── platform-connections.ts         # Existing
```

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Mini App load time | < 2s |
| Match submission flow | < 30s |
| Verification flow | < 15s |
| TON top-up flow | < 45s |
| Bot command response | < 1s |

---

## Next Steps for Hackathon

### Remaining Tasks

1. [x] Create `TelegramMiniAppShell.tsx` with tab navigation
2. [x] Create `TelegramSquadDashboard.tsx` with form + insights
3. [x] Create `TelegramMatchCenter.tsx` with submit/verify (Enhanced with parity)
4. [x] Create `TelegramPlayerProfile.tsx` with attributes
5. [x] Add `/ask`, `/app`, `/profile` bot commands
6. [x] **Consolidate backend flow:** Seed stats, rewards, and XP distribute automatically
6. [ ] **Test full flow:** link → log → verify → XP → treasury
7. [ ] **Record demo video** for hackathon submission
8. [ ] **Deploy to production** with Telegram Bot webhook

### Demo Checklist

- [ ] Telegram bot is running and accessible
- [ ] Mini App URL is configured in BotFather
- [ ] TON Connect manifest is accessible
- [ ] Database has test squad with members
- [ ] AI providers (Venice/OpenAI) have valid API keys

### Bot Configuration (BotFather)

```
/setmenubutton
URL: https://your-domain.com/telegram/mini-app
Text: Open SportWarren

/setcommands
start - Link Telegram to your squad
app - Open the full SportWarren Mini App
log - Submit a match result
stats - View squad or player stats
fixtures - View upcoming matches
ask - Ask AI Staff a question
fee - Propose a match fee
treasury - Open treasury in Mini App
profile - View your player profile
help - Show all commands
```

---

## Files Reference

```
src/
├── app/
│   ├── telegram/mini-app/page.tsx         # Mini App entry point
│   └── api/telegram/mini-app/
│       ├── context/route.ts               # Full CM context
│       ├── match/submit/route.ts          # Match submission
│       ├── match/verify/route.ts          # Match verification
│       ├── top-up/route.ts                # TON top-ups
│       └── ask/route.ts                   # AI Staff queries
├── components/telegram/
│   ├── TelegramMiniAppShell.tsx           # Shell with 4 tabs
│   ├── TelegramSquadDashboard.tsx         # Squad tab
│   ├── TelegramMatchCenter.tsx            # Match tab
│   ├── TelegramPlayerProfile.tsx          # Profile tab
│   ├── TelegramTreasuryTab.tsx            # Treasury tab
│   └── index.ts                           # Exports
server/
└── services/communication/
    ├── telegram.ts                        # Bot service (enhanced)
    └── telegram-mini-app.ts               # Context service (enhanced)
```

---

**See Also:** [CORE.md](./CORE.md) | [BUILD.md](./BUILD.md)
