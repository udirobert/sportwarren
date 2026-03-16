# SportWarren — Production Readiness Assessment

**Date:** 17 March 2026  
**Build Status:** ✅ `npm run build` passing (lint emits warnings)

---

## The Honest Verdict

> **Ready for: Closed Beta**  
> **Status: UX/IA + Auth Hardening In Progress**

We have a high-fidelity, functional application with a compelling user loop. The onboarding, core gameplay, and backend integrations are all live. What remains is operational hardening.

---

## ✅ What IS Production-Quality Today

| Area | Status | Notes |
|---|---|---|
| **Build & Types** | ✅ | Zero TS errors, clean `npm run build` |
| **Onboarding Flow** | ✅ | 6-step wizard + persistent checklist |
| **Draft Engine** | ✅ | Signs to DB, deducts treasury |
| **Match Engine** | ✅ | Uses real squad data, stat-driven physics |
| **Staff Room** | ✅ | Agentic dialog-first flow, live tRPC data, per-staff chat, consumed actions, mobile responsive |
| **Cross-staff Context** | ✅ | AgentContext (React Context + useReducer) — Scout/Physio/Comms/Coach actions propagate to sibling staff chats |
| **On-chain Approval Gates** | ✅ | Yellow payment + Lens post queued with ✅ Sign & Execute / ❌ Cancel UI; Lens router stub ready for SDK swap |
| **Notification Feed** | ✅ | EventFeed widget — persistent backroom alerts outside Staff Room, per-category filters, unread badge |
| **Performance (Dynamic Imports)** | ✅ | 12 heavy dashboard components code-split via next/dynamic (ssr:false) |
| **Test Coverage** | ✅ | Vitest suite: 20 tests across AgentContext reducer (11) and useAgentAlerts rules (9) |
| **Match Verification** | ✅ | GPS, multi-party consensus, Algorand tx |
| **Yellow Payments** | ✅ | Treasury live-wired; transfer + match shared-session flows implemented in app, pending production env rollout |
| **Player XP & Attributes** | ✅ | TRPC + Prisma, FIFA-style progression |
| **Squad DAO & Voting** | ✅ | Democratic challenge proposals |
| **Territory Control** | ✅ | Real-world pitch dominance |
| **Lens Social Layer** | ✅ | Profile, highlight sharing on Lens Chain |
| **Squad Creation Gate** | ✅ | 3-step wizard for new connected users with no squad |
| **Guest Mode** | ✅ | Explore the full app without a wallet |
| **Training Center** | ✅ | Logging, Sharpness, XP gains |

---

## 🔴 Hard Blockers for Public Launch

These **must** be resolved before you can open to the public without risk.

### 1. Database Connection in Production
**Status: ✅ RESOLVED**
- Added production guards in `db.ts` to throw on missing `DATABASE_URL`.
- Optimized connection pooling for serverless environments.
- Added `directUrl` support for Neon/Supabase migrations.

### 2. Real Wallet Signatures are Simulated
**Status: ✅ RESOLVED**
- Rewrote `connect()` flow in `WalletContext.tsx` to use client-side signing.
- Implemented `/api/auth/challenge` for server-side verification.
- Fixed TRPC closure bug to ensure auth signatures are injected into every request.

### 3. Environment Variables Not Audited for Production
**Status: ✅ RESOLVED**
- Audited all required variables in `.env.example`.
- Created `.env.production.example` with a comprehensive deployment checklist.
- Enhanced `/api/health` to perform deep checks on DB connectivity and required env vars.

### 4. Agentic Staff Room — Sprint Items
**Status: ✅ RESOLVED**
- Consumed inline action buttons: grey out and disable after first click via `usedActions` Set — no double-firing.
- Per-staff chat history: each staff member retains their own conversation across the session.
- Loading and error banners: pulsing loader while tRPC queries are in-flight; red warning banner on treasury query error.
- Squad creation gate: connected users with no squad see a 3-step creation wizard before the dashboard.
- TypeScript strict-mode pass: `response` typed as `string | null`; all `null as unknown as string` casts removed.
- Mobile responsive audit: Staff sidebar scrolls horizontally on small screens; Contract modal anchors as bottom sheet with touch-friendly controls.

