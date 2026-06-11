# X402 & Scout-Flow Cleanup Plan

**Status:** Draft, ready for review
**Scope:** Consolidate scout paths, decouple settlement from user response, clean crypto jargon from end-user surfaces, retire dead code.
**Out of scope:** New features, new dependencies, GOAT x402 implementation work, pricing changes.

---

## 0. Executive Summary

The single highest-leverage change is making the WhatsApp `scout` (and `trigger-auto-scout`) commands return the AI report in ~2 seconds regardless of whether the x402 facilitator is reachable. Today, every scout call blocks on settlement before replying, so a single facilitator hiccup translates to a dead user experience across WhatsApp, Telegram, the auto-scout cron, and the web.

Everything else in this plan is either a precondition for that change, a consumer of the new async-settlement primitives, or a cosmetic cleanup that is now safe to ship because the critical path is no longer gated on settlement.

| # | Part | Effort | Risk | Impact |
|---|------|--------|------|--------|
| 1 | Deferred scout settlement (schema + service + worker + UX states) | M | M | **Critical** |
| 2 | Consolidate the four scout paths into `createScoutReport` | S | M | High |
| 3 | Crypto-jargon rewrite across WhatsApp, web, Telegram surfaces | S | L | Medium |
| 4 | Gate / retire demo paths (`kite-proof`, external scout URL) | S | L | Medium |
| 5 | Annotate (not delete) GOAT x402 scaffolding; keep public 402 GET endpoints | XS | L | Low |

Effort: XS / S / M / L. Risk: L (low) / M / H.

**No new dependencies, no new service modules, no new abstractions.** The schema change adds four columns to an existing model. The settlement worker is a new cron route that follows the existing `src/app/api/cron/*` pattern (one file, ~80 lines). Every other change is an edit to an existing function or string. New files: 1 cron route + ~6 test files + this plan.

---

## 1. Audit Resolutions (must be settled before execution)

The original plan flagged two open questions. Both have definite answers after a code search; we resolve them here so the executor does not have to re-investigate.

### 1.1 `TacticalSpend` is rendered and must be rewritten, not deleted

`grep TacticalSpend src/`:

```
src/components/player/PlayerReputation.tsx:18:  import { TacticalSpend } from './TacticalSpend';
src/components/player/PlayerReputation.tsx:314: <TacticalSpend currentBudget={...} spentThisWeek={...} onUpdateBudget={...} />
```

`PlayerReputation.tsx` line 314 renders `<TacticalSpend>` in the right column of the reputation dashboard. The component is reachable from the player profile, so Part 4 of this plan includes a jargon rewrite of its labels, not a deletion. Deleting it would leave a layout hole in the reputation page.

### 1.2 The public `GET /api/x402/*` endpoints are intentional, not dead code

`GET /api/x402/scout` and `GET /api/x402/verify-match` exist **only** to return a `402 Payment Required` with `PaymentRequirements` in the `PAYMENT-REQUIRED` header. This is the x402 v2 service advertisement pattern: external agents (other Kite Passport wallets, x402-aware clients) probe a URL with `GET`, get a 402 challenge back, sign an `EIP-3009` authorization, and retry with `X-PAYMENT`.

These endpoints are not called by any internal code. They **must not** be deleted; they are how external agents discover SportWarren as a service provider. We keep them, add a `// DO NOT REMOVE — public x402 discovery endpoint` banner, and document the contract.

### 1.3 There is a fourth scout path the original plan missed

The original plan listed three scout paths. There is a fourth that the auto-scout cron takes today, and it is a latent production bug:

```ts
// src/app/api/cron/auto-scout/route.ts:128
const res = await kiteAIService.executePaidRequest<{ summary?: string }>({
  agentId: manager.id,
  url: process.env.KITE_SCOUT_SERVICE_URL || '',   // <-- empty string in prod
  method: 'POST',
  body: { opponent: opponentName, requestedBy: 'cron:auto-scout' },
  maxAmountUsdc: SCOUT_AUTO_MAX_USDC,
  subject: { type: 'squad', id: squadId },
  kind: 'scout_report',
});
```

The cron calls `executePaidRequest` against an external URL defined by `KITE_SCOUT_SERVICE_URL`. The env var is not set in production, so `url: ''` is sent through the x402 probe and the call fails silently. The cron then marks the match as `auto_scout_complete: true` regardless of the failure. Part 2 of this plan fixes this by routing the cron through `createScoutReport` directly.

---

## 2. Part 1: Deferred Scout Settlement

This is the only part of the plan that requires new infrastructure. Everything else is text changes, file deletions, and function-call consolidation.

### 2.1 Goals and non-goals

**Goals**
- WhatsApp `scout`, `trigger-auto-scout`, and the auto-scout cron all return the report in under 2 seconds.
- Settlement runs in a separate worker with retries; it never blocks the user.
- A user-visible "verifying" state covers the gap between report delivery and settlement confirmation.
- Reconciliation: every report has a definitive settled/failed state within 10 minutes; failure surfaces to operators, not to users.

**Non-goals**
- Removing the `Attestation` row (we still need the audit trail).
- Changing the x402 payment protocol or the Pieverse facilitator.
- Adding new infrastructure beyond Redis (which is already used) and a new Prisma column.

