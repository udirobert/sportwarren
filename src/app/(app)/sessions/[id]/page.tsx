"use client";

import React, { useState, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { trpc } from '@/lib/trpc-client';
import { PageShell } from '@/components/common/PageShell';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  Calendar, Users, Trophy, Swords, Target,
  Clock, Plus, Check, RotateCw, Zap,
  Circle, ArrowRight, ListChecks, RefreshCw,
  UserPlus, Shield, Flag, AlertCircle,
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────

interface Attendee {
  id: string;
  profileId: string;
  teamPreference: string | null;
  profile: {
    id: string;
    user: { name: string | null; avatar: string | null } | null;
  };
}

interface MatchSummary {
  id: string;
  homeScore: number | null;
  awayScore: number | null;
  status: string;
  teamAssignments: unknown;
  createdAt: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    open: { label: 'Open', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' },
    balanced: { label: 'Balanced', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400' },
    completed: { label: 'Completed', className: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
  };
  const c = config[status] ?? { label: status, className: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' };
  return (
    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${c.className}`}>
      {c.label}
    </span>
  );
}

function SquadBadge({ label }: { label: string }) {
  const colorMap: Record<string, string> = {
    bibs: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    no_bibs: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-400 border-sky-200 dark:border-sky-800',
  };
  const cls = colorMap[label] ?? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';
  return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cls}`}>{label === 'bibs' ? 'Bibs' : 'No Bibs'}</span>;
}

// ── Loading State ──────────────────────────────────────────────────────────

function SessionDetailSkeleton() {
  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="h-10 w-48 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
      <div className="h-20 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
      <div className="grid grid-cols-2 gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-12 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
        ))}
      </div>
      <div className="h-32 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function SessionDetailPage() {
  const params = useParams();
  const sessionId = params.id as string;

  const { data: session, isLoading, refetch } = trpc.session.getById.useQuery(
    { id: sessionId },
    { enabled: !!sessionId, staleTime: 10_000 },
  );

  const utils = trpc.useUtils();

  // Team generation mutation
  const generateTeams = trpc.session.generateTeams.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  // Micro-match mutation — onSuccess is passed per-call so closures are fresh
  const submitMicroMatch = trpc.session.submitMicroMatch.useMutation();

  // Micro-match form state
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [hasKeeper, setHasKeeper] = useState(true);
  const [matchTeamHome, setMatchTeamHome] = useState<string[]>([]);
  const [matchTeamAway, setMatchTeamAway] = useState<string[]>([]);
  const [winnerStaysOn, setWinnerStaysOn] = useState(false);

  // Toggle a player between teams: unassigned → home → away → unassigned
  const togglePlayer = useCallback((profileId: string) => {
    if (matchTeamHome.includes(profileId)) {
      setMatchTeamHome((prev) => prev.filter((id) => id !== profileId));
      setMatchTeamAway((prev) => [...prev, profileId]);
    } else if (matchTeamAway.includes(profileId)) {
      setMatchTeamAway((prev) => prev.filter((id) => id !== profileId));
    } else {
      setMatchTeamHome((prev) => [...prev, profileId]);
    }
  }, [matchTeamHome, matchTeamAway]);

  // Resolve attendee data
  const attendees = (session?.attendees ?? []) as unknown as Attendee[];
  const matches = (session?.matches ?? []) as unknown as MatchSummary[];

  // Sort attendees: bibs first, then unassigned, then no_bibs
  const sortedAttendees = useMemo(() => {
    const order: Record<string, number> = { bibs: 0, no_bibs: 1 };
    return [...attendees].sort((a, b) => {
      const aOrder = a.teamPreference ? order[a.teamPreference] ?? 2 : 3;
      const bOrder = b.teamPreference ? order[b.teamPreference] ?? 2 : 3;
      return aOrder - bOrder;
    });
  }, [attendees]);

  const bibsCount = attendees.filter((a) => a.teamPreference === 'bibs').length;
  const noBibsCount = attendees.filter((a) => a.teamPreference === 'no_bibs').length;
  const unassignedCount = attendees.filter((a) => !a.teamPreference).length;

  const canGenerateTeams = session?.status === 'open' && attendees.length >= 2;
  const canSubmitMatch = matchTeamHome.length > 0 && matchTeamAway.length > 0;

  if (isLoading) {
    return (
      <PageShell maxWidth="2xl">
        <SessionDetailSkeleton />
      </PageShell>
    );
  }

  if (!session) {
    return (
      <PageShell maxWidth="2xl">
        <div className="max-w-lg mx-auto p-4">
          <Card className="text-center py-12">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-600 dark:text-gray-400 font-medium">Session not found</p>
          </Card>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell maxWidth="2xl">
      <div className="max-w-lg mx-auto space-y-6">
        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                {session.name}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {new Date(session.date).toLocaleDateString(undefined, {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
          <StatusBadge status={session.status} />
        </div>

        {/* ── Attendee Roster ─────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-violet-500" />
              Roster
              <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                ({attendees.length})
              </span>
            </h2>
            {bibsCount > 0 && (
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  {bibsCount}
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-sky-500" />
                  {noBibsCount}
                </span>
                {unassignedCount > 0 && (
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-gray-400" />
                    {unassignedCount}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {sortedAttendees.map((a) => {
              const name = a.profile?.user?.name ?? 'Player';
              const isBibs = a.teamPreference === 'bibs';
              const isNoBibs = a.teamPreference === 'no_bibs';
              const assigned = isBibs || isNoBibs;
              return (
                <div
                  key={a.id}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all ${
                    isBibs
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
                      : isNoBibs
                      ? 'bg-sky-50 dark:bg-sky-900/20 border-sky-200 dark:border-sky-800'
                      : 'bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    isBibs
                      ? 'bg-emerald-500 text-white'
                      : isNoBibs
                      ? 'bg-sky-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  }`}>
                    {name.charAt(0).toUpperCase()}
                  </div>
                  <span className={`truncate text-xs font-medium ${
                    assigned ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {name}
                  </span>
                  {isBibs && <span className="ml-auto text-[10px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0">B</span>}
                  {isNoBibs && <span className="ml-auto text-[10px] font-bold text-sky-600 dark:text-sky-400 shrink-0">N</span>}
                </div>
              );
            })}
            {attendees.length === 0 && (
              <div className="col-span-full py-6 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">No players have joined yet.</p>
              </div>
            )}
          </div>
        </section>

        {/* ── Team Management ─────────────────────────────────────── */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-500" />
            Teams
          </h2>
          <Card>
            {attendees.length < 2 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-3">
                Need at least 2 players to generate teams.
              </p>
            ) : session.status === 'open' ? (
              <div className="text-center py-3">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  Generate balanced teams based on player attributes.
                </p>
                <button
                  onClick={() => generateTeams.mutate({ sessionId: session.id })}
                  disabled={generateTeams.isPending}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-sm font-bold disabled:opacity-50 transition-colors"
                >
                  {generateTeams.isPending ? (
                    <RotateCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  {generateTeams.isPending ? 'Generating...' : 'Generate Teams'}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
                      Bibs ({bibsCount})
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {attendees.filter((a) => a.teamPreference === 'bibs').map((a) => (
                        <span key={a.id} className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                          {a.profile?.user?.name ?? 'Player'}
                        </span>
                      ))}
                    </div>
                  </div>
                  <Swords className="w-4 h-4 text-gray-400 shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-1">
                      No Bibs ({noBibsCount})
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {attendees.filter((a) => a.teamPreference === 'no_bibs').map((a) => (
                        <span key={a.id} className="text-xs px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300">
                          {a.profile?.user?.name ?? 'Player'}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                {session.status === 'balanced' && (
                  <div className="border-t border-gray-100 dark:border-gray-700 pt-3 mt-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                      Teams are set. Submit micro-matches below for each rotation.
                    </p>
                  </div>
                )}
              </div>
            )}
          </Card>
        </section>

        {/* ── Micro-Match Submission ──────────────────────────────── */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-rose-500" />
            Submit Micro-Match
          </h2>
          <Card>
            <div className="space-y-4">
              {/* Player picker */}
              <div>
                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Assign Players — tap to cycle: unassigned → Home → Away → unassigned
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {attendees.map((a) => {
                    const profileId = a.profileId || a.profile?.id;
                    if (!profileId) return null;
                    const name = a.profile?.user?.name ?? 'Player';
                    const isHome = matchTeamHome.includes(profileId);
                    const isAway = matchTeamAway.includes(profileId);
                    return (
                      <button
                        key={a.id}
                        onClick={() => profileId && togglePlayer(profileId)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all touch-manipulation ${
                          isHome
                            ? 'bg-emerald-100 dark:bg-emerald-900/40 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300'
                            : isAway
                            ? 'bg-sky-100 dark:bg-sky-900/40 border-sky-300 dark:border-sky-700 text-sky-800 dark:text-sky-300'
                            : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        {isHome && <Circle className="w-2.5 h-2.5 fill-emerald-500 text-emerald-500" />}
                        {isAway && <Circle className="w-2.5 h-2.5 fill-sky-500 text-sky-500" />}
                        {!isHome && !isAway && <Circle className="w-2.5 h-2.5 text-gray-300 dark:text-gray-600" />}
                        {name}
                      </button>
                    );
                  })}
                  {attendees.length === 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 py-2">No players available.</p>
                  )}
                </div>
              </div>

              {/* Team assignment summary */}
              {(matchTeamHome.length > 0 || matchTeamAway.length > 0) && (
                <div className="flex items-start gap-4 text-xs">
                  <div className="flex-1">
                    <p className="font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                      Home ({matchTeamHome.length})
                    </p>
                    {matchTeamHome.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {matchTeamHome.map((id) => {
                          const a = attendees.find((att) => att.profileId === id || att.profile?.id === id);
                          return (
                            <span key={id} className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                              {a?.profile?.user?.name ?? 'Player'}
                            </span>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-gray-400 italic">No players assigned</p>
                    )}
                  </div>
                  <Swords className="w-4 h-4 text-gray-400 mt-1 shrink-0" />
                  <div className="flex-1">
                    <p className="font-bold text-sky-600 dark:text-sky-400 mb-1">
                      Away ({matchTeamAway.length})
                    </p>
                    {matchTeamAway.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {matchTeamAway.map((id) => {
                          const a = attendees.find((att) => att.profileId === id || att.profile?.id === id);
                          return (
                            <span key={id} className="px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300">
                              {a?.profile?.user?.name ?? 'Player'}
                            </span>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-gray-400 italic">No players assigned</p>
                    )}
                  </div>
                </div>
              )}

              {/* Score inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-1">
                    Home Score
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={99}
                    value={homeScore}
                    onChange={(e) => setHomeScore(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider block mb-1">
                    Away Score
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={99}
                    value={awayScore}
                    onChange={(e) => setAwayScore(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              {/* Has keeper toggle */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setHasKeeper(!hasKeeper)}
                  className={`w-9 h-5 rounded-full transition-colors relative ${
                    hasKeeper ? 'bg-violet-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform`}
                    style={{ transform: hasKeeper ? 'translateX(16px)' : 'translateX(0)' }} />
                </button>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {hasKeeper ? 'With goalkeeper' : 'No goalkeeper'}
                </span>
              </div>

              {/* Winner Stays On toggle */}
              <div className="flex items-center justify-between rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <div>
                    <p className="text-sm font-bold text-amber-800 dark:text-amber-300">Winner Stays On</p>
                    <p className="text-[11px] text-amber-600 dark:text-amber-400">
                      {winnerStaysOn
                        ? 'Winners auto-suggested as home team for next rotation'
                        : 'Form resets after each submission'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setWinnerStaysOn(!winnerStaysOn)}
                  className={`w-10 h-6 rounded-full transition-colors relative shrink-0 ${
                    winnerStaysOn ? 'bg-amber-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                  aria-label="Toggle winner stays on"
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform`}
                    style={{ transform: winnerStaysOn ? 'translateX(16px)' : 'translateX(0)' }}
                  />
                </button>
              </div>

              {/* Submit button */}
              <button
                onClick={() => {
                  if (!canSubmitMatch) return;
                  submitMicroMatch.mutate(
                    {
                      sessionId: session.id,
                      homeScore,
                      awayScore,
                      teamHome: matchTeamHome,
                      teamAway: matchTeamAway,
                      hasKeeper,
                    },
                    {
                      onSuccess: () => {
                        // Use local state — same values that were just submitted
                        if (winnerStaysOn && homeScore !== awayScore) {
                          const winners = homeScore > awayScore ? matchTeamHome : matchTeamAway;
                          const allProfileIds: string[] = attendees
                            .map((a) => a.profileId || a.profile?.id)
                            .filter(Boolean) as string[];
                          const remaining = allProfileIds.filter((id) => !winners.includes(id));
                          const awayCount = winners.length;
                          const suggestedAway = remaining.slice(0, awayCount);

                          setMatchTeamHome(winners);
                          setMatchTeamAway(suggestedAway);
                        } else {
                          setMatchTeamHome([]);
                          setMatchTeamAway([]);
                        }

                        setHomeScore(0);
                        setAwayScore(0);
                        setHasKeeper(true);
                        refetch();
                      },
                    },
                  );
                }}
                disabled={!canSubmitMatch || submitMicroMatch.isPending}
                className="w-full py-3 rounded-xl font-bold text-sm bg-rose-600 hover:bg-rose-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {submitMicroMatch.isPending ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Submit Micro-Match
                  </>
                )}
              </button>
              {submitMicroMatch.isSuccess && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 text-center">
                  Micro-match submitted successfully! Score logged and XP applied.
                </p>
              )}
              {submitMicroMatch.isError && (
                <p className="text-xs text-red-600 dark:text-red-400 text-center">
                  {submitMicroMatch.error?.message ?? 'Failed to submit micro-match.'}
                </p>
              )}

              {submitMicroMatch.isPending && (
                <p className="text-xs text-amber-600 dark:text-amber-400 text-center">
                  Processing match — this might take a moment.
                </p>
              )}
            </div>
          </Card>
        </section>

        {/* ── Match History ────────────────────────────────────────── */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <ListChecks className="w-4 h-4 text-emerald-500" />
            Match History
            {matches.length > 0 && (
              <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                ({matches.length})
              </span>
            )}
          </h2>
          {matches.length === 0 ? (
            <Card>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                No matches yet. Use the form above to submit the first micro-match.
              </p>
            </Card>
          ) : (
            <div className="space-y-2">
              {[...matches].reverse().map((m) => {
                const ta = m.teamAssignments as { home?: string[]; away?: string[] } | null;
                return (
                  <Card key={m.id} padding="sm">
                    <div className="flex items-center gap-3">
                      {/* Score */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-lg font-black text-gray-900 dark:text-white">
                          {m.homeScore ?? '?'}
                        </span>
                        <span className="text-xs text-gray-400">-</span>
                        <span className="text-lg font-black text-gray-900 dark:text-white">
                          {m.awayScore ?? '?'}
                        </span>
                      </div>

                      {/* Status */}
                      <StatusBadge status={m.status} />

                      {/* Team composition */}
                      <div className="flex-1 min-w-0">
                        {ta ? (
                          <div className="flex flex-wrap gap-0.5">
                            {ta.home?.slice(0, 3).map((pid) => {
                              const a = attendees.find((att) => att.profileId === pid || att.profile?.id === pid);
                              return (
                                <span key={pid} className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 truncate max-w-[80px]">
                                  {a?.profile?.user?.name?.split(' ')[0] ?? '?'}
                                </span>
                              );
                            })}
                            <span className="text-[10px] text-gray-400 self-center mx-0.5">vs</span>
                            {ta.away?.slice(0, 3).map((pid) => {
                              const a = attendees.find((att) => att.profileId === pid || att.profile?.id === pid);
                              return (
                                <span key={pid} className="text-[10px] px-1.5 py-0.5 rounded bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 truncate max-w-[80px]">
                                  {a?.profile?.user?.name?.split(' ')[0] ?? '?'}
                                </span>
                              );
                            })}
                            {(ta.home?.length ?? 0) > 3 && (
                              <span className="text-[10px] text-gray-400">+{ta.home!.length - 3}</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Fixed squads</span>
                        )}
                      </div>

                      {/* Timestamp */}
                      <span className="text-[10px] text-gray-400 shrink-0">
                        {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </PageShell>
  );
}
