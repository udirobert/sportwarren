# Yellow Network Integration (Nitrolite)

**Last Updated:** March 2026  
**Status:** Operational in app flows; sessions use `NitroRPC_0_4`

## Overview

SportWarren uses the Yellow Network as its EVM payment rail for treasury actions, transfer escrow, and match-fee settlement.

In the broader SportWarren architecture, Yellow has a strict role: instant settlement for operational money movement. It complements Algorand verification, Avalanche governance and asset policy, Kite AI agent identity and attestations, TON wallet UX, and Lens social distribution.

The important product truth is:

- Yellow is **off-chain first** in this app.
- Prisma/Postgres remain the source of truth for football state.
- Yellow carries payment-session state and final closeout data.

That means much of the coordination around deposits, escrow, and payouts already happens inside a Yellow session rather than as a fresh wallet or chain interaction every time.

## Protocol And Session Lifecycle

The browser integration lives in [`/Users/udingethe/Dev/sportwarren/src/hooks/useYellowSession.ts`](/Users/udingethe/Dev/sportwarren/src/hooks/useYellowSession.ts).

Current flow:

1. Open a WebSocket to the configured Yellow ClearNode.
2. Generate an ephemeral ECDSA session key in the browser with `generatePrivateKey()`.
3. Authorize that session key through Yellow's EIP-712 auth flow with `createEIP712AuthMessageSigner()`.
4. Complete the challenge/verify handshake with `createAuthRequestMessage()` and `createAuthVerifyMessageFromChallenge()`.
5. Create or update sessions with `createAppSessionMessage()`, `createSubmitAppStateMessage()`, and `createCloseAppSessionMessage()`.
6. Persist the resulting session ids and settlement markers back into Prisma-backed domain records.

Implementation notes:

- Library: `@erc7824/nitrolite`
- Protocol version used in app sessions: `RPCProtocolVersion.NitroRPC_0_4`
- Session updates are signed by the local session key after the initial wallet authorization

This session-key architecture is the main UX win. Users approve the session once, then the app can keep pushing eligible treasury and escrow updates through the session without restarting the full wallet flow on every step.

## What Is Already Off-Chain

### Squad Treasury

- Deposits and withdrawals can create or reuse a squad Yellow session.
- Treasury balance changes are submitted with `submitState`.
- The treasury ledger still records the canonical app-side accounting path.

### Match Fee Escrow

- Match submission can lock the fee pot into a shared session.
- Post-consensus settlement closes that session with the correct distribution.
- Idempotency is guarded by `Match.yellowFeeSettledAt`.

### Player Transfer Escrow

- Offer creation can open a shared Yellow escrow session across discoverable squad leaders.
- Accept, reject, and cancel flows can close that same session and release funds to the right side.

So the answer to "does Yellow keep much of settlement off-chain?" is yes. The bigger gap was that the UI did not explain this clearly enough.

## Backend Verification And Recovery

The backend no longer needs to trust the client's `sessionId` and `version` blindly.

- [`/Users/udingethe/Dev/sportwarren/server/services/blockchain/yellow.ts`](/Users/udingethe/Dev/sportwarren/server/services/blockchain/yellow.ts) now queries ClearNode directly, finds the claimed session from allowed participant wallets, and canonicalizes the settlement id from the verified `sessionId` and `version`.
- Treasury, transfer, and match routers now verify Yellow settlements server-side before writing ledger effects or settlement markers.
- Yellow-backed ledger writes now use idempotent posting so the same settlement cannot be applied twice just because a route or recovery job was retried.
- [`/Users/udingethe/Dev/sportwarren/server/services/blockchain/yellow-recovery.ts`](/Users/udingethe/Dev/sportwarren/server/services/blockchain/yellow-recovery.ts) can reconcile DB state against ClearNode state for unresolved match-fee and transfer sessions.
- [`/Users/udingethe/Dev/sportwarren/scripts/yellow-recovery.ts`](/Users/udingethe/Dev/sportwarren/scripts/yellow-recovery.ts) provides an operator entrypoint for manual recovery runs over SSH.

## Data Model

- `SquadTreasury.yellowSessionId`
- `TransferOffer.yellowSessionId`
- `Match.yellowFeeSessionId`
- `Match.yellowFeeSettledAt`

## Required Environment Variables

