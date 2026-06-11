# SportWarren Smart Contracts

This directory contains the on-chain contracts for the SportWarren platform, primarily across **Algorand** and **Goat Network** (Bitcoin L2).

Within the broader SportWarren architecture, these contracts work alongside **Kite AI** (agent identity, agent payments, attestations), **Yellow** (instant settlement rail), **TON** (Telegram-native treasury UX), and **Lens** (social identity and distribution). Those integrations live in the application and service layers rather than in this directory.

## Chain Responsibility Model

| Feature | Algorand | Goat Network (Bitcoin L2) |
|---------|----------|---------------------------|
| **Purpose** | Match verification, reputation, proof-backed match state | Governance, treasury policy, programmable assets, Agentic Economy |
| **Language** | TEAL | Solidity (EVM, Type-1 zkEVM) |
| **Network** | Testnet → Mainnet | BitVM2 Testnet → Mainnet |

These chains are not competing implementations of the same feature set. Algorand handles the high-frequency sports data, while Goat Network serves as the secure, Bitcoin-native settlement and agent logic layer.

## Contract Structure

```
contracts/
├── README.md                   # This file
├── algorand/                   # Algorand TEAL contracts
│   ├── match_verification/     # Match result attestation
│   ├── reputation_system/      # Player reputation
│   └── global_challenges/      # Tournament contracts
└── goat/                       # EVM Solidity contracts (Goat Network Target)
    ├── SquadDAO.sol            # Squad governance (ERC-8004 compatible)
    ├── AgentEscrow.sol         # Micropayment handling for AI Scouts (x402)
    ├── SquadToken.sol          # Governance & Incentive token
    ├── Reputation.sol          # Player reputation tokens (ERC-8004)
    ├── AchievementNFT.sol       # Match milestone NFTs
    ├── interfaces/
    │   ├── IAgentIdentity.sol  # ERC-8004 Interface
    │   └── IGoatYield.sol      # Goat Native Yield Interface
    └── test/
        ├── SquadDAO.t.sol
        └── Reputation.t.sol
```

## Available Contracts

### 🏛️ Squad DAO (Goat Network)

**Goat Network:** `contracts/goat/SquadDAO.sol`

**Features:**
- Democratic team decision making
- Token-based voting systems (ERC-20 Votes)
- Squad treasury management
- Role-based permissions
- ERC-8004 agent identity support

### ✅ Match Verification (Algorand)

**Algorand:** `contracts/algorand/match_verification/`

**Features:**
- Multi-party match result verification
- Immutable match statistics storage
- Dispute resolution mechanisms
- Automated stat updates
- Chainlink oracle integration

### 🎯 Reputation System

**Algorand:** `contracts/algorand/reputation_system/` — Player reputation records  
**Goat Network:** `contracts/goat/Reputation.sol` — ERC-8004 agent identity registry

**Features:**
- Decentralized reputation scoring
- Skill-based token distribution
- Performance verification
- Professional pathway credentials
- Soulbound tokens (SBT)

### 🏆 Global Challenges (Algorand)

**Algorand:** `contracts/algorand/global_challenges/`

**Features:**
- Tournament creation and management
- Prize pool distribution
- Cross-league competition tracking
- Automated reward distribution

## Deployment

### Prerequisites

**Algorand:**
- Algorand Sandbox or node access
- algosdk v3.x
- Sufficient ALGO for deployment

**Goat Network:**
- Foundry (`curl -L https://foundry.paradigm.xyz | bash`)
- Node.js 18+
- Sufficient ETH/BTC for deployment

### Deploy Contracts

```bash
# Deploy Algorand contracts to testnet
npm run deploy:contracts:algorand:testnet

# Deploy Goat contracts to BitVM2 testnet (uses tsx + ethers.js)
pnpm exec tsx ../scripts/deploy-to-goat.ts

# Deploy to both chains
npm run deploy:contracts:testnet
```

### Verify Deployments

```bash
# Verify all contracts
npm run verify:contracts

# Check deployment status
npm run check:deployments
```

Contract addresses are saved in:
- `deployments/algorand-{network}.json`
- `deployments/goat-{network}.json`

## Development

### Testing Contracts

```bash
# Test Algorand contracts
npm run test:contracts:algorand

# Test Goat contracts (Foundry)
forge test

# Test all contracts
npm run test:contracts
```

### Local Development

#### Algorand Sandbox
```bash
# Start Algorand Sandbox
cd sandbox && ./sandbox up dev

# Deploy to local sandbox
npm run deploy:contracts:algorand:local
```

#### Goat Network Local Dev
```bash
# Start local EVM dev environment
npx hardhat node --network localhost

# Deploy to local (uses the hardhat deploy script inside contracts/goat/)
cd goat && npx hardhat run scripts/deploy.ts --network localhost
```

## Chain Selection Guide

| Use Case | Recommended Chain | Rationale |
|----------|------------------|-----------|
| Match verification | Algorand | Proof-backed football state and low-cost verification |
| Player reputation | Algorand | Durable progression and reputation records |
| Squad governance | Goat Network | Bitcoin-native security via BitVM2, ERC-8004 agent identity |
| Squad assets / escrow | Goat Network | Programmable contracts, x402 micropayments, native yield |
| Agent identity / payments | Kite AI | Purpose-built agent passports and agent economy rails |
| Instant settlement | Yellow | Fast operational settlement outside heavyweight contract flows |
| Telegram wallet UX | TON | Native consumer payment flows in Telegram |
| Social distribution | Lens | Portable social graph and content publishing |

## Security Considerations

### General Security
- All contracts undergo thorough testing before deployment
- Multi-signature requirements for critical operations
- Regular security audits and code reviews
- Emergency pause mechanisms where appropriate

### Algorand-Specific
- State Proofs with Falcon signatures (quantum-safe)
- TEAL best practices
- Minimal computation for fee optimization

### Goat Network-Specific
- Foundry tests with high coverage
- EVM security best practices
- Reentrancy guards
- Access control (OpenZeppelin)
- BitVM2 fraud proof compatibility

## Resources

### Algorand
- [Algorand Developer Documentation](https://developer.algorand.org/)
- [TEAL Language Reference](https://developer.algorand.org/docs/get-details/dapps/avm/teal/)
- [algosdk Documentation](https://algorand.github.io/js-algorand-sdk/)

### Goat Network
- [Goat Network Documentation](https://docs.goat.network/)
- [Foundry Book](https://book.getfoundry.sh/)
- [ERC-8004 Standard](https://eips.ethereum.org/EIPS/eip-8004)
- [BitVM2 Overview](https://bitvm.org/)

### SportWarren
- [Architecture](../docs/ARCHITECT.md)
- [Build & Deployment](../docs/BUILD.md)

---

**Last Updated:** 2026-06-09  
**Status:** Algorand deployed ✅ | Goat Network BitVM2 testnet pending ⏳
