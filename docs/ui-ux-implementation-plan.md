# UI/UX Implementation Plan

> Generated: 2026-03-11  
> **Last Updated:** 2026-03-11 (Junie tasks 1.1–1.4, 1.6, 1.7, 1.10 completed)  
> Based on: UI/UX Audit Report + Comparative Review (ClassPass / Strava benchmarks)

This plan is split into two sections:

- **Section 1 — Junie** — frontend code changes that can be implemented directly in the codebase
- **Section 2 — Adal** — product/design decisions, backend-dependent items, and work requiring external configuration or design assets

---

## ✅ Completed Junie Tasks (2026-03-11)

| Task | Status |
|------|--------|
| 1.1 Fix blank desktop gap | ✅ Done — Adaptive grid columns |
| 1.2 Add persistent Log a Match FAB | ✅ Done — Mobile FAB + desktop button |
| 1.3 Add CommunicationHub component | ✅ Done — Widget registered in dashboard |
| 1.4 Surface integrations in onboarding | ✅ Done — Connections step added |
| 1.6 Reorder dashboard widget priorities | ✅ Done — Player-first hierarchy |
| 1.7 Jargon audit — replace crypto terms | ✅ Done — Player-friendly language |
| 1.10 Hero page badge + subheadline | ✅ Done — Guest-first CTA, trust signals |

---

## Section 1 — Junie's Work (Frontend Code Changes)

### 1.1 Fix the Blank Desktop Gap

**Problem:** `AdaptiveDashboard.tsx` renders a `md:grid-cols-2 lg:grid-cols-3` grid for every section. When a section (e.g. "Today") has only one widget, the right 1–2 columns are a white void on desktop.

**Fix:** Make column count conditional on widget count, and fill any remaining space with a contextual CTA card.

```tsx
// In AdaptiveDashboard.tsx — Section component desktop grid
<div className={`hidden md:grid gap-4 ${
  widgets.length === 1 ? 'grid-cols-1 max-w-xl' :
  widgets.length === 2 ? 'grid-cols-2' :
  'grid-cols-2 lg:grid-cols-3'
}`}>
  {widgets.map(w => <div key={w.id} id={w.id}>{w.component}</div>)}
  {/* Fill gap with CTA when only 1 widget */}
  {widgets.length === 1 && (
    <LogMatchCTACard />
  )}
</div>
```

**Files:** `src/components/adaptive/AdaptiveDashboard.tsx`

---

### 1.2 Add Persistent "Log a Match" FAB

**Problem:** There is no persistent primary action. To log a match, a user must navigate through multiple widgets. Strava always shows a `+` record button.

**Fix:** Add a floating action button (FAB) on mobile and a top-nav button on desktop, always visible.

```tsx
// Fixed FAB — mobile only
<Link href="/match?mode=capture">
  <button className="fixed bottom-6 right-6 z-50 bg-green-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-xl md:hidden">
    <Plus className="w-6 h-6" />
  </button>
</Link>

// Desktop: add "Log Match" button to dashboard header actions
<Link href="/match?mode=capture">
  <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
    + Log Match
  </Button>
</Link>
```

**Files:** `src/components/adaptive/AdaptiveDashboard.tsx`

---

### 1.3 Add Communication Hub Component

**Problem:** Telegram, XMTP, and WhatsApp integrations are fully implemented in `server/services/communication/` but have **zero frontend surface**. Users cannot see connection status, configure preferences, or understand the value.

**Fix:** Create a new `CommunicationHub` component that shows:
- Connection status badges for each platform (Telegram, WhatsApp, XMTP)
- Link/unlink buttons per platform
- A "Share to [Platform]" button on match result cards

```tsx
// New file: src/components/dashboard/CommunicationHub.tsx
export const CommunicationHub: React.FC = () => (
  <Card>
    <h2 className="text-lg font-bold mb-4">Connect Your Squad's Chat</h2>
    <div className="space-y-3">
      <PlatformRow icon={<TelegramIcon />} name="Telegram" status="disconnected" onConnect={...} />
      <PlatformRow icon={<WhatsAppIcon />} name="WhatsApp" status="disconnected" onConnect={...} />
      <PlatformRow icon={<MessageSquare />} name="XMTP" status="disconnected" onConnect={...} />
    </div>
  </Card>
);
```

Add this widget to the dashboard with priority 155 (above governance, below pending actions) so it appears in the "Today" section until all platforms are connected.

**Files:** 
- `src/components/dashboard/CommunicationHub.tsx` (new)
- `src/components/adaptive/AdaptiveDashboard.tsx` (register widget)

