# SportWarren Roadmap

**Phygital Football Platform | Real World + Championship Manager**

---

## Phase 1: Core Loop (Q1-Q2 2026) | 10-12 weeks

**Goal:** Working parallel season — real matches drive game state

### Match Verification
- [ ] Voice + photo capture during matches
- [ ] Consensus verification (both teams confirm)
- [ ] GPS + timestamp anti-fraud
- [ ] Dispute resolution with witness/arbiter
- [ ] On-chain storage (Algorand)

### Player Attributes
- [ ] 6 core stats (shooting, passing, defending, pace, stamina, physical)
- [ ] XP system tied to verified match data
- [ ] Form rating (last 5 matches)
- [ ] Soulbound reputation tokens

### Squad Management
- [ ] Create squad, invite teammates
- [ ] Basic DAO (captain, voting)
- [ ] Squad chemistry system
- [ ] Match history dashboard

### Championship Manager Layer
- [ ] Tactics setup for next match
- [ ] Basic scout reports
- [ ] Formation recommendations
- [ ] Squad rotation tools

**Deliverables:** Users can verify matches, earn attributes, manage squads, set tactics

---

## Phase 2: Agents & Economy (Q2-Q3 2026) | 10-12 weeks

**Goal:** AI agents + treasury make the game strategic

### Avalanche Integration
- [ ] Foundry setup, Solidity contracts
- [ ] SquadDAO with governance
- [ ] Treasury management
- [ ] RainbowKit wallet connection

### AI Agents (Avalanche Exclusive)
- [ ] Squad Manager agent (tactics, rotation)
- [ ] Scout agent (opponent analysis)
- [ ] Fitness agent (training suggestions)
- [ ] Social agent (morale management)

### Economy
- [ ] Match fees → treasury
- [ ] Facility upgrades
- [ ] Transfer market (basic)
- [ ] Kit customization

**Deliverables:** Avalanche users get AI agents + treasury. Algorand users get verification + reputation.

---

## Phase 3: Viral Features (Q3 2026) | 8-10 weeks

**Goal:** Make it shareable, discoverable, addictive

### Rivalries
- [ ] Derby detection (3+ matches vs same team)
- [ ] Rivalry history tracking
- [ ] Derby XP bonuses
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

**Deliverables:** Users share moments, discover local rivals, build season narratives

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

**Deliverables:** Power users bridge chains. Casual users stay on one. Everyone competes.

---

## Success Metrics

### Phase 1 (Core Loop)
- [ ] 100 squads created
- [ ] 500 matches verified
- [ ] 80% verification consensus rate

### Phase 2 (Agents)
- [ ] 30% of users on Avalanche (agents)
- [ ] 50 squads with active treasury
- [ ] 10,000 AI agent interactions

### Phase 3 (Viral)
- [ ] 5,000 MAU
- [ ] 1,000 rivalry relationships
- [ ] 500 shared highlight cards/month

### Phase 4 (Scale)
- [ ] 10,000 MAU
- [ ] 100 cross-chain tournaments
- [ ] 50,000 matches verified total

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

| Risk | Mitigation |
|------|------------|
| Verification gaming | Consensus + stake slashing + reputation penalties |
| User confusion (dual-chain) | Clear feature tier messaging, start on one chain |
| AI agent over-promising | Start simple, expand capabilities gradually |
| Low engagement | Focus on rivalry + season narrative hooks |

---

**See Also:** [Architecture](./ARCHITECTURE.md) | [Features](./FEATURES.md) | [Development](./DEVELOPMENT.md)
