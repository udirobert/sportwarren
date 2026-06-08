"use client";

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Trophy, TrendingUp } from 'lucide-react';
import type { MatchResult } from '@/types';

interface MatchHistoryViewProps {
  settledMatches: MatchResult[];
  onSelectMatch: (matchId: string) => void;
}

export const MatchHistoryView: React.FC<MatchHistoryViewProps> = ({
  settledMatches,
  onSelectMatch,
}) => {
  const verifiedCount = settledMatches.filter((m) => m.status === "verified").length;
  const winCount = settledMatches.filter(
    (m) => m.status === "verified" && m.homeScore > m.awayScore
  ).length;
  // Aggregate goals as a proxy for total XP earned — the actual XP
  // pipeline lives in match-xp.ts which is server-side. Once the XP
  // surface is in the match payload we can swap this for a real total.
  const totalGoals = settledMatches.reduce(
    (sum, m) => sum + m.homeScore + m.awayScore,
    0
  );

  return (
    <div className="space-y-4">
      {settledMatches.length > 0 && (
        /* Card-as-anchor: matches the emerald gradient language from
           OnboardingFlow and MatchXPSummaryView so the journey
           narrative lands in the third place — history. */
        <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 p-4 shadow-lg shadow-emerald-500/5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-emerald-400/40 bg-emerald-500/15">
              <Trophy className="h-6 w-6 text-emerald-300" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-300">
                Your card so far
              </p>
              <p className="truncate text-base font-black text-white">
                {verifiedCount} verified match{verifiedCount === 1 ? "" : "es"}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-emerald-400/30 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-emerald-200">
                  {winCount} win{winCount === 1 ? "" : "s"}
                </span>
                <span className="rounded-full border border-emerald-400/30 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-emerald-200">
                  {totalGoals} goal{totalGoals === 1 ? "" : "s"}
                </span>
              </div>
            </div>
            <TrendingUp className="h-5 w-5 shrink-0 text-emerald-300" />
          </div>
        </div>
      )}

      {settledMatches.length === 0 ? (
        <Card className="py-10 text-center text-gray-600">No settled matches yet.</Card>
      ) : (
        settledMatches.map((match) => (
          <Card key={match.id}>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="mb-2 flex items-center gap-3">
                  <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
                    match.status === "verified"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-rose-100 text-rose-700"
                  }`}>
                    {match.status.toUpperCase()}
                  </span>
                  {match.paymentRail?.enabled && (
                    <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">
                      {match.paymentRail.assetSymbol} Fee Rail
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-gray-900">
                  {match.homeTeam} {match.homeScore} - {match.awayScore} {match.awayTeam}
                </h3>
                <p className="text-sm text-gray-500">{match.timestamp.toLocaleString()}</p>
              </div>
              <Button
                variant="outline"
                onClick={() => onSelectMatch(match.id)}
              >
                Open Details
              </Button>
            </div>
          </Card>
        ))
      )}
    </div>
  );
};