---

### 1.4 Surface Integrations in Onboarding Checklist

**Problem:** The onboarding checklist (`OnboardingChecklist`) does not include a step for connecting communication platforms. Users complete onboarding without ever knowing Telegram/WhatsApp/XMTP exist.

**Fix:** Add a "Connect your squad's chat" step to the onboarding checklist, shown immediately after squad creation, with icons for each platform.

**Files:** `src/components/onboarding/OnboardingChecklist.tsx`

---

### 1.5 Redesign Match Center Widget

**Problem:** The Match Center widget (`recent-matches`) is a plain text list in a 3-column grid. It has no visual richness, no pitch visualization, no XP indicators, and no team crests — leaving the allocated space feeling empty.

**Fix:** Transform into a visual match card:
- Colour-coded result badge (green W / red L / grey D) with score
- Opponent name + date in a structured layout
- XP earned indicator per match
- "Share result" button linking to Communication Hub
- Empty state with illustrated prompt ("Your first match is waiting — log it now")

```tsx
// Enhanced match row
<div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-green-200 transition-colors">
  <div className="flex items-center gap-3">
    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-white text-sm ${
      match.result.startsWith('W') ? 'bg-green-600' :
      match.result.startsWith('L') ? 'bg-red-500' : 'bg-gray-400'
    }`}>
      {match.result.split(' ')[0]}
    </div>
    <div>
      <h3 className="font-semibold text-gray-900">vs {match.opponent}</h3>
      <p className="text-xs text-gray-500">{match.date}</p>
    </div>
  </div>
  <div className="flex items-center gap-2">
    <span className="text-xs text-green-600 font-bold">+{xp} XP</span>
    <span className="font-black text-gray-900">{match.score}</span>
  </div>
</div>
```

**Files:** `src/components/adaptive/AdaptiveDashboard.tsx` (recent-matches widget inline), or extract to `src/components/dashboard/MatchCenterWidget.tsx`

---

### 1.6 Reorder Dashboard Widgets

**Problem:** "Match Center" is widget priority 90, below Governance (92), Staff Feed (95), Event Feed (96), and Match Engine (98). The most important player action is buried.

**Fix:** Reorder priorities to reflect a player-first hierarchy:

| Widget | Current Priority | New Priority |
|---|---|---|
| Log a Match FAB | — | Always visible |
| Recent Matches | 90 | **170** |
| Pending Actions | 160 | 165 |
| Captain's Log | 150 | 155 |
| Communication Hub | — | **150** |
| Quick Stats | 100 | 140 |
| Match Engine | 98 | 130 |
| Event Feed | 96 | 100 |
| Lens Social | 94 | 95 |
| Governance | 92 | **60** |
| Staff Feed | 95 | **55** |
| Territory | 80 | **40** |

**Files:** `src/components/adaptive/AdaptiveDashboard.tsx`

---

### 1.7 Jargon Audit — Replace Crypto/Tech Terms in UI Copy

**Problem:** The UI uses developer/crypto-native language that alienates Sunday league players.

**Fix:** Replace the following terms across all frontend files:

| Current term | Replacement |
|---|---|
| "Phygital Proof" | "Share match result" |
| "CRE Workflow" | (remove from UI entirely) |
| "Lens V3 Identity" | "Social profile" |
| "Squad Governance" | "Squad settings" |
| "Territory Control" | "Local rankings" |
| "Agentic Concierge" | "Your assistant" |
| "Enter Office" | "Manage squad" |
| "Native Identity" | (remove badge) |
| "Web3-native Phygital community" | (remove entirely) |
| "Blockchain Verified • Chainlink Oracles • Kite AI Powered" | "Used by players across 12 cities" |
| "Post Phygital Proof" | "Share result" |

**Files:** 
- `src/components/common/HeroSection.tsx`
- `src/components/dashboard/LensSocialHub.tsx`
- `src/components/adaptive/AdaptiveDashboard.tsx`
- `src/components/adaptive/AgenticConcierge.tsx`
- Any other `.tsx` files containing the above terms

---

### 1.8 Add Empty States with Guidance

**Problem:** Empty states show generic messages ("No matches yet. Start your season!") with no actionable guidance or visual interest.

**Fix:** Replace all generic empty states with illustrated, action-oriented prompts:

```tsx
// Match Center empty state
<div className="text-center py-10">
  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
    <Trophy className="w-8 h-8 text-green-600" />
  </div>
  <h3 className="font-bold text-gray-900 mb-1">No matches logged yet</h3>
  <p className="text-sm text-gray-500 mb-4">
    Log your first match in 30 seconds — just enter the score and opponent.
  </p>
  <Link href="/match?mode=capture">
    <Button className="bg-green-600 text-white">Log First Match</Button>
  </Link>
