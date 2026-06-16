# Onboarding Flow

**Persona-first onboarding with formation playground as primary conversion surface**

---

## Overview

SportWarren uses a **persona-first** onboarding that prioritizes the formation playground as the primary conversion surface. The goal is to make the value proposition tangible before asking for wallet connections.

### Design Principles
- **Tactics before tasks** — Lead with formation building, not match logging
- **Squad as trust layer** — Create/join squad early for social proof
- **Soft wallet gate** — Wallet connection deferred until first match
- **Card as conversion surface** — Player identity card visible throughout

---

## Flow Stages

### Stage 1: Landing
**Route:** `/`

User lands on hero section with embedded FormationPlayground.

**Elements:**
- Hero headline: "Every match leaves a mark"
- FormationPlayground (interactive, no auth required)
- Value prop grid: XP, Attributes, Seasons, Squad Twin
- Primary CTA: "Start Building Your Squad"
- Secondary CTA: "Already have a squad? Import your roster" (scrolls to import wizard)

**Conversion:** User clicks primary CTA → proceeds to squad creation; clicks import CTA → proceeds to import wizard

---

### Stage 2: Squad Creation or Import

Users can either create a squad manually or import one from a spreadsheet.

#### Option A: Manual Squad Creation
**Component:** `SquadCreationModal`

**Options:**
- **Create Squad** — Enter squad name, create new squad
- **Join Squad** — Enter invite code or search
- **Skip for now** — Continue without squad (soft gate)

#### Option B: Spreadsheet Import
**Component:** `SquadImportWizard`

A 5-step wizard that converts an existing CSV/TSV roster into a fully-initialized squad:
1. **Upload** — Upload a file or paste tabular data
2. **Column Mapping** — Auto-detected columns (name, position, goals, assists, matches played), user-adjustable
3. **Preview & Name** — Review detected players, name the squad
4. **Confirm** — Summary with player count, stats columns, auth guard
5. **Complete** — Squad created, invite links generated (copy-all, CSV download, WhatsApp/Telegram share)

**Optional match-history import** (after squad creation):
- Upload a separate CSV with match results (date, opponent, goals for/against)
- Each row becomes a Moment (kind: `match_imported`) in the squad's gallery
- Label format: "W 4-2 vs North London FC"

**Soft Wallet Gate:**
- Squad invites work without wallet connection
- First match triggers wallet setup
- Privy OAuth callbacks preserve formation URL state

---

### Stage 3: Formation Setup
**Component:** `FormationPlayground` (pre-filled if from claim)

**If from claim flow:**
- `PendingClaimContext` pre-fills position
- Formation shown with claimed slot highlighted

**If new user:**
- Empty formation, user builds from scratch
- Can set tactical preferences (formation name, style)

---

### Stage 4: Avatar Upload
**Component:** `PlayerCardPreview`

**Optional but encouraged:**
- Camera icon UI on landing card
- Avatar preview replaces initials
- File validation: JPEG/PNG/WebP, 5MB max
- Preview generated client-side

**Storage:**
- `PendingPersonaContext` stores avatar base64 + mime type
- localStorage with 24h TTL
- Uploaded via `updateProfile` mutation during personalization

---

### Stage 5: Personalization
**Component:** `OnboardingFlow`

**Steps:**
1. **FIFA Attributes** — Select initial attribute preferences (Pace, Shooting, Passing, Dribbling, Defending, Physical)
2. **Avatar Confirm** — Upload or skip avatar
3. **Squad Confirm** — Join/create squad
4. **Profile Review** — Name, handle, squad badge

**Context Integration:**
- `PendingPersonaContext` consumed for avatar + preferences
- `PendingClaimContext` consumed for pre-filled squad/position
- Both contexts cleared after successful profile creation

