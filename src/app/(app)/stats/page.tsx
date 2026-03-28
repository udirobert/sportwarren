"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Shield,
  Target,
  Trophy,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/common/EmptyState";
import { StatCard } from "@/components/common/StatCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { getJourneyZeroState } from "@/lib/journey/content";
import { describeMatchForSquad } from "@/lib/match/summary";
import { useJourneyState } from "@/hooks/useJourneyState";
import { useSeasonSnapshot } from "@/hooks/useSeasonSnapshot";

export default function StatsPage() {
  const {
    journeyStage,
    hasAccount,
    hasWallet,
    isGuest,
    isVerified,
  } = useJourneyState();
  const lockedState = getJourneyZeroState(journeyStage, "stats_locked");
  const emptyState = getJourneyZeroState(journeyStage, "stats_empty");
  const {
    primarySquad,
    primarySquadId,
    attributes,
    attributesLoading,
    matchesLoading,
    settledMatches,
    pendingMatchesCount,
    latestSettledMatch,
    seasonRecord,
  } = useSeasonSnapshot(8);

  if (!hasAccount || isGuest || !hasWallet || !isVerified) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-12 nav-spacer-top nav-spacer-bottom">
        <EmptyState
          icon={BarChart3}
          title={lockedState.title}
          description={lockedState.description}
          actionLabel={lockedState.actionLabel}
          actionHref={lockedState.actionHref}
        />
      </main>
    );
  }

  if (attributesLoading || matchesLoading) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-12 nav-spacer-top nav-spacer-bottom text-gray-900 dark:text-gray-100">
        <div className="space-y-4">
          <Skeleton className="h-20 rounded-2xl" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-56 rounded-2xl" />
        </div>
      </main>
    );
  }

  if (!attributes) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-12 nav-spacer-top nav-spacer-bottom">
        <EmptyState
          icon={BarChart3}
          title={emptyState.title}
          description={emptyState.description}
          actionLabel={emptyState.actionLabel}
          actionHref={emptyState.actionHref}
        />
      </main>
    );
  }

  const pace = attributes.skills.find((s) => s.skill === "pace")?.rating ?? 0;
  const shooting = attributes.skills.find((s) => s.skill === "shooting")?.rating ?? 0;
  const passing = attributes.skills.find((s) => s.skill === "passing")?.rating ?? 0;
  const defending = attributes.skills.find((s) => s.skill === "defending")?.rating ?? 0;
  const dribbling = attributes.skills.find((s) => s.skill === "dribbling")?.rating ?? 0;
  const physical = attributes.skills.find((s) => s.skill === "physical")?.rating ?? 0;
  const latestSummary = latestSettledMatch ? describeMatchForSquad(latestSettledMatch, primarySquadId) : null;
  const recentSettledMatches = settledMatches.slice(0, 3);
  const seasonContext = !primarySquadId
    ? "Your player profile is ready, but a squad is what turns it into a live season. Join one to start building verified match history."
    : pendingMatchesCount > 0
      ? `${primarySquad?.name || "Your squad"} is ${seasonRecord.wins}-${seasonRecord.draws}-${seasonRecord.losses} with ${pendingMatchesCount} result${pendingMatchesCount === 1 ? "" : "s"} awaiting review.`
      : latestSummary
        ? `${primarySquad?.name || "Your squad"} is ${seasonRecord.wins}-${seasonRecord.draws}-${seasonRecord.losses}. Latest verified result: ${latestSummary.result} ${latestSummary.goalsFor}-${latestSummary.goalsAgainst} vs ${latestSummary.opponent}.`
        : `${primarySquad?.name || "Your squad"} has not settled a verified result yet. The first completed match will turn this into a live season record.`;
  const seasonProgress = Math.min((attributes.xp.seasonXP / attributes.xp.nextLevelXP) * 100, 100);

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 nav-spacer-top nav-spacer-bottom space-y-6 text-gray-900 dark:text-gray-100">
      <Card className="border-gray-100 bg-gray-50">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-gray-600 dark:text-gray-300">
              <BarChart3 className="h-4 w-4" />
              Season Stats
            </div>
            <h1 className="mt-2 text-2xl font-black text-gray-900">{attributes.playerName}</h1>
            <p className="mt-1 text-sm text-gray-600">
              {attributes.position} · Level {attributes.xp.level} · {attributes.xp.totalXP.toLocaleString()} total XP
            </p>
            <p className="mt-3 max-w-2xl text-sm text-gray-600">{seasonContext}</p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <Link
              href={pendingMatchesCount > 0 ? "/match?mode=verify" : "/match?mode=capture"}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
            >
              {pendingMatchesCount > 0 ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Target className="w-3.5 h-3.5" />}
              {pendingMatchesCount > 0 ? "Review Pending" : "Submit Match"}
            </Link>
            <Link
              href="/reputation"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Trophy className="w-3.5 h-3.5" />
              Reputation
            </Link>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-700">
            <Shield className="h-3.5 w-3.5 text-blue-500" />
            {primarySquad?.name || "No squad yet"}
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-700">
            <Target className="h-3.5 w-3.5 text-green-500" />
            {seasonRecord.wins}-{seasonRecord.draws}-{seasonRecord.losses}
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-700">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            {seasonRecord.settled} verified result{seasonRecord.settled === 1 ? "" : "s"}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="Matches" value={attributes.totalMatches} icon={Target} color="blue" />
        <StatCard title="Goals" value={attributes.totalGoals} icon={Zap} color="green" />
        <StatCard title="Assists" value={attributes.totalAssists} icon={TrendingUp} color="orange" />
        <StatCard title="Reputation" value={attributes.reputationScore} icon={Trophy} color="purple" />
      </div>

      <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <h2 className="text-base font-black uppercase tracking-wide text-gray-700 mb-4">Skill Ratings</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: "Pace", value: pace, icon: Zap },
            { label: "Shooting", value: shooting, icon: Target },
            { label: "Passing", value: passing, icon: TrendingUp },
            { label: "Dribbling", value: dribbling, icon: BarChart3 },
            { label: "Defending", value: defending, icon: Shield },
            { label: "Physical", value: physical, icon: Shield },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex items-center gap-3">
              <Icon className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between mb-1">
                  <span className="text-xs font-semibold text-gray-600">{label}</span>
                  <span className="text-xs font-black text-gray-900">{value}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all"
                    style={{ width: `${Math.min(value, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-black uppercase tracking-wide text-gray-700">XP Progress</h2>
            <span className="text-xs text-gray-600 dark:text-gray-300">Level {attributes.xp.level} → {attributes.xp.level + 1}</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all"
              style={{ width: `${seasonProgress}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-300">
            {attributes.xp.seasonXP.toLocaleString()} / {attributes.xp.nextLevelXP.toLocaleString()} season XP
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-600 dark:text-gray-300">Verified Record</div>
              <div className="mt-2 text-lg font-bold text-gray-900">
                {seasonRecord.wins}-{seasonRecord.draws}-{seasonRecord.losses}
              </div>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-600 dark:text-gray-300">Pending Queue</div>
              <div className="mt-2 text-lg font-bold text-gray-900">{pendingMatchesCount}</div>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-600 dark:text-gray-300">Highlights</div>
              <div className="mt-2 text-lg font-bold text-gray-900">{attributes.careerHighlights.length}</div>
            </div>
          </div>
        </Card>

        <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-black uppercase tracking-wide text-gray-700">Recent Momentum</h2>
            <Link href="/match?mode=history" className="text-xs font-semibold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
              Full history
            </Link>
          </div>

          {recentSettledMatches.length > 0 ? (
            <div className="space-y-3">
              {recentSettledMatches.map((match: Parameters<typeof describeMatchForSquad>[0]) => {
                const summary = describeMatchForSquad(match, primarySquadId);
                return (
                  <Link
                    key={match.id}
                    href={`/match?mode=detail&matchId=${match.id}`}
                    className="flex items-center gap-3 rounded-xl border border-gray-200 px-3 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white ${
                        summary.result === "W"
                          ? "bg-green-500"
                          : summary.result === "D"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                      }`}
                    >
                      {summary.result}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-gray-900 truncate">vs {summary.opponent}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-300">
                        {summary.goalsFor}-{summary.goalsAgainst} · {match.matchDate ? new Date(match.matchDate).toLocaleDateString() : 'Unknown date'}
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-300" />
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center">
              <Target className="mx-auto h-5 w-5 text-gray-400" />
              <h3 className="mt-3 text-sm font-semibold text-gray-900">No verified results yet</h3>
              <p className="mt-1 text-sm text-gray-600">
                The first completed match will start drawing form and momentum into this panel.
              </p>
            </div>
          )}
        </Card>
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        <Link
          href="/match?mode=capture"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-xl hover:bg-green-700 transition-colors"
        >
          <Target className="w-4 h-4" />
          Submit a Match
        </Link>
        <Link
          href="/reputation"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <Trophy className="w-4 h-4" />
          View Reputation
        </Link>
        <Link
          href="/squad"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          Go to Squad
        </Link>
      </div>
    </main>
  );
}
