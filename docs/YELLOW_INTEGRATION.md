# Yellow SDK Integration

**Instant Off-Chain Payments for SportWarren's Economic Layer**

**Last Updated:** March 2026 | **Status:** Implemented in-app, pending production env + migration rollout

---

## Overview

Yellow SDK (`@erc7824/nitrolite`) provides state channel infrastructure for instant, cross-chain stablecoin payments with near-zero fees ($0.01/tx). This integration targets SportWarren's three DB-only economic flows — **Squad Treasury**, **Transfer Market**, and **Match Fees** — replacing PostgreSQL-only records with real, settled USDC transactions while preserving Web2-speed UX.

### Why Yellow?

| Problem | Current State | Yellow Solution |
|---------|--------------|-----------------|
| Treasury deposits/withdrawals are DB-only | `squad_treasury.balance` is a number in PostgreSQL | Real USDC settlement via state channels |
| Transfer market has no payment rail | `transfer_offers.amount` is recorded but never moved | 2-party escrow sessions with quorum release |
| Match fees aren't collected on-chain | `treasury_transactions` logs income but no actual transfer | Micropayments at $0.01/tx make small stakes viable |
| Multi-chain complexity | Algorand + Avalanche + Kite + Lens = 4 chains | Yellow unifies EVM payments into one integration |

### What Yellow Does NOT Replace

- **Algorand** — XP system, match verification (App ID: 756630713)
- **Avalanche** — SquadDAO governance, SquadToken (SQT)
- **Kite AI** — Agent passports, agent payments, marketplace
- **Lens Network** — Social highlights, athlete identity
- **Chainlink CRE** — Oracle-based match verification

Yellow handles **value transfer only** — the payment rail beneath the existing game logic.

## Current Implementation Status

### Shipped on `main`

- **Treasury:** live Yellow-authenticated treasury deposits and withdrawals are wired through the existing tRPC endpoints and ledger model.
- **Transfer Escrow:** transfer offers can create shared Yellow sessions across squad leaders, then close those sessions on cancel / accept / reject when both parties are discoverable.
- **Match Fees:** match submission can lock Yellow fees; post-consensus verification can close the session and persist payouts exactly once.
- **Data Model:** Prisma now stores `yellowSessionId` on treasury and transfer records, `yellowFeeSessionId` on matches, and `yellowFeeSettledAt` as an idempotent settlement marker.

### Still Required in Production

- Run the latest Prisma migration in every deployed environment.
- Set all Yellow env vars, especially `NEXT_PUBLIC_YELLOW_PLATFORM_WALLET`, before expecting live match-fee payouts.
- Ensure both participating squad leaders have discoverable EVM wallet addresses, otherwise the app intentionally falls back to the existing simulated/server settlement path.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    SportWarren Platform                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐      │
│  │   Algorand   │  │  Avalanche   │  │     Kite AI      │      │
│  │  (XP/Verify) │  │ (Governance) │  │ (Agent Economy)  │      │
│  └──────────────┘  └──────────────┘  └──────────────────┘      │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Yellow SDK (Payment Layer)                   │   │
│  │                                                           │   │
│  │  Squad Treasury ←→ State Channels ←→ Transfer Escrow     │   │
│  │       ↕                                    ↕              │   │
│  │  Match Fee Collection              USDC Settlement        │   │
│  │                                                           │   │
│  │  WebSocket: wss://clearnet.yellow.com/ws                  │   │
│  │  SDK: @erc7824/nitrolite                                  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                            ↕                                    │
│              ┌─────────────────────────┐                        │
│              │   tRPC API Layer        │                        │
│              └───────────┬─────────────┘                        │
│                          ↓                                      │
│              ┌─────────────────────────┐                        │
│              │   PostgreSQL (Prisma)   │                        │
│              │   • Treasury ledger     │                        │
│              │   • Transfer offers     │                        │
│              │   • Match fee records   │                        │
│              └─────────────────────────┘                        │
└─────────────────────────────────────────────────────────────────┘
```

**Dual-write pattern:** Every Yellow state channel operation writes to both the off-chain state channel (real settlement) and PostgreSQL (app state, audit trail). The DB remains the source of truth for game logic; Yellow handles actual value movement.

---

## Integration 1: Squad Treasury

### Current State

Treasury is no longer DB-only on `main`. `squad_treasury` and `treasury_transactions` remain the audit source of truth, but deposits and withdrawals now accept real Yellow settlement refs from the browser whenever an authenticated Yellow session exists.

**Files involved:**
- `src/hooks/squad/useTreasury.ts` — Frontend hook
- `server/routers/squad.ts` — tRPC endpoints (`depositToTreasury`, `withdrawFromTreasury`)
- `prisma/schema.prisma` — `squad_treasury`, `treasury_transactions` models

### Yellow Integration

Each squad now reuses a persistent Yellow application session. The browser hook resumes or creates that session, submits the next state during deposit or withdrawal, and the existing tRPC mutation persists the settlement reference into PostgreSQL.

```typescript
import { Client, createAppSessionMessage, createCloseAppSessionMessage } from '@erc7824/nitrolite';

