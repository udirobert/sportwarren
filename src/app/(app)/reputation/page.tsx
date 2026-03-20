"use client";

import Link from "next/link";
import { PlayerReputation } from "@/components/player/PlayerReputation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/common/EmptyState";
import { Target, History, CheckCircle, Clock, Trophy, Shield, Star } from "lucide-react";
import { TrpcErrorBoundary } from "@/components/ui/TrpcErrorBoundary";
import { VerificationBanner } from "@/components/common/VerificationBanner";
import { getJourneyZeroState } from "@/lib/journey/content";
import { describeMatchForSquad, isSettledMatchStatus } from "@/lib/match/summary";
import { useJourneyState } from "@/hooks/useJourneyState";
import { AchievementGallery } from "@/components/player/AchievementGallery";
import { useSeasonSnapshot } from "@/hooks/useSeasonSnapshot";

function ReputationPageInner() {
  const { journeyStage, hasWallet, isVerified } = useJourneyState();
  const {
    primarySquad,
    primarySquadId,
    attributes,
    attributesLoading,
    matches,
    matchesLoading,
    pendingMatchesCount,
    settledMatchesCount,
    latestSettledMatch,
  } = useSeasonSnapshot(8);
  const noSquadState = getJourneyZeroState(journeyStage, 'reputation_no_squad');
  const emptyReputationState = getJourneyZeroState(journeyStage, 'reputation_empty');
  const latestSummary = latestSettledMatch ? describeMatchForSquad(latestSettledMatch, primarySquadId) : null;
  const profileReady = hasWallet && isVerified;
  const reputationContext = !primarySquadId
    ? noSquadState.description
    : !profileReady
      ? `${primarySquad?.name || 'Your squad'} is active, but the protected player profile is not connected yet. Verify your wallet to load the full reputation card and keep the season record secure.`
    : pendingMatchesCount > 0
      ? `${primarySquad?.name || 'Your squad'} has ${pendingMatchesCount} result${pendingMatchesCount === 1 ? '' : 's'} awaiting verification. Reputation will update when those settle.`
      : settledMatchesCount > 0
        ? `${attributes?.playerName || 'Your player profile'} is carrying ${attributes?.reputationScore?.toLocaleString() || 0} rep across ${settledMatchesCount} verified squad result${settledMatchesCount === 1 ? '' : 's'}.`
        : `${primarySquad?.name || 'Your squad'} is ready for its first proof-backed result. One verified match starts the reputation curve.`;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 nav-spacer-top nav-spacer-bottom space-y-4 text-gray-900 dark:text-gray-100">
      <VerificationBanner />
      {/* Contextual nav */}
      <Card className="border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm text-gray-600">
            {reputationContext}
          </p>
          <div className="flex gap-2 shrink-0">
            <Link href="/match?mode=history">
              <Button size="sm" variant="outline" className="flex items-center gap-1.5">
                <History className="w-3.5 h-3.5" />
                Match History
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
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="grid gap-3 md:grid-cols-4">
              <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3">
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">Player</div>
                <div className="mt-2 font-semibold text-gray-900">{attributes?.playerName || 'No player profile yet'}</div>
                <div className="mt-1 text-sm text-gray-600">{attributes?.position || 'Position not set'}</div>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3">
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">Squad</div>
                <div className="mt-2 flex items-center gap-2 font-semibold text-gray-900">
                  <Shield className="h-4 w-4 text-blue-500" />
                  {primarySquad?.name || 'No squad yet'}
                </div>
                <div className="mt-1 text-sm text-gray-600">
                  {primarySquad ? `${settledMatchesCount} verified result${settledMatchesCount === 1 ? '' : 's'}` : 'Create or join a squad'}
                </div>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3">
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">Reputation</div>
                <div className="mt-2 flex items-center gap-2 font-semibold text-gray-900">
                  <Star className="h-4 w-4 text-yellow-500" />
                  {attributes?.reputationScore?.toLocaleString() || 0}
                </div>
                <div className="mt-1 text-sm text-gray-600">
                  {pendingMatchesCount > 0 ? `${pendingMatchesCount} pending review` : 'No pending review queue'}
                </div>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3">
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">Latest Result</div>
                <div className="mt-2 font-semibold text-gray-900">
                  {latestSummary ? `${latestSummary.result} ${latestSummary.goalsFor}-${latestSummary.goalsAgainst}` : 'No verified result yet'}
                </div>
                <div className="mt-1 text-sm text-gray-600">
                  {latestSummary ? `vs ${latestSummary.opponent}` : 'Play and verify the first match'}
                </div>
              </div>
            </div>
          </Card>

          {profileReady ? (
            <PlayerReputation attributes={attributes} loading={attributesLoading} />
          ) : (
            <Card>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Protected Player Profile</h2>
                  <p className="mt-1 text-sm text-gray-600">
                    The full reputation card loads once your verified wallet is connected. Squad match contributions below still reflect the live season record.
                  </p>
                </div>
                <Link href="/settings?tab=wallet">
                  <Button>Verify Wallet</Button>
                </Link>
              </div>
            </Card>
          )}
          
          {/* Match contributions */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Recent Match Contributions</h2>
              <Link href="/match?mode=history">
                <Button size="sm" variant="outline">All Matches</Button>
              </Link>
            </div>
            {!primarySquadId ? (
              <EmptyState
                icon={Trophy}
                title={noSquadState.title}
                description={noSquadState.description}
                actionLabel={noSquadState.actionLabel}
                actionHref={noSquadState.actionHref}
                className="py-8"
              />
            ) : matchesLoading || attributesLoading ? (
              <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-14 bg-gray-100 rounded animate-pulse" />)}</div>
            ) : matches.length > 0 ? (
              <div className="space-y-2">
                {matches.map((match: any) => {
                  const summary = describeMatchForSquad(match, primarySquadId);
                  const settled = isSettledMatchStatus(match.status);
                  return (
                    <Link key={match.id} href={`/match?mode=detail&matchId=${match.id}`} className="block">
                      <div className="flex items-center gap-3 p-3 border border-gray-100 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${
                          !settled ? 'bg-gray-300' : summary.result === 'W' ? 'bg-green-500' : summary.result === 'D' ? 'bg-yellow-400' : 'bg-red-400'
                        }`}>
                          {!settled ? '?' : summary.result}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">vs {summary.opponent}</p>
                          <p className="text-xs text-gray-500">{summary.goalsFor} – {summary.goalsAgainst} · {new Date(match.matchDate).toLocaleDateString()}</p>
                        </div>
                        {settled ? (
                          <span className="flex items-center gap-1 text-xs text-green-600 shrink-0">
                            <CheckCircle className="w-3.5 h-3.5" /> +XP
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-yellow-600 shrink-0">
                            <Clock className="w-3.5 h-3.5" /> Pending
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                icon={Trophy}
                title={emptyReputationState.title}
                description={emptyReputationState.description}
                actionLabel={emptyReputationState.actionLabel}
                actionHref={emptyReputationState.actionHref}
                className="py-8"
              />
            )}
          </Card>
        </div>

        <div className="lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center">
              <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
              Trophy Room
            </h2>
          </div>
          <AchievementGallery />
        </div>
      </div>
    </div>
  );
}

export default function ReputationPage() {
  return (
    <TrpcErrorBoundary>
      <ReputationPageInner />
    </TrpcErrorBoundary>
  );
}
