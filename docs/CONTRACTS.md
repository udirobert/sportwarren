# SportWarren Contracts & Integrations

**Deployed Smart Contracts + Third-Party Integrations**

---

## 🟦 Algorand Testnet ✅

### Deployed Contracts

| Contract | App ID | Explorer |
|----------|--------|----------|
| **MatchVerification** | `756828208` | [AlgoScan](https://testnet.algoscan.app/app/756828208) |
| **ReputationSystem** | `756828211` | [AlgoScan](https://testnet.algoscan.app/app/756828211) |
| **SquadDAO** | `756828561` | [AlgoScan](https://testnet.algoscan.app/app/756828561) |
| **GlobalChallenges** | `756828229` | [AlgoScan](https://testnet.algoscan.app/app/756828229) |

**Creator:** `CO5MCLTB6IKXIKIEY3KPSCXEIFJX4PJETAT4GTPWHQ`
**Deployed:** March 9, 2026

### Contract Purposes

**MatchVerification**
- Multi-party match result verification
- Immutable match statistics storage
- Chainlink CRE oracle integration

**ReputationSystem**
- Player XP and reputation tracking
- On-chain attribute progression
- ASA-based reputation tokens

**SquadDAO**
- Squad-level governance and voting
- ASA-based membership tokens
- Proposal creation and execution

**GlobalChallenges**
- Cross-squad challenge creation
- Leaderboard and reward distribution
- Tournament bracket management

---

## 🔺 Avalanche Fuji Testnet ✅

### Deployed Contracts

| Contract | Address | Explorer |
|----------|---------|----------|
| **SquadToken** (ERC20 Votes) | `0x9ecDe1788E1cE1B40024F0fD9eA87f49a94781dB` | [Snowtrace](https://testnet.snowtrace.io/address/0x9ecDe1788E1cE1B40024F0fD9eA87f49a94781dB) |
| **SquadTimelock** | `0xb3cF66142882b3eAf197167cA7191654d4Ea5A78` | [Snowtrace](https://testnet.snowtrace.io/address/0xb3cF66142882b3eAf197167cA7191654d4Ea5A78) |
| **SquadGovernor** | `0x2e98aF1871bF208Ad361202884AB88F904eFf826` | [Snowtrace](https://testnet.snowtrace.io/address/0x2e98aF1871bF208Ad361202884AB88F904eFf826) |
| **AchievementNFT** (ERC721) | `0xF8ae857B73DF377A4D9387600bA15c0f1e0e15C4` | [Snowtrace](https://testnet.snowtrace.io/address/0xF8ae857B73DF377A4D9387600bA15c0f1e0e15C4) |
| **AgentEscrow** | `0xc675D1Dd85419C7Af28755830e06b0F54DB196c7` | [Snowtrace](https://testnet.snowtrace.io/address/0xc675D1Dd85419C7Af28755830e06b0F54DB196c7) |

**Deployer:** `0x29FA4181620358dA180CAD770dB1696fbA78F1Cd`
**Network:** Avalanche Fuji (Chain ID: 43113)

### Contract Purposes

**SquadToken (ERC20 Votes)**
- Governance token for squad DAO voting
- Token-based voting and delegation
- Upgradeable via UUPS

**SquadTimelock**
- Timelock controller for governance actions
- 48-hour delay (172,800 seconds)
- Ensures governance decisions have waiting period

**SquadGovernor**
- Main governance logic for DAO decisions
- Works with SquadToken and SquadTimelock
- Proposal creation, voting, execution

**AchievementNFT (ERC721)**
- NFTs for match achievements and milestones
- MVP awards, milestone badges, collectibles
- Upgradeable via UUPS

**AgentEscrow**
- Escrow for AI agent payments
- Kite AI agent marketplace integration
- Secure payment holding, conditional release

### Governance Status ✅ Initialized

| Role | Holder | Purpose |
|------|--------|---------|
| `TIMELOCK_ADMIN_ROLE` | SquadGovernor | Admin control of timelock |
| `PROPOSER_ROLE` | SquadGovernor | Create proposals to timelock |
| `CANCELLER_ROLE` | SquadGovernor | Cancel malicious proposals |
| `EXECUTOR_ROLE` | Anyone (0x0) | Execute after 48h delay |

**Governance Flow:**
1. Token holders vote on proposals via SquadGovernor
2. Passed proposals → queued in SquadTimelock
3. 48-hour waiting period
4. Anyone can execute after delay

---

## 🔗 Kite AI Testnet ⏳

**Network:** RPC `https://rpc-testnet.gokite.ai`, Chain ID 2368. Planned: Agent Escrow.

---

## Chainlink Oracles

**Purpose:** External data verification for match credibility via Chainlink CRE.

**Weather Oracle:** Temperature, precipitation, conditions via OpenWeatherMap. Prevents fake submissions.

**Location Oracle:** Validates GPS via Google Maps/OpenStreetMap. Confirms stadium/pitch, prevents spoofing.

**CRE Workflow:** Parallel oracle fetching → weighted consensus (60% location + 40% weather) → confidence score → Algorand settlement.

**Consensus Logic:** Location (60%), Weather (40%), threshold 60% for Platinum.

**Verification Tiers:** Bronze (self-reported) → Silver (both confirm) → Gold (both + media) → Platinum (CRE) → Diamond (full + witness).

**Sovereign Fallbacks:** Works without API keys using Open-Meteo (weather) and OpenStreetMap Nominatim (location).

---

## Kite AI Integration

**Purpose:** Agent identity, payments, marketplace infrastructure.

**Why Kite AI:** Purpose-built for agents, 17.8M+ passports, 1.7B+ interactions, cryptographic identity, stablecoin rails.

**Integration:** Agent registration with passports, USDC payment processing, marketplace listing with subscription/per-use fees.

**Core Agents:** Squad Manager (10 USDC/month), Scout (0.50/report), Fitness Coach (5/month), Social Manager (free).

**Economics:** Users pay agents in USDC, agents earn reputation through success, 10% platform fee, high-reputation agents command premiums.

---

## Yellow Payment Rail 🟡

**Status:** Implemented, operational rollout pending

### Features
- Browser-side ClearNode auth via `useYellowSession`
- Treasury deposits/withdrawals with real Yellow settlement refs
- Transfer escrow using shared squad-leader sessions
- Match fees lock on submit, settle after consensus

### Production Requirements
- Set `NEXT_PUBLIC_YELLOW_PLATFORM_WALLET` in live envs
- Test with two real squad-leader wallets on live rail

---

## Lens Protocol Integration ✅

### Features
- **Sign-in with Lens (SIWL):** Decentralized authentication on Lens Chain
- **Highlight Sharing:** Post "Pro-Style" highlight cards to Lens feed
- **Verified Credentials:** Decentralized proof of Sunday league status

### Status
Complete (Context + Service + Base Integration)

---

## Environment Variables

```bash
# Algorand
ALGORAND_MATCH_VERIFICATION_APP_ID=756828208
ALGORAND_NETWORK=testnet
NEXT_PUBLIC_ALGORAND_NODE_URL=https://testnet-api.algonode.cloud

# Avalanche
AVALANCHE_PRIVATE_KEY=your_private_key
AVALANCHE_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
AVALANCHE_CHAIN_ID=43113
AVALANCHE_SQUAD_TOKEN_ADDRESS=0x9ecDe1788E1cE1B40024F0fD9eA87f49a94781dB
AVALANCHE_GOVERNOR_ADDRESS=0x2e98aF1871bF208Ad361202884AB88F904eFf826

# Kite AI
KITE_API_URL=https://api.gokite.ai
KITE_API_KEY=your_api_key

# Chainlink (optional - uses sovereign fallbacks)
OPENWEATHER_API_KEY=your_key_here
GEO_VERIFICATION_API_KEY=your_key_here

# Yellow Payment Rail
NEXT_PUBLIC_YELLOW_PLATFORM_WALLET=your_wallet_here
```

---

## Verification Scripts

```bash
npx tsx scripts/find-deployed-contracts.ts   # Find all contracts
npm run test:chainlink                       # Test Chainlink
npx tsx scripts/test-cre-logic.ts            # Test CRE logic
```

---

## Architecture Notes

**Why Multiple Chains:**
- **Algorand:** Match verification, reputation (low fees, fast finality)
- **Avalanche:** Governance, DeFi, agents (EVM compatibility)
- **Kite AI:** Agent identity & payments (purpose-built for agents)

**Cross-Chain Strategy:** Algorand for immutable match data, Avalanche for governance/economics, Kite AI for agent settlements. Future: State Proofs, Warp Messaging, app-layer sync.

---

## Security Notes

⚠️ **Important:**
- Never expose mainnet private keys in `.env` files
- Use separate wallets for testnet and mainnet
- Rotate keys if accidentally committed to git
- Consider using a secrets manager for production

---

**See Also:** [CORE.md](./CORE.md) | [BUILD.md](./BUILD.md) | [GROWTH.md](./GROWTH.md)
