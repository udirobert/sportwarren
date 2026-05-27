# SportWarren Avalanche Smart Contracts

This folder contains the Avalanche smart contracts for SportWarren, running on Avalanche (Fuji Testnet & C-Chain).

Avalanche has a strict role in the broader SportWarren architecture: governance, treasury policy, programmable squad assets, and contract-based escrow. It complements Algorand verification, Kite AI agent economy primitives, Yellow settlement rails, TON Telegram treasury flows, and Lens social distribution.

## Transition from Prisma to On-Chain

In order to achieve a truly decentralized execution model, the following changes were made:

1. **Hardwiring the "Collective Strategy" (Pro Layer)**: The `SquadProposal` and `ProposalVote` models in Prisma have been **DELETED**. Instead, governance is now handled fully on-chain:
   - `SquadToken.sol`: An ERC20Votes compatible governance token.
   - `SquadGovernor.sol`: The OpenZeppelin Governor contract, ensuring squad decisions (match acceptance, treasury spending) are mature, transparent, and immutable.

2. **Achievement NFTs (Phygital Value)**
   - `AchievementNFT.sol`: An ERC-721 contract to represent match-day MVPs & Milestones as tradable digital assets. Players now truly "own" these.

3. **Agent Escrow & Marketplace**
   - `AgentEscrow.sol`: A smart contract designed for coordinating escrow around paid agent work. Squads can deposit stablecoins or squad tokens into escrow, which are released programmatically upon the completion of a match analysis or other specialized tasks, while Kite AI handles agent identity, attestations, and agent-side payment primitives.

## Local Development & Setup

Make sure you have `Node.js >= 18` installed, then run:

```bash
npm install
npx hardhat compile
```

## Deployment mapped to Fuji Testnet

To deploy to the Avalanche Fuji Testnet, you must ensure you have `PRIVATE_KEY` set in your `.env` or `.env.local` file at the root of the project.

Then, deploy using:

```bash
npx hardhat run scripts/deploy.ts --network fuji
```

The script will launch and verify all four contracts dynamically.
