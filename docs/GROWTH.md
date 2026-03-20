# SportWarren Growth & Roadmap

**Development Phases + Growth Strategy + Hackathon Demo**

---

## Roadmap Overview

**Progress:** 99% Complete (March 2026)

---

## Phase 1: Core Loop (Q1-Q2 2026) ✅ 100% Complete

**Goal:** Working parallel season — real matches drive game state

### Match Verification ✅
- Voice + photo capture during matches
- Consensus verification (both teams confirm)
- GPS + timestamp anti-fraud
- Chainlink weather + location oracles
- Dispute resolution with witness/arbiter
- On-chain storage (Algorand - App ID: 756828208)

### Player Attributes ✅
- 6 core stats (shooting, passing, defending, pace, stamina, physical)
- XP system tied to verified match data
- Form rating (last 5 matches)
- Soulbound reputation tokens

### Squad Management ✅
- Create squad, invite teammates
- Democratic DAO (captain, voting)
- Squad chemistry system
- Match history dashboard

### Championship Manager Layer ✅
- Tactics setup for next match
- Basic scout reports
- Formation recommendations
- Squad rotation tools

**Deliverables:** Users can verify matches, earn attributes, manage squads via collective voting, set tactics, and secure records on-chain.

---

## Phase 2: Agents & Economy (Q2-Q3 2026) 🟢 99% Complete

**Goal:** AI agents + treasury make the game strategic

### Multi-Chain Integration ✅
- Hardhat setup (Fuji & Kite Testnet)
- UUPS Upgradeable Smart Contracts
- SquadDAO on Avalanche Fuji
- Agent Escrow on Kite AI Testnet

### AI Agents ✅
- Kite AI agent passport registration
- Squad Manager / Coach (tactical insights)
- Fitness Agent (activity sync)
- Agentic Economic Settlement
- Staff Room (5 agents, dialog-first, live data)
- Cross-staff context sharing (AgentContext)
- On-chain approval gates (Yellow + Lens)
- Notification/event feed (EventFeed)

### Economy ✅
- Match fees → treasury (database)
- Facility upgrades
- Transfer market (Draft Engine)
- Kit customization (planned)

**Deliverables:** Core 3-chain structure live. AI agents registered with passports, economic settlement contracts deployed, interactive Staff Office functional.

---

## Phase 3: Viral Features (Q3 2026) ✅ 90% Complete

**Goal:** Make it shareable, discoverable, addictive

### Rivalries ✅
- Derby detection (3+ matches vs same team)
- Rivalry history tracking
- Derby XP bonuses

### Discovery ✅
- Local leaderboards
- Nearby squads finder (GPS)
- Match challenges (Squad Vote)
- Territory control (pitch dominance)

### Social ✅
- Shareable highlight cards
- Lens Protocol v3 integration
- Post highlights to Lens feed
- Season stats infographics (planned)
- Trophy cabinet (planned)

**Deliverables:** Nearby discovery, matchmaking, territory control, and Lens social sharing all live.

---

## Growth Funnel (Activation → Conversion → Retention → Viral)

### Objective
Configure the first user journey so every early action supports one of four outcomes:

1. **Activation:** Submit first match and see XP impact
2. **Viral Trigger:** Share verification link with opponent
3. **Retention:** Connect one messaging channel for weekly reminders
4. **Conversion:** Connect identity/wallet to persist progression

### Core Growth Events

| Event | Stage |
|-------|-------|
| `first_match_submitted` | Activation |
| `opponent_verification_invite_shared` | Viral |
| `channel_connected` | Retention |
| `identity_connected` | Conversion |
| `verification_queue_reviewed` | Retention |

### UI Strategy
- Dashboard checklist sequenced in funnel order
- Match Center shows "Season Kickoff Path" card with next-step CTA
- Invite sharing anchored to real match IDs
- Wallet/channel prompts appear after value moments, not as first action

### Success Metrics
- Time to first submitted match
- Share rate of verification invites
- Channel connection rate after first match
- Identity connection rate after channel connection
- 7-day return rate with at least one verification queue review

---

## Chainlink CRE Hackathon Demo

### The Product: CRE-Powered Sports Infrastructure

**SportWarren is building the infrastructure layer for amateur sports using Chainlink CRE.** We start with football match verification, then expand through a clear roadmap:

| Phase | Feature | CRE Integration | Impact |
|-------|---------|-----------------|--------|
| **Phase 1 (Now)** | Match Verification | Weather + Location oracles → Trust Score | Prevents captain disputes |
| **Phase 2** | Player Identity | WorldID + Fitness Tracker Oracles | Prevents ringers, verifies training |
| **Phase 3** | League Governance | Chainlink Automation + Functions | Auto-scheduling, dispute arbitration |
| **Phase 4** | Multi-Sport | Sport-specific oracles per sport | Rugby, cricket, basketball |

