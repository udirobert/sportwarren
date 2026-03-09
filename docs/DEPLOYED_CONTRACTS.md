# Deployed Smart Contracts

**Last Updated:** March 9, 2026  
**Status:** Active on Testnets

---

## 🟦 Algorand Testnet ✅

### Match Verification Contract

| Property | Value |
|----------|-------|
| **App ID** | `756630713` |
| **Creator** | `CO5MCLTB6IKXIKIEY3AYWUTLD4XHQYTGK3KPSCXEIFJX4PJETAT4GTPWHQ` |
| **Created At Round** | 61,138,878 |
| **Status** | ✅ Active (Not Deleted) |
| **Network** | Algorand TestNet |

### State Schema

| Type | Byte Slice | Uint |
|------|------------|------|
| **Global** | 8 | 8 |
| **Local** | 3 | 3 |

### Explorer Links

- [AlgoScan](https://testnet.algoscan.app/app/756630713)
- [Pera Wallet Explorer](https://testnet.explorer.perawallet.app/app/756630713)
- [AlgoExplorer](https://testnet.algoexplorer.io/application/756630713)

### Usage

This contract handles:
- Multi-party match result verification
- Immutable match statistics storage
- Reputation tracking for players
- Dispute resolution mechanisms

---

## 🔺 Avalanche Fuji Testnet ⚠️

**Status:** Private key not configured in `.env`

### Required Configuration

To deploy and verify Avalanche contracts, add to `.env`:

```bash
AVALANCHE_PRIVATE_KEY=your_fuji_testnet_private_key
```

### Expected Contracts

Once deployed, the following contracts will be available:

| Contract | Purpose | Status |
|----------|---------|--------|
| SquadToken | ERC20 governance token | ⏳ Pending deployment |
| SquadTimelock | Timelock for governance | ⏳ Pending deployment |
| SquadGovernor | DAO governance logic | ⏳ Pending deployment |
| AchievementNFT | ERC721 achievement tokens | ⏳ Pending deployment |
| AgentEscrow | Agent payment escrow | ⏳ Pending deployment |

### Deployment Script

```bash
cd contracts/avalanche
npx hardhat run scripts/deploy.ts --network fuji
```

After deployment, contract addresses will be logged and should be saved to `.env`.

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

Add these to your `.env` file:

```bash
# ── Algorand (Deployed) ─────────────────────────────────────
ALGORAND_MATCH_VERIFICATION_APP_ID=756630713
ALGORAND_NETWORK=testnet
NEXT_PUBLIC_ALGORAND_NODE_URL=https://testnet-api.algonode.cloud
NEXT_PUBLIC_ALGORAND_INDEXER_URL=https://testnet-idx.algonode.cloud

# ── Avalanche (Pending) ─────────────────────────────────────
AVALANCHE_PRIVATE_KEY=your_private_key_here
AVALANCHE_NETWORK=fuji
AVALANCHE_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
AVALANCHE_CHAIN_ID=43113
# After deployment, add:
# AVALANCHE_SQUAD_TOKEN_ADDRESS=0x...
# AVALANCHE_GOVERNOR_ADDRESS=0x...
# AVALANCHE_TIMELOCK_ADDRESS=0x...
# AVALANCHE_ACHIEVEMENT_NFT_ADDRESS=0x...
# AVALANCHE_AGENT_ESCROW_ADDRESS=0x...

# ── Kite AI (Planned) ───────────────────────────────────────
KITE_API_URL=https://api.gokite.ai
KITE_API_KEY=your_api_key
KITE_AGENT_WALLET=your_agent_wallet
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
