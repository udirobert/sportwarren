"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Target, Users, Trophy, Star, Shield } from "lucide-react";
import { trpc } from "@/lib/trpc-client";

export default function CommunityPage() {
  const { data: leaderboard, isLoading: loadingLeaderboard } = trpc.player.getLeaderboard.useQuery({ type: 'overall', limit: 10 });
  const { data: squadsData, isLoading: loadingSquads } = trpc.squad.list.useQuery({ limit: 8 });
  const { data: recentMatches, isLoading: loadingMatches } = trpc.match.list.useQuery({ limit: 5 });

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">
      {/* Contextual nav */}
      <Card className="border-gray-100 bg-gray-50 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm text-gray-600">
            Rivalries and leaderboards are built from verified match results. Play more to climb the rankings.
          </p>
          <div className="flex gap-2 shrink-0">
            <Link href="/squad">
              <Button size="sm" variant="outline" className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                My Squad
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
            <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}</div>
          ) : leaderboard && leaderboard.length > 0 ? (
            <div className="space-y-2">
              {leaderboard.map((player: any, i: number) => (
                <div key={player.userId} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                  <span className={`w-6 text-center text-sm font-bold ${i === 0 ? 'text-yellow-500' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-amber-600' : 'text-gray-400'}`}>{i + 1}</span>
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700">
                    {(player.name ?? 'A').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{player.name ?? 'Anonymous'}</p>
                    <p className="text-xs text-gray-500">{player.totalMatches} matches · Lv {player.level}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Star className="w-3 h-3 text-yellow-400" />
                    {player.averageRating ?? 0}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Trophy className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No players ranked yet.</p>
              <Link href="/match?mode=capture"><Button size="sm" className="mt-3">Submit a Match</Button></Link>
            </div>
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
            <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />)}</div>
          ) : squadsData?.squads && squadsData.squads.length > 0 ? (
            <div className="space-y-2">
              {squadsData.squads.map((squad: any) => (
                <div key={squad.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-xs font-bold text-green-700">
                    {squad.shortName?.charAt(0) ?? squad.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{squad.name}</p>
                    <p className="text-xs text-gray-500">{squad.shortName} · {squad._count?.members ?? 0} members</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Shield className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No squads found yet.</p>
              <Link href="/squad"><Button size="sm" className="mt-3">Create a Squad</Button></Link>
            </div>
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
          <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-14 bg-gray-100 rounded animate-pulse" />)}</div>
        ) : recentMatches?.matches && recentMatches.matches.length > 0 ? (
          <div className="space-y-2">
            {recentMatches.matches.map((match: any) => (
              <div key={match.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-sm font-medium text-gray-900 truncate">{match.homeSquad?.name ?? 'Home'}</span>
                  <span className="text-lg font-bold text-gray-700 shrink-0">{match.homeScore} – {match.awayScore}</span>
                  <span className="text-sm font-medium text-gray-900 truncate">{match.awaySquad?.name ?? 'Away'}</span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ml-2 ${
                  match.status === 'VERIFIED' ? 'bg-green-100 text-green-700' :
                  match.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'
                }`}>{match.status}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">No matches played yet. Be the first!</p>
            <Link href="/match?mode=capture"><Button size="sm" className="mt-3">Submit a Match</Button></Link>
          </div>
        )}
      </Card>
    </div>
  );
}
