# SportWarren Features

**The Parallel Season** — Your real Sunday league season and your SportWarren season run simultaneously. Real matches drive the game.

**Last Updated:** March 2026

---

## 1. Match Verification ✅

### Real-World Capture
- **Voice logging:** Dictate match events as they happen
- **Photo capture:** Goal celebrations, lineups, scoreboards
- **GPS + timestamp:** Automatic location and time verification
- **Consensus confirmation:** Both teams submit results independently
- **Chainlink oracles:** External data validation for credibility

### Verification Tiers
| Tier | Method | Trust Score |
|------|--------|-------------|
| Bronze | Self-reported | Low |
| Silver | Both teams confirm | Medium |
| Gold | Both teams + photo/voice | High |
| Platinum | Both teams + Chainlink oracle | Maximum |
| Diamond | Full verification + witness | Absolute |

### On-Chain Result
- Match hash stored on Algorand (fast, cheap)
- Disputed results escalate to community arbitration
- False reporting = reputation penalty + stake slashed

**Status:** ✅ Complete (Frontend + Backend + Database + Algorand Blockchain)  
**Infrastructure:** Algorand Testnet (App ID: 756630713), Chainlink Oracles (Simulated)

---

## 2. Player Attributes ✅

### FIFA-Style Attribute System
- **6 Core Stats:** Shooting, Passing, Defending, Pace, Stamina, Physical.
- **Rating:** 0-99 (FIFA-style) with color-coded tiers.
- **XP Progression:** quadratic curve based on verified match events.
- **Level-Up UI:** Immersive framer-motion animations and celebrations.
- **On-Chain Sync:** Attribute progression synced to Algorand for portable reputation.

**Status:** ✅ Complete (Frontend + Backend + Database + On-Chain Sync)

---

## 3. Squad Management & DAO ✅

### Your Real Team, In-Game
- **Roster:** Manage teammates, roles (Captain, Player), and positions.
- **Tactics:** 10+ formations and custom play styles (Possession, Counter, etc).
- **Democratic DAO:** Collective voting on squad decisions.
- **Challenges:** Squads vote to accept or reject match challenges from rivals.
- **Treasury:** Manage squad funds for agent hiring and transfers.

**Status:** ✅ Complete (Frontend + Backend + Database + Voting System)

---

## 4. The Office & Draft Engine ✅

### Interactive Command Center
- **Staff Room:** Conversational interface with the Agent, Scout, and Coach.
- **Functional Advisors:** Staff respond with real-time squad data (Treasury balance, Formation, Morale).
- **Draft Engine:** Discover and sign local academy prospects to your squad.
- **Economic Impact:** Signing players deducts from the Squad Treasury and records a transaction.
- **Match Engine Sync:** Newly signed players are immediately injected into the match simulation.

**Status:** ✅ Complete (Frontend + Backend + Database + AI Logic)

---

## 5. Training Center & Fitness Agent ✅

### Real-World Training Sync
- **Activity Sync:** Log runs, gym sessions, and HIIT (ready for Strava integration).
- **Sharpness Mechanic:** Physical activity maintains a "Sharpness" percentage.
- **Attribute XP:** Training sessions provide XP boosts to Stamina and Pace.
- **Schedule Agnostic:** Weekly goals adjust based on the squad's preferred match day.

**Status:** ✅ Complete (Frontend + Backend + Database + Logic)

---

## 6. Matchmaking & Territory ✅

### Phygital Discovery
- **Nearby Rivals:** Discover squads within your GPS radius.
- **Match Challenges:** Proposed matches trigger squad governance votes.
- **Territory Control:** Claim "Home Turf" dominance at real-world pitches.
- **King of the Hill:** Real matches determine pitch ownership and prestige.

**Status:** ✅ Complete (Frontend + Backend + Database + GPS Logic)

---

## 7. Lens Social Graph ✅

### Web3 Identity & Engagement
- **Login with Lens:** Sign-in with Lens (SIWL) on the Base network.
- **Athlete Profiles:** Link your SportWarren stats to your decentralized identity.
- **Highlight Sharing:** Post "Pro-Style" highlight cards directly to Lens feed.
- **Verified Credentials:** Decentralized proof of Sunday league legendary status.

**Status:** ✅ Complete (Context + Service + Base Integration)

---

## 8. AI Agents (Kite AI) ✅

**Powered by Kite AI Infrastructure:**
- **Coach Kite:** Conversational tactical advice based on form and attributes.
- **Fitness Agent:** Activity sync and physical condition monitoring.
- **Reputation:** Agents use Kite Agent Passports for verified identity.

**Status:** ✅ Active (via OpenAI + Kite Passport Schema)

---

## Feature Status Summary

| Feature | Frontend | Backend | Database | Overall |
|---------|----------|---------|----------|---------|
| Match Verification | ✅ | ✅ | ✅ | ✅ 100% |
| Player Attributes | ✅ | ✅ | ✅ | ✅ 100% |
| Squad Management | ✅ | ✅ | ✅ | ✅ 100% |
| Rivalries | ✅ | ✅ | ✅ | ✅ 100% |
| Training Center | ✅ | ✅ | ✅ | ✅ 100% |
| AI Agents | ✅ | ✅ | ✅ | ✅ 100% |
| Viral Mechanics | ✅ | ✅ | ✅ | ✅ 100% |
| Office / Market | ✅ | ✅ | ✅ | ✅ 100% |
| Blockchain | ✅ | ✅ | ✅ | ✅ 90% |

**Legend:** ✅ Complete | 🟡 Partial | 🔴 Not Started

---

**See Also:** [Architecture](./ARCHITECTURE.md) | [Roadmap](./ROADMAP.md) | [Development](./DEVELOPMENT.md)