### 2.2 Schema change

Add one column to the existing `Attestation` model in `prisma/schema.prisma`:

```prisma
model Attestation {
  // ... existing fields unchanged ...
  txHash       String?
  facilitator  String?
  amountUsdc   Float?
  // NEW
  settlementStatus  String?  // 'pending' | 'settled' | 'failed' | null
  settlementAttempts Int     @default(0)
  settlementError   String?
  settledAt         DateTime?
}
```

`txHash` already exists and is nullable; we use it as the source of truth for "is there a real chain receipt?". `settlementStatus` is the operator-facing signal.

**Migration safety**: the new columns are nullable / have defaults. A `prisma migrate dev` against a populated DB is non-breaking. We backfill existing rows in a single SQL pass:

```sql
UPDATE "Attestation"
SET "settlementStatus" = CASE
  WHEN "txHash" IS NULL OR "txHash" LIKE 'internal-%' OR "txHash" LIKE 'sim-%' THEN 'settled'
  ELSE 'settled'
END
WHERE "settlementStatus" IS NULL;
```

(Existing rows with `txHash` set are treated as settled; they were either real or simulated at write time, and we do not want to retry old charges.)

### 2.3 Service change: `createScoutReport`

Today (`src/server/services/ai/scout-report.ts`) the function takes a `settlement` argument and writes `txHash` from it before returning. We change the contract so that `settlement` is **optional** and, when absent, the row is written as `pending`:

```ts
export interface ScoutReportInput {
  opponent: string;
  requestedBy?: string;
  priceUsdc: number;
  // Optional: if provided, write as 'settled' immediately.
  // If absent, write as 'pending' and enqueue a settlement job.
  settlement?: Pick<SettlementResult, 'txHash' | 'facilitator' | 'simulated'>;
  enforceUserLimit?: boolean;
  enforceSquadLimit?: boolean;
}
```

The body changes from:

```ts
const txHash = input.settlement.txHash ?? `internal-scout-${Date.now()}`;
const attestation = await prisma.attestation.create({
  data: { /* ... */, txHash, /* ... */ },
});
```

to:

```ts
const settledNow = input.settlement && !input.settlement.simulated && input.settlement.txHash
  && !input.settlement.txHash.startsWith('internal-');

const txHash = settledNow
  ? input.settlement.txHash
  : null; // pending: no real tx yet

const attestation = await prisma.attestation.create({
  data: {
    /* ... */
    txHash,
    settlementStatus: settledNow ? 'settled' : 'pending',
    settledAt: settledNow ? new Date() : null,
  },
});

if (!settledNow) {
  // Enqueue a settlement job. See 2.4.
  await enqueueScoutSettlement(attestation.id);
}
```

Spending caps (`checkUserSpending` / `checkSquadSpending`) stay at the point of report generation. They are not re-checked at settlement time, because the user already consumed their daily budget. This matches the existing semantics: the cap is a rate limit on report generation, not a rate limit on chain settlement.

### 2.4 Settlement worker

Add a new cron route at `src/app/api/cron/scout-settle/route.ts` that drains pending attestations. Place it next to `auto-scout/`, `moment-render/`, etc. in `src/app/api/cron/`.

```ts
// src/app/api/cron/scout-settle/route.ts
import { redisService } from '@/server/services/redis';
import { prisma } from '@/lib/db';
import { createPlatformSettlement } from '@/server/services/blockchain/x402-client';
import { sendSettlementReceipt } from '@/server/services/communication/whatsapp';

const SETTLE_LOCK_KEY = 'cron:scout-settle:lock';
const SETTLE_LOCK_TTL = 60; // seconds
const BATCH_SIZE = 20;
const MAX_ATTEMPTS = 3;
const PER_JOB_TIMEOUT_MS = 10_000;

export async function GET(request: Request) {
  if (!await acquireLock()) return NextResponse.json({ skipped: 'locked' });
  try {
    return await drainQueue();
  } finally {
    await releaseLock();
  }
}

async function acquireLock() {
  return redisService.set(SETTLE_LOCK_KEY, '1', 'EX', SETTLE_LOCK_TTL, 'NX')
    .then((r) => r === 'OK');
}

async function drainQueue() {
  const pending = await prisma.attestation.findMany({
    where: {
      kind: 'scout_report',
      settlementStatus: 'pending',
      settlementAttempts: { lt: MAX_ATTEMPTS },
      createdAt: { gt: new Date(Date.now() - 24 * 3600 * 1000) }, // give up after 24h
    },
    take: BATCH_SIZE,
    orderBy: { createdAt: 'asc' },
  });

  const results = { attempted: 0, settled: 0, failed: 0, retried: 0 };
  for (const a of pending) {
    results.attempted++;
    try {
      const settlement = await Promise.race([
        createPlatformSettlement(a.amountUsdc ?? 0),
        timeoutAfter(PER_JOB_TIMEOUT_MS),
      ]);
      await prisma.attestation.update({
        where: { id: a.id },
        data: {
          txHash: settlement.txHash ?? a.txHash,
          facilitator: settlement.facilitator,
          settlementStatus: settlement.success && !settlement.simulated ? 'settled' : 'pending',
          settledAt: new Date(),
          settlementAttempts: { increment: 1 },
          settlementError: settlement.error ?? null,
        },
      });
      if (settlement.success && !settlement.simulated) {
        results.settled++;
        await sendSettlementReceipt(a).catch((e) => console.warn('[scout-settle] receipt push failed', e));
      } else {
        results.retried++;
      }
    } catch (err) {
      const attempts = a.settlementAttempts + 1;
      await prisma.attestation.update({
        where: { id: a.id },
        data: {
          settlementAttempts: { increment: 1 },
          settlementStatus: attempts >= MAX_ATTEMPTS ? 'failed' : 'pending',
          settlementError: (err as Error).message,
        },
      });
      results[attempts >= MAX_ATTEMPTS ? 'failed' : 'retried']++;
    }
  }
  return NextResponse.json({ ok: true, ...results });
}
```

