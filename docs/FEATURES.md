# SportWarren Features

**The Parallel Season** — Your real Sunday league season and your SportWarren season run simultaneously. Real matches drive the game.

**Last Updated:** March 11, 2026

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
- **Staff Room:** Full agentic backroom with five staff members — Agent, Scout, Coach Kite, Physio, and Commercial Lead.
- **Dialog-First Consultation:** Every action triggers a staff dossier/analysis first; inline ✅/❌ confirm buttons gate any modal or commitment — no immediate blind actions.
- **Per-Staff Chat Persistence:** Each staff member maintains their own conversation history across the session; switching staff preserves all prior exchanges.
- **Consumed Action Buttons:** Inline confirm/cancel buttons grey out and disable after first click — no double-firing, clear decision record.
- **Live Squad Data:** Contract dossiers, morale checks, and fitness reports derive from real `useSquadDetails` data (wage from level/matches, reputation tier, market valuation) with graceful fallbacks.
- **Draft Engine:** Discover and sign local academy prospects to your squad.
- **Economic Impact:** Signing players deducts from the Squad Treasury and records a transaction.
- **Match Engine Sync:** Newly signed players are immediately injected into the match simulation.
- **Squad Creation Gate:** New connected users without a squad are routed through a 3-step creation wizard (name → archetype → confirm) before accessing the dashboard.
- **Mobile Responsive:** Staff sidebar scrolls horizontally on small screens; Contract modal anchors to bottom sheet on mobile with touch-friendly controls.
- **Cross-Staff Context Sharing:** `AgentContext` (React Context + useReducer) — when Scout confirms a trial, Agent proactively surfaces contract terms; Physio injury flags Coach's training plan; Comms deal triggers Agent budget update.
- **On-Chain Approval Gates:** Scout trial queues a Yellow payment action; Comms deal queues a Lens post — both surface a ⛓️ approval banner with ✅ Sign & Execute / ❌ Cancel before anything executes.
- **Notification/Event Feed:** `EventFeed` widget renders persistent backroom alerts outside the Staff Room — per-category filters (Agent/Scout/Coach/Physio/Comms), unread badge, mark-all-read.
- **LLM Free-text Chat:** Venice AI (`llama-3.3-70b`) as default provider with OpenAI fallback; squad context (balance, members, formation) injected into system prompt; all five staff members have distinct personas.
- **Decision Memory:** `memory` tRPC router logs every ✅/❌ inline action to `AiMemory`; recent decisions injected into LLM system prompt so agents reference past manager choices.
- **Proactive Alerts:** `useAgentAlerts` hook fires rule-based alerts (contract expiry, low budget, squad depth, injury risk, sponsorship window) into staff chat histories on data load.
- **Performance:** 12 heavy dashboard components code-split via `next/dynamic` (ssr:false) for faster initial load.
- **Test Coverage:** Vitest suite — 20 tests covering `AgentContext` reducer (all actions, isolation, provider guard) and `useAgentAlerts` rule engine (all thresholds, empty states, memoisation).

**Status:** ✅ Complete (Frontend + Backend + Database + Agentic Dialog Flow + Live Data + Mobile + Cross-staff Context + On-chain Gates + Tests)

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
- **Login with Lens:** Sign-in with Lens (SIWL) on Lens Chain.
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

## 9. Managerial Simulation & Economics ⭐ NEW

### Shadow Match Engine
- **Monte Carlo Simulations:** Run 1,000+ iterations to predict IRL match outcomes.
- **Tactical Modifiers:** Formation and playstyle choices (e.g., High Press, Low Block) directly impact win probability.
- **Pre-match Insights:** AI-driven tactical briefings identifying opponent weaknesses and squad fatigue.

### Player Valuation Engine
- **Fair Market Value:** Data-driven valuations in USDC based on average rating, current form, and potential.
- **Market Dynamics:** Values increase based on "Interest" (active transfer offers) and performance momentum.
- **Tiered Classification:** Players classified as Prospect, Regular, Star, or Elite based on attributes.

### Fitness & Sharpness System
- **Match Sharpness:** A dynamic attribute that decays daily without physical activity.
- **Performance Modifiers:** Sharpness directly affects in-game simulation performance (+10% to -25% attribute modifiers).
- **Activity-Based Recovery:** Specific gains from Runs, HIIT, and Field Training sessions.

### Automated DAO Treasury Loop
- **Autonomous Payouts:** Match verification automatically triggers prize money deposits to the Squad Treasury.
- **Performance Bonuses:** Automated "Match Appearance Fees" and "Goal Bonuses" distributed to players' ledgers.

**Status:** ✅ Complete (Frontend + Backend + Simulation Logic + Economic Automation)

---

## 10. Communication Hub & Platform Connections ✅

### Unified Messaging Integration
- **Multi-Platform Support:** Connect Telegram, WhatsApp, and XMTP for squad communications.
- **Connection Status:** Real-time badges showing which platforms are linked.
- **One-Click Linking:** Streamlined OAuth flows for each platform.
- **Share to Chat:** Share match results directly to connected squad chats.

### Settings Page
- **Tabbed Interface:** Organized into Profile, Connections, Notifications, and Wallet tabs.
- **Profile Management:** Edit display name, position, and avatar.
- **Notification Preferences:** Granular control over match reminders, squad alerts, and rivalry notifications.
- **Wallet Management:** View connected wallet, copy address, or disconnect.

**Status:** ✅ Complete (Frontend UI — Backend bridges exist, OAuth flows pending deployment)

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
| Managerial Sim | ✅ | ✅ | ✅ | ✅ 100% |
| Viral Mechanics | ✅ | ✅ | ✅ | ✅ 100% |
| Office / Market | ✅ | ✅ | ✅ | ✅ 100% |
| Blockchain | ✅ | ✅ | ✅ | ✅ 90% |
| Platform Connections | ✅ | 🟡 | 🟡 | 🟡 60% |

**Legend:** ✅ Complete | 🟡 Partial | 🔴 Not Started

---

**See Also:** [Architecture](./ARCHITECTURE.md) | [Roadmap](./ROADMAP.md) | [Development](./DEVELOPMENT.md)
