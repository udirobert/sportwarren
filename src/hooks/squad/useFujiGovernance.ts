"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '@/contexts/WalletContext';

// Type for hex strings
type Hex = `0x${string}`;

// Minimal ABIs for governance
const GOVERNOR_ABI = [
  "function propose(address[] targets, uint256[] values, bytes[] calldatas, string description) public returns (uint256)",
  "function castVote(uint256 proposalId, uint8 support) public returns (uint256)",
  "function queue(address[] targets, uint256[] values, bytes[] calldatas, bytes32 descriptionHash) public",
  "function execute(address[] targets, uint256[] values, bytes[] calldatas, bytes32 descriptionHash) public",
  "function state(uint256 proposalId) public view returns (uint8)",
  "function proposalThreshold() public view returns (uint256)",
  "function votingDelay() public view returns (uint256)",
  "function votingPeriod() public view returns (uint256)",
  "function quorum(uint256 blockNumber) public view returns (uint256)",
  "event ProposalCreated(uint256 proposalId, address proposer, address[] targets, uint256[] values, string[] signatures, bytes[] calldatas, uint256 voteStart, uint256 voteEnd, string description)",
];

const TOKEN_ABI = [
  "function balanceOf(address account) public view returns (uint256)",
  "function getVotes(address account) public view returns (uint256)",
  "function delegate(address delegatee) public",
  "function delegates(address account) public view returns (address)",
];

const GOVERNOR_ADDRESS = process.env.NEXT_PUBLIC_AVALANCHE_GOVERNOR_ADDRESS || "0x2e98aF1871bF208Ad361202884AB88F904eFf826";
const TOKEN_ADDRESS = process.env.NEXT_PUBLIC_AVALANCHE_SQUAD_TOKEN_ADDRESS || "0x9ecDe1788E1cE1B40024F0fD9eA87f49a94781dB";

export interface FujiProposal {
  id: string;
  proposer: string;
  description: string;
  status: 'Pending' | 'Active' | 'Canceled' | 'Defeated' | 'Succeeded' | 'Queued' | 'Expired' | 'Executed';
  votesFor: string;
  votesAgainst: string;
  votesAbstain: string;
  startBlock: number;
  endBlock: number;
}

export function useFujiGovernance() {
  const { address, chain } = useWallet();
  const [proposals, setProposals] = useState<FujiProposal[]>([]);
  const [tokenBalance, setTokenBalance] = useState("0");
  const [votingPower, setVotingPower] = useState("0");
  const [delegatee, setDelegatee] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isFuji = chain === 'avalanche';

  const provider = useMemo(() => {
    if (typeof window !== 'undefined' && (window as any).ethereum && isFuji) {
      return new ethers.BrowserProvider((window as any).ethereum);
    }
    return null;
  }, [isFuji]);

  const fetchGovernanceData = useCallback(async () => {
    if (!provider || !address) return;

    setLoading(true);
    try {
      const tokenContract = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, provider);
      const governorContract = new ethers.Contract(GOVERNOR_ADDRESS, GOVERNOR_ABI, provider);

      const [balance, votes, currentDelegatee] = await Promise.all([
        tokenContract.balanceOf(address),
        tokenContract.getVotes(address),
        tokenContract.delegates(address),
      ]);

      setTokenBalance(ethers.formatEther(balance));
      setVotingPower(ethers.formatEther(votes));
      setDelegatee(currentDelegatee);

      // Fetch proposals via events (simplified for demo)
      const filter = governorContract.filters.ProposalCreated();
      const events = await governorContract.queryFilter(filter, -10000); // Last 10k blocks

      const processedProposals = await Promise.all(events.map(async (event: any) => {
        const proposalId = event.args.proposalId;
        const stateIndex = await governorContract.state(proposalId);
        const states = ['Pending', 'Active', 'Canceled', 'Defeated', 'Succeeded', 'Queued', 'Expired', 'Executed'];
        
        return {
          id: proposalId.toString(),
          proposer: event.args.proposer,
          description: event.args.description,
          status: states[stateIndex] as FujiProposal['status'],
          votesFor: "0", // Simplified
          votesAgainst: "0",
          votesAbstain: "0",
          startBlock: Number(event.args.voteStart),
          endBlock: Number(event.args.voteEnd),
        };
      }));

      setProposals(processedProposals.reverse());
    } catch (err) {
      console.error("Failed to fetch Fuji governance data:", err);
      setError("Failed to load governance data from Avalanche.");
    } finally {
      setLoading(false);
    }
  }, [provider, address]);

  useEffect(() => {
    if (isFuji && address) {
      fetchGovernanceData();
    }
  }, [isFuji, address, fetchGovernanceData]);

  const castVote = async (proposalId: string, support: number) => {
    if (!provider || !address) return;
    setLoading(true);
    try {
      const signer = await provider.getSigner();
      const governorContract = new ethers.Contract(GOVERNOR_ADDRESS, GOVERNOR_ABI, signer);
      const tx = await governorContract.castVote(proposalId, support);
      await tx.wait();
      await fetchGovernanceData();
    } catch (err: any) {
      console.error("Failed to cast vote:", err);
      setError(err.message || "Failed to cast vote on Fuji.");
    } finally {
      setLoading(false);
    }
  };

  const delegate = async (targetAddress: string) => {
    if (!provider || !address) return;
    setLoading(true);
    try {
      const signer = await provider.getSigner();
      const tokenContract = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, signer);
      const tx = await tokenContract.delegate(targetAddress);
      await tx.wait();
      await fetchGovernanceData();
    } catch (err: any) {
      console.error("Failed to delegate:", err);
      setError(err.message || "Failed to delegate on Fuji.");
    } finally {
      setLoading(false);
    }
  };

  return {
    proposals,
    tokenBalance,
    votingPower,
    delegatee,
    loading,
    error,
    castVote,
    delegate,
    refresh: fetchGovernanceData,
  };
}
