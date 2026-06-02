# SportWarren Platforms

**Multi-Channel Distribution: Telegram, WhatsApp, and Social Layers**

SportWarren uses a "Headless" architecture where product logic is shared across different messaging and social platforms, each serving a unique role in the squad workflow.

---

## 💎 Telegram: The Command Center
Telegram is the primary surface for **squad coordination and power users**.

### Features
- **Mini App:** Full "Championship Manager" UI for squad management, tactics, and player attributes.
- **Bot Commands:** Fast logging (`/log`), stat checks (`/stats`), and fixtures.
- **Proactive Match Detection:** The bot detects match results from casual chat ("we won 3-1 against Red Lions") and prompts for confirmation — no `/log` required.
- **Any-Member Logging:** Any linked squad member can log a match, not just captains. Group reaction verification (confirm/dispute buttons) ensures accuracy.
- **Auto-Created Opponents:** When logging a match against a squad not on the platform, a placeholder squad is created automatically so the match can proceed.
- **Match Cards:** After verification and peer consensus, a visual match result card (score, MOTM, XP progression) is sent to both squad group chats as a photo.
- **TON Integration:** Native wallet UX for treasury top-ups and rewards.

---

## 🟢 WhatsApp: Squad Engagement
WhatsApp reaches the broadest, least technical squad members. All messages are signed by **Marcus**, the squad's Academy Director.

### Features
- **Auto-link on join:** When Marcus is added to a group, it auto-links to the squad whose Champion phone number matches a group member.
- **Welcome handler:** Marcus introduces itself to the group on first add.
- **Match detection & verification:** Detects results from casual chat ("we won 3-1"), posts confirm/dispute buttons, auto-verifies at 3 confirms.
- **RSVP via inline reply:** Players reply `in`, `out`, or `maybe` directly in chat to availability requests — no web form needed.
- **Scout reports as interactive lists:** `scout <opponent>` returns a Kapso interactive list message, tappable on mobile.
- **Rating reminders DM:** Cron (every 2h) nudges players who haven't rated teammates after a match.
- **Rate-token auth:** Players tap a signed link in DM to rate teammates — no Privy login required. Wallet banners are suppressed for these sessions.
- **Post-match player cards:** FIFA-style player cards posted to the group after consensus closes.

### Management Commands
| Message | Action |
|---|---|
| `scout <opponent>` | Autonomous AI scouting report (interactive list). |
| `trigger-auto-scout` | Instantly trigger the 24h pre-match autonomous scout. |
| `attestations` | Recent agent actions and KiteScan links. |
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

## 🔗 Cross-Platform Linking

Users link their WhatsApp number to their SportWarren account to unlock Kite Agentic Economy features (Scout, Hire, Pay, Status).

### Linking Flow
1. **Start on Telegram** — Open the SportWarren Telegram Bot and send `/linkwhatsapp`. The bot replies with a unique 6-character code.
2. **Verify on WhatsApp** — Message **+1 (201) 534-5384** with `link <code>`. Marcus confirms the account is linked.

### Security
- Codes expire after **15 minutes**
- Only one WhatsApp number per account
- Phone numbers stored as platform identity hashes (never shared)

### Command Access
| Command | Unlinked | Linked |
|---------|----------|--------|
| `help` | ✅ | ✅ |
| `find <query>` | ✅ | ✅ |
| `status` | ❌ | ✅ |
| `scout <opponent>` | ❌ | ✅ |
| `hire <agentId>` | ❌ | ✅ |
| `pay <wallet> <usdc>` | ❌ | ✅ |

### Receipt UX
WhatsApp keeps receipts compact. Internal scout commands return SportWarren attestation ids such as `internal-scout-...`; direct Kite transactions and external x402 settlements should link to KiteScan only when the backend has a real transaction hash. This avoids sending users to broken explorer links while still giving judges and operators a verifiable audit handle.

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