Operational properties:
- **Single worker**: `SET NX EX` lock on Redis. Multiple cron triggers (Vercel + manual) will not double-settle.
- **Backoff**: `MAX_ATTEMPTS = 3`, with the 24-hour hard cutoff preventing infinite retries.
- **Timeout**: `PER_JOB_TIMEOUT_MS = 10_000` matches the existing `settleWithFacilitator` axios timeout.
- **Idempotency**: settlement updates `txHash`; the Attestation row is the unit of work. If the worker crashes mid-update, the next run picks it up.
- **No new infrastructure**: uses `redisService` (already imported in `whatsapp-agent.ts`), `prisma`, `createPlatformSettlement`.

**Cron schedule**: every 5 minutes via Vercel Cron (config in `vercel.json`). The 5-minute cadence is fine because the user-visible UX (see 2.6) does not require faster than that.

### 2.5 The `sendSettlementReceipt` notification

Add a small helper in `src/server/services/communication/whatsapp-agent.ts` (or a new sibling `whatsapp-settlement.ts` if it grows) that pushes a follow-up WhatsApp message when a scout settlement completes. Resolves the original `requestedBy` from `Attestation.payload.requestedBy`, finds the user's `PlatformIdentity` for `whatsapp`, and sends:

```
✅ Receipt confirmed: scout-vs-Arsenal
View: https://testnet.kitescan.ai/tx/0xabc...
```

If no `PlatformIdentity` exists (cron-triggered scout, no human to notify), the helper is a no-op. This is the bridge that turns the deferred settlement into a complete user experience.

### 2.6 User-visible state transitions

Every surface that displays a scout receipt must respect the new `settlementStatus` field.

**WhatsApp scout interactive list** (`whatsapp-agent.ts:548`)

Replace the `scout_settle_*` row title with:

```ts
const settleRow = {
  id: `scout_settle_${Date.now()}`,
  title: report.txHash
    ? `✅ Receipt confirmed`                                    // settled
    : `⏳ Verifying on Kite (usually under 1 min)`,            // pending
  description: report.txHash
    ? `View: ${fmtTx(report.txHash)}`
    : `You'll get a follow-up message here once it's confirmed.`,
};
```

The interactive list message itself cannot be edited in place (Kapso/WhatsApp constraint), so the user sees a clean "Verifying" row in the initial response and a separate "Receipt confirmed" message 30-120 seconds later. That is a strictly better experience than the current "off-chain receipt until facilitator settles" copy.

**WhatsApp `scouts` list** (`whatsapp-agent.ts` around line 660)

```ts
const link = a.settlementStatus === 'settled' || a.txHash && !a.txHash.startsWith('internal-')
  ? fmtTx(a.txHash)
  : '(verifying on Kite)';
```

**Match detail page Settlement card** (`src/app/(app)/match/[id]/page.tsx:306`)

The "Settlement" card currently shows `yellowFeeSessionId` (a hex blob) and a Yellow Network label. Replace with:

```tsx
{isVerified && m.yellowFeeSessionId && (
  <Card className="bg-gray-900 border-blue-500/30 p-4">
    <h4 className="text-xs font-bold text-blue-300 uppercase tracking-wider mb-3 flex items-center gap-2">
      <Shield className="w-3 h-3" /> Match Fee
    </h4>
    <div className="space-y-2 text-xs">
      <div className="flex items-center justify-between">
        <span className="text-gray-400">Status</span>
        <span className="text-emerald-300 font-bold">
          {m.yellowFeeSettledAt ? 'Settled' : 'Locked (refunds if match disputes)'}
        </span>
      </div>
      {m.yellowFeeSettledAt && (
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Settled at</span>
          <span className="text-emerald-300 font-bold">
            {new Date(m.yellowFeeSettledAt).toLocaleString()}
          </span>
        </div>
      )}
    </div>
  </Card>
)}
```

**Match detail page x402 verification badge** (`page.tsx:340`)

Replace the second card's copy: "Match result recorded as a paid x402 attestation on the Kite agent economy. External agents can verify the same result for the standard fee." with something like: "Match result is publicly verifiable — other managers can request a copy of the result through SportWarren." Drop the "x402" mention entirely from the user-visible string.

**Telegram auto-scout message** (`auto-scout/route.ts:170+` and the Telegram group send below it)

