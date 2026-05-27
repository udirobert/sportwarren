import { ethers } from 'ethers';
import { getGoatRpcUrl, getGoatContracts } from '@/lib/blockchain/evm-config';

// Full ABI for reading governance state and events
const GOVERNOR_ABI = [
  // Read functions
  "function state(uint256 proposalId) public view returns (uint8)",
  "function proposalThreshold() public view returns (uint256)",
  "function votingDelay() public view returns (uint256)",
  "function votingPeriod() public view returns (uint256)",
  "function quorum(uint256 blockNumber) public view returns (uint256)",
  "function proposalProposer(uint256 proposalId) public view returns (address)",
  "function getVotes(address account, uint256 blockNumber) public view returns (uint256)",
  // Events
  "event ProposalCreated(uint256 proposalId, address proposer, address[] targets, uint256[] values, string[] signatures, bytes[] calldatas, uint256 voteStart, uint256 voteEnd, string description)",
  "event VoteCast(address indexed voter, uint256 indexed proposalId, uint8 support, uint256 weight, string reason)",
];

const TOKEN_ABI = [
  "function balanceOf(address account) public view returns (uint256)",
  "function getVotes(address account) public view returns (uint256)",
];

const STATES = ['Pending', 'Active', 'Canceled', 'Defeated', 'Succeeded', 'Queued', 'Expired', 'Executed'] as const;

export interface IndexedProposal {
  id: string;
  proposer: string;
  description: string;
  status: typeof STATES[number];
  votesFor: number;
  votesAgainst: number;
  votesAbstain: number;
  startBlock: number;
  endBlock: number;
  contractAddress: string;
}

export interface GovernanceData {
  proposals: IndexedProposal[];
  votingPower: string;
  tokenBalance: string;
  quorum: string;
  votingPeriod: number;
  proposalThreshold: string;
  network: string;
}

export class GovernanceIndexer {
  private provider: ethers.JsonRpcProvider | null = null;
  private governorContract: ethers.Contract | null = null;
  private tokenContract: ethers.Contract | null = null;
  private contracts: ReturnType<typeof getGoatContracts> | null = null;
  private initialized = false;

  initialize() {
    if (this.initialized) return;

    try {
      const rpcUrl = getGoatRpcUrl();
      this.provider = new ethers.JsonRpcProvider(rpcUrl);
      this.contracts = getGoatContracts();

      this.governorContract = new ethers.Contract(
        this.contracts.governor,
        GOVERNOR_ABI,
        this.provider,
      );

      this.tokenContract = new ethers.Contract(
        this.contracts.squadToken,
        TOKEN_ABI,
        this.provider,
      );

      this.initialized = true;
      console.log('[GOVERNANCE-INDEXER] Initialized:', {
        governor: this.contracts.governor,
        token: this.contracts.squadToken,
        rpc: rpcUrl,
      });
    } catch (err) {
      console.error('[GOVERNANCE-INDEXER] Failed to initialize:', err);
    }
  }

  /**
   * Fetch all proposals from the SquadGovernor contract
   */
  async getProposals(): Promise<IndexedProposal[]> {
    this.initialize();
    if (!this.governorContract || !this.provider) {
      console.warn('[GOVERNANCE-INDEXER] Not initialized');
      return [];
    }

    try {
      // Query ProposalCreated events (last 100k blocks for testnet)
      const filter = this.governorContract.filters.ProposalCreated();
      const currentBlock = await this.provider.getBlockNumber();
      const fromBlock = Math.max(0, currentBlock - 100_000);
      
      const events = await this.governorContract.queryFilter(
        filter,
        fromBlock,
        currentBlock,
      );

      console.log(`[GOVERNANCE-INDEXER] Found ${events.length} ProposalCreated events`);

      if (events.length === 0) {
        return [];
      }

      const proposals: IndexedProposal[] = [];

      for (const event of events) {
        try {
          if (!('args' in event) || !event.args) continue;
          const args = (event as any).args;
          const proposalId = args.proposalId;
          const stateIndex = await this.governorContract.state(proposalId);
          const states = STATES;

          // Get proposer from event
          const proposer = args.proposer;

          proposals.push({
            id: proposalId.toString(),
            proposer: proposer || '0x0000000000000000000000000000000000000000',
            description: args.description || '',
            status: states[Number(stateIndex)] || 'Pending',
            votesFor: 0, // Simplified - would need per-proposal vote event parsing
            votesAgainst: 0,
            votesAbstain: 0,
            startBlock: Number(args.voteStart),
            endBlock: Number(args.voteEnd),
            contractAddress: this.contracts!.governor,
          });
        } catch (err) {
          console.error(`[GOVERNANCE-INDEXER] Failed to process proposal event:`, err);
        }
      }

      // Sort by start block descending (newest first)
      proposals.sort((a, b) => b.startBlock - a.startBlock);
      
      // Fetch vote counts for active/completed proposals
      for (const proposal of proposals) {
        try {
          const votes = await this.getVoteCounts(proposal.id);
          proposal.votesFor = votes.for;
          proposal.votesAgainst = votes.against;
          proposal.votesAbstain = votes.abstain;
        } catch {
          // Vote parsing is best-effort
        }
      }

      return proposals;
    } catch (err) {
      console.error('[GOVERNANCE-INDEXER] Failed to fetch proposals:', err);
      return [];
    }
  }

