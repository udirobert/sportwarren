# SportWarren Architecture

**Dual-Chain Agentic Platform | Algorand (FIFA) + Avalanche (Agents)**

---

## Vision: Championship Manager Meets Web3

SportWarren is the **first agentic football platform** combining:
- **FIFA Official Partnership** (Algorand) - World Cup 2026 integration
- **1,600+ AI Agent Ecosystem** (Avalanche) - Autonomous squad management  
- **Dual-Chain Architecture** - Best of both worlds, user choice

```
┌─────────────────────────────────────────────────────────────────┐
│                    SportWarren Agentic Platform                  │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐                           ┌──────────────┐   │
│  │   AVALANCHE  │                           │   ALGORAND   │   │
│  │   Subnet     │                           │   Mainnet    │   │
│  ├──────────────┤                           ├──────────────┤   │
│  │ 🤖 Agent     │                           │ ⚽ FIFA       │   │
│  │    Economy   │◄────── User Choice ──────►│    Official  │   │
│  │              │        Layer              │    Data      │   │
│  │ • ERC-8004   │                           │ • State      │   │
│  │ • TEE/Intel  │                           │   Proofs     │   │
│  │   TDX        │                           │ • Match      │   │
│  │ • AWM Cross  │                           │   Oracles    │   │
│  │   -subnet    │                           │ • Reputation │   │
│  │ • DeFi/MeV   │                           │   System     │   │
│  │   agents     │                           │              │   │
│  └──────────────┘                           └──────────────┘   │
│         │                                        │              │
│         └────────────┬───────────────────────────┘              │
│                      │                                          │
│         ┌────────────▼────────────┐                             │
│         │   Next.js Abstraction   │                             │
│         │         Layer           │                             │
│         ├─────────────────────────┤                             │
│         │ • Chain-agnostic UI     │                             │
│         │ • Agent orchestration   │                             │
│         │ • User preference mgmt  │                             │
│         └─────────────────────────┘                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## Dual-Chain Strategy

| Feature | Algorand | Avalanche |
|---------|----------|-----------|
| **Purpose** | FIFA data, match verification, reputation | AI agents, DeFi, cross-chain tournaments |
| **Partnership** | ✅ Official FIFA (World Cup 2026) | ❌ |
| **Agentic Primitives** | ❌ | ✅ ERC-8004, TEE, 1,600+ agents |
| **Cross-Chain** | State Proofs (Falcon signatures) | AWM (Warp Messaging) |
| **Fees** | ~$0.001 | ~$0.01 |
| **Finality** | 4.5s | <1s |
| **EVM Compatibility** | ❌ | ✅ Full |

### Competitive Moat

```
Traditional Sports Apps:    Single-chain or no blockchain
Your Competitors:           Maybe Ethereum L2
SportWarren:                Dual-chain + Agentic + FIFA Official
                            ↑
                            This is defensible
```

---

## Chain Selection Strategy

| Operation | Default Chain | Rationale |
|-----------|---------------|-----------|
| Match Verification | Algorand | FIFA data integrity, low fees |
| Player Reputation | Algorand | Official credibility |
| Squad DAO Governance | User Choice | EVM vs. fee preference |
| Agent Trading/DeFi | Avalanche | Liquidity, MEV opportunities |
| Cross-Squad Tournaments | Dual-Chain | AWM + State Proofs |
| AI Agent Operations | Avalanche | ERC-8004, TEE infrastructure |

---

## System Architecture

### Chain Abstraction Layer

```typescript
// src/lib/blockchain/interface.ts
interface BlockchainProvider {
  chain: 'AVALANCHE' | 'ALGORAND';
  
  // Identity & Agents
  connectWallet(): Promise<WalletConnection>;
  createAgentIdentity(params: AgentParams): Promise<AgentId>;
  
  // Squad DAO Operations
  deploySquadDAO(params: DAOParams): Promise<DeploymentResult>;
  createProposal(params: ProposalParams): Promise<TxHash>;
  vote(params: VoteParams): Promise<boolean>;
  
  // Match Operations
  submitMatchResult(match: MatchData): Promise<TxHash>;
  verifyMatch(matchId: string, verifier: string): Promise<boolean>;
  
  // Agent-Specific
  executeAgentAction(action: AgentAction): Promise<TxHash>;
  getAgentState(agentId: string): Promise<AgentState>;
}
```

### Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                   Next.js 14 Application                     │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────┐          │
│  │       Chain Abstraction Layer                 │          │
│  │  BlockchainProvider Interface                 │          │
│  └──────────────────────────────────────────────┘          │
│         │                              │                    │
│         ▼                              ▼                    │
│  ┌──────────────┐            ┌──────────────┐              │
│  │ Algorand     │            │ Avalanche    │              │
│  │ (algosdk v3) │            │ (Viem/Wagmi) │              │
│  └──────────────┘            └──────────────┘              │
└─────────────────────────────────────────────────────────────┘
         │                              │
         ▼                              ▼
┌──────────────────┐          ┌──────────────────┐
│ Algorand Network │          │ Avalanche Network│
│ • FIFA Data      │          │ • ERC-8004       │
│ • State Proofs   │          │ • AWM Messaging  │
│ • Match Oracles  │          │ • DeFi/MeV       │
└──────────────────┘          └──────────────────┘
```

---

## Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS + shadcn/ui
- **State:** Zustand + TanStack Query
- **Wallets:** RainbowKit (Avalanche) + Pera Wallet (Algorand)

### Blockchain
| Chain | Contracts | Frontend | Cross-Chain |
|-------|-----------|----------|-------------|
| **Algorand** | TEAL (existing) | algosdk v3.x | State Proofs |
| **Avalanche** | Foundry + Solidity 0.8.x | Viem + Wagmi | AWM |

### Backend & AI
- **API:** Next.js API Routes
- **Indexing:** The Graph + Algorand Indexer
- **Agents:** LangChain + ERC-8004 + TEE

---

## Security

### Cross-Chain Security
- **Avalanche → Avalanche:** AWM (native protocol)
- **Algorand → External:** State Proofs (quantum-safe Falcon signatures)
- **Application Layer:** Tournament synchronization

### Agent Security
- **TEE (Intel TDX):** Hardware-isolated execution
- **ERC-8004:** Verifiable agent identity

### Smart Contracts
- **Algorand:** TEAL best practices
- **Avalanche:** Foundry tests, OpenZeppelin
- **Both:** Security audits before mainnet

---

**See Also:** [Development](./DEVELOPMENT.md) | [Roadmap](./ROADMAP.md) | [Features](./FEATURES.md)
