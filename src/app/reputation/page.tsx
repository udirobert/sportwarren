"use client";

import Link from "next/link";
import { PlayerReputation } from "@/components/player/PlayerReputation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Target, History, CheckCircle, Clock, Trophy } from "lucide-react";
import { trpc } from "@/lib/trpc-client";
import { useMySquads } from "@/hooks/squad/useSquad";
import { TrpcErrorBoundary } from "@/components/ui/TrpcErrorBoundary";
import { VerificationBanner } from "@/components/common/VerificationBanner";

import { AchievementGallery } from "@/components/player/AchievementGallery";

function ReputationPageInner() {
  const { memberships } = useMySquads();
  const primarySquadId = memberships?.[0]?.squad?.id;

  const { data: matchData, isLoading } = trpc.match.list.useQuery(
    { squadId: primarySquadId, limit: 8 },
    { enabled: !!primarySquadId }
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 pb-24 md:pb-6 space-y-4 text-gray-900 dark:text-gray-100">
      <VerificationBanner />
      {/* Contextual nav */}
      <Card className="border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm text-gray-600">
            Reputation is earned through verified matches. Submit and verify results to grow your score.
          </p>
          <div className="flex gap-2 shrink-0">
            <Link href="/match?mode=history">
              <Button size="sm" variant="outline" className="flex items-center gap-1.5">
                <History className="w-3.5 h-3.5" />
                Match History
              </Button>
            </Link>
            <Link href="/match">
              <Button size="sm" className="flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" />
                Play a Match
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <PlayerReputation />
          
          {/* Match contributions */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Recent Match Contributions</h2>
              <Link href="/match?mode=history">
                <Button size="sm" variant="outline">All Matches</Button>
              </Link>
            </div>
            {!primarySquadId ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">Join or create a squad to see your match contributions.</p>
                <Link href="/squad"><Button size="sm" className="mt-3">Go to Squad</Button></Link>
              </div>
            ) : isLoading ? (
              <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-14 bg-gray-100 rounded animate-pulse" />)}</div>
            ) : matchData?.matches && matchData.matches.length > 0 ? (
              <div className="space-y-2">
                {matchData.matches.map((match: any) => {
                  const isHome = match.homeSquadId === primarySquadId;
                  const myScore = isHome ? match.homeScore : match.awayScore;
                  const oppScore = isHome ? match.awayScore : match.homeScore;
                  const oppName = isHome ? match.awaySquad?.name : match.homeSquad?.name;
                  const won = myScore > oppScore;
                  const drew = myScore === oppScore;
                  return (
                    <Link key={match.id} href={`/match?mode=detail&matchId=${match.id}`} className="block">
                      <div className="flex items-center gap-3 p-3 border border-gray-100 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${
                          match.status !== 'VERIFIED' ? 'bg-gray-300' : won ? 'bg-green-500' : drew ? 'bg-yellow-400' : 'bg-red-400'
                        }`}>
                          {match.status !== 'VERIFIED' ? '?' : won ? 'W' : drew ? 'D' : 'L'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">vs {oppName ?? 'Unknown'}</p>
                          <p className="text-xs text-gray-500">{myScore} – {oppScore} · {new Date(match.matchDate).toLocaleDateString()}</p>
                        </div>
                        {match.status === 'VERIFIED' ? (
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
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">No matches yet. Play and verify matches to earn reputation.</p>
                <Link href="/match?mode=capture"><Button size="sm" className="mt-3">Submit a Match</Button></Link>
              </div>
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