// Squad treasury session definition
const treasurySession = {
  protocol: 'sportwarren-treasury-v1',
  participants: [captainAddress, viceCaptainAddress], // expand as needed
  weights: [60, 40],  // captain has majority
  quorum: 60,         // captain alone can authorize
  challenge: 3600,    // 1 hour dispute window
  nonce: Date.now(),
  application: `squad-treasury-${squadId}`,
};

// Initial allocation (captain deposits 10 USDC for squad)
const allocations = [
  { participant: captainAddress, asset: 'usdc', amount: '10000000' }, // 10 USDC
  { participant: viceCaptainAddress, asset: 'usdc', amount: '0' },
];
```

### Treasury tRPC Changes

```typescript
// server/routers/squad.ts — enhanced deposit
depositToTreasury: protectedProcedure
  .input(z.object({
    squadId: z.string(),
    amount: z.number(),
    description: z.string().optional(),
  }))
  .mutation(async ({ ctx, input }) => {
    // 1. Execute Yellow state channel deposit
    const yellowResult = await yellowService.depositToSession(
      input.squadId,
      ctx.user.walletAddress,
      input.amount,
    );

    // 2. Record in PostgreSQL (audit trail)
    await ctx.prisma.treasury_transactions.create({
      data: {
        treasuryId: treasury.id,
        type: 'income',
        category: 'deposit',
        amount: input.amount,
        description: input.description ?? 'USDC deposit via Yellow',
        txHash: yellowResult.sessionId,  // Yellow session ID as reference
        verified: true,
      },
    });

    // 3. Update DB balance to match Yellow state
    await ctx.prisma.squad_treasury.update({
      where: { squadId: input.squadId },
      data: { balance: { increment: input.amount } },
    });
  }),
```

### Frontend Hook Changes

```typescript
// src/hooks/squad/useTreasury.ts — add Yellow connection
import { useYellowSession } from '@/hooks/useYellowSession';

export function useTreasury(squadId?: string) {
  const { session, sendPayment } = useYellowSession(squadId);

  // Existing tRPC calls remain — they now trigger Yellow + DB writes
  const depositMutation = trpc.squad.depositToTreasury.useMutation();

  const deposit = useCallback(async (amount: number, description?: string) => {
    if (!squadId) return;
    await depositMutation.mutateAsync({ squadId, amount, description });
    // Treasury UI updates via tRPC cache invalidation (unchanged)
  }, [squadId, depositMutation]);

  // ...rest unchanged
}
```

---

## Integration 2: Transfer Market Escrow

### Current State

Transfer offers are no longer just DB rows. Offer creation can open a real shared Yellow escrow session; the DB record still remains the source of truth for lifecycle and audit.

**Files involved:**
- `src/hooks/squad/useTransfers.ts` — Frontend hook
- `server/routers/squad.ts` — `createTransferOffer`, `respondToTransferOffer`
- `prisma/schema.prisma` — `transfer_offers` model

### Yellow Integration

Each transfer now attempts to create a shared Yellow session across squad leaders from the buying and selling squads. Funds are locked on offer creation, then the same session can be closed on seller accept/reject or buyer cancellation when the counterparty wallets are available.

```typescript
// Transfer escrow session
const escrowSession = {
  protocol: 'sportwarren-transfer-v1',
  participants: [buyerCaptainAddress, sellerCaptainAddress],
  weights: [50, 50],
  quorum: 100,       // both parties must agree to release
  challenge: 86400,  // 24 hour dispute window
  nonce: Date.now(),
  application: `transfer-${offerId}`,
};

