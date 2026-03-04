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

### Chainlink Oracle Integration
**Weather Oracle:** Confirms weather conditions at match time/location  
**Location Oracle:** Validates GPS coordinates authenticity  
**Sports Data Oracle (Future):** Integration with local league APIs

### On-Chain Result
- Match hash stored on Algorand (fast, cheap)
- Disputed results escalate to community arbitration
- False reporting = reputation penalty + stake slashed

**Status:** ✅ Complete (Frontend + Backend + Database)  
**Pending:** Blockchain deployment, Chainlink integration

---

## 2. Player Attributes ✅

### FIFA-Style Attribute System

#### Core Stats (Evolve Through Play)
| Attribute | Real-World Driver | Game Impact |
|-----------|------------------|-------------|
| Shooting | Goals scored | Finishing quality in sims |
| Passing | Assists | Build-up play effectiveness |
| Defending | Clean sheets, tackles | Defensive solidity |
| Pace | Sprint speed, distance | Counter-attack threat |
| Stamina | Minutes played, fitness | Late-game performance |
| Physical | Duels won, aerials | Strength in challenges |

#### Goalkeeper Attributes
| Attribute | Description |
|-----------|-------------|
| Diving | Shot-stopping ability |
| Handling | Catching and holding |
| Kicking | Distribution accuracy |
| Reflexes | Reaction speed |
| Speed | Rushing out |
| Positioning | Angle play |

### Rating System
- **Scale:** 0-99 (FIFA-style)
- **Color Coding:** 90+ purple (elite), 80+ green (excellent), 70+ yellow (good), 60+ orange (average), <60 red (poor)
- **Position Detection:** Auto-detects best position from top attributes

### XP Progression
- **Quadratic Curve:** XP required increases per level
- **Position-Based XP Distribution:** Strikers get more shooting XP from goals
- **Level-Up Notifications:** Animated celebrations
- **Season XP Tracking:** Separate career and seasonal totals

### Form System
- **Calculation:** Last 5 match ratings determine form
- **Visual Indicators:** FIFA-style arrows (↑↑ +5, ↑ +3, → 0, ↓ -3, ↓↓ -5)
- **Form Trend Detection:** Improving, declining, or stable
- **Team Comparison:** Compare your form to squad average

### User Flow Example
```
1. Match Completed: Marcus scores 2 goals, gets 8.5 rating
2. XP Calculation: +125 XP to Shooting, +85 to Passing
3. Level Up: Shooting increases from 87 → 88
4. Form Update: Form arrow shows ↑ (Good form)
5. Notification: Popup shows "+385 XP Earned!"
6. Profile Updated: New rating visible on player card
```

**Status:** ✅ Complete (Frontend + Backend + Database)

---

## 3. Squad Management ✅

### Your Real Team, In-Game
- All your actual teammates with fictional club name
- Positions, formations, tactics
- Chemistry based on real attendance and social activity

### Tactics System
- **10 Formations:** 4-4-2, 4-3-3, 4-2-3-1, 3-5-2, 5-3-2, 4-5-1, 4-1-4-1, 3-4-3, 4-3-1-2, 5-4-1
- **Visual Pitch:** Player positions displayed
- **Play Styles:** Balanced, Possession, Direct, Counter, High Press, Low Block
- **Team Instructions:**
  - Width: Narrow, Normal, Wide
  - Tempo: Slow, Normal, Fast
  - Passing: Short, Mixed, Long
  - Pressing: Low, Medium, High
  - Defensive Line: Deep, Normal, High
- **Set Pieces:** Corner kicks, free kicks, penalties

### Transfer Market
- **Browse Players:** Search by position, filter by rating
- **Offer Types:** Permanent transfers and loans (1-24 months)
- **Offer Management:** Create, accept, reject, cancel offers
- **Expiration:** 7-day default expiry
- **Treasury Integration:** Auto-deduction on accepted offers

### Treasury Management
- **Balance Tracking:** Real-time ALGO balance
- **Income/Expense Categories:**
  - Match fees, sponsorships, tournament prizes
  - Transfer fees, wages, facility upgrades
- **Budget Allocations:** Weekly wages, transfer budget, facilities
- **Transaction History:** Full audit trail with verification status
- **Permissions:**
  - Deposits: Any squad member
  - Withdrawals: Captain/vice-captain only

### DAO Governance
| Decision | Voting Power |
|----------|-------------|
| Tactics for next match | Captain + vice-captain |
| Transfer offers | Squad majority |
| Treasury spending | Squad majority |
| Kit design | Open vote |

### Squad Chemistry
- Regular attendance = chemistry bonus
- WhatsApp/Telegram activity = morale boost
- Social events organized = "club culture" trait
- New player integration = chemistry penalty (temporary)

**Status:** ✅ Complete (Frontend + Backend + Database)  
**tRPC Endpoints:** 9 endpoints (getTactics, saveTactics, getTreasury, depositToTreasury, withdrawFromTreasury, getTransferOffers, createTransferOffer, respondToTransferOffer, cancelTransferOffer)

---

## 4. Rivalries ✅

### Derby Activation
- Play same team 3+ times = rivalry unlocked
- Real banter drives in-game trash talk
- Rematch scheduling = anticipation XP boost
- Cross-season rivalry history tracked

### Rivalry Intensity
- **Scale:** 1-10 flames
- **Factors:** Match frequency, competitiveness, historical results
- **Visual Indicators:** Flame icons, color coding

