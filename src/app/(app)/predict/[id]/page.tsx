"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface MarketOption {
  id: string;
  text: string;
  odds: number;
  totalBet: number;
}

interface PredictionMarket {
  id: string;
  question: string;
  description: string | null;
  category: string;
  sportType: string | null;
  creatorName: string | null;
  deadline: string;
  settleBy: string;
  status: string;
  result: string | null;
  totalPool: number;
  creatorFee: number;
  aiReasoning: string | null;
  options: MarketOption[];
}

export default function MarketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [market, setMarket] = useState<PredictionMarket | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [betAmount, setBetAmount] = useState("");
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    async function fetchMarket() {
      try {
        const res = await fetch(`/api/prediction/markets/${resolvedParams.id}`);
        if (res.ok) {
          const data = await res.json();
          setMarket(data.market);
        }
      } catch (error) {
        console.error("Failed to fetch market:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchMarket();
  }, [resolvedParams.id]);

  async function handlePlaceBet() {
    if (!selectedOption || !betAmount) return;

    setPlacing(true);
    try {
      const res = await fetch(`/api/prediction/bet`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          marketId: market?.id,
          optionId: selectedOption,
          amount: parseFloat(betAmount) * 1e9, // Convert to nanoTON
        }),
      });

      if (res.ok) {
        const data = await res.json();
        alert(`Bet placed! Potential win: ${data.bet.potentialWin / 1e9} TON`);
        router.refresh();
      } else {
        const error = await res.json();
        alert(error.message || "Failed to place bet");
      }
    } catch (_error) {
      alert("Failed to place bet");
    } finally {
      setPlacing(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (!market) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-xl font-semibold text-white mb-4">Market Not Found</h2>
          <Link href="/predict" className="text-cyan-400 hover:underline">
            Back to Markets
          </Link>
        </div>
      </div>
    );
  }

  const isSettled = market.status === "settled";
  const isExpired = new Date(market.deadline) < new Date();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      {/* Header */}
      <div className="bg-slate-900/50 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link
            href="/predict"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            ← Back to Markets
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Market Info */}
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2 py-0.5 text-xs rounded-full bg-slate-700 text-slate-300">
              {market.category}
            </span>
            {market.sportType && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-blue-500/20 text-blue-300">
                {market.sportType}
              </span>
            )}
            <span
              className={`px-2 py-0.5 text-xs rounded-full ${
                isSettled
                  ? "bg-green-500/20 text-green-300"
                  : isExpired
                  ? "bg-red-500/20 text-red-300"
                  : "bg-cyan-500/20 text-cyan-300"
              }`}
            >
              {isSettled ? "🏆 Settled" : isExpired ? "⏰ Expired" : "🎯 Active"}
            </span>
          </div>

          <h1 className="text-2xl font-bold mb-2">{market.question}</h1>
          {market.description && (
            <p className="text-slate-400 mb-4">{market.description}</p>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-slate-500">Total Pool</div>
              <div className="text-xl font-bold text-cyan-400">
                {(market.totalPool / 1e9).toFixed(2)} TON
              </div>
            </div>
            <div>
              <div className="text-slate-500">Deadline</div>
              <div className="font-medium">
                {new Date(market.deadline).toLocaleDateString()}
              </div>
            </div>
            <div>
              <div className="text-slate-500">Creator</div>
              <div className="font-medium">@{market.creatorName || "anonymous"}</div>
            </div>
            <div>
              <div className="text-slate-500">Creator Fee</div>
              <div className="font-medium">
                {(market.creatorFee / 1e9).toFixed(2)} TON
              </div>
            </div>
          </div>
        </div>

        {/* AI Reasoning (if settled) */}
        {isSettled && market.aiReasoning && (
          <div className="bg-green-900/20 rounded-xl p-4 border border-green-500/30 mb-6">
            <h3 className="font-semibold text-green-400 mb-2">🤖 AI Verification</h3>
            <p className="text-sm text-slate-300">{market.aiReasoning}</p>
          </div>
        )}

        {/* Options / Betting */}
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <h2 className="text-lg font-semibold mb-4">
            {isSettled ? "Results" : "Place Your Bet"}
          </h2>

          <div className="space-y-3">
            {market.options.map((option, index) => {
              const isWinner = isSettled && market.result === option.id;
              const isSelected = selectedOption === option.id;

              return (
                <button
                  key={option.id}
                  disabled={isSettled || isExpired}
                  onClick={() => setSelectedOption(option.id)}
                  className={`w-full p-4 rounded-lg border transition-all text-left ${
                    isWinner
                      ? "bg-green-500/20 border-green-500"
                      : isSelected
                      ? "bg-cyan-500/20 border-cyan-500"
                      : "bg-slate-700/30 border-slate-600 hover:border-slate-500"
                  } ${(isSettled || isExpired) && !isWinner ? "opacity-50" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold">
                        {index + 1}
                      </span>
                      <span className="font-medium">{option.text}</span>
                      {isWinner && <span className="text-green-400">🏆</span>}
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-cyan-400">
                        {option.odds.toFixed(2)}x
                      </div>
                      <div className="text-xs text-slate-500">
                        {(option.totalBet / 1e9).toFixed(2)} TON staked
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Bet Form */}
          {!isSettled && !isExpired && (
            <div className="mt-6 pt-6 border-t border-slate-700">
              <div className="flex gap-3">
                <input
                  type="number"
                  placeholder="Amount (TON)"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  className="flex-1 px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg focus:border-cyan-500 focus:outline-none"
                />
                <button
                  onClick={handlePlaceBet}
                  disabled={!selectedOption || !betAmount || placing}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:from-cyan-400 hover:to-blue-500 transition-all"
                >
                  {placing ? "Placing..." : "Place Bet"}
                </button>
              </div>
              {selectedOption && betAmount && (
                <p className="mt-2 text-sm text-slate-400">
                  Potential win:{" "}
                  <span className="text-cyan-400 font-semibold">
                    {(
                      parseFloat(betAmount) *
                      (market.options.find((o) => o.id === selectedOption)?.odds || 1)
                    ).toFixed(2)}{" "}
                    TON
                  </span>
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}