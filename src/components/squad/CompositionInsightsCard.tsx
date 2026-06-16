"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Users, Shield, Swords, TrendingUp, Sparkles, Grid3X3, Layers } from 'lucide-react';
import TrioNetworkGraph from './TrioNetworkGraph';
import { trpc } from '@/lib/trpc-client';

interface CompositionInsightsCardProps {
  squadId: string;
}

export default function CompositionInsightsCard({ squadId }: CompositionInsightsCardProps) {
  const { data: insights, isLoading } = trpc.squad.getCompositionInsights.useQuery(
    { squadId },
    { enabled: !!squadId, staleTime: 60_000 },
  );

  if (isLoading) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-5">
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-40 rounded bg-white/[0.06]" />
          <div className="h-20 rounded-xl bg-white/[0.04]" />
          <div className="h-20 rounded-xl bg-white/[0.04]" />
        </div>
      </div>
    );
  }

  if (!insights || (!insights.headlineInsight && insights.topPairs.length === 0 && insights.topDefensivePairs.length === 0)) {
    return null;
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-950/40 via-gray-900 to-gray-900">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(245,158,11,0.06)_0%,transparent_60%)]" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center gap-2 border-b border-white/[0.06] px-5 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20">
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Composition Insights</h3>
            <p className="text-[11px] text-gray-400">Player pair affinities &amp; tactical trends</p>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Headline insight — the shareable stat */}
          {insights.headlineInsight && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="rounded-xl bg-gradient-to-r from-amber-500/10 to-amber-500/5 border border-amber-500/20 px-4 py-3"
            >
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-100 leading-relaxed">
                  {insights.headlineInsight}
                </p>
              </div>
            </motion.div>
          )}

          {/* Top pairs grid */}
          {insights.topPairs.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-3">
                <Users className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
                  Best Pairings
                </span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {insights.topPairs.slice(0, 4).map((pair, idx) => {
                  const colorClass = pair.winRate >= 70
                    ? 'text-emerald-400'
                    : pair.winRate >= 50
                      ? 'text-amber-400'
                      : 'text-red-400';
                  return (
                    <motion.div
                      key={`${pair.playerA.userId}-${pair.playerB.userId}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.05 * idx }}
                      className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-3.5 py-3"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="truncate text-sm font-bold text-white">
                            {pair.playerA.name}
                          </span>
                          <span className="text-gray-500 text-xs">+</span>
                          <span className="truncate text-sm font-bold text-white">
                            {pair.playerB.name}
                          </span>
                        </div>
                        <span className={`shrink-0 text-xs font-black tabular-nums ml-2 ${colorClass}`}>
                          {pair.winRate}%
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-gray-500">
                        <span>{pair.matchesPlayed} matches</span>
                        <span>{pair.wins}W · {pair.draws}D · {pair.losses}L</span>
                      </div>
                      {/* Mini win-rate bar */}
                      <div className="mt-1.5 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pair.winRate}%` }}
                          transition={{ duration: 0.6, delay: 0.15 * idx, ease: 'easeOut' }}
                          className={`h-full rounded-full ${
                            pair.winRate >= 70
                              ? 'bg-emerald-500'
                              : pair.winRate >= 50
                                ? 'bg-amber-500'
                                : 'bg-red-500'
                          }`}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Top trios — network graph visualization */}
          {insights.topTrios && insights.topTrios.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-3">
                <Layers className="w-3.5 h-3.5 text-rose-400" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
                  Best Trios
                </span>
              </div>

              {/* Network graph */}
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="mb-3 rounded-xl border border-white/[0.06] bg-white/[0.03] px-2 py-2"
              >
                <TrioNetworkGraph trios={insights.topTrios.slice(0, 5)} />
              </motion.div>

              {/* Compact detail list */}
              <div className="grid gap-2 sm:grid-cols-2">
                {insights.topTrios.slice(0, 4).map((trio, idx) => {
                  const colorClass = trio.winRate >= 70
                    ? 'text-emerald-400'
                    : trio.winRate >= 50
                      ? 'text-amber-400'
                      : 'text-red-400';
                  return (
                    <motion.div
                      key={`trio-${trio.players.map(p => p.userId).join('-')}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.05 * idx }}
                      className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-3.5 py-2.5"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1 min-w-0 flex-wrap text-xs">
                          <span className="truncate font-bold text-white">{trio.players[0].name}</span>
                          <span className="text-gray-500">+</span>
                          <span className="truncate font-bold text-white">{trio.players[1].name}</span>
                          <span className="text-gray-500">+</span>
                          <span className="truncate font-bold text-white">{trio.players[2].name}</span>
                        </div>
                        <span className={`shrink-0 text-xs font-black tabular-nums ml-2 ${colorClass}`}>
                          {trio.winRate}%
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-gray-500">
                        <span>{trio.matchesPlayed} matches</span>
                        <span>{trio.wins}W · {trio.draws}D · {trio.losses}L</span>
                      </div>
                      <div className="mt-1 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${trio.winRate}%` }}
                          transition={{ duration: 0.6, delay: 0.15 * idx, ease: 'easeOut' }}
                          className={`h-full rounded-full ${
                            trio.winRate >= 70
                              ? 'bg-emerald-500'
                              : trio.winRate >= 50
                                ? 'bg-amber-500'
                                : 'bg-red-500'
                          }`}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Defensive pairs */}
          {insights.topDefensivePairs.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-3">
                <Shield className="w-3.5 h-3.5 text-sky-400" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
                  Defensive Partnerships
                </span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {insights.topDefensivePairs.slice(0, 4).map((pair, idx) => (
                  <motion.div
                    key={`def-${pair.playerA.userId}-${pair.playerB.userId}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.05 * idx }}
                    className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-3.5 py-3"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="truncate text-sm font-bold text-white">
                          {pair.playerA.name}
                        </span>
                        <span className="text-gray-500 text-xs">+</span>
                        <span className="truncate text-sm font-bold text-white">
                          {pair.playerB.name}
                        </span>
                      </div>
                      <span className="shrink-0 text-xs font-black tabular-nums ml-2 text-sky-400">
                        {pair.cleanSheetRate}%
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-gray-500">
                      <span>{pair.matchesPlayed} matches</span>
                      <span>{pair.cleanSheets} clean sheets</span>
                    </div>
                    {/* Mini clean-sheet rate bar */}
                    <div className="mt-1.5 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pair.cleanSheetRate}%` }}
                        transition={{ duration: 0.6, delay: 0.15 * idx, ease: 'easeOut' }}
                        className="h-full rounded-full bg-sky-500"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Formation performance */}
          {insights.formationStats.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-3">
                <Grid3X3 className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
                  Formation Performance
                </span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {insights.formationStats.slice(0, 4).map((f, idx) => (
                  <motion.div
                    key={`fmt-${f.formation}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.05 * idx }}
                    className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-3.5 py-3"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-bold text-white font-mono">{f.formation}</span>
                      <span className={`text-xs font-black tabular-nums ${
                        f.winRate >= 60 ? 'text-emerald-400' : f.winRate >= 40 ? 'text-amber-400' : 'text-red-400'
                      }`}>
                        {f.winRate}%
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-gray-500">
                      <span>{f.matchesPlayed} matches</span>
                      <span>{f.wins}W · {f.draws}D · {f.losses}L</span>
                    </div>
                    <div className="mt-1.5 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${f.winRate}%` }}
                        transition={{ duration: 0.6, delay: 0.15 * idx, ease: 'easeOut' }}
                        className={`h-full rounded-full ${
                          f.winRate >= 60 ? 'bg-emerald-500' : f.winRate >= 40 ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Scoring impact */}
          {insights.topScoringImpact.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-3">
                <Swords className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
                  Scoring Presence
                </span>
              </div>
              <div className="grid gap-2 sm:grid-cols-3">
                {insights.topScoringImpact.slice(0, 3).map((p, idx) => (
                  <motion.div
                    key={`scoring-${p.player.userId}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.05 * idx }}
                    className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-3.5 py-3 text-center"
                  >
                    <p className="text-sm font-bold text-white truncate">{p.player.name}</p>
                    <p className="mt-1 text-lg font-black text-emerald-400 tabular-nums">
                      {p.winRateWhenScores}%
                    </p>
                    <p className="mt-0.5 text-[10px] text-gray-500">
                      win rate when playing
                    </p>
                    <p className="text-[10px] text-gray-500">
                      {p.matchesWithGoal} matches · {p.totalGoals} goals
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
