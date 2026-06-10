"use client";

import React, { useState } from "react";
import { Swords, Zap, Trophy, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface RivalMatchResult {
  user: { name: string; formation: string; color: string; score: number };
  rival: { name: string; formation: string; color: string; score: number };
  possession: { home: number; away: number };
  events: Array<{ minute: number; text: string; type: string }>;
  winProbability: number;
}

interface RivalPreviewCardProps {
  formation: string;
  style: string;
  color: string;
  names: string[];
  size: number;
}

export const RivalPreviewCard: React.FC<RivalPreviewCardProps> = ({
  formation,
  style,
  color,
  names,
  size,
}) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RivalMatchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runSim = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/platform/rival-preview", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ formation, style, color, names, size }),
      });
      if (!res.ok) throw new Error("Preview failed");
      const data = (await res.json()) as RivalMatchResult;
      setResult(data);
    } catch (e) {
      setError("Could not load rival preview.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto mb-8 w-full max-w-md">
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-2xl">
        <div className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Swords className="h-4 w-4 text-amber-400" />
            <h3 className="text-sm font-black uppercase tracking-widest text-amber-400">
              Rival Preview
            </h3>
          </div>

          {!result && !loading && (
            <div className="text-center space-y-4">
              <p className="text-sm text-gray-300">
                Your squad is ready. See how it stacks up against a real rival.
              </p>
              <button
                onClick={runSim}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-amber-500/30 transition hover:scale-[1.02]"
              >
                <Zap className="h-4 w-4" />
                Simulate a Rival Match
              </button>
            </div>
          )}

          {loading && (
            <div className="text-center py-6">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-emerald-400" />
              <p className="mt-2 text-xs text-gray-400">Simulating head-to-head...</p>
            </div>
          )}

          {error && (
            <p className="text-center text-xs text-red-300 py-4">{error}</p>
          )}

          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Scoreboard */}
                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="text-center flex-1">
                    <div
                      className="mx-auto mb-1 h-8 w-8 rounded-full border-2 border-white/30"
                      style={{ backgroundColor: color }}
                    />
                    <p className="text-[10px] font-bold text-gray-400 uppercase">You</p>
                    <p className="text-2xl font-black">{result.user.score}</p>
                  </div>
                  <div className="px-3 text-center">
                    <p className="text-[10px] font-bold text-amber-400">VS</p>
                    <p className="text-[9px] text-gray-500 mt-0.5">
                      {result.possession.home}% poss
                    </p>
                  </div>
                  <div className="text-center flex-1">
                    <div
                      className="mx-auto mb-1 h-8 w-8 rounded-full border-2 border-white/30"
                      style={{ backgroundColor: result.rival.color }}
                    />
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Rival</p>
                    <p className="text-2xl font-black">{result.rival.score}</p>
                  </div>
                </div>

                {/* Win prob */}
                <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2">
                  <Trophy className="h-3.5 w-3.5 text-emerald-400" />
                  <p className="text-xs font-bold text-emerald-300">
                    {result.winProbability}% predicted win rate
                  </p>
                </div>

                {/* Events feed */}
                <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                  {result.events.slice(0, 6).map((ev, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-xs text-gray-300"
                    >
                      <span className="w-7 text-right text-[10px] font-bold text-gray-500 tabular-nums">
                        {ev.minute}&apos;
                      </span>
                      <span className="flex-1 truncate">{ev.text}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div className="pt-2 border-t border-white/10 text-center">
                  <p className="text-xs text-gray-400 mb-2">
                    Sign up to challenge this squad for real.
                  </p>
                  <a
                    href="/?connect=1"
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition-colors"
                  >
                    <Users className="h-3 w-3" />
                    Challenge Rival
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