### Rivalry Bonuses
| Achievement | Reward |
|-------------|--------|
| Win derby | Double XP for all players (+50%) |
| Derby hat-trick | Rare achievement minted |
| Clean sheet in derby | Defensive reputation bonus (+500) |
| Fan engagement | Fan engagement bonus (+1000) |

### Head-to-Head Stats
- Total matches, wins, draws, losses
- Goals for/against
- Current streak
- Memorable matches highlighted

**Status:** ✅ Complete (Frontend + Backend)

---

## 5. Championship Manager Layer 🟡

### Tactics
- Set formation for upcoming real matches
- Agent recommends based on opponent scout report
- Squad votes on approach
- Post-match: tactic effectiveness analysis

### Scouting
- Browse local players by reputation
- View attributes, recent form, heat maps
- Identify weaknesses in upcoming opponents
- Make transfer offers (treasury-backed)

### Finances
- Match fees → treasury
- Tournament winnings → treasury
- Facility upgrades → training bonuses
- Kit customization

**Status:** 🟡 Partial (Tactics complete, scouting basic)

---

## 6. AI Agents (Avalanche Exclusive) 🔴

**Powered by Kite AI Infrastructure:**

All SportWarren agents are registered with Kite AI passports, enabling:
- Cryptographic agent identity verification
- Cross-platform agent portability
- Stablecoin-based agent payments
- Access to Kite's 1.7B+ agent interactions network

### Squad Manager Agent
- Analyzes your real results vs tactics
- Suggests formation changes
- Manages squad rotation
- *"Your 4-4-2 works at home but not away — try 4-2-3-1"*
- **Kite Identity:** Verified agent passport with reputation score

### Scout Agent
- Watches match logs + AI vision
- Identifies squad weaknesses
- Recommends transfer targets
- Opponent analysis before derbies
- **Kite Identity:** Accesses Kite Agent Store for enhanced scouting data

### Fitness Agent
- Syncs with Strava/Apple Health (optional)
- Manages player condition
- Suggests training focus
- *"Marcus hasn't trained — stamina penalty this weekend"*
- **Kite Payments:** Micro-payments for premium health integrations

### Social Agent
- Monitors squad chat activity
- Suggests socials when morale drops
- Organizes end-of-season events
- Tracks team cohesion metrics
- **Kite Marketplace:** Discoverable in Kite Agent Store

**Agent Economics:**
- Agents earn stablecoins for successful recommendations
- Users pay micro-fees for premium agent features
- Agent reputation tracked via Kite passports
- Cross-squad agent sharing via Kite marketplace

**Status:** 🔴 Not Started (Schema only)

---

## 7. Season Structure

### Real Season (10-20 matches)
- Local league fixtures
- Cup runs
- Friendlies arranged via app
- All verified on-chain

### SportWarren Season (Parallel)
- Same fixtures drive narrative
- Virtual "what if" scenarios
- End-of-season awards
- Promotion/relegation in virtual leagues

### Crossover Events
- Real cup final → Special in-game tournament
- Real injury → Player unavailable in-game
- New player joins → Scout them in-game
- End of real season → Full stats retrospective

---

## 8. Viral Mechanics 🟡

### Shareable Moments
- Match highlight cards (auto-generated)
- Attribute progression: "Shooting 67 → 71!"
- Derby victory timeline
- Season stats infographic

### Local Discovery
- "Best striker in Hackney Marshes" leaderboard
- Nearby squads looking for friendlies
- Territory control (win at rival's ground)
- Local tournament announcements

### Social Proof
- Squad profile with verified match history
- Individual player cards with attributes
- Rivalry records
- Trophy cabinet

**Status:** 🟡 Partial (Rivalries complete, sharing not started)

---

## 9. Blockchain Integration

### Algorand (Primary)
- Match verification (fast, cheap)
- Reputation tokens (soulbound)
- Squad registry

### Avalanche (Premium)
- AI agents (ERC-8004)
- Treasury management (DeFi)
- Advanced governance

### Both Chains
- Cross-squad tournaments
- Shared leaderboards
- Bridgeable reputation

---

## 10. Communication

- **WhatsApp/Telegram bots:** Match reminders, results, stats
- **XMTP:** Web3 native messaging between squads
- **In-app:** Squad chat, transfer negotiations, banter

---

## Feature Status Summary

| Feature | Frontend | Backend | Database | Overall |
|---------|----------|---------|----------|---------|
| Match Verification | ✅ | ✅ | ✅ | 🟡 90% |
| Player Attributes | ✅ | ✅ | ✅ | ✅ 100% |
| Squad Management | ✅ | ✅ | ✅ | ✅ 100% |
| Rivalries | ✅ | ✅ | ✅ | ✅ 100% |
| Championship Manager | 🟡 | 🟡 | ✅ | 🟡 70% |
| AI Agents | 🔴 | 🔴 | 🟡 | 🔴 10% |
| Viral Mechanics | 🟡 | 🔴 | ✅ | 🟡 50% |
| Blockchain | 🔴 | 🟡 | ✅ | 🔴 40% |

**Legend:** ✅ Complete | 🟡 Partial | 🔴 Not Started

---

**See Also:** [Architecture](./ARCHITECTURE.md) | [Roadmap](./ROADMAP.md) | [Development](./DEVELOPMENT.md)
