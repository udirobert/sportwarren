"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface PredictionMarket {
  id: string;
  question: string;
  description: string | null;
  category: string;
  sportType: string | null;
  deadline: string;
  status: string;
  totalPool: number;
  options: {
    id: string;
    text: string;
    odds: number;
    totalBet: number;
  }[];
  _count: {
    bets: number;
  };
}

export default function PredictionMarketsPage() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category") || "all";
  const [markets, setMarkets] = useState<PredictionMarket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMarkets() {
      try {
        const url =
          category === "all"
            ? "/api/prediction/markets"
            : `/api/prediction/markets?category=${category}`;
        const res = await fetch(url);
        const data = await res.json();
        setMarkets(data.markets || []);
      } catch (error) {
        console.error("Failed to fetch markets:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchMarkets();
  }, [category]);

  const categories = [
    { id: "all", label: "All" },
    { id: "sports", label: "Sports" },
    { id: "politics", label: "Politics" },
    { id: "crypto", label: "Crypto" },
    { id: "entertainment", label: "Entertainment" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      {/* Header */}
      <div className="bg-slate-900/50 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              🎯 Prediction Markets
            </h1>
            <Link
              href="/predict/create"
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-medium hover:from-cyan-400 hover:to-blue-500 transition-all"
            >
              + Create Market
            </Link>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/predict?category=${cat.id}`}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                category === cat.id
                  ? "bg-cyan-500 text-white"
                  : "bg-slate-700/50 text-slate-300 hover:bg-slate-600"
              }`}
            >
              {cat.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Markets List */}
      <div className="max-w-4xl mx-auto px-4 pb-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
          </div>
        ) : markets.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📭</div>
            <h2 className="text-xl font-semibold text-slate-300 mb-2">
              No Active Markets
            </h2>
            <p className="text-slate-400 mb-6">
              Be the first to create a prediction market!
            </p>
            <Link
              href="/predict/create"
              className="inline-block px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg font-medium"
            >
              Create Market
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {markets.map((market) => (
              <Link
                key={market.id}
                href={`/predict/${market.id}`}
                className="block bg-slate-800/50 rounded-xl p-5 border border-slate-700 hover:border-cyan-500/50 transition-all hover:shadow-lg hover:shadow-cyan-500/10"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 text-xs rounded-full bg-slate-700 text-slate-300">
                        {market.category}
                      </span>
                      {market.sportType && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-blue-500/20 text-blue-300">
                          {market.sportType}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                      {market.question}
                    </h3>
                    <div className="flex flex-wrap gap-3 text-sm text-slate-400">
                      <span className="flex items-center gap-1">
                        💎 {(market.totalPool / 1e9).toFixed(2)} TON
                      </span>
                      <span className="flex items-center gap-1">
                        👥 {market._count.bets} bets
                      </span>
                      <span className="flex items-center gap-1">
                        ⏰ {new Date(market.deadline).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-cyan-400">
                      {market.options.length}
                    </div>
                    <div className="text-xs text-slate-500">options</div>
                  </div>
                </div>

                {/* Options Preview */}
                <div className="mt-4 pt-4 border-t border-slate-700/50">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {market.options.slice(0, 3).map((option, _i) => (
                      <div
                        key={option.id}
                        className="bg-slate-700/30 rounded-lg p-2 text-center"
                      >
                        <div className="text-xs text-slate-400 truncate">
                          {option.text}
                        </div>
                        <div className="text-sm font-semibold text-cyan-300">
                          {option.odds.toFixed(2)}x
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}