**Why Sports?**
- **$100B amateur sports market** - No official records, rampant fraud
- **Clear CRE fit** - Real-world events need verifiable data
- **Network effects** - Players, teams, leagues all on one platform
- **Expandable** - Same pattern works for every sport

---

### Demo Quick Start

#### 1. Seed Demo Data (Recommended)
```bash
npx tsx scripts/seed-demo-matches.ts
```

Creates:
- ✅ **Stamford Bridge** match - 100% confidence (stadium)
- ⚠️ **Burgess Park** match - 70% confidence (park)
- ✅ **Wembley Stadium** match - 100% confidence (iconic venue)

#### 2. Start Development Server
```bash
npm run dev
```
Navigate to: **http://localhost:3000/match**

#### 3. Terminal Demo (Optional)
```bash
npx tsx scripts/demo-cre-workflow.ts
```

---

### Demo Recording Guide (3 min)

| Time | Scene | Content |
|------|-------|---------|
| 0:00-0:20 | Problem | Show Match Center, explain "Phygital Trust Gap" |
| 0:20-0:40 | Submission | Submit match with GPS (Stamford Bridge) |
| 0:40-1:10 | CRE Workflow | Watch Technical Commentary panel animate |
| 1:10-1:40 | Data Deep Dive | Expand "CRE Verification Data" section |
| 1:40-2:00 | Architecture | Scroll to CRE Workflow Diagram |
| 2:00-2:20 | Disputed Match | Navigate to Burgess Park (70% confidence) |
| 2:20-2:40 | Terminal Demo | Run `demo-cre-workflow.ts` |
| 2:40-3:00 | Closing | XP summary, GitHub repo, end card |

---

### CRE Workflow Implementation

**Core Files:**
- `server/services/blockchain/cre/match-verification.ts` - Core CRE workflow
- `server/services/blockchain/chainlink.ts` - Chainlink service integration
- `src/components/match/MatchConsensus.tsx` - Enhanced with CRE data display
- `src/components/match/CREWorkflowDiagram.tsx` - Visual architecture diagram

**Demo Scripts:**
- `scripts/seed-demo-matches.ts` - Populate test matches
- `scripts/demo-cre-workflow.ts` - Terminal demo with colors
- `scripts/test-chainlink.ts` - Basic Chainlink integration test

---

### CRE Technical Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Chainlink CRE Workflow                    │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │   Weather    │  │   Location   │  │    Inference     │  │
│  │   (OWM API)  │  │  (GMaps/OSM) │  │   (Venice AI)    │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘  │
│         │                  │                   │            │
│         └──────────────────┼───────────────────┘            │
│                            ▼                                │
│              ┌─────────────────────────┐                    │
│              │   Weighted Consensus    │                    │
│              │   (60% Loc + 40% Wx)    │                    │
│              └───────────┬─────────────┘                    │
│                          │                                  │
│                          ▼                                  │
│              ┌─────────────────────────┐                    │
│              │   Confidence Score      │                    │
│              │   (Threshold: 60%)      │                    │
│              └───────────┬─────────────┘                    │
│                          │                                  │
│                          ▼                                  │
│              ┌─────────────────────────┐                    │
│              │   Algorand Settlement   │                    │
│              │   (workflowId stored)   │                    │
│              └─────────────────────────┘                    │
└─────────────────────────────────────────────────────────────┘
```

**Workflow Traceability:** Every verification generates unique `workflowId` (e.g., `cre_mw_pibhj`) persisted in PostgreSQL + cross-referenced with Algorand tx logs.

---

### Demo Match Scenarios

**Locations:** Stamford Bridge (100%), Burgess Park (70%), Wembley (100%), Old Trafford (100%), Random Field (40%).

### Hackathon Submission Checklist

- [ ] Demo Video (2-3 min)
- [ ] GitHub Repo with CRE code highlighted
- [ ] Live Demo deployed
- [ ] Devpost submission
- [ ] Test scripts working

---

## Recent Progress

**March 2026 - Agentic Platform:** Cross-staff Context (AgentContext), On-chain Approval Gates, Notification Feed, Performance (12 components code-split), Test Coverage (20 tests).

**March 2026 - Governance & Training:** Squad DAO, Fitness Agent, Territory Control, Lens Social, Matchmaking, Staff Office, Draft Engine, Onboarding wizard, Production hardening.

---

## Recommended Launch Path

**Week 1:** Hard blockers ✅ | **Week 2:** Closed Beta (10-20 players) | **Week 3:** Feedback + Sentry | **Week 4:** Soft launch

> **Tip:** Watch 5 real Sunday League players go through onboarding. Their behaviour tells you what to fix.

---

**See Also:** [CORE.md](./CORE.md) | [BUILD.md](./BUILD.md) | [CONTRACTS.md](./CONTRACTS.md)
