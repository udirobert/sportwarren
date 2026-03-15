# SportWarren — Route & Navigation Audit

_Last updated: 2026-03-15_

This document is the living navigation map for the app. Every page, its purpose, and its inbound links are listed here. Update this file whenever a route is added, removed, or redirected.

---

## Active Routes

### `/` — Landing
- **Purpose:** Public marketing landing with guest-first entry and wallet connect CTA.
- **Key components:** `HeroSection`
- **Inbound links:** Brand logo, "Back to Landing" in dashboard

### `/dashboard` — Dashboard
- **Purpose:** Post-login home showing today's priorities, pending actions, treasury alerts, and squad overview via `AdaptiveDashboard`.
- **Key components:** `AdaptiveDashboard`, `PendingActionsPanel`
- **Inbound links:** Primary nav, all "go to dashboard" CTAs, onboarding checklist

### `/match` — Matches Hub
- **Purpose:** First-class destination for submitting match results, viewing pending verifications, match history, and fee rail status.
- **Key components:** Match submission form, verification queue, match history list
- **Inbound links:** Primary nav ("Matches"), dashboard pending-action links, squad overview CTAs, `/verification` redirect, `/rivalries` redirect

### `/squad` — Squad Hub
- **Purpose:** Operational hub for treasury management, player transfers, tactics, and squad governance.
- **Key components:** `SquadDAO`, `Treasury`, `TransferMarket`, `TacticsBoard`, `PendingActionsPanel`
- **Inbound links:** Primary nav ("Squad"), dashboard squad alerts, `/challenges` redirect

### `/reputation` — Reputation
- **Purpose:** Player and squad progression, reputation scores, and achievement history.
- **Key components:** `PlayerReputation`
- **Inbound links:** Primary nav ("Reputation" — when unlocked), `/achievements` redirect

### `/stats` — Stats
- **Purpose:** Match and player statistics overview.
- **Inbound links:** Primary nav ("Stats")

### `/analytics` — Analytics
- **Purpose:** Advanced analytics for organizers and power users. Hidden in simple UI mode.
- **Inbound links:** Primary nav ("Analytics" — intermediate+ users only)

### `/community` — Community
- **Purpose:** Social discovery layer. Shown only when social preference is "active".
- **Inbound links:** Primary nav ("Community" — conditional)

### `/settings` — Settings
- **Purpose:** User preferences, platform connections, notification config, and wallet management.
- **Key components:** Tabbed interface with Profile, Connections, Notifications, and Wallet tabs
  - **Profile:** Display name, position, avatar editing
  - **Connections:** Link/unlink Telegram, WhatsApp, XMTP with real-time status badges
  - **Notifications:** Granular preferences for match reminders, squad alerts, rivalry notifications
  - **Wallet:** Connected address display, copy, disconnect options
- **Inbound links:** Primary nav ("Settings"), dashboard user menu, SmartNavigation (Cmd+E shortcut)

---

## Redirected Routes (no longer standalone destinations)

| Route | Redirects To | Reason |
|---|---|---|
| `/verification` | `/match?mode=verify` | Verification is part of the match flow, not a separate journey |
| `/rivalries` | `/match` | Rivalry context belongs in the Matches hub |
| `/challenges` | `/squad` | Challenge setup is a squad-level action |
| `/achievements` | `/reputation` | Achievements are surfaced within the Reputation hub |

---

## Navigation Structure

Primary nav items (SmartNavigation):

| Label | Path | Unlock Level | Condition |
|---|---|---|---|
| Dashboard | `/dashboard` | basic | always |
| Matches | `/match` | basic | always |
| Stats | `/stats` | basic | always |
| Analytics | `/analytics` | intermediate | not simple UI |
| Squad | `/squad` | intermediate | organizer role or social not minimal |
| Community | `/community` | intermediate | social === active |
| Settings | `/settings` | basic | always |

> **Note:** `/achievements`, `/verification`, `/rivalries`, and `/challenges` are intentionally absent from the nav — they redirect to their respective hubs.

---

## Journey Map (MVP)

### Guest (Demo Experience)
1. Landing (`/`) → Explore as Guest
2. Dashboard (`/dashboard`) → Today/Squad/Progress overview
3. Match Center (`/match`) → Demo capture + verification preview
4. Settings (`/settings`) → Connect wallet CTA

### Verified Member
1. Landing (`/`) → Connect Wallet
2. Dashboard (`/dashboard`) → live squad data + actions
3. Match Center (`/match`) → submit/verify results
4. Squad (`/squad`) → tactics, treasury, transfers
5. Reputation/Stats (`/reputation`, `/stats`)

### Captain / Organizer
1. Dashboard (`/dashboard`) → pending actions + staff alerts
2. Match Center (`/match`) → approve/verify results
3. Squad (`/squad`) → treasury, transfers, governance
4. Settings (`/settings`) → channels + notifications

---

## Role & Permissions (Target Behavior)

| Action | Guest | Member | Captain |
|---|---|---|---|
| View landing + marketing | ✅ | ✅ | ✅ |
| View dashboard data | Demo-only | ✅ | ✅ |
| Submit match result | Demo-only | ✅ | ✅ |
| Verify match result | Demo-only | View | ✅ |
| Manage tactics/transfers/treasury | Demo-only | View | ✅ |
| Connect channels (Telegram/WhatsApp/XMTP) | ✳️ CTA | Limited | ✅ |
| Post to Lens / on-chain actions | ❌ | ✅ (verified) | ✅ (verified) |

**Notes**
- “Demo-only” means UI is available but no on-chain writes or protected data.
- Verification-required actions must be enforced server-side (not just UI gating).

---

## Operational Queue Entry Points

`PendingActionsPanel` surfaces the operational queue (pending verifications, treasury alerts, transfer offers) in two places:

1. **Dashboard** (`/dashboard`) — via `AdaptiveDashboard` → full variant
2. **Squad** (`/squad`) — overview tab → compact variant

---

## Recommended Journey Flow

```
Connect Wallet / Guest Entry
    ↓
Landing (`/`) → Dashboard (`/dashboard`)
    ↓
Dashboard — see today's priorities & pending actions
    ↓
Squad — manage treasury, transfers, tactics
    ↓
Matches — submit result / verify opponent result / check fee status
    ↓
Reputation — track progression and achievements
```
