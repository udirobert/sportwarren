# SportWarren

**Tactical Football Command Center** | Real matches, peer ratings, and Web3-native squad operations

SportWarren turns grassroots football into a Championship Manager-style experience where real-world match activity feeds tactical simulation, squad progression, and peer-vetted reputation. It combines modern web tooling, AI-driven scouting, and multi-network integrations across Web and Telegram.

---

## 🎯 Vision

SportWarren transforms amateur football with:
- **Tactical Simulation** - Immersive match previews, scouting reports, and AI-driven coaching insights.
- **Peer-Vetted Reputation** - FIFA-style attributes that improve through real performance and peer consensus.
- **Autonomous Agents** - Every squad is managed by a Kite-backed agent that scouts and pays for services.
- **Multi-Channel Distribution** - Operates seamlessly across Telegram and WhatsApp.

**⚡ Kite AI Hackathon:** See **[docs/HACKATHON.md](docs/HACKATHON.md)** for our Agentic Behavior implementation and verification guide.

---

## 🛰️ 60-Second WhatsApp Demo

Experience the **Kite Agentic Economy** live from your phone. No wallet, no app, just one message.

1. **Message Marcus:** Text `hi` to **+1 (201) 534-5384**.
2. **Run a Scout:** Text `scout Liverpool`.
3. **Observe:** The platform's squad agent generates a scouting report, records a SportWarren Kite attestation receipt, and updates the daily scout budget.
4. **Inspect Receipts:** Run `scouts` or `attestations` to review prior reports and settlement records.

For hackathon review: WhatsApp scout receipts are internal SportWarren attestation ids. External x402 services still use the paid `/api/x402/scout` surface and Kite Passport settlement path when the merchant host is supported by Passport discovery.

**Commands:** `whoami`, `budget`, `attestations`, `cost`, `trigger-auto-scout`, `help`.

---

## 📚 Documentation Index

| Document | Purpose |
|----------|---------|
| **[HACKATHON.md](docs/HACKATHON.md)** | **Start Here.** Kite AI Hackathon story: agent autonomy, x402, and attestations. |
| **[ARCHITECT.md](docs/ARCHITECT.md)** | Technical blueprint: multi-chain strategy, database schema, and system design. |
| **[PLATFORMS.md](docs/PLATFORMS.md)** | Channel guides for Telegram, WhatsApp, and Lens Protocol. |
| **[BUILD.md](docs/BUILD.md)** | Development guide, deployment flow, and testing instructions. |
| **[DEPLOY_HETZNER_RUNTIME.md](docs/DEPLOY_HETZNER_RUNTIME.md)** | Deep dive into standalone PM2 runtime operations. |

---

## 🚀 Key Features

- **Match Preview Engine** - Interactive PitchCanvas visualization with win probabilities.
- **Digital Twin 3D Simulation** - High-fidelity "Broadcast Engine" for match visualization.
- **Peer Consensus Engine** - Post-match evaluations that drive player attribute growth.
- **Agentic Commerce (x402)** - Autonomous agent-to-agent financial flows on Kite.
- **Multi-Chain Stack** - Purpose-built roles for Algorand, Avalanche, Kite, TON, Yellow, and Lens.

---

## 🛠️ Quick Start

```bash
git clone https://github.com/udirobert/sportwarren.git
cd sportwarren
npm install
cp .env.example .env.local
npm run dev
```

**Frontend:** http://localhost:3000 | **API:** http://localhost:3000/api/trpc

---

**Built with ❤️ for footballers everywhere.**

⚽ **SportWarren** | 🌐 **Tactical home for grassroots football**
