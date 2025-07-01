import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../common/Card';
import { Users, Vote, Trophy, Settings, Plus, Check, X, Clock } from 'lucide-react';

interface SquadDAOInfo {
  governanceAppId: number;
  creator: string;
  governanceTokenId: number;
  name: string;
  totalSupply: number;
}

interface Proposal {
  id: number; // Changed to number as per PyTeal contract
  description: string; // Changed from title to description
  startRound: number;
  endRound: number;
  votesFor: number;
  votesAgainst: number;
  totalVotes: number;
  proposer: string; // Will be fetched or derived
  status: 'active' | 'passed' | 'rejected' | 'executed'; // Determine status based on rounds and execution
}

export const SquadDAO: React.FC = () => {
  const [squadDAOInfo, setSquadDAOInfo] = useState<SquadDAOInfo | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [showCreateProposal, setShowCreateProposal] = useState(false);
  const [newProposal, setNewProposal] = useState({
    description: '',
    type: 'general' as 'lineup' | 'tactics' | 'transfer' | 'general', // Keep type for UI, but not sent to contract
    startRound: 0,
    endRound: 0,
  });
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [userTokens, setUserTokens] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDAOData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch Squad DAO Info
      const daoInfoResponse = await fetch('/api/algorand/squad-dao-info');
      const daoInfoData = await daoInfoResponse.json();

      if (daoInfoData.daoInfo) {
        setSquadDAOInfo(daoInfoData.daoInfo);
        const currentAppId = daoInfoData.daoInfo.governanceAppId;

        // Fetch current network status for round information
        const statusResponse = await fetch('/api/algorand/network-status');
        const statusData = await statusResponse.json();
        const currentRound = statusData.network.lastRound;

        // Fetch proposals
        const proposalsResponse = await fetch('/api/algorand/proposals');
        const proposalsData = await proposalsResponse.json();
        
        const processedProposals = proposalsData.proposals.map((p: any) => {
          let status: Proposal['status'] = 'active';
          let endDate: Date = new Date();

          if (p.endRound) {
            // Assuming 1 round = 4.5 seconds (average block time on Algorand testnet)
            const roundsRemaining = p.endRound - currentRound;
            const secondsRemaining = roundsRemaining * 4.5;
            endDate = new Date(Date.now() + secondsRemaining * 1000);

            if (currentRound > p.endRound) {
              if (p.votesFor > p.votesAgainst) {
                status = 'passed';
              } else {
                status = 'rejected';
              }
            }
          }

          // Check if executed (needs a global state for executed proposals)
          // For now, we'll assume if passed and voting period is over, it's ready for execution
          // A more robust solution would involve fetching a separate 'executed' flag from the contract
          if (status === 'passed' && currentRound > p.endRound) {
            // This is a simplification. Actual execution status would be stored on-chain.
            // For now, we'll just mark it as executable if passed and voting period is over.
            // We'll add a separate 'executed' state later if the contract supports it.
          }

          return {
            id: p.id,
            title: p.description, // Using description as title for UI
            description: p.description,
            startRound: p.startRound,
            endRound: p.endRound,
            votesFor: p.votesFor,
            votesAgainst: p.votesAgainst,
            totalVotes: p.votesFor + p.votesAgainst,
            // You might need to fetch proposer from transaction history or add to global state
            proposer: "Unknown", 
            status: status,
            requiredVotes: daoInfoData.daoInfo.totalSupply / 2, // Example: 50% of total supply
          };
        });
        setProposals(processedProposals);

        // Fetch user address (from AlgorandWallet component or context)
        const walletAddress = localStorage.getItem('algorand_connected_address');
        if (walletAddress) {
          setUserAddress(walletAddress);
          const tokenBalanceResponse = await fetch(`/api/algorand/user-token-balance?address=${walletAddress}`);
          const tokenBalanceData = await tokenBalanceResponse.json();
          setUserTokens(tokenBalanceData.balance || 0);
        }

      } else {
        setError("Squad DAO Application ID not found. Ensure the DAO is deployed.");
      }
    } catch (err) {
      console.error("Failed to fetch DAO data:", err);
      setError("Failed to load DAO data. Please check server and network.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDAOData();
  }, [fetchDAOData]);

  const handleCreateProposal = async () => {
    if (!newProposal.description || !userAddress) return;

    setLoading(true);
    setError(null);
    try {
      // Fetch current round for startRound
      const statusResponse = await fetch('/api/algorand/network-status');
      const statusData = await statusResponse.json();
      const currentRound = statusData.network.lastRound;

      // Calculate endRound (e.g., 1000 rounds from now)
      const calculatedEndRound = currentRound + 1000;

      const response = await fetch('/api/algorand/create-proposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposerAddress: userAddress,
          description: newProposal.description,
          startRound: currentRound,
          endRound: calculatedEndRound,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setNewProposal({ description: '', type: 'general', startRound: 0, endRound: 0 });
        setShowCreateProposal(false);
        fetchDAOData(); // Refresh data
      } else {
        setError(data.error || 'Failed to create proposal.');
      }
    } catch (err) {
      console.error('Failed to create proposal:', err);
      setError('Failed to create proposal. Network error.');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (proposalId: number, voteType: 0 | 1) => {
    if (!userAddress) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/algorand/vote-proposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voterAddress: userAddress,
          proposalId,
          voteType,
        }),
      });
      const data = await response.json();
      if (data.success) {
        fetchDAOData(); // Refresh data
      } else {
        setError(data.error || 'Failed to cast vote.');
      }
    } catch (err) {
      console.error('Failed to vote:', err);
      setError('Failed to cast vote. Network error.');
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteProposal = async (proposalId: number) => {
    if (!userAddress) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/algorand/execute-proposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          executorAddress: userAddress,
          proposalId,
        }),
      });
      const data = await response.json();
      if (data.success) {
        fetchDAOData(); // Refresh data
      } else {
        setError(data.error || 'Failed to execute proposal.');
      }
    } catch (err) {
      console.error('Failed to execute proposal:', err);
      setError('Failed to execute proposal. Network error.');
    } finally {
      setLoading(false);
    }
  };