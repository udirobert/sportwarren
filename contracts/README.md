# SportWarren Smart Contracts

This directory contains all smart contracts for the SportWarren platform, supporting both **Algorand** (core blockchain) and **Avalanche** (agentic infrastructure) blockchains.

## Dual-Chain Architecture

SportWarren leverages both blockchains for their unique advantages:

| Feature | Algorand | Avalanche |
|---------|----------|-----------|
| **Purpose** | Match verification, reputation | AI agents, DeFi, cross-chain tournaments |
| **Language** | TEAL | Solidity |
| **Development** | algosdk + TEAL | Foundry + Solidity |
| **Network** | Testnet → Mainnet | Fuji → C-Chain |

## Contract Structure

```
contracts/
├── README.md                   # This file
├── algorand/                   # Algorand TEAL contracts
│   ├── squad_dao/
│   │   ├── approval.teal      # Main DAO logic
│   │   └── clear_state.teal   # Account cleanup
│   ├── match_verification/
│   │   ├── approval.teal
│   │   └── clear_state.teal
│   ├── reputation_system/
│   │   ├── approval.teal
│   │   └── clear_state.teal
│   └── global_challenges/
│       ├── approval.teal
│       └── clear_state.teal
└── avalanche/                  # Avalanche Solidity contracts (Phase 2)
    ├── SquadDAO.sol           # Squad governance (ERC-8004 compatible)
    ├── MatchVerification.sol  # Match result verification
    ├── Reputation.sol         # Player reputation tokens
    ├── GlobalChallenges.sol   # Tournament management
    ├── interfaces/
    │   ├── IChainAbstraction.sol
    │   └── IAgentIdentity.sol
    └── test/
        ├── SquadDAO.t.sol
        ├── MatchVerification.t.sol
        ├── Reputation.t.sol
        └── GlobalChallenges.t.sol
```

## Available Contracts

### 🏛️ Squad DAO

**Algorand:** `contracts/algorand/squad_dao/`  
**Avalanche:** `contracts/avalanche/SquadDAO.sol`

**Features:**
- Democratic team decision making
- Token-based voting systems
- Squad treasury management
- Role-based permissions
- **Avalanche:** ERC-8004 agent identity support

### ✅ Match Verification

**Algorand:** `contracts/algorand/match_verification/`  
**Avalanche:** `contracts/avalanche/MatchVerification.sol`

**Features:**
- Multi-party match result verification
- Immutable match statistics storage
- Dispute resolution mechanisms
- Automated stat updates
- **Algorand:** Chainlink oracle integration

### 🎯 Reputation System

**Algorand:** `contracts/algorand/reputation_system/`  
**Avalanche:** `contracts/avalanche/Reputation.sol`

**Features:**
- Decentralized reputation scoring
- Skill-based token distribution
- Performance verification
- Professional pathway credentials
- **Avalanche:** Soulbound tokens (SBT)

### 🏆 Global Challenges

**Algorand:** `contracts/algorand/global_challenges/`  
**Avalanche:** `contracts/avalanche/GlobalChallenges.sol`

**Features:**
- Tournament creation and management
- Prize pool distribution
- Cross-league competition tracking
- Automated reward distribution
- **Dual-Chain:** Cross-chain tournaments via AWM + State Proofs

## Deployment

### Prerequisites

**Algorand:**
- Algorand Sandbox or node access
- algosdk v3.x
- Sufficient ALGO for deployment

**Avalanche:**
- Foundry (`curl -L https://foundry.paradigm.xyz | bash`)
- Node.js 18+
- Sufficient AVAX for deployment

### Deploy Contracts

```bash
# Deploy Algorand contracts to testnet
npm run deploy:contracts:algorand:testnet

# Deploy Avalanche contracts to Fuji testnet
npm run deploy:contracts:avalanche:fuji

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
- `deployments/avalanche-{network}.json`

## Development

### Testing Contracts

```bash
# Test Algorand contracts
npm run test:contracts:algorand

# Test Avalanche contracts (Foundry)
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

#### Avalanche Local Subnet (Optional)
```bash
# Install Avalanche CLI
npm install -g avalanche-cli

# Create local subnet
avalanche subnet create sportwarren-local
avalanche subnet deploy sportwarren-local
```

## Contract Addresses

### Testnet

| Contract | Algorand (Testnet) | Avalanche (Fuji) |
|----------|-------------------|------------------|
| Squad DAO | `PENDING` | `PENDING` |
| Match Verification | `PENDING` | `PENDING` |
| Reputation | `PENDING` | `PENDING` |
| Global Challenges | `PENDING` | `PENDING` |

### Mainnet

| Contract | Algorand (Mainnet) | Avalanche (C-Chain) |
|----------|-------------------|---------------------|
| Squad DAO | `PENDING` | `PENDING` |
| Match Verification | `PENDING` | `PENDING` |
| Reputation | `PENDING` | `PENDING` |
| Global Challenges | `PENDING` | `PENDING` |

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

### Avalanche-Specific
- Foundry tests with high coverage
- EVM security best practices
- Reentrancy guards
- Access control (OpenZeppelin)

## Cross-Chain Integration

### Chain Abstraction Layer

SportWarren implements a chain abstraction layer that provides:
- Unified API for both chains
- Smart defaults (Algorand for matches, Avalanche for agents)
- User preference configuration
- Cross-chain operations support

### Cross-Chain Messaging

| Direction | Protocol | Use Case |
|-----------|----------|----------|
| Avalanche → Avalanche | AWM | Cross-subnet tournaments |
| Algorand → External | State Proofs | Verifiable data proofs |
| Both | Application Layer | Tournament synchronization |

## Contributing

When adding new contracts:

1. **Determine target chain(s)** based on use case
2. **Create appropriate subdirectory** (algorand/ or avalanche/)
3. **Follow established patterns** for contract structure
4. **Write comprehensive tests** (TEAL tests or Foundry)
5. **Update documentation** (this README + docs/)
6. **Security review** before deployment

### Chain Selection Guide

| Use Case | Recommended Chain | Rationale |
|----------|------------------|-----------|
| Match verification | Algorand | Chainlink oracles, low fees |
| Player reputation | Algorand | Official credibility |
| Squad governance | User choice | Fees vs. features |
| AI agents | Avalanche | ERC-8004, TEE |
| DeFi operations | Avalanche | Liquidity, yield |
| Cross-chain tournaments | Both | AWM + State Proofs |

## Resources

### Algorand
- [Algorand Developer Documentation](https://developer.algorand.org/)
- [TEAL Language Reference](https://developer.algorand.org/docs/get-details/dapps/avm/teal/)
- [algosdk Documentation](https://algorand.github.io/js-algorand-sdk/)

### Avalanche
- [Avalanche Developer Documentation](https://docs.avax.network/)
- [Foundry Book](https://book.getfoundry.sh/)
- [ERC-8004 Standard](https://eips.ethereum.org/EIPS/eip-8004)

### SportWarren
- [Migration Strategy](../docs/MIGRATION_STRATEGY.md)
- [Deployment Guide](../docs/DEPLOYMENT.md)
- [Project Structure](../docs/PROJECT_STRUCTURE.md)

---

**Last Updated:** 2026-02-25  
**Status:** Algorand contracts deployed ✅ | Avalanche contracts in development ⏳