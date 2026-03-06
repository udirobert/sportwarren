# SportWarren Roadmap

**Phygital Football Platform | Real World + Championship Manager**

**Last Updated:** March 2026: **Progress:** 95% Complete

---

## Phase 1: Core Loop (Q1-Q2 2026) | 10-12 weeks

**Goal:** Working parallel season — real matches drive game state

### Match Verification
- [x] Voice + photo capture during matches
- [x] Consensus verification (both teams confirm)
- [x] GPS + timestamp anti-fraud
- [x] Chainlink weather oracle integration (Simulated)
- [x] Chainlink location oracle integration (Simulated)
- [x] Dispute resolution with witness/arbiter
- [x] On-chain storage (Algorand - App ID: 756630713)

### Player Attributes
- [x] 6 core stats (shooting, passing, defending, pace, stamina, physical)
- [x] XP system tied to verified match data
- [x] Form rating (last 5 matches)
- [x] Soulbound reputation tokens (Initial logic)

### Squad Management
- [x] Create squad, invite teammates
- [x] Basic DAO (captain, voting - NOW DEMOCRATIC)
- [x] Squad chemistry system
- [x] Match history dashboard

### Championship Manager Layer
- [x] Tactics setup for next match
- [x] Basic scout reports
- [x] Formation recommendations
- [x] Squad rotation tools

**Deliverables:** ✅ Users can verify matches, earn attributes, manage squads via collective voting, set tactics, and secure records on-chain.

**Status:** ✅ **100% Complete** - Full stack + Governance loop finalized

---

## Phase 2: Agents & Economy (Q2-Q3 2026) | 10-12 weeks

**Goal:** AI agents + treasury make the game strategic

### Multi-Chain Integration (Avalanche + Kite AI)
- [x] Hardhat setup (Fuji & Kite Testnet)
- [x] UUPS Upgradeable Smart Contracts (Governance & Escrow)
- [x] SquadDAO on Avalanche Fuji
- [x] Agent Escrow on Kite AI Testnet
- [ ] Unified Privy Multi-Chain connection

### AI Agents (Agent-Native Infrastructure via Kite AI)
- [x] Kite AI agent passport registration (Schema active)
- [x] Squad Manager / Coach (Tactical insights active)
- [x] Fitness Agent (Activity sync active)
- [x] Agentic Economic Settlement (Kite Chain) 🚀
- [ ] Live Agent Marketplace for Scouting/Social agents
- [ ] Continuous Attestations for "Match Proof" on Kite

### Economy
- [x] Match fees → treasury (database)
- [x] Facility upgrades (database)
- [x] Transfer market (Live via Draft Engine)
- [x] Staff Room / Office (Interactive Command Center)
- [ ] Kit customization

**Deliverables:** ✅ Core 3-Chain structure is live. AI agents are registered with passports, the economic settlement contracts are deployed, and the interactive Staff Office is functional.

**Status:** 🟢 **95% Complete** - Multi-chain infrastructure + Agentic economic settlement active. Transfer Market and Staff Office are functional. Finalizing frontend Unified Wallet connection.

---

## Phase 3: Viral Features (Q3 2026) | 8-10 weeks

**Goal:** Make it shareable, discoverable, addictive

### Rivalries
- [x] Derby detection (3+ matches vs same team)
- [x] Rivalry history tracking
- [x] Derby XP bonuses
- [ ] Banter system

### Discovery
- [x] Local leaderboards (Infrastructure ready)
- [x] Nearby squads finder (Live via GPS)
- [x] Match challenges (Live via Squad Vote)
- [x] Territory control (Live - pitch dominance)

### Social
- [x] Shareable highlight cards (Auto-generated with level-ups)
- [x] Lens Protocol v3 integration (Live on Base)
- [x] Post highlights to Lens feed
- [ ] Season stats infographics
- [ ] Trophy cabinet

**Deliverables:** ✅ Nearby discovery, matchmaking, territory control, and Lens social sharing are all live.

**Status:** ✅ **90% Complete** - Core viral loops and social graph active

---

## Recent Progress

### March 2026 - Governance & Training Expansion ✅
- **Squad DAO:** Implemented democratic voting for match challenges and squad decisions
- **Fitness Agent:** Launched the Training Center with real-world activity syncing (Sharpness/XP)
- **Territory Control:** Added "King of the Hill" mechanics for real-world pitch dominance
- **Lens Social:** Integrated Lens Protocol v3 on Base for decentralized athlete identity
- **Resilience:** Full TypeScript build passing with ES2020 BigInt support and SDK v3 compatibility
- **Matchmaking:** Automated challenge proposals tied directly to squad governance votes
- **Staff Office:** Launched the interactive Staff Room with functional budget and tactical advisors
- **Draft Engine:** Real-time prospect signing with squad treasury impact and DB persistence
- **Match Engine Sync:** Live squad data injection into the 2D match simulation engine

---

**See Also:** [Architecture](./ARCHITECTURE.md) | [Features](./FEATURES.md) | [Development](./DEVELOPMENT.md) | [Phase 4 Summary](./PHASE4_SUMMARY.md)
