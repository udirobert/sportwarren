# SportWarren

**Turn every grassroots match into a Championship Manager experience.** Stats, commentary, player progression, and peer-vetted reputation — all through WhatsApp.

SportWarren brings the depth of a football management sim to amateur football. Players get pre-match previews with win probabilities, live commentary, post-match peer ratings that drive FIFA-style attribute growth, and AI-generated tactical analysis. No app installs, no crypto wallets — just play, and SportWarren builds your football legacy match by match.

Every squad gets its own autonomous AI agent that handles data, intelligence, and on-chain payments in the background. The platform serves Web, Telegram, and WhatsApp.

---

## 🎯 Vision

SportWarren gives amateur footballers what pros take for granted:

- **Pre-Match Previews** — Win probabilities, tactical breakdowns, and head-to-head stats before kickoff.
- **Live Match Commentary** — AI-generated play-by-play that brings every Sunday league game to life.
- **Peer-Vetted Reputation** — Post-match player ratings where teammates rate each other's FIFA-style attributes (Pace, Shooting, Passing). Consensus logic weeds out trolls and rewards accurate scouts.
- **Player Progression** — Attributes grow over time through real match performance and peer consensus, just like Championship Manager.
- **AI-Powered Analysis** — Tactical insights, squad optimization, and scouting reports — generated and delivered to your WhatsApp.
- **No Apps Required** — Everything works through WhatsApp. Telegram Mini App for power users who want the full dashboard.

---

## ⚡ Powered by the Kite Agentic Economy

Under the hood, every squad is managed by an autonomous Kite Passport AI agent that scouts opponents, discovers paid intelligence services, negotiates payments on-chain via x402, and operates within user-delegated budgets. Players never touch a wallet or a DEX — the agent handles everything.

**Kite AI Hackathon:** See **[docs/HACKATHON.md](docs/HACKATHON.md)** for our agent autonomy implementation, x402 commerce flow, and verifiable on-chain transaction proofs.

---

## 🛰️ Try It Live

Text **+1 (201) 534-5384** on WhatsApp:

| Command | What You Get |
|---------|--------------|
| `hi` | Meet Marcus, your squad's AI director |
| `scout Liverpool` | AI-generated tactical scouting report |
| `whoami` | Your linked platform identities |
| `attestations` | Recent agent actions and settlement receipts |
| `help` | Full command reference |

**Telegram:** [@SportWarrenBot](https://t.me/SportWarrenBot) — full Mini App dashboard.

**Web:** [api.sportwarren.com](https://api.sportwarren.com)

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| **[HACKATHON.md](docs/HACKATHON.md)** | Kite AI Hackathon: agent autonomy, x402 payments, on-chain proofs. |
| **[ARCHITECT.md](docs/ARCHITECT.md)** | Technical blueprint: multi-chain design, match lifecycle, peer consensus engine. |
| **[PLATFORMS.md](docs/PLATFORMS.md)** | Channel guides for Telegram, WhatsApp, and Lens Protocol. |
| **[BUILD.md](docs/BUILD.md)** | Development guide, deployment flow, and testing instructions. |
| **[DEPLOY_HETZNER_RUNTIME.md](docs/DEPLOY_HETZNER_RUNTIME.md)** | Standalone PM2 runtime operations on Hetzner. |

---

## 🚀 Key Features

- **Formation Playground** — Interactive tactics editor with static pitch and animated simulation. Toggle between setting formations and watching them play out. Share challenge links that invite opponents to counter your setup.
- **Counter-Play Viral Loop** — Share a formation, receive a counter-formation, simulate the match, get a result card. Every share generates a second interaction.
- **Match Preview Engine** — Interactive pitch visualization with win probabilities and tactical breakdowns.
- **Live Commentary** — AI-generated play-by-play during matches directly in WhatsApp group chats.
- **Peer Consensus Engine** — Post-match player ratings that drive FIFA-style attribute progression.
- **Proactive Match Detection** — The Telegram bot detects match results from casual chat ("we won 3-1") without requiring commands.
- **Zero-Friction Logging** — Any squad member can log matches (not just captains). Opponent squads are auto-created if they don't exist on the platform.
- **Player & Squad Progression** — Stats, attributes, and reputation that grow with every match.
- **Autonomous Squad Agents** — Kite Passport AI agents that manage scouting, intelligence procurement, and on-chain payments in the background.
- **Multi-Chain Architecture** — Purpose-built roles for Algorand (verification), GOAT Network (governance), Kite (agents), TON (Telegram wallet), and Lens (social identity).

---

## 🛠️ Quick Start

```bash
git clone https://github.com/udirobert/sportwarren.git
cd sportwarren
pnpm install
cp .env.example .env.local
pnpm run dev
```

**Frontend:** http://localhost:3000 | **API:** http://localhost:3000/api/trpc

---

**Built with ❤️ for footballers everywhere.**

⚽ **SportWarren** — Every match leaves a mark.