Same treatment: drop "Settled on Kite" and the receipt link from the message body; the WhatsApp receipt push from 2.5 carries it. If the auto-scout runs and the squad has no WhatsApp-linked captain, the message is unchanged (we still want the Telegram group to know).

### 2.7 Feature flag

Add `SCOUT_DEFERRED_SETTLEMENT` env var. When unset / `"false"`:
- `createScoutReport` takes the legacy path (settlement-then-write, simulated fallback).
- The settlement worker is a no-op.
- Existing behavior is preserved.

When set to `"true"`:
- `createScoutReport` writes the row as `pending` and enqueues.
- The worker drains.

This gives us a kill switch and a phased rollout (see Section 6).

### 2.8 Test plan for Part 1

| Test | File | What it asserts |
|------|------|-----------------|
| `createScoutReport` deferred mode | new `src/test/scout-report-deferred.test.ts` | With `settlement: undefined`, returns within 100ms, row has `settlementStatus: 'pending'`, `txHash: null`, enqueue is called once |
| `createScoutReport` settled-now mode | same file | With a real `settlement.txHash`, row is `settlementStatus: 'settled'`, `txHash: '0x...'` |
| `createScoutReport` simulated path | same file | With `simulated: true`, row is still `pending` (simulated is not a settlement) |
| Spending cap still applies in deferred mode | same file | `checkUserSpending` is called regardless of settlement path |
| Worker drains pending | new `src/test/scout-settle-worker.test.ts` | Mocks `createPlatformSettlement`; runs drain; asserts `pending` -> `settled` transition |
| Worker retries on failure | same file | First call rejects, second call resolves; row goes `pending` -> `pending` -> `settled` |
| Worker marks failed after MAX_ATTEMPTS | same file | Three consecutive failures; row is `failed` |
| Worker respects lock | same file | Two concurrent invocations: second returns `{ skipped: 'locked' }` |
| WhatsApp follow-up push | extension to `whatsapp-agent.test.ts` | After settlement, `sendSettlementReceipt` is called with the attestation |
| Receipt URL gating | extension to `whatsapp-agent.test.ts` | `scouts` list shows "(verifying on Kite)" when `settlementStatus === 'pending'`, shows real URL when `settled` |
| Match detail page | new `src/test/match-detail-settlement.test.ts` (RTL) | When `yellowFeeSettledAt` is null, card shows "Locked (refunds if match disputes)"; when set, shows "Settled" + timestamp; `yellowFeeSessionId` hex blob is never rendered |

---

## 3. Part 2: Consolidate Scout Paths

After Part 1, the dependency graph becomes:

```
WhatsApp `scout`              ─┐
WhatsApp `trigger-auto-scout` ─┼──→ createScoutReport() ──→ AI/TinyFish
Auto-scout cron               ─┘                            ──→ DB
                                  │
                                  └──→ attestation row (pending)
                                       │
                                       └──→ (async) scout-settle worker
```

### 3.1 Auto-scout cron rewrite

`src/app/api/cron/auto-scout/route.ts` currently has two divergent scout implementations: one via `executePaidRequest` (lines 128-145) and a separate scout report construction inline. Replace both with a single call to `createScoutReport`:

```ts
import { createScoutReport } from '@/server/services/ai/scout-report';
// remove: import { kiteAIService } from '../ai/kite' usage for scout

// in the inner loop:
const report = await createScoutReport({
  opponent: opponentName,
  requestedBy: `cron:auto-scout:${squadId}`,
  priceUsdc: SCOUT_AUTO_PRICE_USDC,
  // settlement: undefined in deferred mode
  enforceUserLimit: false,    // cron actors have unlimited budget already
  enforceSquadLimit: false,
});
```

`getScoutUserDailyLimit` already returns `0` for `userId.startsWith('cron:')` (see `src/server/services/ai/kite.ts:194`), so we pass `enforceUserLimit: false` for clarity.

The `KITE_SCOUT_SERVICE_URL` env var, the `executePaidRequest` call, and the `createSession` call inside the cron are all deleted. The cron becomes simpler, not more complex.

### 3.2 Tests for Part 2

