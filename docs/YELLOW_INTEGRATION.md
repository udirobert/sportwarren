# Yellow SDK Integration

**Instant Off-Chain Payments for SportWarren's Economic Layer**

**Last Updated:** March 2026 | **Status:** Proposed

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

Treasury is fully database-driven (`squad_treasury` + `treasury_transactions`). The `balance` field is a number, deposits/withdrawals are tRPC mutations that update PostgreSQL. No real funds move.

**Files involved:**
- `src/hooks/squad/useTreasury.ts` — Frontend hook
- `server/routers/squad.ts` — tRPC endpoints (`depositToTreasury`, `withdrawFromTreasury`)
- `prisma/schema.prisma` — `squad_treasury`, `treasury_transactions` models

### Yellow Integration

Each squad gets a persistent Yellow application session. Squad members deposit USDC into the session; the captain (or quorum of members) authorizes withdrawals.

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

Transfer offers (`transfer_offers` table) track amount, status, and type but no funds are locked or transferred. Accepting a transfer is a database status change.

**Files involved:**
- `src/hooks/squad/useTransfers.ts` — Frontend hook
- `server/routers/squad.ts` — `createTransferOffer`, `respondToTransferOffer`
- `prisma/schema.prisma` — `transfer_offers` model

### Yellow Integration

Each transfer creates a 2-party Yellow escrow session between the buying and selling squads. Funds are locked on offer creation and released on acceptance (or returned on rejection/expiry).

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
   → Yellow: Update allocations (funds → seller), close session
   → DB: transfer_offers.status = 'accepted', move player

3. Seller rejects (or offer expires)
   → Yellow: Close session with original allocations (funds → buyer)
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
}
```

### Migration

```sql
ALTER TABLE transfer_offers ADD COLUMN yellow_session_id TEXT;
ALTER TABLE matches ADD COLUMN yellow_fee_session_id TEXT;
```

---

## Environment Variables

```bash
# Yellow SDK
YELLOW_CLEARNODE_URL=wss://clearnet-sandbox.yellow.com/ws   # sandbox
# YELLOW_CLEARNODE_URL=wss://clearnet.yellow.com/ws         # production
YELLOW_PLATFORM_ADDRESS=0x...                                # platform fee recipient
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

### Phase 1: Foundation (1 week)

- [ ] Install `@erc7824/nitrolite`
- [ ] Create `server/services/blockchain/yellow.ts` service module
- [ ] Register for Yellow App ID at https://yellowdeveloper.com
- [ ] Connect to sandbox ClearNode (`wss://clearnet-sandbox.yellow.com/ws`)
- [ ] Add `useYellowSession` React hook for wallet authentication
- [ ] Verify end-to-end with sandbox test tokens (`ytest.usd`)

### Phase 2: Squad Treasury (1 week)

- [ ] Wire `depositToTreasury` tRPC endpoint to Yellow session
- [ ] Wire `withdrawFromTreasury` with captain quorum signing
- [ ] Dual-write: Yellow state channel + PostgreSQL audit trail
- [ ] Treasury UI shows real USDC balance alongside DB balance
- [ ] Test with 2-member squad (captain + vice-captain)

### Phase 3: Transfer Escrow (1 week)

- [ ] Add `yellowSessionId` field to `transfer_offers` model
- [ ] Create escrow session on `createTransferOffer`
- [ ] Release/refund on `respondToTransferOffer`
- [ ] Handle offer expiry (auto-refund via session timeout)
- [ ] Test full transfer lifecycle: offer → accept/reject → settlement

### Phase 4: Match Fees (1 week)

- [ ] Add `yellowFeeSessionId` to `matches` model
- [ ] Create fee session on match submission
- [ ] Distribute fees on match verification (win/draw/dispute)
- [ ] Wire into existing CRE verification flow
- [ ] Test with sandbox match: submit → verify → payout

### Phase 5: Production (1 week)

- [ ] Switch to production ClearNode (`wss://clearnet.yellow.com/ws`)
- [ ] Switch asset from `ytest.usd` to `usdc`
- [ ] Configure platform fee address
- [ ] Add error handling and retry logic for WebSocket disconnections
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
