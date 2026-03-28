"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/common/EmptyState";
import { Target, Users, Trophy, Star, Shield, Swords, Clock } from "lucide-react";
import { trpc } from "@/lib/trpc-client";
import { TrpcErrorBoundary } from "@/components/ui/TrpcErrorBoundary";
import { Skeleton, SkeletonLines } from "@/components/ui/Skeleton";
import { getJourneyZeroState } from "@/lib/journey/content";
import { getMatchStatusLabel, isSettledMatchStatus } from "@/lib/match/summary";
import { useSeasonSnapshot } from "@/hooks/useSeasonSnapshot";
import { useJourneyState } from "@/hooks/useJourneyState";

function CommunityPageInner() {
  const { journeyStage } = useJourneyState();
  const {
    primarySquad,
    primarySquadId,
    attributes,
    pendingMatchesCount,
    settledMatchesCount,
  } = useSeasonSnapshot(6);
  const { data: leaderboard, isLoading: loadingLeaderboard } = trpc.player.getLeaderboard.useQuery({ type: 'overall', limit: 10 });
  const { data: squadsData, isLoading: loadingSquads } = trpc.squad.list.useQuery({ limit: 8 });
  const { data: recentMatches, isLoading: loadingMatches } = trpc.match.list.useQuery({ limit: 5 });
  const playersZeroState = getJourneyZeroState(journeyStage, 'community_players');
  const squadsZeroState = getJourneyZeroState(journeyStage, 'community_squads');
  const matchesZeroState = getJourneyZeroState(journeyStage, 'community_matches');
  const communityContext = !primarySquadId
    ? 'Create or join a squad to appear in the active squads board and turn your local results into visible community standing.'
    : pendingMatchesCount > 0
      ? `${primarySquad?.name || 'Your squad'} has ${pendingMatchesCount} result${pendingMatchesCount === 1 ? '' : 's'} awaiting verification. Community standing updates when those settle.`
      : settledMatchesCount > 0
        ? `${primarySquad?.name || 'Your squad'} is already visible through ${settledMatchesCount} verified result${settledMatchesCount === 1 ? '' : 's'}. Keep the match loop moving to climb.`
        : `${primarySquad?.name || 'Your squad'} is live but not ranked yet. One verified result puts it into the community graph.`;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 nav-spacer-top nav-spacer-bottom space-y-4 text-gray-900 dark:text-gray-100">
      {/* Contextual nav */}
      <Card className="border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm text-gray-700 dark:text-gray-200">
            {communityContext}
          </p>
          <div className="flex gap-2 shrink-0">
            <Link href="/squad">
              <Button size="sm" variant="outline" className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                {primarySquadId ? "My Squad" : "Create Squad"}
              </Button>
            </Link>
            <Link href={pendingMatchesCount > 0 ? "/match?mode=verify" : "/match"}>
              <Button size="sm" className="flex items-center gap-1.5">
                {pendingMatchesCount > 0 ? <Clock className="w-3.5 h-3.5" /> : <Target className="w-3.5 h-3.5" />}
                {pendingMatchesCount > 0 ? "Review Pending" : "Play a Match"}
              </Button>
            </Link>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-700">
            <Shield className="h-3.5 w-3.5 text-blue-500" />
            {primarySquad?.name || 'No squad yet'}
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-700">
            <Trophy className="h-3.5 w-3.5 text-yellow-500" />
            {settledMatchesCount} verified result{settledMatchesCount === 1 ? '' : 's'}
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-700">
            <Star className="h-3.5 w-3.5 text-amber-500" />
            {attributes?.reputationScore?.toLocaleString() || 0} rep
          </div>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Player Leaderboard */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Player Leaderboard
            </h2>
            <Link href="/stats"><Button size="sm" variant="outline">My Stats</Button></Link>
          </div>
          {loadingLeaderboard ? (
            <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 rounded-lg" />)}</div>
          ) : leaderboard && leaderboard.length > 0 ? (
            <div className="space-y-2">
              {leaderboard.map((player: any, i: number) => (
                <div key={player.userId} className="flex items-center gap-3 p-2 rounded-lg">
                  <span className={`w-6 text-center text-sm font-bold ${i === 0 ? 'text-yellow-500' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-amber-600' : 'text-gray-400'}`}>{i + 1}</span>
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700">
                    {(player.name ?? 'A').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{player.name ?? 'Anonymous'}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-300">{player.totalMatches} matches · Lv {player.level}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300">
                    <Star className="w-3 h-3 text-yellow-400" />
                    {player.averageRating ?? 0}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Trophy}
              title={playersZeroState.title}
              description={playersZeroState.description}
              actionLabel={playersZeroState.actionLabel}
              actionHref={playersZeroState.actionHref}
              className="py-8"
            />
          )}
        </Card>

        {/* Active Squads */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-500" />
              Active Squads
            </h2>
            <Link href="/squad"><Button size="sm" variant="outline">My Squad</Button></Link>
          </div>
          {loadingSquads ? (
            <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}</div>
          ) : squadsData?.squads && squadsData.squads.length > 0 ? (
            <div className="space-y-2">
              {squadsData.squads.map((squad: any) => (
                <div key={squad.id} className="flex items-center gap-3 p-2 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-xs font-bold text-green-700">
                    {squad.shortName?.charAt(0) ?? squad.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900 truncate">{squad.name}</p>
                      {squad.id === primarySquadId && (
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-700">
                          Your squad
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300">{squad.shortName} · {squad._count?.members ?? 0} members</p>
                  </div>
                  {squad.id === primarySquadId ? (
                    <Link href="/squad" className="shrink-0 ml-2">
                      <Button size="sm" variant="outline" className="flex items-center gap-1 text-xs px-2 py-1 h-auto">
                        <Shield className="w-3 h-3" />
                        Open
                      </Button>
                    </Link>
                  ) : (
                    <Link href={`/match?mode=capture&opponentSquadId=${squad.id}`} className="shrink-0 ml-2">
                      <Button size="sm" variant="outline" className="flex items-center gap-1 text-xs px-2 py-1 h-auto">
                        <Swords className="w-3 h-3" />
                        Challenge
                      </Button>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Shield}
              title={squadsZeroState.title}
              description={squadsZeroState.description}
              actionLabel={squadsZeroState.actionLabel}
              actionHref={squadsZeroState.actionHref}
              className="py-8"
            />
          )}
        </Card>
      </div>

      {/* Recent Community Matches */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Recent Matches</h2>
          <Link href="/match"><Button size="sm" variant="outline">All Matches</Button></Link>
        </div>
          {loadingMatches ? (
            <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}</div>
        ) : recentMatches?.matches && recentMatches.matches.length > 0 ? (
          <div className="space-y-2">
            {recentMatches.matches.map((match: any) => (
              <div key={match.id} className="flex items-center justify-between p-3 border border-gray-100 dark:border-gray-700 rounded-lg">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-sm font-medium text-gray-900 truncate">{match.homeSquad?.name ?? 'Home'}</span>
                  <span className="text-lg font-bold text-gray-700 shrink-0">{match.homeScore} – {match.awayScore}</span>
                  <span className="text-sm font-medium text-gray-900 truncate">{match.awaySquad?.name ?? 'Away'}</span>
                  {primarySquadId && (match.homeSquadId === primarySquadId || match.awaySquadId === primarySquadId) && (
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-700">
                      Your squad
                    </span>
                  )}
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ml-2 ${
                  isSettledMatchStatus(match.status) ? 'bg-green-100 text-green-700' :
                  match.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'
                }`}>{getMatchStatusLabel(match.status)}</span>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Target}
            title={matchesZeroState.title}
            description={matchesZeroState.description}
            actionLabel={matchesZeroState.actionLabel}
            actionHref={matchesZeroState.actionHref}
            className="py-8"
          />
        )}
      </Card>
    </div>
  );
}

export default function CommunityPage() {
  return (
    <TrpcErrorBoundary>
      <CommunityPageInner />
    </TrpcErrorBoundary>
  );
}