</div>
```

Apply the same pattern to: Squad Activity, Upcoming Fixtures, Training Center, Scouting Report.

**Files:** `src/components/adaptive/AdaptiveDashboard.tsx` and individual widget components

---

### 1.9 Desktop Layout Optimisation

**Problem:** The 3-column widget grid on desktop creates visual imbalance. A right sidebar with persistent quick actions would be more useful than a third widget column.

**Fix:** Implement a 2-column main + right sidebar layout on desktop:
- **Left/main (2/3 width):** Primary widgets (matches, stats, squad activity)
- **Right sidebar (1/3 width):** Persistent panel with:
  - "Log a Match" CTA
  - Communication Hub connection status (Telegram / WhatsApp / XMTP)
  - Upcoming fixtures
  - Quick squad notifications

```tsx
// Dashboard layout
<div className="hidden md:grid md:grid-cols-3 gap-6">
  <div className="col-span-2 space-y-6">
    {/* Main widgets */}
  </div>
  <div className="col-span-1 space-y-4">
    <LogMatchCTACard />
    <CommunicationHub compact />
    <UpcomingFixtures />
  </div>
</div>
```

**Files:** `src/components/adaptive/AdaptiveDashboard.tsx`

---

### 1.10 Hero Page — Rewrite Badge and Subheadline

**Problem:** The hero badge reads "Blockchain Verified • Chainlink Oracles • Kite AI Powered" — written for a developer audience, not a Sunday league player.

**Fix:**
```tsx
// Before
<span>Blockchain Verified • Chainlink Oracles • Kite AI Powered</span>

// After
<span>Used by 5-a-side players in 12 cities</span>
```

Also update the subheadline:
```tsx
// Before
"Turn real matches into an epic game. Build your legend with AI agents, blockchain verification, and Championship Manager gameplay."

