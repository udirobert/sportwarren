# SportWarren

**Tactical Football Command Center** | Real matches, peer ratings, and Web3-native squad operations

SportWarren turns grassroots football into a Championship Manager-style experience where real-world match activity feeds tactical simulation, squad progression, and peer-vetted reputation. It combines modern web tooling, AI-driven scouting, and multi-network integrations across Web and Telegram.

---

## 🎯 Vision

SportWarren transforms amateur football with:
- **Tactical Simulation** - Immersive match previews, scouting reports, and AI-driven coaching insights
- **Peer-Vetted Reputation** - FIFA-style attributes that improve through real performance and peer consensus ratings
- **Real Match Verification** - Structured submissions, consensus checks, and oracle-assisted trust signals
- **Squad Management** - Team organization, tactical DNA, brand kit personalization, and treasury management
- **Championship Manager UX** - Experience-first gameplay focused on "How do we win?" before "What happened?"

**⚡ Kites Hackathon Participants:** See [docs/CORE.md](docs/CORE.md#kite-ai-agentic-economy) for our full Agentic Economy implementation and the **[60-Second WhatsApp Demo](#-60-second-whatsapp-demo)** below.

**The Flywheel:** Tactical Prep → Real Performance → Peer Rating → Attribute Growth → Strategy Refinement

---

## 🛰️ 60-Second WhatsApp Demo

Experience the **Kite Agentic Economy** live from your phone. No wallet, no app, just one message.

1. **Message Marcus:** Text `hi` to **+1 (201) 534-5384** (SportWarren Director).
2. **Link (Optional):** If you want to use your squad context, link your number with `link WA-XXXXXX` (get code from our Telegram bot via `/linkwhatsapp`).
3. **Run a Paid Scout:** Text `scout Liverpool`.
4. **Observe:**
   - **AI Brief:** You'll receive a tactical scouting report.
   - **x402 Settlement:** The platform's squad agent autonomously pays $0.50 USDC on the **Kite Testnet**.
   - **On-Chain Receipt:** You'll get a [KiteScan](https://testnet.kitescan.ai) link to verify the settlement and attestation.

---

## 🎯 Vision

```bash
git clone https://github.com/udirobert/sportwarren.git
cd sportwarren
npm install
cp .env.example .env.local

# Required for encrypted squad media (generate a 32-byte base64 key)
# openssl rand -base64 32
echo "MEDIA_MASTER_KEY=$(openssl rand -base64 32)" >> .env.local

# Start PostgreSQL
brew services start postgresql@14
psql sportwarren < prisma/migrations/001_init.sql

npm run dev
```

**Frontend:** http://localhost:3000 | **API:** http://localhost:3000/api/trpc

---

## 📚 Documentation Index

| Document | Purpose |
|----------|---------|
| **[CORE.md](docs/CORE.md)** | Architecture, database schema, tech stack, features |
| **[BUILD.md](docs/BUILD.md)** | Development guide, deployment, testing, troubleshooting |
| **[DEPLOY_HETZNER_RUNTIME.md](docs/DEPLOY_HETZNER_RUNTIME.md)** | Lean artifact-based deployment flow for the Hetzner runtime |
| **[CONTRACTS.md](docs/CONTRACTS.md)** | Deployed contracts, chain responsibilities, and integration inventory |
| **[HACKATHON.md](docs/HACKATHON.md)** | Kite AI Hackathon story: agent autonomy, x402, and attestations |
| **[x402-services.md](docs/x402-services.md)** | Public x402 API: Scout and Match Verifier agents |
| **[WHATSAPP.md](docs/WHATSAPP.md)** | WhatsApp agent commander and Kite bridge |
| **[linking.md](docs/linking.md)** | How to link WhatsApp to your SportWarren account |
| **[UX_REFOCUS.md](docs/UX_REFOCUS.md)** | Strategy for prioritizing tactical experience over match logging |
| **[PEER_RATINGS.md](docs/PEER_RATINGS.md)** | Peer consensus engine, MOTM voting, and Scout reputation progression |
| **[TELEGRAM.md](docs/TELEGRAM.md)** | Telegram bot + Mini App architecture, tactical notifications, and TON integration |
| **[SOCIAL.md](docs/SOCIAL.md)** | Private squad media sharing and Lens integration |
| **[YELLOW_INTEGRATION.md](docs/YELLOW_INTEGRATION.md)** | Yellow Network integration details and operational notes |

---

## 🏗️ Architecture (High-Level)

```
┌──────────────────────────────────────────────────────────────────────┐
│                         SportWarren Platform                         │
├──────────────────────────────────────────────────────────────────────┤
│ Algorand   Avalanche   Kite AI   Yellow   TON   Lens               │
│ Verification Governance Agents   Rail     Wallet Social            │
│ Reputation   Assets     Payments Settlement MiniApp Identity       │
├──────────────────────────────────────────────────────────────────────┤
│                    App + Service Orchestration Layer                │
│             tRPC, Prisma, AI Staff, Treasury, Telegram             │
├──────────────────────────────────────────────────────────────────────┤
│                     Web App + Telegram Mini App                     │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Key Features

### Tactical Experience
- **Match Preview Engine** - Interactive PitchCanvas visualization with scouting reports and win probabilities
- **Digital Twin 3D Simulation** - High-fidelity "Broadcast Engine" that simulates 11v11 matches using real-world inputs (sleep, training, nutrition) as performance multipliers. *Available as an optional reward for high-engagement streaks (DAU/WAU) or premium subscribers.*
- **Coach Kite Insights** - AI-driven "Phygital" tactical briefings that bridge physical performance with digital growth
- **Informal Friends Flow** - Frictionless "Quick Log" match reporting with automated Social Trust verification for recurring squads
- **Tactical DNA** - Personalize your squad's brand kit (colors/nickname) and formation before every match
- **Match Hype Notifications** - Automated Telegram briefings delivered 1 hour before kick-off

### Peer Ratings & Reputation
- **Peer Consensus Engine** - Post-match teammate evaluations for Attack, Defense, Pace, and Stamina
- **Scout Reputation** - Earn XP and level up your "Scout Tier" through accurate and consistent ratings
- **Man of the Match (MOTM)** - Cast votes to award bonus XP and prestige to top performers
- **Dynamic Attributes** - FIFA-style ratings that evolve based on real-world performance and peer vetted data

### Real Match Verification
- Both teams submit results independently with consensus-required verification (3 checks)
- Oracle-backed context (environmental/location signals) contributes to trust scoring
- Verification, attestation, and treasury flows are distributed across purpose-specific networks

### Multi-Chain Infrastructure
- **Algorand:** Match verification, reputation state, and proof-backed football records
- **Avalanche:** Squad governance, treasury policy, programmable assets, and escrow
- **Kite AI:** Agent identity, agent payments, attestations, and autonomous economy
- **Yellow Network:** Instant settlement rail for operational treasury movement and match-fee coordination
- **Telegram + TON:** Consumer wallet UX, Mini App treasury actions, rewards, and Telegram-native payments
- **Lens:** Social identity, highlight publishing, and community distribution

### Chain Responsibility Matrix

| Network | Strict Role |
|---------|-------------|
| **Algorand** | Verifiable match state, reputation, and proof-backed player progression |
| **Avalanche** | Governance, squad treasury policy, digital assets, and contract-based escrow |
| **Kite AI** | Agent passports, paid agent actions, attestations, and agent marketplace primitives |
| **Yellow** | Fast settlement rail for treasury operations and match-fee coordination |
| **TON** | Telegram-native wallet flows, top-ups, rewards, and Mini App payments UX |
| **Lens** | Social graph, highlight distribution, and portable community identity |

No chain is redundant in the SportWarren architecture. Each one owns a bounded responsibility, and the app layer composes them into a single squad experience.

### AI Staff Layer
- Multi-persona staff assistants (Agent, Scout, Coach, Physio, Analyst, Commercial)
- **Kite AI Passports** - Every `PlayerTwin` is an autonomous agent with a unique Kite Passport ID on the Kite Testnet.
- **Agentic Commerce (x402)** - Native USDC wage payments and autonomous agent-to-agent financial flows using the Kite `kpass` x402 standard.
- **Tactical Spend UI** - Interactive dashboard for delegating and managing autonomous spending budgets for your Digital Twin.
- **Verifiable Attestations** - All agent actions and match results are cryptographically signed and pushed to the Kite Chain for a permanent, verifiable history.
- **Reputation-Aware Delegation** - Hiring is gated by on-chain reputation checks (min 400/1000) to ensure high-quality tactical support.
- **Proof of Liveness** - Real-time "Ping" checks to verify agent activity on-chain.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14.2.3, Tailwind CSS, shadcn/ui |
| API | tRPC (type-safe RPC) |
| Database | PostgreSQL 15+ |
| ORM | Prisma 7.4.1 |
| State | TanStack Query, Zustand |
| Auth | Privy v3 + Wagmi v2 bridge (unified wallets) |
| AI | Venice AI primary + OpenAI fallback |
| Messaging | Telegram Bot API, Telegram Mini App (TMA), TON flows |
| Networks | Algorand, Avalanche, Kite AI, Yellow, TON, Lens |

---

## 🧪 Testing

```bash
# Run tests
npm run test

# Build check (local production verification)
DISABLE_SENTRY_BUILD=true NODE_OPTIONS='--max-old-space-size=4096' npm run build
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and build
5. Submit a PR

See [BUILD.md](docs/BUILD.md) for detailed guidelines.

---

## 📄 License

MIT License - see LICENSE file for details.

---

**Built with ❤️ for footballers everywhere.**

⚽ **SportWarren** | 🌐 **Tactical home for grassroots football**
