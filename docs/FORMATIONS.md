# Formation Playground & Viral Loop

**Interactive pitch editor + viral growth engine for squad recruitment**

---

## Overview

The Formation Playground is SportWarren's primary user acquisition surface. Users build formations, share challenge links, and teammates claim positions — driving organic signups through a viral loop.

### Key Features
- **Drag-and-drop formation builder** with player name/avatar inputs
- **Tactical share** via `/api/tactics/share` → generates shareable slug
- **Claim flow** at `/play/[slug]` — teammates claim positions without logging in
- **Counter-play loop** — opponents counter formations and share back
- **Match simulation** — run 2D animated match between two formations

---

## Architecture

### Components
| Component | Purpose |
|-----------|---------|
| `FormationPlayground` | Main client component with 4 flow states |
| `PitchCanvas` | DOM-based pitch renderer with animations |
| `PlayerEditor` | Player name/avatar input per position |
| `MatchEnginePreview` | Tick-based 2D match simulation |
| `ExportPanel` | PNG export, Web Share API, video recording |
| `ChallengeOverlay` | Counter-play entry point |
| `MatchResultCard` | Score display after simulation |
| `TacticShareActions` | Share buttons and URL generation |

### Flow States
```
build → challenge_received → counter_setup → result
```

| State | Description |
|-------|-------------|
| `build` | User arranges formation, adds player names/avatars |
| `challenge_received` | User opened a shared formation, can counter |
| `counter_setup` | User building counter-formation |
| `result` | Simulation complete, showing score |

---

## Share Flow

### Creating a Share
1. User builds formation with player names/avatars
2. Clicks "Share Tactics" in ExportPanel
3. `POST /api/tactics/share` creates `TacticalPlanShare` with unique slug
4. Share URL: `https://sportwarren.com/play/[slug]`
5. PNG exported with embedded claim link
6. User shares via WhatsApp, social, etc.

### Claiming a Position
1. Teammate clicks shared URL → `/play/[slug]`
2. `ClaimablePitch` shows formation with open positions
3. Teammate enters name, clicks position to claim
4. `ShareClaimRecord` created (one claim per position per share)
5. `PendingClaimContext` stored in localStorage
6. OnboardingFlow consumes claim context → profile pre-filled

### Data Flow
```
FormationPlayground (avatars + names)
    ↓
POST /api/tactics/share → creates TacticalPlanShare with slug
    ↓
ExportPanel exports PNG + includes claim URL in share text
    ↓
User shares via WhatsApp → teammate clicks link
    ↓
/play/[slug] → ClaimablePitch → teammate claims position
    ↓
OnboardingFlow consumes PendingClaimContext → profile created
```

---

## Counter-Play Loop

### Challenge URL Parameters
| Param | Description |
|-------|-------------|
| `vs_f` | Formation slug being challenged |
| `vs_s` | Share ID |
| `vs_c` | Challenge ID |
| `vs_n` | Challenge number (for back-and-forth) |

### Flow
```
User A builds formation → shares challenge URL
    ↓
User B opens URL → sees ChallengeOverlay ("Countering your 4-3-3")
    ↓
User B clicks "Counter with 4-5-1" → simulation runs
    ↓
MatchResultCard renders (score, goals, possession)
    ↓
User B clicks "Challenge Back" → new URL copied → loop restarts
```

---

## Avatar Integration

### Upload Flow
1. `useAvatarUpload` hook validates file (JPEG/PNG/WebP, 5MB max)
2. Preview generated, base64 stored in `PendingPersonaContext`
3. `PlayerCardPreview` shows camera icon, avatar replaces initials
4. Onboarding reconstructs avatar data URL, uploads via `updateProfile`

### Persistence
- `PendingPersonaContext` — localStorage, 24h TTL
- `usePitchPersonalization` — localStorage per formation
- `PitchCanvas` displays avatars from `personalization.avatars`

---

## Analytics Events

| Event | Description |
|-------|-------------|
| `formation_shared` | User creates tactical share |
| `claim_link_clicked` | Teammate opens claim page |
| `claim_position_completed` | Teammate claims a position |
| `signup_from_share` | Teammate completes signup from claim |
| `challenge_created` | User initiates counter-play |
| `simulation_run` | Match simulation executed |

---

## API Endpoints

### POST /api/tactics/share
Creates a shareable tactical plan.

**Request:**
```json
{
  "formation": { "name": "4-3-3", "positions": [...] },
  "players": [{ "name": "John", "avatarUrl": "..." }],
  "squadId": "clx..."
}
```

**Response:**
```json
{
  "slug": "abc123",
  "url": "https://sportwarren.com/play/abc123"
}
```

### GET /api/og/formation?slug=[slug]
Generates OG image for social sharing.

### GET /api/og/tactic-card
Generates shareable tactic card image.

---

## Storage

| Model | Purpose |
|-------|---------|
| `TacticalPlanShare` | Share records with slug, view/copy counts |
| `ShareClaimRecord` | One claim per position per share |
| `PendingPersonaContext` | localStorage, avatar + preferences |
| `PendingClaimContext` | localStorage, slug + claim token |

---

**See Also:** [ARCHITECT.md](./ARCHITECT.md) | [ONBOARDING.md](./ONBOARDING.md)
