# Yellow Integration

**Last Updated:** March 2026  
**Status:** Implemented in app; schema migrations applied to the deployed database

## Scope

Yellow is the EVM payment rail for:

- squad treasury deposits and withdrawals
- transfer market escrow
- match fee locking and payout

Yellow does not replace:

- Algorand match verification and XP
- Avalanche governance
- Lens Chain social features
- Kite AI agent flows
- Chainlink CRE verification

## Current Architecture

- Browser auth and session control use `@erc7824/nitrolite` through `useYellowSession`
- App state and audit remain in Prisma and tRPC
- Yellow session refs are persisted into the existing domain models
- PostgreSQL remains the source of truth for game state
- Yellow handles payment session creation, state updates, and closeout

## Current Behavior

### Treasury

- Deposits and withdrawals can submit real Yellow settlements through the existing treasury mutations
- Treasury ledger entries are still written through the shared economy ledger path
- A squad treasury session is reused when available

### Transfer Escrow

- Offer creation can create a shared Yellow session across squad leaders
- Buyer cancellation can close that session and refund the buyer
- Seller accept/reject can close that session when the seller-side leader wallet is discoverable and authenticated
- When the counterparty wallet set cannot be built, the app falls back to the existing non-live settlement path

### Match Fees

- Match submission can lock fees into a shared Yellow fee session
- Match verification returns whether a live Yellow closeout is required
- Post-consensus settlement closes the fee session and persists payouts exactly once
- Match payout idempotency is enforced with `yellowFeeSettledAt`

## Data Model

Yellow-related fields currently in use:

- `SquadTreasury.yellowSessionId`
- `TransferOffer.yellowSessionId`
- `Match.yellowFeeSessionId`
- `Match.yellowFeeSettledAt`

## Required Environment Variables

- `YELLOW_ENABLED`
- `NEXT_PUBLIC_YELLOW_ENABLED`
- `YELLOW_APP_ID`
- `YELLOW_API_KEY`
- `NEXT_PUBLIC_YELLOW_APP_ID`
- `YELLOW_CLEARNODE_URL`
- `NEXT_PUBLIC_YELLOW_CLEARNODE_URL`
- `YELLOW_ASSET_SYMBOL`
- `NEXT_PUBLIC_YELLOW_ASSET_SYMBOL`
- `YELLOW_MATCH_FEE_AMOUNT`
- `NEXT_PUBLIC_YELLOW_MATCH_FEE_AMOUNT`
- `NEXT_PUBLIC_YELLOW_SCOPE`
- `NEXT_PUBLIC_YELLOW_EIP712_DOMAIN_NAME`
- `NEXT_PUBLIC_YELLOW_ALLOWANCE_AMOUNT`
- `NEXT_PUBLIC_YELLOW_PLATFORM_WALLET`

## Deployment Requirements

- ensure live environments expose the Yellow env vars above
- ensure participating squad leaders have discoverable EVM wallet addresses
- validate the full treasury, transfer, and match settlement flows with real multi-party wallets against the target ClearNode

## Remaining Operational Boundaries

- shared-session paths depend on both sides having usable EVM wallet identities
- live match payout depends on a valid platform payout wallet in env
- if live Yellow session requirements are not met, the app uses the existing fallback settlement path instead of blocking the football flow

## Related Files

- `/src/hooks/useYellowSession.ts`
- `/src/hooks/squad/useTreasury.ts`
- `/src/hooks/squad/useTransfers.ts`
- `/src/hooks/match/useMatchVerification.ts`
- `/src/server/routers/squad.ts`
- `/src/server/routers/match.ts`
- `/server/services/blockchain/yellow.ts`
- `/server/services/economy/treasury-ledger.ts`
- `/prisma/schema.prisma`