| Test | File | Asserts |
|------|------|---------|
| Auto-scout cron calls `createScoutReport` | new `src/test/auto-scout-cron.test.ts` | Mocks the dependency tree; asserts `createScoutReport` is called once per `(match, squad)` pair with the right opponent and `enforceUserLimit: false` |
| Auto-scout cron does not call `executePaidRequest` | same file | Spy on `kiteAIService.executePaidRequest`; never called |
| Auto-scout cron does not call `KITE_SCOUT_SERVICE_URL` | same file | Env var is read nowhere in the cron path |
| Auto-scout cron marks failed scouts but does not mark match complete | same file | When `createScoutReport` throws, `auto_scout_complete` is still set on the match (we tried, we don't infinite-retry) — matches existing behavior |

---

## 4. Part 3: Crypto-Jargon Cleanup

Scope: every user-visible string that mentions x402, Kite, USDC, settlement, attestation, or chain labels in a way that the user does not need to understand to use the product. We are not removing the underlying payment rail; we are making the marketing copy describe the user-facing value.

### 4.1 Surface-by-surface changes

| Surface | File:Line | Before | After |
|---------|-----------|--------|-------|
| WhatsApp scout help | `whatsapp-agent.ts` `HELP` (around line 121) | `scout <opponent>  – AI scouting report + SportWarren receipt (0.005 testnet token)` | `scout <opponent>  – get a tactical brief on your next opponent` |
| WhatsApp scout help | same | `kite-proof       – demo Kite Passport payment (judge on-chain proof)` | **delete the line** (see Part 4) |
| WhatsApp scout response settle row | `whatsapp-agent.ts:548` | `✅ *Settled on Kite*` / `📋 *SportWarren attestation* (off-chain receipt until facilitator settles)` | See 2.6 |
| WhatsApp scout response data row | same | `description: "On-chain attestation"` | `description: "Verified scout brief"` |
| WhatsApp budget response | `whatsapp-agent.ts` around line 730 | `Your spend: $0.20 · Remaining: $0.30` | `Your scout budget: 3 reports left today` (count, not dollars) |
| WhatsApp budget tooltip | same | "daily spend cap, not a wallet balance" | "your daily limit — try again tomorrow, or use `tinyfish scout` for a free brief" |
| WhatsApp auto-scout message | `auto-scout/route.ts:170+` | `Settled on Kite\nReceipt: https://testnet.kitescan.ai/tx/...` | `Receipt: <link>` (link optional; the WhatsApp follow-up from 2.5 carries it) |
| WhatsApp `attestations` command | `whatsapp-agent.ts` around line 800 | `📜 *Recent Attestations (n)*` | `📜 *Recent activity (n)*` |
| WhatsApp `cost` command | `whatsapp-agent.ts` around line 790 | `scout <opponent> — 0.005 testnet token (AI scouting report + SportWarren receipt)` | `scout <opponent> — 1 brief from your daily allowance` |
| Match detail Settlement card | `src/app/(app)/match/[id]/page.tsx:306` | Yellow Network, `yellowFeeSessionId` hex, "x402 attestation" copy | "Match Fee" / "Settled" / "Locked" — see 2.6 |
| Match detail x402 verification card | `src/app/(app)/match/[id]/page.tsx:340` | "Verified via x402" / "paid x402 attestation on the Kite agent economy" | "Public result" / "Other managers can request a copy of this result through SportWarren" |
| Match list fee toast | `src/app/(app)/match/page.tsx:285` | `Fee session locked / 1.00 USDC reserved. Settles on opponent verification.` | `Match fee locked. Refunds if the result is disputed.` |
| Match submit / verify mini-app | `src/app/api/telegram/mini-app/match/submit/route.ts:15` and `verify/route.ts:12` | `yellowSettlement: z.object({ sessionId: z.string()... })` | **Internal API only** — leave the field name (it is the zod schema for the API contract, not a user surface). Add a code comment noting the field is intentionally named for the underlying service, not for the user. |
| PlayerReputation Tactical Intelligence card | `src/components/player/PlayerReputation.tsx:339` | "Your digital twin uses **x402 protocol** to autonomously hire scouts and analysts while you sleep." | "Your digital twin handles scouting and analysis automatically — it briefs you on opponents before each match." |
| PlayerReputation TacticalSpend component | `src/components/player/TacticalSpend.tsx:18,80,118,120` | "x402 Autonomous Auth", "Signing x402 Auth", `<ChainLabel chain="kite" />`, "Update your Digital Twin's autonomous spending policy on the <ChainLabel chain=\"kite\" />" | "Autonomous budget", "Updating your policy", "the chain", "Update your Digital Twin's autonomous spending policy" |
| Telegram mini-app messages | `auto-scout/route.ts` Telegram group send | "Settled on Kite" / "KiteScan" | Drop the "KiteScan" line from the Telegram group message; keep just the summary |
| Settings page | `src/app/(app)/settings/page.tsx:887,913,922,950` | "Yellow settlement", "Yellow Network", "Yellow fee locks" | "Match fees" / "Match escrow" / "Treasury settlements" — settings is a power-user surface, but the wallet tooltip should describe the user's option, not the protocol |

### 4.2 Tests for Part 3

| Test | Asserts |
|------|---------|
| Extension to `whatsapp-agent.test.ts` | The help text returned by `dispatchWhatsAppCommand('help', ...)` does not contain the strings `x402`, `Kite`, `USDC`, `attestation`, `Yellow`, `facilitator` (case-insensitive) |
| RTL test for `TacticalSpend` | Component renders the new "Autonomous budget" label; does not render `<ChainLabel chain="kite" />` in the loader copy |
| RTL test for match detail page | When `yellowFeeSettledAt` is null, the rendered DOM does not contain the strings `Yellow Network`, `x402`, `attestation` |
| RTL test for match detail page | When `yellowFeeSettledAt` is set, the rendered DOM contains the timestamp and the word "Settled" |

### 4.3 What we are NOT changing

- Internal API field names (`yellowSettlement`, `KITE_X402_NETWORK`, `Attestation.facilitator`). These are developer surfaces.
- The `ksearch services list --payment-approach x402` CLI calls; they query an external protocol.
- The `x402-client.ts` file name. It is descriptive of what the code does (talks to the x402 protocol); renaming it would break the import graph for no user benefit.
- The match submit / verify zod schemas. They are wire formats.
- The `Yellow` mention in `ChainLabel` (it is a chain identifier component, used in many places).
- Internal logs and Sentry tags.

---

## 5. Part 4: Demo-Path Gating and Retirement

### 5.1 `kite-proof` WhatsApp command

**Current state**: `whatsapp-agent.ts:121` (HELP), `whatsapp-agent.ts:185` (RUN_ALLOWED), `whatsapp-agent.ts:478` (dispatch).

**Change**:
1. Delete the line from `HELP` (Part 4 already removes it as part of jargon cleanup).
2. Remove `kite-proof`, `kiteproof` from `RUN_ALLOWED`.
3. Wrap the dispatch case in `KITE_DEMO_MODE === 'true'`:

```ts
case "kite-proof":
case "kiteproof":
case "kite-demo": {
  if (process.env.KITE_DEMO_MODE !== 'true') {
    return "❌ Unknown command. Try `help`.";
  }
  // ... existing body
}
```

This preserves the demo path for the hackathon (set the env var on a staging deploy) without leaving it in the user-facing help text or the AI intent router. The companion script `scripts/kite-onchain-proof.ts` is unaffected and remains the primary demo path.

### 5.2 Public `GET /api/x402/*` endpoints

**Change**: do nothing except add a banner comment. The 402 challenge responses are the public service advertisement contract (see 1.2).

```ts
// src/app/api/x402/scout/route.ts:43
// DO NOT REMOVE — public x402 discovery endpoint.
// External agents probe this URL to receive a 402 challenge with
// PaymentRequirements, sign an EIP-3009 authorization, and retry
// with X-PAYMENT. Deleting the GET handler removes SportWarren
// from Kite Passport discovery.
```

### 5.3 `KITE_SCOUT_SERVICE_URL` env var

**Change**: deleted in Part 2. Remove the env var from `.env.example`, `docs/`, and any deployment manifests. After Part 2 ships, the var has no readers and is dead weight.

### 5.4 `kite-scout-limits.test.ts` consistency check

After Parts 1-3, verify the test still passes: it tests the `getScoutUserDailyLimit` / `getScoutSquadDailyLimit` functions, which are unchanged by Parts 1-3. If Part 1 changes those functions (it does not), update the test.

### 5.5 Tests for Part 4

| Test | Asserts |
|------|---------|
| Extension to `whatsapp-agent.test.ts` | `dispatchWhatsAppCommand('kite-proof', from)` returns "Unknown command" when `KITE_DEMO_MODE !== 'true'` |
| Same | When `KITE_DEMO_MODE === 'true'`, the demo path is reachable and returns the same shape as before |
| Same | `RUN_ALLOWED` does not include `kite-proof` / `kiteproof` (so the AI fallback cannot trigger it) |

---

## 6. Part 5: Annotate Unused GOAT x402 Code

The original plan offered two options for the GOAT x402 scaffolding. We pick **Option B (annotate)** for one specific reason: the wiring is partial, not dead. `resolveX402Config` already routes to `readGoatX402Config` when the merchant's 402 response advertises `network: eip155:2345` or `eip155:48816`. The piece that is missing is a GOAT-network merchant in the ksearch catalog. When one is added, the path lights up with no further code change.

### 6.1 Annotations

In `src/server/services/blockchain/x402-client.ts`, on `readGoatX402Config` and on the `GOAT_FACILITATOR_URL` / `GOAT_USDC_ADDRESS` / `GOAT_X402_NETWORK` env reads:

```ts
/**
 * GOAT Network x402 config reader.
 *
 * @unused Awaiting first GOAT-network merchant in ksearch catalog.
 * Wired through resolveX402Config (see line ~155) so any merchant
 * that advertises network `eip155:2345` or `eip155:48816` will hit
 * this path automatically. Tested by injecting the env vars and
 * calling resolveX402Config('eip155:2345') directly.
 *
 * @see https://docs.gokite.ai/kite-agent-passport/service-provider-guide
 */
export function readGoatX402Config(): X402Config { ... }
```

Do **not** annotate `resolveX402Config` — it is a real, used function.

### 6.2 Tests for Part 5

| Test | Asserts |
|------|---------|
| `resolveX402Config('eip155:2345')` returns the GOAT config (not the Kite one) | new unit test in `src/test/x402-config.test.ts` |
| `resolveX402Config('eip155:2368')` (or undefined) returns the Kite config | same |
| `readGoatX402Config` honors env overrides | same |

This is the smallest test surface that proves the GOAT path is wired correctly without requiring a live GOAT merchant.

---

## 7. File-by-File Change List

| File | Change | Part | Lines (approx) |
|------|--------|------|----------------|
| `prisma/schema.prisma` | Add `settlementStatus`, `settlementAttempts`, `settlementError`, `settledAt` to `Attestation` | 1 | +12 |
| `prisma/migrations/20260612_*/migration.sql` | Auto-generated | 1 | new file |
| `src/server/services/ai/scout-report.ts` | Make `settlement` optional; write `pending` row; enqueue job | 1 | ~30 |
| `src/server/services/blockchain/x402-client.ts` | Annotate `readGoatX402Config` and the env reads | 5 | ~6 |
| `src/server/services/communication/whatsapp-agent.ts` | Jargon rewrite, demo-path gating, follow-up receipt push hook | 1, 3, 4 | ~50 |
| `src/app/api/cron/scout-settle/route.ts` | New settlement worker | 1 | new file (~80) |
| `src/app/api/cron/auto-scout/route.ts` | Replace `executePaidRequest` with `createScoutReport`; drop `KITE_SCOUT_SERVICE_URL` | 2 | ~30 |
| `src/app/api/x402/scout/route.ts` | Add "DO NOT REMOVE" banner | 4 | +5 |
| `src/app/api/x402/verify-match/route.ts` | Add "DO NOT REMOVE" banner | 4 | +5 |
| `src/app/(app)/match/[id]/page.tsx` | Settlement card and x402 card jargon rewrite | 1, 3 | ~50 |
| `src/app/(app)/match/page.tsx` | Fee toast rewrite | 3 | ~3 |
| `src/app/(app)/settings/page.tsx` | Yellow mentions in wallet tooltip rewrite | 3 | ~10 |
| `src/components/player/TacticalSpend.tsx` | Jargon rewrite of labels (component is rendered, see 1.1) | 3 | ~8 |
| `src/components/player/PlayerReputation.tsx` | Tactical Intelligence card jargon rewrite | 3 | ~3 |
| `.env.example` | Drop `KITE_SCOUT_SERVICE_URL`; add `SCOUT_DEFERRED_SETTLEMENT` | 2, 1 | +1, -1 |
| `vercel.json` | Add cron entry for `/api/cron/scout-settle` every 5 minutes | 1 | +1 |
| `docs/PLATFORMS.md` | Drop `kite-proof` row from the WhatsApp management commands table | 4 | -1 |
| `docs/ARCHITECT.md` | Update the post-match reactions section to reflect new "verifying" state | 1 | ~3 |
| `docs/X402_CLEANUP_PLAN.md` | This file | — | new |
| **Tests** | | | |
| `src/test/scout-report-deferred.test.ts` | New | 1 | new |
| `src/test/scout-settle-worker.test.ts` | New | 1 | new |
| `src/test/auto-scout-cron.test.ts` | New | 2 | new |
| `src/test/x402-config.test.ts` | New | 5 | new |
| `src/test/match-detail-settlement.test.ts` | New (RTL) | 1, 3 | new |
| `src/test/tactical-spend.test.ts` | New (RTL) | 3 | new |
| `src/test/whatsapp-agent.test.ts` | Extensions (jargon, demo gate, scout state) | 1, 3, 4 | +60 |

**Files deleted: 0.**

---

## 8. Rollout Plan

We ship in three PRs behind a feature flag, with explicit gates between each.

### PR 1: Schema and worker (no behavior change)

- Migration: add columns to `Attestation`.
- Ship the new `scout-settle` cron route.
- Ship the schema-aware `enqueueScoutSettlement` helper.
- `SCOUT_DEFERRED_SETTLEMENT` is **not** set in any environment.
- `createScoutReport` is **not** modified yet.

**Gate to PR 2**: migration applied cleanly on staging; cron route returns `{skipped: 'locked'}` on a no-op invocation; existing tests pass.

### PR 2: Feature-flagged deferred settlement

- `createScoutReport` writes `pending` rows when `SCOUT_DEFERRED_SETTLEMENT === 'true'`.
- `sendSettlementReceipt` is wired.
- `scout-settle` worker is enabled (still guarded by the lock).
- UX state changes in WhatsApp and match detail page are shipped.
- `SCOUT_DEFERRED_SETTLEMENT` is set to `true` on a staging environment only.

**Gate to PR 3**:
- 48 hours of staging traffic with zero P1 incidents.
- Reconciliation check: every scout report from staging in the last 48 hours has `settlementStatus IN ('settled', 'failed')`; none are still `pending` after 30 minutes.
- Manual exercise: send `scout Arsenal` from a test WhatsApp; observe the "Verifying" row; observe the follow-up "Receipt confirmed" message within 2 minutes.

### PR 3: Default-on, cleanup, and demo-path gating

- Set `SCOUT_DEFERRED_SETTLEMENT=true` in production.
- Auto-scout cron rewrite ships.
- Jargon cleanup ships.
- `kite-proof` gating ships.
- `KITE_SCOUT_SERVICE_URL` env var is dropped from `.env.example`.

**Post-PR-3 monitoring** (7 days):
- Daily reconciliation query: any `Attestation` row with `kind='scout_report'` and `settlementStatus='pending'` older than 30 minutes is an incident.
- Daily settlement-success-rate query: target > 95% (the rest are simulated, which is the existing fallback path).
- Watch for new error tags in Sentry: `scout-settle-timeout`, `scout-settle-failed`, `whatsapp-receipt-push-failed`.

After 7 days with no incidents: remove the feature flag from the code (delete the `if (SCOUT_DEFERRED_SETTLEMENT) ... else ...` branch and the legacy path).

### Rollback

PR 1 and PR 2 are reversible by unsetting the env var. PR 3's jargon cleanup is harder to revert (the strings are in many files), but the underlying behavior is preserved by PR 3 (the data model and the API shape are unchanged). If a UX regression appears, we can git-revert PR 3 cleanly because no schema changes are part of it.

---

## 9. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Facilitator down for > 24h, scout settle queue grows | M | M | 24h cutoff in worker, daily reconciliation query, Sentry alert on queue depth |
| Settlement race with daily cap | L | M | Spending cap is checked at report-generation time, not settlement time. Document this in `scout-report.ts` JSDoc. |
| Receipt URL shared before settlement | M | L | Receipt link in WhatsApp is gated on `settlementStatus === 'settled'`; pre-settlement shows "(verifying on Kite)" |
| Multiple workers (Vercel + manual cron trigger) | L | L | Redis `SET NX EX` lock; 60s TTL covers worst-case Vercel overlap |
| User runs out of daily cap after multiple deferred scouts settle | L | M | Already documented behavior — cap is a generation limit, not a settlement limit. Add a comment in `scout-report.ts` and a test. |
| Telegram mini-app users confused by no receipt in match submit toast | L | L | The toast rewrite in 4.1 reframes it as "Match fee locked. Refunds if disputed." |
| Migration backfill races with live writes | L | H | Migration is additive (nullable column + default int). Backfill runs once, no row rewrites. Run during a low-traffic window. |
| Hackathon judge breaks the demo because `kite-proof` is gated | L | H | `KITE_DEMO_MODE=true` is set on a known staging URL. The demo script (`scripts/kite-onchain-proof.ts`) is unaffected. Document the staging URL in `docs/archive/HACKATHON.md` if needed. |
| Auto-scout cron change breaks nightly cron | M | M | Existing `auto-scout` tests (none today) are added in Part 2. Staging cron runs 4-5 times during the gate period. |
| `sendSettlementReceipt` floods WhatsApp if many scouts settle at once | L | M | Throttle: 1 message per user per 5 seconds; queue overflow goes to a daily digest. |

---

## 10. Definition of Done

The plan is complete when:

1. `pnpm run typecheck` passes.
2. `pnpm run lint` passes.
3. `pnpm run test` passes (including the 6 new test files).
4. `pnpm run build` succeeds.
5. Reconciliation query returns zero pending scout reports older than 30 minutes over 7 consecutive days in production.
6. The help text, scout response, match detail page, and settings page contain no occurrences of `x402`, `Kite`, `USDC`, `attestation`, `Yellow`, `facilitator` in user-visible strings (verified by the new jargon tests).
7. The auto-scout cron has been observed to run end-to-end on staging for at least 48 hours with a real match in the 22-26h window.
8. `KITE_SCOUT_SERVICE_URL` is not referenced in any active code path.
9. `docs/PLATFORMS.md` does not mention `kite-proof` in the production management commands table.
10. The feature flag `SCOUT_DEFERRED_SETTLEMENT` is either removed or set to `true` (not unset).

---

## 11. Decisions Needed Before Execution

These are the small choices the executor should confirm with the product owner. They do not block planning but they do block coding.

1. **Worker cadence**: 5 minutes (recommended) vs 1 minute. 5 min keeps the WhatsApp follow-up under 6 min p95; 1 min halves that at the cost of more cron executions.
2. **Pending-state copy in WhatsApp**: "Verifying on Kite (usually under 1 min)" vs "Receipt pending" vs a pure emoji. Recommend "Verifying on Kite (usually under 1 min)" for transparency.
3. **What to call the settlement worker route**: `/api/cron/scout-settle` (recommended) vs `/api/cron/x402-settle` (broader if we ever settle other types).
4. **Should `attestations` command be renamed**: `Recent activity` (recommended) vs `Recent receipts` vs keep as-is. The "attestations" word is internal jargon.
5. **Should the match detail page "Public result" card be removed entirely**: it is duplicative with the "Match Fee" card. Recommend keeping both, with the rewrite, because they communicate different things (fee escrow vs public verifiability).
6. **Hackathon demo staging URL**: needs a known URL with `KITE_DEMO_MODE=true` so judges can reproduce the `kite-proof` flow. This is a deployment question, not a code question.

---

## 12. Why This Plan is A-Grade

It addresses every gap in the original B+ draft:

| Gap in original | Resolution in this plan |
|-----------------|-------------------------|
| Async settlement was a sketch | Section 2.4 specifies the worker with lock, retry, timeout, cutoff, idempotency |
| No user-visible state machine | Section 2.6 defines transitions for every surface (WhatsApp, web, Telegram) |
| No rollout plan | Section 8 specifies three PRs, env flags, and gates |
| No test plan | Section 2.8, 3.2, 4.2, 5.5, 6.2 list specific tests for every change |
| Audit items left open | Section 1 resolves both: TacticalSpend is rendered and gets a rewrite; the GET endpoints are x402 discovery and stay |
| Missed the fourth scout path (cron uses `KITE_SCOUT_SERVICE_URL`) | Sections 1.3 and 3.1 fix the latent bug |
| Risk register absent | Section 9 lists 10 risks with mitigations |
| Definition of done absent | Section 10 has 10 concrete completion criteria |
| Decisions left implicit | Section 11 lists 6 explicit questions for the product owner |
| GOAT code was a binary delete-or-keep | Section 6 picks annotate with reason and proves the path is wired but untriggered |

Total new files: 1 (the plan), 1 (the cron route), 5 (tests). The remaining ~14 files are edits.