**Import Claim Flow** (teammate claiming their spot from an import):
```
Captain imports squad → share invite link (?player=<name>)
    ↓
Teammate opens /join/[squadId]?player=<name>
    ↓
GET /api/import/claim/[squadId]?player=<name>
    ↓
Claim card shows player name, position, 'Claim my spot' button
    ↓
POST /api/import/claim/[squadId]  (transfers SquadMember + context from placeholder)
    ↓
Success → redirect to dashboard or squad page
```

---

### Stage 6: Dashboard
**Route:** `/dashboard`

**Component:** `AdaptiveDashboard`

**Personas:**

| Persona | Trigger | Dashboard |
|---------|---------|----------|
| **New User** | No matches | `NewUserDashboard` — First match CTA, drill widget, formation prompt |
| **First Match Pending** | Match logged, not verified | Match waiting card, peer rating prompt |
| **Returning User** | 1+ verified matches | Full dashboard with twin hero, stats, coaching |
| **First Match Friendly** | Quick log default | Match center with evidence wiring, lower auto-verify |

---

## Key Components

| Component | Purpose |
|-----------|---------|
| `OnboardingFlow` | Multi-step wizard with progress indicator |
| `SquadCreationModal` | Create/join squad inline |
| `SquadImportWizard` | 5-step CSV import wizard (upload, mapping, preview, confirm, complete) + optional match-history sub-wizard |
| `PendingPersonaContext` | Stores avatar + preferences in localStorage |
| `PendingClaimContext` | Bridges anonymous claim to authenticated profile |
| `AdaptiveDashboard` | Persona-aware dashboard switching |
| `NewUserDashboard` | First-time user experience |
| `DailyDrillWidget` | Drill CTA for new users |
| `PostMatchReaction` | Animated XP reveal after first match |

---

## Context Flows

### Formation Claim Flow
```
/play/[slug] → ClaimablePitch → teammate claims position
    ↓
PendingClaimContext stored (slug, position, token)
    ↓
OnboardingFlow detects claim context
    ↓
Pre-fills squad/position, skips squad creation
    ↓
Profile created with claimed role
    ↓
Context cleared
```

### Import Claim Flow
```
Captain shares /join/[squadId]?player=<name>
    ↓
Teammate opens link → page detects `?player=` param
    ↓
Fetches pending player info (name, position, isPlaceholder)
    ↓
Claim card renders with player details + 'Claim my spot' button
    ↓
POST claim API → one tx: transfer SquadMember + SquadPlayerContext,
    update user name/position, delete placeholder user
    ↓
Success → redirect to squad dashboard
```

### Import Match-History Flow
```
Squad created via import → 'Import match history' CTA in complete step
    ↓
Upload CSV (date, opponent, goals for/against, optional: competition, venue)
    ↓
Auto-detect columns, preview, confirm
    ↓
POST /api/import/matches/[squadId]
    ↓
Creates Moment rows (kind: 'match_imported') with createdAt = match date
    ↓
Moments appear in squad gallery (rendered by moment-render cron)

### Avatar Flow
```
PlayerCardPreview → camera icon clicked
    ↓
useAvatarUpload validates file, generates preview
    ↓
PendingPersonaContext stores base64 + mime
    ↓
OnboardingFlow uploads via updateProfile
    ↓
Context cleared
```

---

## Privacy & Security

- Phone numbers stored as platform identity hashes
- Avatar stored in storage adapter (not base64 in DB)
- Claim tokens single-use, 24h TTL
- OAuth callbacks preserve state across redirects

---

## Analytics Events

| Event | Description |
|-------|-------------|
| `onboarding_started` | User enters onboarding flow |
| `squad_created` | New squad created |
| `squad_joined` | User joined existing squad |
| `claim_context_detected` | Claim flow detected in onboarding |
| `avatar_uploaded` | Avatar successfully uploaded |
| `onboarding_completed` | Full onboarding finished |
| `first_match_logged` | First match logged (triggers wallet gate) |

---

**See Also:** [ARCHITECT.md](./ARCHITECT.md) | [FORMATIONS.md](./FORMATIONS.md)
