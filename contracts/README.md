# SportWarren Smart Contracts

This directory contains all Algorand smart contracts for the SportWarren platform. Each contract is organized into its own subdirectory with approval and clear state programs.

## Contract Structure

Each smart contract consists of two TEAL programs:
- `approval.teal` - Main contract logic and approval program
- `clear_state.teal` - Clear state program for account cleanup

## Available Contracts

### 🏆 Global Challenges (`global_challenges/`)
Manages global competitions and tournaments across the SportWarren ecosystem.

**Features:**
- Tournament creation and management
- Prize pool distribution
- Cross-league competition tracking
- Automated reward distribution

### ✅ Match Verification (`match_verification/`)
Handles match result verification through blockchain consensus.

**Features:**
- Multi-party match result verification
- Immutable match statistics storage
- Dispute resolution mechanisms
- Automated stat updates

### 🎯 Reputation System (`reputation_system/`)
Manages player reputation tokens and skill verification.

**Features:**
- Decentralized reputation scoring
- Skill-based token distribution
- Performance verification
- Professional pathway credentials

### 🏛️ Squad DAO (`squad_dao/`)
Enables decentralized governance for football squads.

**Features:**
- Democratic team decision making
- Token-based voting systems
- Squad treasury management
- Role-based permissions

## Deployment

### Prerequisites
- Algorand Sandbox or node access
- AlgoKit CLI tools
- Sufficient ALGO for deployment

### Deploy Contracts

```bash
# Deploy all contracts to testnet
npm run deploy:contracts:testnet

# Deploy to mainnet (production only)
npm run deploy:contracts:mainnet
```

### Verify Deployments

```bash
# Verify contract deployments
npm run verify:contracts
```

## Development

### Testing Contracts

```bash
# Run contract unit tests
npm run test:contracts

# Run integration tests
npm run test:contracts:integration
```

### Local Development

1. Start Algorand Sandbox:
```bash
./sandbox up testnet
```

2. Deploy contracts locally:
```bash
npm run deploy:contracts:local
```

## Contract Addresses

### Testnet
- Global Challenges: `[APP_ID_TO_BE_FILLED]`
- Match Verification: `[APP_ID_TO_BE_FILLED]`
- Reputation System: `[APP_ID_TO_BE_FILLED]`
- Squad DAO: `[APP_ID_TO_BE_FILLED]`

### Mainnet
- Contracts not yet deployed to mainnet

## Security Considerations

- All contracts undergo thorough testing before deployment
- Multi-signature requirements for critical operations
- Regular security audits and code reviews
- Emergency pause mechanisms where appropriate

## Contributing

When adding new contracts:

1. Create a new subdirectory with descriptive name
2. Include both `approval.teal` and `clear_state.teal`
3. Add comprehensive tests
4. Update this README with contract details
5. Follow existing naming conventions

## Resources

- [Algorand Developer Documentation](https://developer.algorand.org/)
- [TEAL Language Reference](https://developer.algorand.org/docs/get-details/dapps/avm/teal/)
- [AlgoKit Documentation](https://github.com/algorandfoundation/algokit-cli)