// After
"Log matches in 30 seconds. Share verified results. Build your player reputation — season by season."
```

Add a row of integration logos (Telegram, WhatsApp, XMTP, Lens) below the CTA as trust signals.

**Files:** `src/components/common/HeroSection.tsx`

---

## Section 2 — Adal's Work (Product, Design & Backend-Dependent)

### 2.1 Create User Profile / Settings Page

**What's needed:** A dedicated `/profile` or `/settings` page that shows:
- Connected wallet address with copy/disconnect option
- Squad membership(s) with role
- Notification preferences (email, push, in-app)
- Linked communication platforms (Telegram / XMTP / WhatsApp) with live connection status
- Logout / switch wallet option
- Player stats summary (goals, assists, matches, rating)

**Why this is Adal's work:**
- Requires decisions on what profile data to persist (on-chain vs. database)
- Notification preference schema needs to be defined and added to the Prisma model
- Wallet disconnect/switch flow has security implications that need product sign-off
- Avatar/profile image upload requires storage infrastructure decision (IPFS vs. S3)

---

### 2.2 Communication Hub — Backend API Endpoints

**What's needed:** The `CommunicationHub` frontend component (built by Junie in 1.3) needs API endpoints to:
- `GET /api/user/connections` — return connection status for Telegram, WhatsApp, XMTP per user
- `POST /api/user/connections/telegram` — initiate Telegram link (generate bot deep-link)
- `POST /api/user/connections/whatsapp` — initiate WhatsApp link (generate QR or OTP flow)
- `POST /api/user/connections/xmtp` — initiate XMTP wallet-based connection
- `DELETE /api/user/connections/:platform` — unlink a platform

**Why this is Adal's work:**
- The bridge service (`server/services/communication/bridge.ts`) exists but has no REST API layer
- Telegram bot token, WhatsApp Business API credentials, and XMTP keys need to be provisioned and stored securely
- OAuth/webhook flows for each platform need to be designed and tested
- Rate limiting and error handling strategy needs product input

---

### 2.3 Pitch Visualization Design

**What's needed:** A visual pitch/field graphic for the Match Center widget showing:
- Goal markers at the positions they were scored
- Team formations (home vs. away)
- Key events timeline (goals, cards, substitutions)
- Team crests/logos

**Why this is Adal's work:**
- Requires a design asset (SVG pitch template) or a third-party library decision (e.g. `react-football-pitch`)
- Formation and event data schema needs to be defined in the match submission flow
- Team crest/logo storage and retrieval needs infrastructure decision
- This is a significant design effort that should be prototyped in Figma before implementation

---

### 2.4 Guest / Demo Mode as Default Landing Path

**What's needed:** Make "Explore as Guest" the **primary CTA** on the landing page, with "Connect Wallet" as secondary. The guest mode and Hackney Marshes demo data already exist in code — this is a product decision about the default user journey.

**Current flow:** Land → "Start Your Season" → wallet connect modal → dashboard  
**Proposed flow:** Land → "Explore the App" (guest, no wallet) → populated demo dashboard → "Connect Wallet" prompt when user tries to save/submit

**Why this is Adal's work:**
- This is a fundamental product decision about conversion strategy (wallet-first vs. value-first)
- The demo data (Hackney Marshes) needs to be reviewed and approved as the canonical demo experience
- Analytics/tracking needs to be set up to measure guest→connected conversion rate
- May require legal/privacy review if guest sessions are tracked

---

### 2.5 Personalization and Goal-Oriented User Journeys

**What's needed:** Move from a static widget gallery to goal-oriented user journeys, similar to ClassPass ("Book a class") or Strava ("Record an activity"):

- **Journey 1:** "I played a match today" → log result → verify with opponent → share to squad chat → see XP earned
- **Journey 2:** "I want to find rivals" → browse nearby squads → challenge to a match → schedule fixture
- **Journey 3:** "I want to grow my squad" → invite players → set up communication channels → assign roles

**Why this is Adal's work:**
- Requires product definition of each journey's steps and success criteria
- Journey completion tracking needs analytics infrastructure
- "Challenge to a match" flow requires opponent-side UX design
- Player invitation flow requires email/notification infrastructure decisions
- These journeys should be validated with real users before implementation

---

### 2.6 Navigation — "Connect" / "Messages" Nav Item

**What's needed:** A new top-level navigation item ("Connect" or "Messages") that surfaces the Communication Hub as a first-class destination, with connection status badges visible in the nav.

**Why this is Adal's work:**
- Navigation IA changes require product sign-off (what gets demoted to make room?)
- Badge/notification count logic requires backend push notification infrastructure
- Mobile bottom nav has limited space — this requires a design decision on what to replace or collapse
- The nav item label ("Connect", "Messages", "Chat", "Comms") needs user testing to validate

---

### 2.7 Squad Rivalry and Territory — UX Design

**What's needed:** The Territory Control and Nearby Rivals features exist in code but their UX is unclear to users. These need:
- A clear explanation of what "territory" means in plain English ("your local area ranking")
- A map or visual representation of territory boundaries
- A rivalry system that feels like a game mechanic, not a database query

**Why this is Adal's work:**
- Requires a map/geolocation design decision (Google Maps, Mapbox, or custom SVG)
- "Territory" game mechanics need to be fully designed and documented before implementation
- Geolocation data collection requires privacy policy updates
- This is a differentiating feature that deserves dedicated design sprint time

---

## Priority Summary

### Junie — Completed ✅

| # | Task | Status |
|---|---|---|
| 1.1 | Fix blank desktop gap | ✅ Complete |
| 1.2 | Add persistent Log a Match FAB | ✅ Complete |
| 1.6 | Reorder dashboard widget priorities | ✅ Complete |
| 1.7 | Jargon audit — replace crypto terms | ✅ Complete |
| 1.10 | Hero page badge + subheadline rewrite | ✅ Complete |
| 1.3 | Create CommunicationHub component (UI only) | ✅ Complete |
| 1.4 | Surface integrations in onboarding checklist | ✅ Complete |

### Junie — Remaining

| # | Task | Est. Effort |
|---|---|---|
| 1.5 | Redesign Match Center widget (visual cards) | 2 hours |
| 1.8 | Add empty states with guidance | 1.5 hours |
| 1.9 | Desktop 2-col + sidebar layout | 3 hours |

### Adal — Product/Design Decisions Required First

| # | Task | Dependency |
|---|---|---|
| 2.1 | User Profile / Settings page | Schema decisions, storage infra |
| 2.2 | Communication Hub API endpoints | Platform credentials, OAuth flows |
| 2.3 | Pitch visualization design | Design assets, data schema |
| 2.4 | Guest mode as default landing | Product/conversion strategy decision |
| 2.5 | Personalized user journeys | User research, analytics infra |
| 2.6 | "Connect" nav item | Nav IA decision, notification infra |
| 2.7 | Territory/rivalry UX design | Map library decision, game mechanic design |
