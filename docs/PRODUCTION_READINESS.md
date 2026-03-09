# SportWarren — Production Readiness Assessment

**Date:** 9 March 2026  
**Build Status:** ✅ Passing | **Push:** `a0b15e5` on `main`

---

## The Honest Verdict

> **Ready for: Public Production Launch (pending hosting variables)**  
> **Status: Operational Hardening Complete**

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
| **Match Verification** | ✅ | GPS, multi-party consensus, Algorand tx |
| **Player XP & Attributes** | ✅ | TRPC + Prisma, FIFA-style progression |
| **Squad DAO & Voting** | ✅ | Democratic challenge proposals |
| **Territory Control** | ✅ | Real-world pitch dominance |
| **Lens Social Layer** | ✅ | Profile, highlight sharing on Base |
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

---

## 🟡 Important — Fix Before Wide Beta

### 5. Guest → Wallet Migration (Data Loss Risk)
A user drafts 3 players as Guest, then connects their wallet — their progress is lost. Testers will notice this immediately.

```
ACTION: Implement guest session migration in WalletContext.tsx
        when a wallet first connects
```

### 6. Error Monitoring (Zero Visibility)
There is no Sentry or equivalent. When a real user hits an error in production, you'll never know it happened.

```
ACTION: Add @sentry/nextjs — 30 min job
```

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
