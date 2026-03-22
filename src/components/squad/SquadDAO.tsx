import React, { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/Card";
import { Users, Vote, Trophy, Plus, Check, X, Clock, Shield, ArrowRight } from "lucide-react";
import { useWallet } from "@/contexts/WalletContext";
import { useFujiGovernance, type FujiProposal } from "@/hooks/squad/useFujiGovernance";

interface SquadDAOInfo {
  governanceAppId: number;
  creator: string;
  governanceTokenId: number;
  name: string;
  totalSupply: number;
}

interface Proposal {
  id: number | string;
  description: string;
  startRound?: number;
  endRound?: number;
  votesFor: number | string;
  votesAgainst: number | string;
  totalVotes?: number;
  proposer: string;
  status: "active" | "passed" | "rejected" | "executed" | "Pending" | "Active" | "Canceled" | "Defeated" | "Succeeded" | "Queued" | "Expired" | "Executed";
}

export const SquadDAO: React.FC = () => {
  const { chain, address: userAddress } = useWallet();
  const isAlgorand = chain === 'algorand';
  const isAvalanche = chain === 'avalanche';

  const fujiGov = useFujiGovernance();

  const [squadDAOInfo, setSquadDAOInfo] = useState<SquadDAOInfo | null>(null);
  const [algoProposals, setAlgoProposals] = useState<Proposal[]>([]);
  const [showCreateProposal, setShowCreateProposal] = useState(false);
  const [newProposal, setNewProposal] = useState({
    description: "",
    type: "general" as "lineup" | "tactics" | "transfer" | "general",
  });
  const [userTokens, setUserTokens] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAlgoDAOData = useCallback(async () => {
    if (!isAlgorand) return;
    setLoading(true);
    setError(null);
    try {
      const daoInfoResponse = await fetch("/api/algorand/squad-dao-info");
      const daoInfoData = await daoInfoResponse.json();

      if (daoInfoData.daoInfo) {
        setSquadDAOInfo(daoInfoData.daoInfo);

        const statusResponse = await fetch("/api/algorand/network-status");
        const statusData = await statusResponse.json();
        const currentRound = statusData.network.lastRound;

        const proposalsResponse = await fetch("/api/algorand/proposals");
        const proposalsData = await proposalsResponse.json();

        const processedProposals = proposalsData.proposals.map(
          (p: any) => {
            let status: Proposal["status"] = "active";
            if (p.endRound && currentRound > p.endRound) {
              status = p.votesFor > p.votesAgainst ? "passed" : "rejected";
            }

            return {
              id: p.id,
              description: p.description,
              startRound: p.startRound,
              endRound: p.endRound,
              votesFor: p.votesFor,
              votesAgainst: p.votesAgainst,
              totalVotes: p.votesFor + p.votesAgainst,
              proposer: "Unknown",
              status: status,
            };
          },
        );
        setAlgoProposals(processedProposals);

        if (userAddress) {
          const tokenBalanceResponse = await fetch(
            `/api/algorand/user-token-balance?address=${userAddress}`,
          );
          const tokenBalanceData = await tokenBalanceResponse.json();
          setUserTokens(tokenBalanceData.balance || 0);
        }
      }
    } catch (err) {
      console.error("Failed to fetch Algo DAO data:", err);
      setError("Failed to load Algorand DAO data.");
    } finally {
      setLoading(false);
    }
  }, [isAlgorand, userAddress]);

  useEffect(() => {
    if (isAlgorand) {
      fetchAlgoDAOData();
    }
  }, [isAlgorand, fetchAlgoDAOData]);

  const handleAlgoVote = async (proposalId: number, voteType: 0 | 1) => {
    if (!userAddress) return;
    setLoading(true);
    try {
      const response = await fetch("/api/algorand/vote-proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voterAddress: userAddress, proposalId, voteType }),
      });
      const data = await response.json();
      if (data.success) fetchAlgoDAOData();
      else setError(data.error || "Failed to cast vote.");
    } catch (err) {
      setError("Failed to cast vote. Network error.");
    } finally {
      setLoading(false);
    }
  };

  const renderProposalStatus = (status: Proposal["status"]) => {
    const isSuccess = status === "passed" || status === "Succeeded" || status === "Executed" || status === "executed";
    const isPending = status === "active" || status === "Active" || status === "Pending" || status === "Queued";
    const isFailure = status === "rejected" || status === "Defeated" || status === "Canceled" || status === "Expired";

    return (
      <span className={`flex items-center text-sm font-medium ${
        isSuccess ? "text-green-600" : isPending ? "text-blue-600" : "text-red-600"
      }`}>
        {isSuccess ? <Check className="w-4 h-4 mr-1" /> : isPending ? <Clock className="w-4 h-4 mr-1" /> : <X className="w-4 h-4 mr-1" />}
        {status}
      </span>
    );
  };

  if (!chain || (chain !== 'algorand' && chain !== 'avalanche')) {
    return (
      <Card className="p-8 text-center bg-gray-50 border-dashed border-2 border-gray-200">
        <Shield className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900">Governance Rail Disconnected</h3>
        <p className="text-gray-600 max-w-sm mx-auto mt-2">
          Connect an Algorand or Avalanche wallet to participate in squad governance and vote on proposals.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center justify-between">
          <div className="flex items-center">
            <X className="w-5 h-5 mr-2" />
            {error}
          </div>
          <button onClick={() => setError(null)} className="text-red-900 hover:text-red-700">×</button>
        </div>
      )}

      {/* Chain Status Card */}
      <Card className="bg-gradient-to-br from-gray-900 to-gray-800 text-white border-none">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className={`w-2 h-2 rounded-full ${isAvalanche ? 'bg-red-500' : 'bg-blue-500'} animate-pulse`} />
              <p className="text-gray-300 dark:text-gray-400 text-xs font-bold uppercase tracking-widest">
                {isAvalanche ? 'Avalanche Fuji' : 'Algorand Testnet'} Governance
              </p>
            </div>
            <h2 className="text-2xl font-bold flex items-center">
              <Shield className="w-6 h-6 mr-2 text-white" />
              {isAvalanche ? 'On-Chain Governor' : 'Squad DAO Hub'}
            </h2>
          </div>
          <div className="text-right">
            <p className="text-gray-300 dark:text-gray-400 text-xs uppercase font-bold tracking-wider">Voting Power</p>
            <p className="text-2xl font-bold">
              {isAvalanche ? fujiGov.votingPower : userTokens.toLocaleString()}
              <span className="text-sm font-normal text-gray-400 dark:text-gray-500 ml-1">{isAvalanche ? 'SQT' : 'DAO'}</span>
            </p>
          </div>
        </div>
        
        {isAvalanche && fujiGov.delegatee === '0x0000000000000000000000000000000000000000' && (
          <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center justify-between">
            <p className="text-xs text-red-200">Voting power not delegated. You must delegate to yourself or others to vote.</p>
            <button 
              onClick={() => userAddress && fujiGov.delegate(userAddress)}
              className="text-xs font-bold bg-white text-red-600 px-2 py-1 rounded hover:bg-red-50 transition-colors"
            >
              Delegate to Self
            </button>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {isAvalanche ? fujiGov.proposals.length : algoProposals.length}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-300 font-medium uppercase tracking-wider mt-1">Total Proposals</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {isAvalanche
              ? fujiGov.proposals.filter(p => p.status === 'Succeeded' || p.status === 'Executed').length
              : algoProposals.filter(p => p.status === 'passed').length}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-300 font-medium uppercase tracking-wider mt-1">Passed</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-red-600">
            {isAvalanche
              ? fujiGov.proposals.filter(p => p.status === 'Defeated' || p.status === 'Canceled').length
              : algoProposals.filter(p => p.status === 'rejected').length}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-300 font-medium uppercase tracking-wider mt-1">Rejected</div>
        </Card>
        <button 
          onClick={() => setShowCreateProposal(true)}
          className="flex flex-col items-center justify-center p-4 bg-blue-600 rounded-xl text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
        >
          <Plus className="w-6 h-6 mb-1" />
          <span className="text-xs font-bold uppercase tracking-wider">New Proposal</span>
        </button>
      </div>

      {/* Proposals List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-lg font-bold text-gray-900 flex items-center">
            <Vote className="w-5 h-5 mr-2 text-blue-600" />
            Active Governance Feed
          </h3>
          <button onClick={() => isAvalanche ? fujiGov.refresh() : fetchAlgoDAOData()} className="text-xs text-blue-600 hover:text-blue-800 font-bold uppercase tracking-wider">
            Refresh Data
          </button>
        </div>

        {(isAvalanche ? fujiGov.proposals.length === 0 : algoProposals.length === 0) ? (
          <Card className="p-12 text-center bg-gray-50 border-dashed border-2 border-gray-200">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Vote className="w-8 h-8 text-gray-300" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900">No proposals yet</h4>
            <p className="text-gray-600 dark:text-gray-300 text-sm mt-2">Start a new proposal to influence the squad's direction.</p>
          </Card>
        ) : (
          (isAvalanche ? fujiGov.proposals : algoProposals).map((proposal) => (
            <Card key={proposal.id} className="p-5 hover:shadow-md transition-all border-l-4 border-l-blue-500">
              <div className="flex justify-between items-start mb-3">
                <div className="min-w-0 pr-4">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 font-mono uppercase">ID: {proposal.id.toString().slice(0, 10)}...</span>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400">•</span>
                    <span className="text-[10px] font-bold text-blue-600/70 uppercase">PROPOSER: {proposal.proposer.slice(0, 6)}...{proposal.proposer.slice(-4)}</span>
                  </div>
                  <h4 className="text-base font-bold text-gray-900 truncate">
                    {proposal.description}
                  </h4>
                </div>
                {renderProposalStatus(proposal.status)}
              </div>

              {isAvalanche && proposal.status === 'Active' && (
                <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => fujiGov.castVote(proposal.id as string, 1)}
                    disabled={fujiGov.loading || fujiGov.votingPower === '0'}
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg font-bold text-sm hover:bg-green-700 disabled:opacity-50 flex items-center justify-center"
                  >
                    <Check className="w-4 h-4 mr-2" /> Vote For
                  </button>
                  <button
                    onClick={() => fujiGov.castVote(proposal.id as string, 0)}
                    disabled={fujiGov.loading || fujiGov.votingPower === '0'}
                    className="flex-1 bg-red-600 text-white py-2 rounded-lg font-bold text-sm hover:bg-red-700 disabled:opacity-50 flex items-center justify-center"
                  >
                    <X className="w-4 h-4 mr-2" /> Against
                  </button>
                  <button
                    onClick={() => fujiGov.castVote(proposal.id as string, 2)}
                    disabled={fujiGov.loading || fujiGov.votingPower === '0'}
                    className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg font-bold text-sm hover:bg-gray-200 disabled:opacity-50"
                  >
                    Abstain
                  </button>
                </div>
              )}

              {isAlgorand && proposal.status === "active" && userTokens > 0 && (
                <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleAlgoVote(proposal.id as number, 1)}
                    disabled={loading}
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg font-bold text-sm hover:bg-green-700"
                  >
                    Vote For
                  </button>
                  <button
                    onClick={() => handleAlgoVote(proposal.id as number, 0)}
                    disabled={loading}
                    className="flex-1 bg-red-600 text-white py-2 rounded-lg font-bold text-sm hover:bg-red-700"
                  >
                    Vote Against
                  </button>
                </div>
              )}

              <div className="mt-4 flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
                <div className="flex items-center space-x-4">
                  <span>FOR: {proposal.votesFor}</span>
                  <span>AGAINST: {proposal.votesAgainst}</span>
                </div>
                <div className="flex items-center text-blue-600">
                  <span>View Full Details</span>
                  <ArrowRight className="w-3 h-3 ml-1" />
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Create Proposal Modal - Placeholder for both */}
      {showCreateProposal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Draft Governance Proposal</h3>
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                <p className="text-xs text-blue-700 leading-relaxed">
                  <strong>Network:</strong> {isAvalanche ? 'Avalanche Fuji (EVM)' : 'Algorand Testnet (AVM)'}<br/>
                  Proposals require a minimum threshold of voting power to be submitted to the chain.
                </p>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Proposal Description
                </label>
                <textarea
                  value={newProposal.description}
                  onChange={(e) => setNewProposal({ ...newProposal, description: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none text-sm text-gray-900"
                  rows={4}
                  placeholder="e.g. Upgrade training facilities to increase recovery speed..."
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-8">
              <button
                onClick={() => setShowCreateProposal(false)}
                className="flex-1 border border-gray-200 text-gray-600 px-4 py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors"
              >
                Discard
              </button>
              <button
                disabled={!newProposal.description || loading}
                className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 shadow-lg shadow-blue-500/20"
              >
                {loading ? "Submitting..." : "Submit to Chain"}
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