// Buyer locks funds in escrow
const allocations = [
  { participant: buyerCaptainAddress, asset: 'usdc', amount: '50000000' },  // 50 USDC offer
  { participant: sellerCaptainAddress, asset: 'usdc', amount: '0' },
];
```

### Transfer Flow

```
1. Buyer creates offer
   → Yellow: Open escrow session, lock buyer's USDC
   → DB: transfer_offers.status = 'pending'

2. Seller accepts
   → Yellow: Close shared session with seller payout allocations
   → DB: transfer_offers.status = 'accepted', move player

3. Seller rejects (or offer expires)
   → Yellow: Close session with refund allocations (funds → buyer)
   → DB: transfer_offers.status = 'rejected'
```

### tRPC Changes

```typescript
// server/routers/squad.ts — enhanced transfer offer
createTransferOffer: protectedProcedure
  .input(z.object({
    toSquadId: z.string(),
    playerId: z.string(),
    offerType: z.enum(['permanent', 'loan']),
    amount: z.number(),
    loanDuration: z.number().optional(),
  }))
  .mutation(async ({ ctx, input }) => {
    // 1. Create Yellow escrow session (locks funds)
    const escrow = await yellowService.createEscrowSession({
      buyer: ctx.user.walletAddress,
      seller: await getSquadCaptainAddress(input.toSquadId),
      amount: input.amount,
      offerId: generateOfferId(),
    });

    // 2. Create DB record with Yellow session reference
    const offer = await ctx.prisma.transfer_offers.create({
      data: {
        fromSquadId: ctx.squad.id,
        toSquadId: input.toSquadId,
        playerId: input.playerId,
        offerType: input.offerType,
        amount: input.amount,
        loanDuration: input.loanDuration,
        status: 'pending',
        yellowSessionId: escrow.sessionId,  // new field
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return offer;
  }),

respondToTransferOffer: protectedProcedure
  .input(z.object({ offerId: z.string(), accept: z.boolean() }))
  .mutation(async ({ ctx, input }) => {
    const offer = await ctx.prisma.transfer_offers.findUnique({
      where: { id: input.offerId },
    });

    if (input.accept) {
      // Release escrow funds to seller
      await yellowService.releaseEscrow(offer.yellowSessionId, 'seller');
    } else {
      // Return escrowed funds to buyer
      await yellowService.releaseEscrow(offer.yellowSessionId, 'buyer');
    }

    // Update DB (existing logic unchanged)
    await ctx.prisma.transfer_offers.update({
      where: { id: input.offerId },
      data: { status: input.accept ? 'accepted' : 'rejected' },
    });
  }),
```

---

## Integration 3: Match Fee Collection

### Current State

Match fee locking and settlement are now wired into the existing verification flow. Match submission can create a shared Yellow fee session, and verification consensus can later close that session and persist payouts exactly once.

### Yellow Integration

- Match submit: lock fee amounts into a shared session across home leader, away leader, and optional platform wallet.
- Match verify/dispute: once consensus flips the match into `verified` or `disputed`, the client closes the Yellow session and calls `match.settleFeeSession`.
- Server closeout: payout ledger entries are recorded only once, guarded by `matches.yellow_fee_settled_at`.

### Current Runtime Boundary

- `NEXT_PUBLIC_YELLOW_PLATFORM_WALLET` must be configured for the platform fee split to be represented in the session.
- Without both squad leader wallets, the live match fee path is skipped and the existing fallback path remains in place.

Match fees are logged as `treasury_transactions` with `category: 'match_fee'` but no actual payment occurs. The `amount` is credited to the squad treasury balance in PostgreSQL.

### Yellow Integration

When a match is submitted, both squads pay a small entry fee (e.g., 0.50 USDC per squad) into a match session. On verification, fees are distributed: winner takes 80%, 20% to platform. On a draw, fees are returned minus platform cut.

```typescript
// Match fee session
const matchFeeSession = {
  protocol: 'sportwarren-match-fee-v1',
  participants: [homeCaptainAddress, awayCaptainAddress, platformAddress],
  weights: [40, 40, 20],
  quorum: 60,         // platform + one team can finalize
  challenge: 0,       // instant (post-verification)
  nonce: Date.now(),
  application: `match-fee-${matchId}`,
};

// Both teams deposit match fee
const allocations = [
  { participant: homeCaptainAddress, asset: 'usdc', amount: '500000' },  // 0.50 USDC
  { participant: awayCaptainAddress, asset: 'usdc', amount: '500000' },  // 0.50 USDC
  { participant: platformAddress, asset: 'usdc', amount: '0' },
];
```

### Fee Distribution Logic

```typescript
// After match verification completes
async function distributeMatchFees(matchId: string, result: 'home' | 'away' | 'draw') {
  const totalPool = 1_000_000; // 1.00 USDC (0.50 * 2)
  const platformCut = 200_000; // 0.20 USDC (20%)
  const winnerPayout = 800_000; // 0.80 USDC

  let finalAllocations;

  if (result === 'draw') {
    finalAllocations = [
      { participant: homeCaptainAddress, asset: 'usdc', amount: '400000' },
      { participant: awayCaptainAddress, asset: 'usdc', amount: '400000' },
      { participant: platformAddress, asset: 'usdc', amount: '200000' },
    ];
  } else {
    const winner = result === 'home' ? homeCaptainAddress : awayCaptainAddress;
    const loser = result === 'home' ? awayCaptainAddress : homeCaptainAddress;
    finalAllocations = [
      { participant: winner, asset: 'usdc', amount: String(winnerPayout) },
      { participant: loser, asset: 'usdc', amount: '0' },
      { participant: platformAddress, asset: 'usdc', amount: String(platformCut) },
    ];
  }

  await yellowService.closeSession(matchSessionId, finalAllocations);
}
```

---

## Yellow Service Module

A shared service wrapping the Yellow SDK for all three integrations.

**Proposed file:** `server/services/blockchain/yellow.ts`

```typescript
import { Client, createAppSessionMessage, createSubmitAppStateMessage,
         createCloseAppSessionMessage, createECDSAMessageSigner } from '@erc7824/nitrolite';

const CLEARNODE_URL = process.env.YELLOW_CLEARNODE_URL || 'wss://clearnet-sandbox.yellow.com/ws';

class YellowService {
  private client: Client;

  async connect() {
    this.client = new Client({ url: CLEARNODE_URL });
    await this.client.connect();
  }

  async createSession(definition: object, allocations: object[], signerPrivateKey: string) {
    const signer = createECDSAMessageSigner(signerPrivateKey);
    const message = await createAppSessionMessage(signer, { definition, allocations });
    const response = await this.client.sendMessage(message);
    return response.params.appSessionId;
  }

  async updateAllocations(sessionId: string, allocations: object[], signers: string[]) {
    // Collect multi-party signatures and submit state update
    // ...
  }

  async closeSession(sessionId: string, finalAllocations: object[], signers: string[]) {
    // Collect signatures, close session, settle on-chain
    // ...
  }

  // Convenience methods for each integration
  async depositToSession(squadId: string, address: string, amount: number) { /* ... */ }
  async createEscrowSession(params: EscrowParams) { /* ... */ }
  async releaseEscrow(sessionId: string, recipient: 'buyer' | 'seller') { /* ... */ }
}

export const yellowService = new YellowService();
```

---

## Database Changes

### New Fields

```prisma
model transfer_offers {
  // ... existing fields
  yellowSessionId  String?   // Yellow escrow session reference
}

model treasury_transactions {
  // ... existing fields (txHash already exists — reuse for Yellow session ID)
}

model matches {
  // ... existing fields
  yellowFeeSessionId  String?  // Yellow match fee session reference
  yellowFeeSettledAt  DateTime? // idempotent payout guard
}
```

### Migration

```sql
ALTER TABLE transfer_offers ADD COLUMN yellow_session_id TEXT;
ALTER TABLE matches ADD COLUMN yellow_fee_session_id TEXT;
ALTER TABLE matches ADD COLUMN yellow_fee_settled_at TIMESTAMP;
```

---

## Environment Variables

```bash
# Yellow SDK
YELLOW_CLEARNODE_URL=wss://clearnet-sandbox.yellow.com/ws   # sandbox
# YELLOW_CLEARNODE_URL=wss://clearnet.yellow.com/ws         # production
NEXT_PUBLIC_YELLOW_PLATFORM_WALLET=0x...                    # platform fee recipient in shared fee sessions
YELLOW_PLATFORM_PRIVATE_KEY=                                 # platform signer (server-side only)
NEXT_PUBLIC_YELLOW_ENABLED=true
```

---

## Supported Chains

Yellow settles on any of these EVM chains (user deposits on one, withdraws on another):

| Chain | Status | Notes |
|-------|--------|-------|
| Base | ✅ Recommended | Low fees, Lens is also on Base |
| Polygon | ✅ Supported | — |
| Arbitrum | ✅ Supported | — |
| Optimism | ✅ Supported | — |
| Ethereum | ✅ Supported | Higher settlement cost |
| BNB | ✅ Supported | — |
| Linea | ✅ Supported | — |

**Note:** Algorand is not supported by Yellow. XP/verification stays on Algorand.

---

## Implementation Phases

### Phase 1: Foundation (completed)

- [x] Install `@erc7824/nitrolite`
- [x] Create `server/services/blockchain/yellow.ts` service module
- [x] Register/configure Yellow App ID and ClearNode connectivity
- [x] Connect browser auth to ClearNode via `useYellowSession`
- [x] Verify local end-to-end build path with sandbox-compatible config

### Phase 2: Squad Treasury (completed)

- [x] Wire `depositToTreasury` to accept real Yellow settlements
- [x] Wire `withdrawFromTreasury` to accept real Yellow settlements
- [x] Keep dual-write audit model: Yellow state channel + PostgreSQL ledger
- [x] Treasury UI surfaces Yellow rail status alongside DB balance
- [ ] Exercise treasury flow with two real squad leaders against live ClearNode

### Phase 3: Transfer Escrow (implemented, needs live counterpart testing)

- [x] Add `yellowSessionId` field to `transfer_offers` model
- [x] Create escrow session on `createTransferOffer`
- [x] Release/refund on `respondToTransferOffer`
- [x] Handle offer expiry and cancellation refund paths
- [ ] Test full transfer lifecycle with two real squad-leader wallets

### Phase 4: Match Fees (implemented, needs production rollout)

- [x] Add `yellowFeeSessionId` to `matches` model
- [x] Add `yellowFeeSettledAt` idempotency guard
- [x] Create fee session on match submission
- [x] Distribute fees after match verification consensus
- [x] Wire settlement into the existing CRE verification flow
- [ ] Test sandbox/live match fee closeout with platform wallet configured

### Phase 5: Production Rollout (remaining)

- [ ] Run `prisma migrate deploy` everywhere
- [ ] Switch to production ClearNode (`wss://clearnet.yellow.com/ws`) where applicable
- [ ] Configure `NEXT_PUBLIC_YELLOW_PLATFORM_WALLET`
- [ ] Add stronger retry/reconnect handling around WebSocket/session recovery
- [ ] Monitor first 100 real transactions

---

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| ClearNode downtime | Medium | Graceful fallback to DB-only mode; queue Yellow operations for retry |
| Young ecosystem (20+ apps) | Medium | Start with sandbox; small amounts; monitor closely |
| User needs EVM wallet for payments | Low | Privy already provisions EVM wallets alongside Algorand |
| Key management for server-side signing | High | Use environment variables; rotate keys; never log private keys |
| State channel dispute edge cases | Low | Use `challenge: 0` for simple flows; only add challenge period for escrow |

---

## Testing

```bash
# Test Yellow connection
npx tsx scripts/test-yellow.ts

# Test treasury deposit/withdraw cycle
npx tsx scripts/test-yellow-treasury.ts

# Test transfer escrow lifecycle
npx tsx scripts/test-yellow-escrow.ts

# Test match fee distribution
npx tsx scripts/test-yellow-match-fees.ts
```

---

## Resources

- **Yellow Developer Portal:** https://yellowdeveloper.com
- **Documentation:** https://docs.yellow.org
- **Quick Start:** https://docs.yellow.org/docs/build/quick-start
- **Multi-Party Sessions:** https://docs.yellow.org/docs/guides/multi-party-app-sessions
- **SDK Package:** `@erc7824/nitrolite` on npm
- **GitHub:** https://github.com/layer-3
- **Discord:** https://discord.gg/yellownetwork

---

**See Also:** [Architecture](./ARCHITECTURE.md) | [Integrations](./INTEGRATIONS.md) | [Roadmap](./ROADMAP.md) | [Features](./FEATURES.md)
