# Goat Network Integration Strategy

## Strategic Overview

SportWarren is pivoting its primary EVM layer from Avalanche to **Goat Network (Bitcoin L2)**. This move aligns the project with the **Agentic Economy** and inherits the trust-minimized security of Bitcoin via **BitVM2**.

## Technical Alignment

### 1. Agentic Economy (Kite AI & x402)
SportWarren utilizes **AI Scouts** to analyze performance. Goat Network's native support for **x402 micropayments** and **ERC-8004 agent identity** makes it the ideal environment for these autonomous agents to operate, pay for data, and build verifiable reputations.

### 2. Bitcoin-Native Security (BitVM2)
Athlete career data (reputation, match proofs) is anchored to Bitcoin. By using Goat Network's Type-1 zkEVM, SportWarren ensures that its most critical data points inherit the longevity and security of the Bitcoin mainnet.

### 3. Sustainable BTC Yield
Squad Treasuries held on Goat Network can benefit from **Sustainable BTC Yield** (generated from sequencer fees and BTC staking). This provides a native, non-inflationary funding source for amateur sports clubs.

## Multi-Chain Responsibility Model

| Layer | Network | Responsibility |
| :--- | :--- | :--- |
| **Data Ingestion** | Algorand | High-frequency match verification and proof-backed state. |
| **Settlement & Governance** | Goat Network | Squad DAOs, Asset Escrow, and Global Reputation. |
| **Consumer UX** | TON | Telegram-native wallet interactions and fan engagement. |
| **Social Graph** | Lens Protocol | Portable social identity and content distribution. |

## Roadmap to BitVM2 Testnet

1.  **Contract Audit:** Verify all `contracts/goat/` Solidity code for Type-1 zkEVM compatibility.
2.  **ERC-8004 Integration:** Implement `IAgentIdentity` hooks in `Reputation.sol`.
3.  **x402 Facilitator:** Configure the `AgentEscrow` to use Goat's native micropayment facilitators.
4.  **Testnet Deployment:** Deploy to BitVM2 Testnet and exercise cross-chain proofs from Algorand.

## Dual-Network x402 Routing (Already in Code)

The x402 client at `src/server/services/blockchain/x402-client.ts` already supports GOAT Network alongside Kite chain for settlement. This dual-routing is **code-complete and available** but currently **unused by default** — the scout and verify-match endpoints both default to Kite chain (`eip155:2368`).

### How it works

| Component | Kite Chain (default) | GOAT Network (configured) |
|-----------|---------------------|--------------------------|
| **Chain ID** | `2368` | `48816` (testnet3) / `2345` (mainnet) |
| **Network string** | `eip155:2368` | `eip155:48816` / `eip155:2345` |
| **Facilitator** | `facilitator.pieverse.io` | `facilitator.testnet3.goat.network` (auto-detected) |
| **RPC** | `rpc-testnet.gokite.ai` | `rpc.testnet3.goat.network` / `rpc.goat.network` |
| **USDC address** | `0x0fF5393387ad2f9f691FD6Fd28e07E3969e27e63` | Configurable via `GOAT_USDC_ADDRESS` |
| **Resolution** | Default fallback | Triggered by GOAT network string |

Routes are selected by `resolveX402Config(targetNetwork)` — pass an `eip155:48816` or `eip155:2345` string and all payment requirements, facilitator calls, and settlement envelopes switch to GOAT Network.

### Activating GOAT x402

To route an existing x402 endpoint through GOAT Network instead of Kite chain:

1. Set `GOAT_CHAIN_ID`, `GOAT_RPC_URL`, `GOAT_FACILITATOR_URL`, and `GOAT_USDC_ADDRESS` in env
2. Update the endpoint's `buildPaymentRequirements()` call to use GOAT's `network` string
3. Test with `KITE_X402_SIMULATE=true` before enabling live settlement

## Deferred Work: x402 Verify-Match as Canonical Path

**Status:** Roadmap item (not yet implemented). Captured 2026-06-09.

### Context

The `POST /api/x402/verify-match` endpoint exists and is functional. It accepts a paid X-Payment header, settles via Pieverse facilitator on Kite chain, creates an `Attestation` row, and returns a signed match hash. However, the current match verification flow in `src/server/services/match-workflow.ts` (lines 671-715) writes attestations directly to the database instead of routing through this endpoint.

### What needs to change

1. **Server-side call to /api/x402/verify-match** from inside `verifyMatchResult()` after the standard verification threshold is reached. The call must bypass the X-Payment header requirement (service-account pattern or sandboxed facilitator mode).
2. **Yellow fee rail becomes downstream of the x402 attestation** — settle the fee only after the x402 attestation has been written, so the chain of evidence is: verified → x402 attestation → fee settled.
3. **External agents can call the same endpoint** to verify the same match for the standard fee, creating a true two-sided agent economy.

### Why it's deferred

- **Risk:** The x402 endpoint expects an X-Payment header. Internal calls need a service-account bypass pattern (signed service-internal proof instead of user payment). This changes the payment semantics and needs careful testing.
- **Effort:** ~2-3 hours for the refactor + testing.
- **Lower-priority alternatives shipped in 2026-06-09:** Yellow fee rail toast + settlement card visible to users (Fix 1), "Verified via x402" badge on match detail (Fix 2), and `giveFeedback` on ERC-8004 reputation registry after verified match (Fix 3) already close the visible-integration gap.

### Acceptance criteria for the deferred work

- [ ] `verifyMatchResult()` calls `/api/x402/verify-match` server-side, not directly writes to the `Attestation` table
- [ ] Service-account payment bypass works (or sandboxed facilitator mode)
- [ ] Yellow fee settlement only runs after x402 attestation is written
- [ ] External agent can verify a match via the x402 endpoint and pay the standard fee
- [ ] No regression in the existing match verification happy path

### Tracking

Owner: TBD. Estimated: 1 focused session. Block on: Yellow fee rail production traffic.
