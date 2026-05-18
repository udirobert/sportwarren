# SportWarren Platforms

**Multi-Channel Distribution: Telegram, WhatsApp, and Social Layers**

SportWarren uses a "Headless" architecture where product logic is shared across different messaging and social platforms, each serving a unique role in the squad workflow.

---

## 💎 Telegram: The Command Center
Telegram is the primary surface for **squad coordination and power users**.

### Features
- **Mini App:** Full "Championship Manager" UI for squad management, tactics, and player attributes.
- **Bot Commands:** Fast logging (`/log`), stat checks (`/stats`), and fixtures.
- **TON Integration:** Native wallet UX for treasury top-ups and rewards.

---

## 🟢 WhatsApp: Operational Nudges
WhatsApp reaches the broadest, least technical squad members with **high-frequency utility**.

### Features
- **Marcus AI Persona:** All communications are signed by Marcus, your Squad's Academy Director.
- **Interactive Workflows:** One-tap buttons for match RSVP and result verification.
- **Agent Commander:** Direct natural-language interface for the Kite Agentic Economy.

### Management Commands
| Message | Action |
|---|---|
| `scout <opponent>` | Autonomous AI scouting report (paid via x402). |
| `trigger-auto-scout` | **Demo:** Instantly trigger the 24h pre-match autonomous scout. |
| `attestations` | Show your recent signed on-chain actions with KiteScan links. |
| `whoami` | List your linked platform identities. |
| `unlink` | Remove your WhatsApp connection from SportWarren. |
| `cost` | View pricing for autonomous agent services. |

---

## 🌿 Social: Lens Protocol
Lens Protocol provides a portable social graph and a distribution surface for "Pro-Style" football highlights.

### Features
- **Highlight Sharing:** Post automated highlight cards (stats, results, MVP) directly to your Lens feed.
- **Social Identity:** Sign-in with Lens (SIWL) for decentralized authentication.
- **Community Graph:** Verified credentials of your Sunday league status and reputation.

---

## ⛓️ Integration Strategy: The Adapter Pattern
To prevent platform lock-in, SportWarren uses a provider boundary:

1. **Domain Core:** Squads, matches, AI staff, and permissions (Shared).
2. **Workflow Layer:** `sendReminder`, `routeInboundIntent`, `sendRecap` (Shared).
3. **Provider Layer:** 
   - `TelegramProvider` (via Telegraf/TON)
   - `WhatsAppProvider` (via Kapso)
   - `SocialProvider` (via Lens SDK)

This ensures that adding a new channel (e.g., Discord or Farcaster) requires only a new adapter, not a rewrite of the product logic.
