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

## Core Loop: The Parallel Season

### Weekly Cycle

| Day | Real World | SportWarren Layer |
|-----|-----------|-------------------|
| Mon-Wed | Training, fitness | Stamina regen, training mini-games, agent analysis |
| Thu-Fri | Squad coordination | Tactics setup, scout reports, transfer offers |
| Sat/Sun | **MATCH DAY** | Live tracking, real-time input, verification |
| Mon | Rest, recover | Results finalized, XP/rewards distributed, form updates |

### Real World → Game Mechanics

| Real Action | Game Impact |
|-------------|-------------|
| Goals scored | Shooting attribute XP |
| Assists | Passing attribute XP |
| Clean sheets | Defending attribute XP |
| Distance run | Stamina/pace XP |
| Match difficulty | XP multiplier |
| Regular attendance | Squad chemistry bonus |
| Social activity | Team morale boost |
| 3+ matches vs same team | Derby activated (XP bonuses) |

### Game → Real World Incentives

| In-Game Signal | Drives Real Action |
|----------------|-------------------|
| Stamina low | "Go for a run to regenerate faster" |
| Chemistry down | "Organize a team social" |
| Scout recommends position change | "Try playing CAM this weekend" |
| Derby upcoming | "Schedule the rematch" |
| Agent suggests tactic | "Try 3-5-2 formation" |

---

## Dual-Chain as Feature Tiers

Both chains give you the full core app. Each unlocks exclusive features.

| Feature | Algorand | Avalanche |
|---------|----------|-----------|
| Match verification | ✅ Primary (fast, cheap) | ✅ Supported |
| Reputation tokens | ✅ Primary (soulbound) | ✅ Supported |
| Squad DAO | ✅ Supported | ✅ Primary (EVM governance) |
| AI Agents | ❌ | ✅ Exclusive (ERC-8004) |
| Scout/Tactics Agents | ❌ | ✅ Exclusive |
| DeFi treasury | ❌ | ✅ Exclusive |
| Cross-chain tournaments | Both | Both |

**User journey:** Start on either chain. Algorand = verification + reputation. Avalanche = add AI agents + treasury management. Power users bridge both.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Next.js 14 Application                     │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │   Match      │  │   Squad      │  │   Championship   │  │
│  │   Capture    │  │   Management │  │   Manager Layer  │  │
│  │              │  │              │  │                  │  │
│  │ • Photo/voice│  │ • DAO votes  │  │ • Tactics        │  │
│  │ • Consensus  │  │ • Transfers  │  │ • Scout reports  │  │
│  │ • GPS/time   │  │ • Treasury   │  │ • Form tracking  │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
│         │                  │                   │            │
│         └──────────────────┼───────────────────┘            │
│                            ▼                               │
│              ┌─────────────────────────┐                   │
│              │   Chain Abstraction     │                   │
│              │   (useWallet, etc)      │                   │
│              └─────────────────────────┘                   │
│                     │            │                         │
│         ┌───────────┘            └───────────┐             │
│         ▼                                    ▼             │
│  ┌──────────────┐                   ┌──────────────┐      │
│  │   Algorand   │                   │   Avalanche  │      │
│  │   • Verify   │◄────── Bridge ───►│   • Agents   │      │
│  │   • Reputation│                  │   • Treasury │      │
│  │   • Low fees │                   │   • DeFi     │      │
│  └──────────────┘                   └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

---

## Verification Mechanic (Critical)

**Consensus Model:**
1. Both teams submit result independently
2. Match within 15 mins + same location = auto-confirm
3. Discrepancy = escalate to witness/arbiter
4. Disputed result = stake slashed for false reporter

**Anti-fraud signals:**
- GPS + timestamp metadata
- Photo/voice logs (optional but weighted)
- Squad reputation score (established teams trusted more)
- Third-party witness option

---

## Championship Manager Layer

### Between Real Matches

**Tactics:**
- Set formation for next real match
- Agent recommends based on opponent scout report
- Squad votes on approach (DAO)

**Scouting:**
- Browse local players by on-chain reputation
- View attributes, recent form, strengths/weaknesses
- Make transfer offers (backed by treasury)

**Squad Management:**
- Manage real teammates' positions
- Handle injuries (synced from real life)
- Rotate squad based on form/fitness

**Finances:**
- Match fees, tournament winnings → treasury
- Upgrade facilities → training bonuses
- Custom kit design

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

## Licensing Strategy

**Fictional Names (PES Model):**

| Real | SportWarren |
|------|-------------|
| Manchester United | Manchester Reds |
| Liverpool | Merseyside Reds |
| Premier League | Premier Sunday League |

- City names, colors = not trademarked
- Community-editable (Option Files)
- Real licenses negotiable post-traction

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, Tailwind, shadcn/ui |
| State | Zustand, TanStack Query |
| Wallets | RainbowKit (Avax), Pera (Algo) |
| Algorand | algosdk v3, TEAL contracts |
| Avalanche | Viem/Wagmi, Foundry, Solidity |
| AI | LangChain, ERC-8004, TEE |
| Comms | WhatsApp/Telegram bots, XMTP |

---

**See Also:** [Features](./FEATURES.md) | [Roadmap](./ROADMAP.md) | [Development](./DEVELOPMENT.md)