  /**
   * Get a single proposal by its ID
   */
  async getProposal(proposalId: string): Promise<IndexedProposal | null> {
    this.initialize();
    if (!this.governorContract) return null;

    try {
      const stateIndex = await this.governorContract.state(proposalId);
      // Get proposer via the public mapping (if available)
      let proposer = '0x0000000000000000000000000000000000000000';
      try {
        proposer = await this.governorContract.proposalProposer(BigInt(proposalId));
      } catch {
        // Some governor versions don't have this function
      }

      const votes = await this.getVoteCounts(proposalId);

      return {
        id: proposalId,
        proposer,
        description: '', // Would need event parsing for full description
        status: STATES[Number(stateIndex)] || 'Pending',
        votesFor: votes.for,
        votesAgainst: votes.against,
        votesAbstain: votes.abstain,
        startBlock: 0,
        endBlock: 0,
        contractAddress: this.contracts!.governor,
      };
    } catch (err) {
      console.error(`[GOVERNANCE-INDEXER] Failed to fetch proposal ${proposalId}:`, err);
      return null;
    }
  }

  /**
   * Get voting power for an address
   */
  async getVotingPower(address: string): Promise<{ votingPower: string; tokenBalance: string }> {
    this.initialize();
    if (!this.tokenContract || !this.governorContract) {
      return { votingPower: '0', tokenBalance: '0' };
    }

    try {
      const [votes, balance] = await Promise.all([
        this.tokenContract.getVotes(address),
        this.tokenContract.balanceOf(address),
      ]);

      return {
        votingPower: ethers.formatEther(votes),
        tokenBalance: ethers.formatEther(balance),
      };
    } catch (err) {
      console.error(`[GOVERNANCE-INDEXER] Failed to get voting power for ${address}:`, err);
      return { votingPower: '0', tokenBalance: '0' };
    }
  }

  /**
   * Get overall governance parameters
   */
  async getGovernanceParams(): Promise<{
    quorum: string;
    votingPeriod: number;
    proposalThreshold: string;
    network: string;
  }> {
    this.initialize();
    if (!this.governorContract || !this.provider) {
      return { quorum: '0', votingPeriod: 0, proposalThreshold: '0', network: 'unknown' };
    }

    try {
      const currentBlock = await this.provider.getBlockNumber();
      const [quorum, votingPeriod, proposalThreshold] = await Promise.all([
        this.governorContract.quorum(currentBlock - 1),
        this.governorContract.votingPeriod(),
        this.governorContract.proposalThreshold(),
      ]);

      return {
        quorum: ethers.formatEther(quorum),
        votingPeriod: Number(votingPeriod),
        proposalThreshold: ethers.formatEther(proposalThreshold),
        network: 'GOAT Network',
      };
    } catch (err) {
      console.error('[GOVERNANCE-INDEXER] Failed to get governance params:', err);
      return { quorum: '0', votingPeriod: 0, proposalThreshold: '0', network: 'unknown' };
    }
  }

  /**
   * Parse VoteCast events to get vote counts for a proposal
   */
  private async getVoteCounts(proposalId: string): Promise<{
    for: number;
    against: number;
    abstain: number;
  }> {
    if (!this.governorContract || !this.provider) {
      return { for: 0, against: 0, abstain: 0 };
    }

    try {
      const filter = this.governorContract.filters.VoteCast(null, proposalId);
      const currentBlock = await this.provider!.getBlockNumber();
      const fromBlock = Math.max(0, currentBlock - 100_000);
      const events = await this.governorContract.queryFilter(filter, fromBlock);

      let forVotes = 0;
      let againstVotes = 0;
      let abstainVotes = 0;

      for (const event of events) {
        if (!('args' in event) || !event.args) continue;
        const args = (event as any).args;
        const support = Number(args.support);
        const weight = Number(ethers.formatEther(args.weight));

        if (support === 0) forVotes += weight;
        else if (support === 1) againstVotes += weight;
        else if (support === 2) abstainVotes += weight;
      }

      return { for: forVotes, against: againstVotes, abstain: abstainVotes };
    } catch {
      return { for: 0, against: 0, abstain: 0 };
    }
  }

  /**
   * Cast a vote via a relayer wallet. The relayer must have voting power delegated to it.
   */
  async castVoteAsRelayer(
    proposalId: string,
    support: 0 | 1 | 2, // 0=Against, 1=For, 2=Abstain
  ): Promise<{ txHash: string | null; error?: string }> {
    this.initialize();
    if (!this.governorContract || !this.provider) {
      return { txHash: null, error: 'Indexer not initialized' };
    }

    const relayerPk = process.env.AVALANCHE_RELAYER_PRIVATE_KEY;
    if (!relayerPk) {
      return { txHash: null, error: 'AVALANCHE_RELAYER_PRIVATE_KEY not configured' };
    }

    try {
      const wallet = new ethers.Wallet(relayerPk, this.provider);
      const governorWithSigner = this.governorContract.connect(wallet);

      const tx = await (governorWithSigner as any).castVote(proposalId, support);
      const receipt = await tx.wait();

      return { txHash: receipt?.hash || tx.hash };
    } catch (err: any) {
      console.error('[GOVERNANCE-INDEXER] Relayer vote failed:', err);
      return {
        txHash: null,
        error: err?.reason || err?.message || 'Relayer vote failed',
      };
    }
  }
}

// Singleton export
export const governanceIndexer = new GovernanceIndexer();
