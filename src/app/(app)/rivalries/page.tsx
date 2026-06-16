"use client";

import React from 'react';
import { trpc } from '@/lib/trpc-client';
import { PageShell } from '@/components/common/PageShell';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Swords, TrendingUp, Flame, Trophy, Frown, Minus, Users, Crown, Zap } from 'lucide-react';

function RivalriesSkeleton() {
  return (
    <div className="max-w-lg mx-auto space-y-4 p-4">
      <div className="h-8 w-32 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
      <div className="h-24 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-20 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
      ))}
    </div>
  );
}

function StreakBadge({ streak }: { streak: number }) {
  if (streak === 0) return null;
  const isWinning = streak > 0;
  const absStreak = Math.abs(streak);
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
      isWinning
        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
        : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
    }`}>
      {isWinning ? <Flame className="w-3 h-3" /> : <Frown className="w-3 h-3" />}
      {absStreak}
    </span>
  );
}

function WinRateBar({ rate, size = 'md' }: { rate: number; size?: 'sm' | 'md' }) {
  const color = rate >= 60 ? 'bg-emerald-500' : rate >= 40 ? 'bg-amber-500' : 'bg-red-500';
  const height = size === 'sm' ? 'h-1.5' : 'h-2';
  return (
    <div className={`${height} w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden`}>
      <div className={`${height} ${color} rounded-full transition-all`} style={{ width: `${rate}%` }} />
    </div>
  );
}

function ResultLabel({ result }: { result: 'win' | 'loss' | 'draw' | null }) {
  if (!result) return <span className="text-xs text-gray-400">—</span>;
  const config = {
    win: { label: 'W', className: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30' },
    loss: { label: 'L', className: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30' },
    draw: { label: 'D', className: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30' },
  }[result];
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded ${config.className}`}>
      {config.label}
    </span>
  );
}

