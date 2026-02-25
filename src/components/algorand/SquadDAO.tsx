import React, { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/common/Card";
import { Users, Vote, Trophy, Plus, Check, X, Clock } from "lucide-react";

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
  status: "active" | "passed" | "rejected" | "executed"; // Determine status based on rounds and execution
}

export const SquadDAO: React.FC = () => {
  const [squadDAOInfo, setSquadDAOInfo] = useState<SquadDAOInfo | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [showCreateProposal, setShowCreateProposal] = useState(false);
  const [newProposal, setNewProposal] = useState({
    description: "",
    type: "general" as "lineup" | "tactics" | "transfer" | "general", // Keep type for UI, but not sent to contract
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
      const daoInfoResponse = await fetch("/api/algorand/squad-dao-info");
      const daoInfoData = await daoInfoResponse.json();

      if (daoInfoData.daoInfo) {
        setSquadDAOInfo(daoInfoData.daoInfo);

        // Fetch current network status for round information
        const statusResponse = await fetch("/api/algorand/network-status");
        const statusData = await statusResponse.json();
        const currentRound = statusData.network.lastRound;

        // Fetch proposals
        const proposalsResponse = await fetch("/api/algorand/proposals");
        const proposalsData = await proposalsResponse.json();

        const processedProposals = proposalsData.proposals.map(
          (p: {
            id: number;
            description: string;
            startRound: number;
            endRound: number;
            votesFor: number;
            votesAgainst: number;
          }) => {
            let status: Proposal["status"] = "active";

            if (p.endRound) {
              if (currentRound > p.endRound) {
                if (p.votesFor > p.votesAgainst) {
                  status = "passed";
                } else {
                  status = "rejected";
                }
              }
            }

            // Check if executed (needs a global state for executed proposals)
            // For now, we'll assume if passed and voting period is over, it's ready for execution
            // A more robust solution would involve fetching a separate 'executed' flag from the contract
            if (status === "passed" && currentRound > p.endRound) {
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
          },
        );
        setProposals(processedProposals);

        // Fetch user address (from AlgorandWallet component or context)
        const walletAddress = localStorage.getItem(
          "algorand_connected_address",
        );
        if (walletAddress) {
          setUserAddress(walletAddress);
          const tokenBalanceResponse = await fetch(
            `/api/algorand/user-token-balance?address=${walletAddress}`,
          );
          const tokenBalanceData = await tokenBalanceResponse.json();
          setUserTokens(tokenBalanceData.balance || 0);
        }
      } else {
        setError(
          "Squad DAO Application ID not found. Ensure the DAO is deployed.",
        );
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
      const statusResponse = await fetch("/api/algorand/network-status");
      const statusData = await statusResponse.json();
      const currentRound = statusData.network.lastRound;

      // Calculate endRound (e.g., 1000 rounds from now)
      const calculatedEndRound = currentRound + 1000;

      const response = await fetch("/api/algorand/create-proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proposerAddress: userAddress,
          description: newProposal.description,
          startRound: currentRound,
          endRound: calculatedEndRound,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setNewProposal({
          description: "",
          type: "general",
          startRound: 0,
          endRound: 0,
        });
        setShowCreateProposal(false);
        fetchDAOData(); // Refresh data
      } else {
        setError(data.error || "Failed to create proposal.");
      }
    } catch (err) {
      console.error("Failed to create proposal:", err);
      setError("Failed to create proposal. Network error.");
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (proposalId: number, voteType: 0 | 1) => {
    if (!userAddress) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/algorand/vote-proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        setError(data.error || "Failed to cast vote.");
      }
    } catch (err) {
      console.error("Failed to vote:", err);
      setError("Failed to cast vote. Network error.");
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteProposal = async (proposalId: number) => {
    if (!userAddress) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/algorand/execute-proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          executorAddress: userAddress,
          proposalId,
        }),
      });
      const data = await response.json();
      if (data.success) {
        fetchDAOData(); // Refresh data
      } else {
        setError(data.error || "Failed to execute proposal.");
      }
    } catch (err) {
      console.error("Failed to execute proposal:", err);
      setError("Failed to execute proposal. Network error.");
    } finally {
      setLoading(false);
    }
  };

  const getProposalStatus = (proposal: Proposal) => {
    switch (proposal.status) {
      case "active":
        return (
          <span className="text-blue-600 flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            Active
          </span>
        );
      case "passed":
        return (
          <span className="text-green-600 flex items-center">
            <Check className="w-4 h-4 mr-1" />
            Passed
          </span>
        );
      case "rejected":
        return (
          <span className="text-red-600 flex items-center">
            <X className="w-4 h-4 mr-1" />
            Rejected
          </span>
        );
      case "executed":
        return (
          <span className="text-purple-600 flex items-center">
            <Trophy className="w-4 h-4 mr-1" />
            Executed
          </span>
        );
      default:
        return <span className="text-gray-600">Unknown</span>;
    }
  };

  if (loading && !squadDAOInfo) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Squad DAO Overview */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold flex items-center">
            <Users className="w-6 h-6 mr-2 text-blue-600" />
            Squad DAO
          </h2>
          <button
            onClick={() => setShowCreateProposal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700"
            disabled={!userAddress || loading}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Proposal
          </button>
        </div>

        {squadDAOInfo ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-700">DAO Name</h3>
              <p className="text-xl font-bold text-blue-600">
                {squadDAOInfo.name}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-700">Total Supply</h3>
              <p className="text-xl font-bold text-green-600">
                {squadDAOInfo.totalSupply.toLocaleString()}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-700">Your Tokens</h3>
              <p className="text-xl font-bold text-purple-600">
                {userTokens.toLocaleString()}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">
              No Squad DAO found. Deploy one first.
            </p>
          </div>
        )}
      </Card>

      {/* Create Proposal Modal */}
      {showCreateProposal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md p-6">
            <h3 className="text-xl font-bold mb-4">Create New Proposal</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  value={newProposal.type}
                  onChange={(e) =>
                    setNewProposal({
                      ...newProposal,
                      type: e.target.value as
                        | "lineup"
                        | "tactics"
                        | "transfer"
                        | "general",
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="general">General</option>
                  <option value="lineup">Team Lineup</option>
                  <option value="tactics">Tactics</option>
                  <option value="transfer">Player Transfer</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newProposal.description}
                  onChange={(e) =>
                    setNewProposal({
                      ...newProposal,
                      description: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Describe your proposal..."
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowCreateProposal(false)}
                className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProposal}
                disabled={!newProposal.description || loading}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create"}
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Proposals List */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold flex items-center">
          <Vote className="w-5 h-5 mr-2 text-blue-600" />
          Active Proposals
        </h3>

        {proposals.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-600">
              No proposals yet. Create the first one!
            </p>
          </Card>
        ) : (
          proposals.map((proposal) => (
            <Card key={proposal.id} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-lg font-semibold">
                    {proposal.description}
                  </h4>
                  <p className="text-sm text-gray-600">
                    Proposed by: {proposal.proposer}
                  </p>
                </div>
                {getProposalStatus(proposal)}
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>For: {proposal.votesFor}</span>
                  <span>Against: {proposal.votesAgainst}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{
                      width: `${proposal.totalVotes > 0 ? (proposal.votesFor / proposal.totalVotes) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
              </div>

              {proposal.status === "active" &&
                userAddress &&
                userTokens > 0 && (
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleVote(proposal.id, 1)}
                      disabled={loading}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      Vote For
                    </button>
                    <button
                      onClick={() => handleVote(proposal.id, 0)}
                      disabled={loading}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                      Vote Against
                    </button>
                  </div>
                )}

              {proposal.status === "passed" && (
                <button
                  onClick={() => handleExecuteProposal(proposal.id)}
                  disabled={loading}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  Execute Proposal
                </button>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
