# SportWarren Roadmap

**Phygital Football Platform | Real World + Championship Manager**

**Last Updated:** March 2026  
**Progress:** 78% Complete

---

## Phase 1: Core Loop (Q1-Q2 2026) | 10-12 weeks

**Goal:** Working parallel season — real matches drive game state

### Match Verification
- [x] Voice + photo capture during matches
- [x] Consensus verification (both teams confirm)
- [x] GPS + timestamp anti-fraud
- [ ] Chainlink weather oracle integration
- [ ] Chainlink location oracle integration
- [x] Dispute resolution with witness/arbiter
- [ ] On-chain storage (Algorand)

### Player Attributes
- [x] 6 core stats (shooting, passing, defending, pace, stamina, physical)
- [x] XP system tied to verified match data
- [x] Form rating (last 5 matches)
- [ ] Soulbound reputation tokens

### Squad Management
- [x] Create squad, invite teammates
- [x] Basic DAO (captain, voting)
- [x] Squad chemistry system
- [x] Match history dashboard

### Championship Manager Layer
- [x] Tactics setup for next match
- [ ] Basic scout reports
- [x] Formation recommendations
- [x] Squad rotation tools

**Deliverables:** ✅ Users can verify matches, earn attributes, manage squads, set tactics

**Status:** 🟡 **90% Complete** - Backend + Frontend done, blockchain integration pending

---

## Phase 2: Agents & Economy (Q2-Q3 2026) | 10-12 weeks

**Goal:** AI agents + treasury make the game strategic

### Avalanche Integration
- [ ] Foundry setup, Solidity contracts
- [ ] SquadDAO with governance
- [x] Treasury management (database layer)
- [ ] RainbowKit wallet connection

### AI Agents (Avalanche Exclusive)
- [ ] Kite AI agent passport registration
- [ ] Squad Manager agent (tactics, rotation)
- [ ] Scout agent (opponent analysis)
- [ ] Fitness agent (training suggestions)
- [ ] Social agent (morale management)
- [ ] Kite stablecoin payment rails
- [ ] Agent marketplace integration

### Economy
- [x] Match fees → treasury (database)
- [x] Facility upgrades (database)
- [x] Transfer market (backend + frontend)
- [ ] Kit customization

**Deliverables:** 🟡 Treasury + transfers complete (database layer). AI agents + blockchain pending.

**Status:** 🟡 **40% Complete** - Economy layer done, AI agents not started

---

## Phase 3: Viral Features (Q3 2026) | 8-10 weeks

**Goal:** Make it shareable, discoverable, addictive

### Rivalries
- [x] Derby detection (3+ matches vs same team)
- [x] Rivalry history tracking
- [x] Derby XP bonuses
- [ ] Banter system

### Discovery
- [ ] Local leaderboards
- [ ] Nearby squads finder
- [ ] Friendly match arrangement
- [ ] Territory control (win at rival grounds)

### Social
- [ ] Shareable highlight cards
- [ ] Attribute progression posts
- [ ] Season stats infographics
- [ ] Trophy cabinet

**Deliverables:** 🟡 Rivalry tracker complete. Social sharing not started.

**Status:** 🟡 **50% Complete** - Rivalries done, social features pending

---

## Phase 4: Scale (Q4 2026) | 6-8 weeks

**Goal:** Cross-chain tournaments + advanced features

### Cross-Chain
- [ ] Bridge reputation between chains
- [ ] Cross-squad tournaments
- [ ] Unified leaderboards
- [ ] Chain-agnostic matchmaking

### Advanced
- [ ] AI vision for automatic stat extraction
- [ ] Health app integrations (Strava, Apple Health)
- [ ] Advanced scout reports with heat maps
- [ ] Full transfer market

**Deliverables:** 🔴 Not started

**Status:** 🔴 **0% Complete**

---

## Success Metrics

### Phase 1 (Core Loop)
- [ ] 100 squads created
- [ ] 500 matches verified
- [ ] 80% verification consensus rate
- [ ] 50+ Chainlink oracle verifications

### Phase 2 (Agents)
- [ ] 30% of users on Avalanche (agents)
- [ ] 50 squads with active treasury
- [ ] 10,000 AI agent interactions
- [ ] 100+ agents registered with Kite AI passports

### Phase 3 (Viral)
- [ ] 5,000 MAU
- [ ] 1,000 rivalry relationships
- [ ] 500 shared highlight cards/month
- [ ] 10+ agents listed in Kite Agent Store

### Phase 4 (Scale)
- [ ] 10,000 MAU
- [ ] 100 cross-chain tournaments
- [ ] 50,000 matches verified total
- [ ] 1,000+ Chainlink oracle verifications
- [ ] 500+ active Kite AI agents

---

## User Story: Marcus

> Marcus, 24, plays Sunday league in Manchester. His squad uses SportWarren.
>
> **Saturday:** His real match ends 3-2. He logs it, co-captain confirms. His 2 goals boost his shooting attribute from 67 to 71. The app generates a highlight card he shares.
>
> **Sunday:** His Scout Agent analyzes the opponent for next week — recommends 4-2-3-1 formation. The squad votes and approves.
>
> **Tuesday:** Fitness Agent notes he hasn't trained — suggests a run to regenerate stamina. He logs a 5k, stamina bonus unlocked.
>
> **Thursday:** Transfer offer comes in from a rival squad. DAO votes to reject. Squad chemistry rises.
>
> **Next Saturday:** Using the recommended formation, they win 2-0. Clean sheet bonus. Derby victory (it's their 4th match vs this team). Double XP.
>
> **End of season:** Marcus has 47 verified goals across 3 seasons. His reputation profile is portable. His squad won the local virtual league. Real trophies + virtual trophies.

---

## Risks & Mitigations

| Risk | Mitigation | Status |
|------|------------|--------|
| Verification gaming | Consensus + stake slashing + reputation penalties | 🟡 Partial |
| User confusion (dual-chain) | Clear feature tier messaging, start on one chain | ✅ Planned |
| AI agent over-promising | Start simple, expand capabilities gradually | ✅ Planned |
| Low engagement | Focus on rivalry + season narrative hooks | 🟡 Partial |
| **Frontend-backend gap** | **Full tRPC integration** | ✅ **Resolved** |

---

## Recent Progress

### March 2026 - Full Stack Integration ✅
- **Squad Management:** Fully integrated (frontend + backend + database)
- **tRPC Endpoints:** 9 new endpoints for tactics, treasury, transfers
- **Database:** 4 new models (SquadTactics, SquadTreasury, TreasuryTransaction, TransferOffer)
- **Hooks:** All squad hooks now use real API (no more mock data)
- **Build:** Passing with 19 routes

### Previous Milestones
- **Phase 3:** Player attributes system (FIFA-style ratings, XP, form)
- **Phase 4:** Squad management UI (tactics, transfers, treasury, rivalries)

---

**See Also:** [Architecture](./ARCHITECTURE.md) | [Features](./FEATURES.md) | [Development](./DEVELOPMENT.md) | [Phase 4 Summary](./PHASE4_SUMMARY.md)
