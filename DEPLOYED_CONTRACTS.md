# Deployed Smart Contracts

**Last Updated:** March 9, 2026  
**Status:** ✅ Active on Testnets (Algorand + Avalanche Fuji)  
**Governance:** ✅ Initialized & Decentralized

---

## 🟦 Algorand Testnet ✅

### Deployed Contracts

| Contract | App ID | Explorer |
|----------|--------|----------|
| **MatchVerification** | `756828208` | [AlgoScan](https://testnet.algoscan.app/app/756828208) |
| **ReputationSystem** | `756828211` | [AlgoScan](https://testnet.algoscan.app/app/756828211) |
| **SquadDAO** | `756828561` | [AlgoScan](https://testnet.algoscan.app/app/756828561) |
| **GlobalChallenges** | `756828229` | [AlgoScan](https://testnet.algoscan.app/app/756828229) |

**Creator:** `CO5MCLTB6IKXIKIEY3AYWUTLD4XHQYTGK3KPSCXEIFJX4PJETAT4GTPWHQ`  
**Deployed:** March 9, 2026

### Contract Details

#### MatchVerification
- Multi-party match result verification
- Immutable match statistics storage
- Chainlink CRE weather + location oracle integration

#### ReputationSystem
- Player XP and reputation tracking
- On-chain attribute progression
- ASA-based reputation tokens

#### SquadDAO
- Squad-level governance and voting
- ASA-based membership tokens
- Proposal creation and execution

#### GlobalChallenges
- Cross-squad challenge creation and tracking
- Leaderboard and reward distribution
- Tournament bracket management

---

## 🔺 Avalanche Fuji Testnet ✅ DEPLOYED

**Deployer Address:** `0x29FA4181620358dA180CAD770dB1696fbA78F1Cd`  
**Network:** Avalanche Fuji Testnet (Chain ID: 43113)  
**Deployment Date:** March 9, 2026

### Deployed Contracts

| Contract | Address | Explorer |
|----------|---------|----------|
| **SquadToken** | `0x9ecDe1788E1cE1B40024F0fD9eA87f49a94781dB` | [Snowtrace](https://testnet.snowtrace.io/address/0x9ecDe1788E1cE1B40024F0fD9eA87f49a94781dB) |
| **SquadTimelock** | `0xb3cF66142882b3eAf197167cA7191654d4Ea5A78` | [Snowtrace](https://testnet.snowtrace.io/address/0xb3cF66142882b3eAf197167cA7191654d4Ea5A78) |
| **SquadGovernor** | `0x2e98aF1871bF208Ad361202884AB88F904eFf826` | [Snowtrace](https://testnet.snowtrace.io/address/0x2e98aF1871bF208Ad361202884AB88F904eFf826) |
| **AchievementNFT** | `0xF8ae857B73DF377A4D9387600bA15c0f1e0e15C4` | [Snowtrace](https://testnet.snowtrace.io/address/0xF8ae857B73DF377A4D9387600bA15c0f1e0e15C4) |
| **AgentEscrow** | `0xc675D1Dd85419C7Af28755830e06b0F54DB196c7` | [Snowtrace](https://testnet.snowtrace.io/address/0xc675D1Dd85419C7Af28755830e06b0F54DB196c7) |

### Contract Details

#### SquadToken (ERC20 Votes)
- **Purpose:** Governance token for squad DAO voting
- **Standard:** ERC20Votes (upgradeable via UUPS)
- **Features:** Token-based voting, delegation

#### SquadTimelock
- **Purpose:** Timelock controller for governance actions
- **Delay:** 48 hours (172,800 seconds)
- **Role:** Ensures governance decisions have a waiting period

#### SquadGovernor
- **Purpose:** Main governance logic for DAO decisions
- **Integration:** Works with SquadToken and SquadTimelock
- **Features:** Proposal creation, voting, execution

#### AchievementNFT (ERC721)
- **Purpose:** NFTs for match achievements and milestones
- **Standard:** ERC721 (upgradeable via UUPS)
- **Use Cases:** MVP awards, milestone badges, phygital collectibles

#### AgentEscrow
- **Purpose:** Escrow contract for AI agent payments
- **Integration:** Kite AI agent marketplace
- **Features:** Secure payment holding, conditional release

### All Explorer Links

**Deployer Transactions:**
- https://testnet.snowtrace.io/address/0x29FA4181620358dA180CAD770dB1696fbA78F1Cd

**Individual Contracts:**
- SquadToken: https://testnet.snowtrace.io/address/0x9ecDe1788E1cE1B40024F0fD9eA87f49a94781dB
- SquadTimelock: https://testnet.snowtrace.io/address/0xb3cF66142882b3eAf197167cA7191654d4Ea5A78
- SquadGovernor: https://testnet.snowtrace.io/address/0x2e98aF1871bF208Ad361202884AB88F904eFf826
- AchievementNFT: https://testnet.snowtrace.io/address/0xF8ae857B73DF377A4D9387600bA15c0f1e0e15C4
- AgentEscrow: https://testnet.snowtrace.io/address/0xc675D1Dd85419C7Af28755830e06b0F54DB196c7

### Governance Status ✅ INITIALIZED

**Initialized:** March 9, 2026  
**Status:** Decentralized (deployer admin revoked)

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
5. Governor can cancel if needed

**Initialize Script:** `scripts/initialize-governance.ts`

---

## 🔗 Kite AI Testnet ⏳

**Status:** Planned (not yet deployed)

### Network Configuration

- **RPC URL:** `https://rpc-testnet.gokite.ai`
- **Chain ID:** 2368

### Planned Contracts

- Agent Escrow for Kite AI agent payments

---

## Environment Variables Reference

Add these to your `.env` or `.env.local` file:

```bash
# ── Algorand (Deployed) ─────────────────────────────────────
ALGORAND_MATCH_VERIFICATION_APP_ID=756828208
ALGORAND_REPUTATION_SYSTEM_APP_ID=756828211
ALGORAND_SQUAD_DAO_APP_ID=756828561
ALGORAND_GLOBAL_CHALLENGES_APP_ID=756828229
ALGORAND_NETWORK=testnet
NEXT_PUBLIC_ALGORAND_NODE_URL=https://testnet-api.algonode.cloud
NEXT_PUBLIC_ALGORAND_INDEXER_URL=https://testnet-idx.algonode.cloud

# ── Avalanche (Deployed) ────────────────────────────────────
AVALANCHE_PRIVATE_KEY=your_private_key_here
AVALANCHE_NETWORK=fuji
AVALANCHE_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
AVALANCHE_CHAIN_ID=43113

# Deployed Contract Addresses
AVALANCHE_SQUAD_TOKEN_ADDRESS=0x9ecDe1788E1cE1B40024F0fD9eA87f49a94781dB
AVALANCHE_TIMELOCK_ADDRESS=0xb3cF66142882b3eAf197167cA7191654d4Ea5A78
AVALANCHE_GOVERNOR_ADDRESS=0x2e98aF1871bF208Ad361202884AB88F904eFf826
AVALANCHE_ACHIEVEMENT_NFT_ADDRESS=0xF8ae857B73DF377A4D9387600bA15c0f1e0e15C4
AVALANCHE_AGENT_ESCROW_ADDRESS=0xc675D1Dd85419C7Af28755830e06b0F54DB196c7

# ── Kite AI (Planned) ───────────────────────────────────────
KITE_API_URL=https://api.gokite.ai
KITE_API_KEY=your_api_key
KITE_AGENT_WALLET=your_agent_wallet
```

---

## Deployment Scripts

### Algorand

```bash
# Deploy to testnet
npx tsx scripts/deploy-contracts.ts
```

### Avalanche

```bash
cd contracts/avalanche
npx hardhat run scripts/deploy.ts --network fuji
```

---

## Verification Scripts

Use the included script to find all deployed contracts:

```bash
npx tsx scripts/find-deployed-contracts.ts
```

This will:
1. Query Algorand testnet for contracts deployed by your address
2. Query Avalanche Fuji for contract deployments
3. Generate explorer links for all found contracts

---

## Architecture Notes

### Why Multiple Chains?

| Chain | Purpose | Why |
|-------|---------|-----|
| **Algorand** | Match verification, reputation | Low fees, fast finality, Chainlink oracles |
| **Avalanche** | Governance, DeFi, agents | EVM compatibility, rich smart contract features |
| **Kite AI** | Agent identity & payments | Purpose-built for autonomous agents |

### Cross-Chain Strategy

- **Algorand**: Primary chain for match data and reputation (immutable records)
- **Avalanche**: Governance and economic operations (ERC20, NFTs, DAOs)
- **Kite AI**: Agent passports and inter-agent settlements

Future integration may use:
- Algorand State Proofs for cross-chain verification
- Avalanche Warp Messaging for subnet communication
- Application-layer synchronization for tournaments

---

## Security Notes

⚠️ **Important:**
- Never expose mainnet private keys in `.env` files
- Use separate wallets for testnet and mainnet
- Rotate keys if accidentally committed to git
- Consider using a secrets manager for production

---

**See Also:** 
- [contracts/README.md](./contracts/README.md)
- [docs/INTEGRATIONS.md](./docs/INTEGRATIONS.md)
- [scripts/deploy-contracts.ts](./scripts/deploy-contracts.ts)