export default function RivalriesPage() {
  const { data: identity, isLoading: identityLoading } = trpc.player.getMyIdentity.useQuery(undefined, {
    retry: 1,
    staleTime: 30_000,
  });

  const profileId = (identity as any)?.skin?.profileId;

  const { data: rivalries, isLoading: rivalriesLoading } = trpc.player.getRivalries.useQuery(
    { profileId: profileId ?? '' },
    { enabled: !!profileId, staleTime: 30_000 },
  );

  const { data: duos, isLoading: duosLoading } = trpc.player.getDuos.useQuery(
    { profileId: profileId ?? '' },
    { enabled: !!profileId, staleTime: 30_000 },
  );

  if (identityLoading || rivalriesLoading || duosLoading) {
    return (
      <PageShell maxWidth="2xl">
        <RivalriesSkeleton />
      </PageShell>
    );
  }

  if (!profileId) {
    return (
      <PageShell maxWidth="2xl">
        <div className="max-w-lg mx-auto p-4">
          <Card className="text-center py-12">
            <Swords className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-600 dark:text-gray-400 font-medium">No player profile found.</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Play a match to build your player identity and discover your rivalries.</p>
          </Card>
        </div>
      </PageShell>
    );
  }

  // Derive nemesis — the rivalry with the lowest player win rate (min 2 matches, win rate < 40%)
  const nemesisCandidates = (rivalries ?? []).filter(
    (r) => r.matchesPlayed >= 2 && r.playerWinRate < 40,
  );
  const showNemesis = nemesisCandidates.length > 0;
  const nemesis = showNemesis
    ? nemesisCandidates.reduce((worst, r) => r.playerWinRate < worst.playerWinRate ? r : worst)
    : null;

  // Top partners (top 5)
  const topPartners = duos?.slice(0, 5) ?? [];

  const hasRivalries = rivalries && rivalries.length > 0;
  const hasDuos = topPartners.length > 0;

  return (
    <PageShell maxWidth="2xl">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center shrink-0">
            <Swords className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Rivalries</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Your head-to-head history across every match
            </p>
          </div>
        </div>

        {!hasRivalries && !hasDuos ? (
          <Card className="text-center py-12">
            <Swords className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-600 dark:text-gray-400 font-medium">No rivalry data yet.</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              Play more matches with logged team assignments to discover who your biggest rival is.
            </p>
          </Card>
        ) : (
          <>
            {/* Nemesis Spotlight */}
            {showNemesis && nemesis && (
              <div className="relative overflow-hidden rounded-2xl border border-rose-500/20 bg-gradient-to-br from-rose-950/40 via-gray-900 to-gray-900">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(244,63,94,0.06)_0%,transparent_60%)]" />
                <div className="relative p-5">
                  <div className="flex items-center gap-2 text-rose-400 mb-3">
                    <Zap className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Nemesis</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-rose-500/20 to-rose-600/20 border border-rose-500/30 flex items-center justify-center">
                      <span className="text-xl font-black text-rose-400">
                        {nemesis!.opponent.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg font-bold text-white truncate">{nemesis!.opponent.name}</h2>
                      <p className="text-sm text-gray-400">
                        {nemesis!.opponentWins}W · {nemesis!.draws}D · {nemesis!.playerWins}L in {nemesis!.matchesPlayed} meetings
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <WinRateBar rate={nemesis!.playerWinRate} />
                        <span className="text-xs font-bold text-gray-400 shrink-0">{nemesis!.playerWinRate}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {nemesis!.currentStreak !== 0 && (
                      <StreakBadge streak={nemesis!.currentStreak} />
                    )}
                    <span className="text-xs text-gray-500">
                      Last: <ResultLabel result={nemesis!.lastResult} />
                    </span>
                    {nemesis!.lastMeeting && (
                      <span className="text-xs text-gray-500">
                        {new Date(nemesis!.lastMeeting).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Rivalry Cards */}
            {hasRivalries && (
              <section>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Swords className="w-4 h-4 text-rose-500" />
                  All Rivalries
                </h2>
                <div className="space-y-2">
                  {rivalries!.map((rivalry) => (
                    <Card key={rivalry.opponent.profileId}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center shrink-0">
                          <span className="text-sm font-bold text-gray-600 dark:text-gray-300">
                            {rivalry.opponent.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-semibold text-gray-900 dark:text-white truncate">
                              {rivalry.opponent.name}
                            </p>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <StreakBadge streak={rivalry.currentStreak} />
                              <ResultLabel result={rivalry.lastResult} />
                            </div>
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{rivalry.playerWins}W</span>
                              <span className="mx-0.5">·</span>
                              <span className="text-amber-600 dark:text-amber-400 font-semibold">{rivalry.draws}D</span>
                              <span className="mx-0.5">·</span>
                              <span className="text-red-600 dark:text-red-400 font-semibold">{rivalry.opponentWins}L</span>
                              <span className="mx-1.5 text-gray-400">•</span>
                              {rivalry.matchesPlayed} match{rivalry.matchesPlayed > 1 ? 'es' : ''}
                            </span>
                          </div>
                          <div className="mt-1.5 flex items-center gap-2">
                            <WinRateBar rate={rivalry.playerWinRate} size="sm" />
                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 shrink-0 w-8 text-right">
                              {rivalry.playerWinRate}%
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-gray-400">
                              You: {rivalry.playerGoals}G
                            </span>
                            <span className="text-xs text-gray-400">
                              {rivalry.opponent.name.split(' ')[0]}: {rivalry.opponentGoals}G
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Best Partners */}
            {hasDuos && (
              <section>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-500" />
                  Best Partners
                </h2>
                <div className="grid gap-2 sm:grid-cols-2">
                  {topPartners.map((duo) => (
                    <Card key={duo.partner.profileId}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/40 dark:to-emerald-800/40 flex items-center justify-center shrink-0">
                          <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                            {duo.partner.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-gray-900 dark:text-white truncate">
                              {duo.partner.name}
                            </p>
                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 shrink-0 ml-2">
                              {duo.winRate}%
                            </span>
                          </div>
                          <WinRateBar rate={duo.winRate} size="sm" />
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {duo.wins}W · {duo.draws}D · {duo.losses}L in {duo.matchesPlayed} match{duo.matchesPlayed > 1 ? 'es' : ''} together
                            {duo.totalGoals > 0 && ` · ${duo.totalGoals} GF`}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </PageShell>
  );
}
