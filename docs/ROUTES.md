# SportWarren — Route & Navigation Audit

_Last updated: 2026-03-09_

This document is the living navigation map for the app. Every page, its purpose, and its inbound links are listed here. Update this file whenever a route is added, removed, or redirected.

---

## Active Routes

### `/` — Dashboard
- **Purpose:** Entry point after wallet connect. Shows today's priorities, pending actions, treasury alerts, and squad overview via `AdaptiveDashboard`.
- **Key components:** `AdaptiveDashboard`, `PendingActionsPanel`
- **Inbound links:** Logo/home nav link, all "go to dashboard" CTAs

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
| Dashboard | `/` | basic | always |
| Matches | `/match` | basic | always |
| Stats | `/stats` | basic | always |
| Analytics | `/analytics` | intermediate | not simple UI |
| Squad | `/squad` | intermediate | organizer role or social not minimal |
| Community | `/community` | intermediate | social === active |
| Settings | `/settings` | basic | always |

> **Note:** `/achievements`, `/verification`, `/rivalries`, and `/challenges` are intentionally absent from the nav — they redirect to their respective hubs.

---

## Operational Queue Entry Points

`PendingActionsPanel` surfaces the operational queue (pending verifications, treasury alerts, transfer offers) in two places:

1. **Dashboard** (`/`) — via `AdaptiveDashboard` → full variant
2. **Squad** (`/squad`) — overview tab → compact variant

---

## Recommended Journey Flow

```
Connect Wallet
    ↓
Dashboard — see today's priorities & pending actions
    ↓
Squad — manage treasury, transfers, tactics
    ↓
Matches — submit result / verify opponent result / check fee status
    ↓
Reputation — track progression and achievements
```
