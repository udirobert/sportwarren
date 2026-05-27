"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { ethers } from "ethers";
import { useWallet } from "@/contexts/WalletContext";
import {
  getGoatContracts,
  getGoatRpcUrl,
  getGoatChain,
} from "@/lib/blockchain/evm-config";

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

export interface GoatProposal {
  id: string;
  proposer: string;
  description: string;
  status:
    | "Pending"
    | "Active"
    | "Canceled"
    | "Defeated"
    | "Succeeded"
    | "Queued"
    | "Expired"
    | "Executed";
  votesFor: string;
  votesAgainst: string;
  votesAbstain: string;
  startBlock: number;
  endBlock: number;
}

export function useGoatGovernance() {
  const { address, chain } = useWallet();
  const [proposals, setProposals] = useState<GoatProposal[]>([]);
  const [tokenBalance, setTokenBalance] = useState("0");
  const [votingPower, setVotingPower] = useState("0");
  const [delegatee, setDelegatee] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isGoat = chain === "goat";
  const contracts = getGoatContracts();
  const GOVERNOR_ADDRESS = contracts.governor;
  const TOKEN_ADDRESS = contracts.squadToken;
  const hasContracts = Boolean(GOVERNOR_ADDRESS && TOKEN_ADDRESS);

  const provider = useMemo(() => {
    if (
      typeof window !== "undefined" &&
      (window as any).ethereum &&
      isGoat &&
      hasContracts
    ) {
      return new ethers.BrowserProvider((window as any).ethereum);
    }
    return null;
  }, [isGoat, hasContracts]);

  const fetchGovernanceData = useCallback(async () => {
    if (!provider || !address || !hasContracts) return;

    setLoading(true);
    try {
      const tokenContract = new ethers.Contract(
        TOKEN_ADDRESS,
        TOKEN_ABI,
        provider,
      );
      const governorContract = new ethers.Contract(
        GOVERNOR_ADDRESS,
        GOVERNOR_ABI,
        provider,
      );

      const [balance, votes, currentDelegatee] = await Promise.all([
        tokenContract.balanceOf(address),
        tokenContract.getVotes(address),
        tokenContract.delegates(address),
      ]);

      setTokenBalance(ethers.formatEther(balance));
      setVotingPower(ethers.formatEther(votes));
      setDelegatee(currentDelegatee);

      const filter = governorContract.filters.ProposalCreated();
      const events = await governorContract.queryFilter(filter, -10000);

      const processedProposals = await Promise.all(
        events.map(async (event: any) => {
          const proposalId = event.args.proposalId;
          const stateIndex = await governorContract.state(proposalId);
          const states = [
            "Pending",
            "Active",
            "Canceled",
            "Defeated",
            "Succeeded",
            "Queued",
            "Expired",
            "Executed",
          ];

          return {
            id: proposalId.toString(),
            proposer: event.args.proposer,
            description: event.args.description,
            status: states[stateIndex] as GoatProposal["status"],
            votesFor: "0",
            votesAgainst: "0",
            votesAbstain: "0",
            startBlock: Number(event.args.voteStart),
            endBlock: Number(event.args.voteEnd),
          };
        }),
      );

      setProposals(processedProposals.reverse());
    } catch (err) {
      console.error("Failed to fetch GOAT governance data:", err);
      setError("Failed to load governance data from GOAT Network.");
    } finally {
      setLoading(false);
    }
  }, [provider, address, hasContracts, GOVERNOR_ADDRESS, TOKEN_ADDRESS]);

  useEffect(() => {
    if (isGoat && address && hasContracts) {
      fetchGovernanceData();
    }
  }, [isGoat, address, hasContracts, fetchGovernanceData]);

  const castVote = async (proposalId: string, support: number) => {
    if (!provider || !address || !hasContracts) return;
    setLoading(true);
    try {
      const signer = await provider.getSigner();
      const governorContract = new ethers.Contract(
        GOVERNOR_ADDRESS,
        GOVERNOR_ABI,
        signer,
      );
      const tx = await governorContract.castVote(proposalId, support);
      await tx.wait();
      await fetchGovernanceData();
    } catch (err: any) {
      console.error("Failed to cast vote on GOAT:", err);
      setError(err.message || "Failed to cast vote on GOAT Network.");
    } finally {
      setLoading(false);
    }
  };

  const delegate = async (targetAddress: string) => {
    if (!provider || !address || !hasContracts) return;
    setLoading(true);
    try {
      const signer = await provider.getSigner();
      const tokenContract = new ethers.Contract(
        TOKEN_ADDRESS,
        TOKEN_ABI,
        signer,
      );
      const tx = await tokenContract.delegate(targetAddress);
      await tx.wait();
      await fetchGovernanceData();
    } catch (err: any) {
      console.error("Failed to delegate on GOAT:", err);
      setError(err.message || "Failed to delegate on GOAT Network.");
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
    hasContracts,
  };
}