| Variable | Description |
|---|---|
| `YELLOW_ENABLED` / `NEXT_PUBLIC_YELLOW_ENABLED` | Global toggle for the Yellow rail. |
| `YELLOW_APP_ID` / `NEXT_PUBLIC_YELLOW_APP_ID` | The registered application id on ClearNode. |
| `YELLOW_CLEARNODE_URL` / `NEXT_PUBLIC_YELLOW_CLEARNODE_URL` | WebSocket URL for the Nitrolite node. |
| `YELLOW_ASSET_SYMBOL` / `NEXT_PUBLIC_YELLOW_ASSET_SYMBOL` | Settlement asset used in app copy and allocations. |
| `NEXT_PUBLIC_YELLOW_SCOPE` | EIP-712 authorization scope, e.g. `sportwarren`. |
| `NEXT_PUBLIC_YELLOW_EIP712_DOMAIN_NAME` | Typed-data domain name for auth. |
| `NEXT_PUBLIC_YELLOW_ALLOWANCE_AMOUNT` | Allowance requested during session-key onboarding. |
| `YELLOW_MATCH_FEE_AMOUNT` / `NEXT_PUBLIC_YELLOW_MATCH_FEE_AMOUNT` | Fee used for match escrow setup. |
| `NEXT_PUBLIC_YELLOW_PLATFORM_WALLET` | Platform payout wallet for match-fee distribution. |

## UI Surfacing Rules

Yellow should be described consistently in the product:

- Describe Yellow as the operational settlement layer, not as the source of truth for football state.
- Say "off-chain", "session", or "escrow session" explicitly.
- Do not label Yellow actions as "on-chain" unless the interaction truly is on-chain.
- Explain the timing model: funds are locked in the session first, intermediate updates stay in-session, and payout completes when the session closes.
- Make fallback behavior obvious when an eligible EVM wallet or deployment config is missing.

## Responsibility Boundary

Yellow complements the rest of the stack rather than overlapping with it:

| Network | Responsibility |
|---------|----------------|
| **Yellow** | Instant settlement, escrow sessions, and match-fee coordination |
| **Algorand** | Verified football state and reputation |
| **Avalanche** | Governance, treasury policy, assets, and contract-based escrow |
| **Kite AI** | Agent identity, paid agent actions, and attestations |
| **TON** | Telegram-native wallet and treasury UX |
| **Lens** | Social identity and distribution |

The key UI surfaces to keep aligned are:

- [`/Users/udingethe/Dev/sportwarren/src/components/payments/PaymentRailNotice.tsx`](/Users/udingethe/Dev/sportwarren/src/components/payments/PaymentRailNotice.tsx)
- [`/Users/udingethe/Dev/sportwarren/src/components/match/MatchConsensus.tsx`](/Users/udingethe/Dev/sportwarren/src/components/match/MatchConsensus.tsx)
- [`/Users/udingethe/Dev/sportwarren/src/components/dashboard/StaffRoom.tsx`](/Users/udingethe/Dev/sportwarren/src/components/dashboard/StaffRoom.tsx)

## What Gets This To 10/10

The prototype is stronger now. The remaining production-grade gaps are:

- Better operator visibility into session failures, fallback reasons, and payout closeouts
- Optional multi-party signature orchestration for more complex squad-leader flows
- Live production Yellow env configuration on the deployed backend so verification and recovery can run against real sessions instead of falling back to local/manual rails

## Related Files

- [`/Users/udingethe/Dev/sportwarren/src/hooks/useYellowSession.ts`](/Users/udingethe/Dev/sportwarren/src/hooks/useYellowSession.ts)
- [`/Users/udingethe/Dev/sportwarren/src/hooks/match/useMatchVerification.ts`](/Users/udingethe/Dev/sportwarren/src/hooks/match/useMatchVerification.ts)
- [`/Users/udingethe/Dev/sportwarren/src/hooks/squad/useTreasury.ts`](/Users/udingethe/Dev/sportwarren/src/hooks/squad/useTreasury.ts)
- [`/Users/udingethe/Dev/sportwarren/src/hooks/squad/useTransfers.ts`](/Users/udingethe/Dev/sportwarren/src/hooks/squad/useTransfers.ts)
- [`/Users/udingethe/Dev/sportwarren/server/services/blockchain/yellow.ts`](/Users/udingethe/Dev/sportwarren/server/services/blockchain/yellow.ts)
- [`/Users/udingethe/Dev/sportwarren/server/services/blockchain/yellow-recovery.ts`](/Users/udingethe/Dev/sportwarren/server/services/blockchain/yellow-recovery.ts)
- [`/Users/udingethe/Dev/sportwarren/scripts/yellow-recovery.ts`](/Users/udingethe/Dev/sportwarren/scripts/yellow-recovery.ts)
