# SportWarren

**Championship Manager Meets Web3** | Agentic football platform with dual-chain architecture

A next-generation football management platform built with Next.js, combining **Algorand** (core blockchain) and **Avalanche** (AI agent ecosystem) for an unparalleled sports experience.

---

## 🎯 Vision

SportWarren transforms amateur football with:
- **Real Match Verification** - On-chain verified Sunday league matches
- **Autonomous AI Agents** - Squad management, match analysis, treasury operations
- **Dual-Chain Architecture** - User choice, best of both blockchains
- **Championship Manager UX** - Familiar gameplay, Web3 ownership

Built for footballers who want ownership, transparency, global recognition, AND autonomous agent assistance.

---

## ⚡ Quick Start

```bash
git clone https://github.com/your-org/sportwarren.git
cd sportwarren
npm install
cp .env.example .env
npm run dev
```

**Frontend:** http://localhost:3000 | **API:** http://localhost:4000 | **Analytics:** http://localhost:5001

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    SportWarren Agentic Platform                  │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐                           ┌──────────────┐   │
│  │   AVALANCHE  │                           │   ALGORAND   │   │
│  │   Subnet     │                           │   Mainnet    │   │
│  ├──────────────┤                           ├──────────────┤   │
│  │ 🤖 Agent     │                           │ ⚽ Match      │   │
│  │    Economy   │◄────── User Choice ──────►│    Verify    │   │
│  │ • ERC-8004   │                           │ • State      │   │
│  │ • Kite AI    │                           │   Proofs     │   │
│  │ • Chainlink  │                           │ • Match      │   │
│  │ • AWM Cross  │                           │   Oracles    │   │
│  │ • DeFi/MeV   │                           │ • Reputation │   │
│  └──────────────┘                           └──────────────┘   │
│         └────────────┬───────────────────────────┘              │
│                      ▼                                          │
│         ┌─────────────────────────┐                             │
│         │   Next.js Abstraction   │                             │
│         │   Layer (Chain-agnostic)│                             │
│         └─────────────────────────┘                             │
└─────────────────────────────────────────────────────────────────┘
```

### Chain Selection

| Operation | Default Chain | Why |
|-----------|---------------|-----|
| Match Verification | Algorand | State Proofs, $0.001 fees, Chainlink oracles |
| Player Reputation | Algorand | Official credibility |
| AI Agents | Avalanche | ERC-8004, Kite AI passports |
| Agent Payments | Avalanche | Kite stablecoin rails |
| Treasury/DeFi | Avalanche | Liquidity, yield |
| Squad DAO | User Choice | Flexibility |

---

## 📚 Documentation (4 Core Docs)

| Document | Purpose |
|----------|---------|
| **[Architecture](docs/ARCHITECTURE.md)** | System design, dual-chain strategy, tech stack |
| **[Development](docs/DEVELOPMENT.md)** | Getting started, deployment, contributing |
| **[Features](docs/FEATURES.md)** | AI analytics, agents, blockchain integration |
| **[Roadmap](docs/ROADMAP.md)** | 5-phase migration plan, success metrics |

---

## 🚀 Key Features

### Core Platform
- **Smart Match Tracking** - Voice/photo capture, AI-powered stats
- **Adaptive Community Hub** - Squad management, rivalries, leaderboards
- **Achievement System** - Skill-based achievements, seasonal challenges

### AI & Agents
- **Player Analytics** - Roboflow + SAM3, pro benchmarking, match prediction
- **AI Agents** - Squad Manager, Match Analyst, Treasury Manager (ERC-8004)
- **Kite AI Integration** - 17.8M+ agent passports, stablecoin payments
- **Agent Marketplace** - Discover and deploy agents from Kite Agent Store
- **Multi-Platform** - WhatsApp, Telegram, XMTP integration

### Blockchain
- **Algorand** - State Proofs, low fees (~$0.001), fast finality
- **Avalanche** - 1,600+ agents, Kite AI, EVM compatibility
- **Chainlink Oracles** - Weather/location verification for match credibility
- **Cross-Chain** - AWM + State Proofs for seamless operations

---

## 📅 Roadmap Summary

| Phase | Timeline | Focus |
|-------|----------|-------|
| **1. Next.js Foundation** | Q1 2026 | Frontend migration, API routes |
| **2. Avalanche Integration** | Q2 2026 | Solidity contracts, Foundry tests |
| **3. Chain Abstraction** | Q2-Q3 2026 | Unified interface, cross-chain messaging |
| **4. Agentic Features** | Q3 2026 | ERC-8004 agents, TEE infrastructure |
| **5. Mainnet Launch** | Q4 2026 | Public launch, full platform |

**See [Roadmap](docs/ROADMAP.md) for detailed timeline and success metrics.**

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14, Tailwind CSS, Zustand, TanStack Query |
| **Backend** | Next.js API Routes, PostgreSQL, Redis, Socket.IO |
| **Algorand** | algosdk v3.x, TEAL contracts, State Proofs |
| **Avalanche** | Viem + Wagmi, Foundry + Solidity, ERC-8004, AWM |
| **AI Agents** | OpenAI, LangChain, ERC-8004, Kite AI Passports |
| **Agent Infra** | Kite AI (identity, payments, marketplace) |
| **Oracles** | Chainlink (weather, location, sports data) |
| **Computer Vision** | Roboflow, SAM3 |

---

## 📊 Success Metrics

### Technical (Post-Launch)
- < 3s page load time | 99.9% uptime | 95%+ contract test coverage

### Business (6 Months)
- 10,000+ MAU | 1,000+ squads | 5,000+ matches verified | 100+ agents deployed

---

## 🤝 Contributing

We welcome contributions! See our [Development Guide](docs/DEVELOPMENT.md) for:
- Setup instructions
- Smart contract development
- Testing guidelines
- Pull request process

**Key Guidelines:**
- TypeScript best practices
- Tests required (Vitest + Foundry)
- Mobile responsiveness
- Dual-chain compatibility

---

## 📞 Support

- 📧 Email: support@sportwarren.com
- 💬 Discord: [Join Community](https://discord.gg/sportwarren)
- 🐦 Twitter: [@SportWarren](https://twitter.com/sportwarren)

---

**Built with ⚽ by the SportWarren team**

**Strategic Positioning:** Algorand core infrastructure + Agentic infrastructure (Avalanche) + Next.js UX = Championship Manager for the Web3 era