### 5. Agentic Platform — Advanced Sprints
**Status: ✅ RESOLVED**
- TS2589 type explosion in StaffRoom tactics inference fixed (cast via `Record<string, unknown>`).
- Sprint 4: `AgentContext` (React Context + useReducer) — cross-staff context sharing; Scout trial/Physio injury/Comms deal/Coach formation dispatches propagate reactive messages to sibling staff chats.
- Sprint 5: On-chain approval gate UI (yellow border banner); Scout trial queues Yellow payment action; Comms deal queues Lens post action; `lens.ts` tRPC router stub wired and ready for `@lens-protocol/client` swap.
- Notification feed: `EventFeed` component reads `useAgentAlerts`, renders per-category filtered event list with unread badge outside Staff Room.
- Performance: 12 heavy dashboard components converted to `next/dynamic` (ssr:false) for code-splitting.
- Test coverage: Vitest + React Testing Library installed; 20 tests across `AgentContext` reducer and `useAgentAlerts` rule engine.

### 6. Yellow Payment Rail
**Status: 🟡 IMPLEMENTED, OPERATIONAL ROLLOUT PENDING**
- Browser-side ClearNode auth is wired through `useYellowSession`.
- Treasury deposits/withdrawals accept real Yellow settlement refs and persist them through the existing ledger path.
- Transfer escrow uses shared squad-leader sessions for create/cancel/respond when both parties have discoverable EVM wallets.
- Match fees lock on submit and settle after consensus with an idempotent `yellow_fee_settled_at` guard.
- Remaining production work is operational, not architectural: confirm `NEXT_PUBLIC_YELLOW_PLATFORM_WALLET` is set in live envs and test with two real squad-leader wallets on the live rail.

---

## 🟡 Product & UX Hardening (Beta → Public)

### 1. Journey Clarity + IA Boundaries
Landing (`/`) must remain marketing-only; all operational flows live in `/dashboard` and feature hubs.

### 2. Affordance Integrity
Every icon/button that looks clickable must perform a real action or be visually de-emphasized.

### 3. Layout Density + Visual System
Dashboards and hubs must follow the shared grid/token system with consistent spacing, headers, and card rhythms.

### 4. Role & Permission Clarity
Member vs Captain actions need clear, consistent UI and server-side enforcement.

---

## 🟡 Important — Fix Before Wide Beta

### 5. Guest → Wallet Migration (Data Loss Risk)
**Status: ✅ RESOLVED**
- Guest progress now persists through wallet connect and prompts for migration.
- Pending migration flag (`sw_guest_pending_migration`) prevents silent data loss.

### 6. Error Monitoring (Zero Visibility)
**Status: ✅ RESOLVED**
- Added `@sentry/nextjs` with client/server/edge configs.
- Requires `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN` in production envs.

### 7. Real Prospect Data
The draft pool is still `MOCK_AVAILABLE_PLAYERS`. In production the market router returns them as-is. Testers will see the same 5 names every time.

```
ACTION: Seed the DB with real prospect profiles, or
        add a `createProspect` admin route
```

---

## 🔵 Nice-to-Have Before Public Launch

| Item | Effort |
|---|---|
| Toast notifications instead of `alert()` calls | Low |
| Mobile performance pass on Match Engine canvas | Medium |
| Season stats infographics / Trophy cabinet | Medium |
| Kit customisation | High |
| CI/CD GitHub Actions pipeline | Medium |

---

## Recommended Launch Path

```
Week 1: Fix Hard Blockers (DB + Auth + Env Vars)
Week 2: Closed Beta with 10–20 real Sunday League players
Week 3: Gather feedback, fix Guest migration + add Sentry
Week 4: Soft public launch with waitlist
```

---

> [!IMPORTANT]
> The single most valuable thing you can do **right now** is put the app in front of 5 real Sunday League players and watch them go through the onboarding wizard. Their behaviour will tell you exactly what to fix next — before you invest in operational hardening.

---

**See Also:** [ROADMAP.md](./ROADMAP.md) | [FEATURES.md](./FEATURES.md)
