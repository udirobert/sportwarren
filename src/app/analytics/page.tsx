"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Target, BarChart3, TrendingUp, TrendingDown, Minus, Star } from "lucide-react";
import { trpc } from "@/lib/trpc-client";
import { useWallet } from "@/contexts/WalletContext";
import { usePlayerAttributes } from "@/hooks/player/usePlayerAttributes";
import { TrpcErrorBoundary } from "@/components/ui/TrpcErrorBoundary";

function AnalyticsPageInner() {
  const { address } = useWallet();
  const { attributes, loading: loadingAttrs } = usePlayerAttributes();
  const { data: form, isLoading: loadingForm } = trpc.player.getForm.useQuery(
    { userId: address!, limit: 10 },
    { enabled: !!address }
  );
  const { data: leaderboard } = trpc.player.getLeaderboard.useQuery({ type: 'matches', limit: 5 });

  const avgRating = form && form.length > 0
    ? (form.reduce((sum: number, f: { rating: number }) => sum + f.rating, 0) / form.length).toFixed(1)
    : null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">
      {/* Contextual nav */}
      <Card className="border-gray-100 bg-gray-50 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm text-gray-600">
            Performance analytics improve as you log more verified matches. Submit results to build your data set.
          </p>
          <div className="flex gap-2 shrink-0">
            <Link href="/stats">
              <Button size="sm" variant="outline" className="flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5" />
                My Stats
              </Button>
            </Link>
            <Link href="/match?mode=capture">
              <Button size="sm" className="flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" />
                Log a Match
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {!address ? (
        <Card className="text-center py-12">
          <BarChart3 className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-600 mb-4">Connect your wallet to see your analytics.</p>
          <Link href="/settings?tab=wallet"><Button>Connect Wallet</Button></Link>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Recent Form */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Recent Form</h2>
              {avgRating && (
                <span className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400" /> {avgRating} avg
                </span>
              )}
            </div>
            {loadingForm ? (
              <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}</div>
            ) : form && form.length > 0 ? (
              <div className="space-y-2">
                {form.map((entry: { rating: number; notes?: string | null; createdAt: string | Date }, i: number) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-lg border border-gray-100">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                      entry.rating >= 7 ? 'bg-green-500' : entry.rating >= 5 ? 'bg-yellow-500' : 'bg-red-400'
                    }`}>{entry.rating}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 truncate">{entry.notes ?? 'Match performance'}</p>
                      <p className="text-xs text-gray-400">{new Date(entry.createdAt).toLocaleDateString()}</p>
                    </div>
                    {entry.rating >= 7 ? <TrendingUp className="w-4 h-4 text-green-500 shrink-0" /> :
                     entry.rating >= 5 ? <Minus className="w-4 h-4 text-yellow-500 shrink-0" /> :
                     <TrendingDown className="w-4 h-4 text-red-400 shrink-0" />}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">No form data yet.</p>
                <Link href="/match?mode=capture"><Button size="sm" className="mt-3">Log a Match</Button></Link>
              </div>
            )}
          </Card>

          {/* Attribute Ratings */}
          <Card>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Attribute Ratings</h2>
            {loadingAttrs ? (
              <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />)}</div>
            ) : attributes && attributes.skills && attributes.skills.length > 0 ? (
              <div className="space-y-3">
                {attributes.skills.map((attr: any) => (
                  <div key={attr.skill}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 capitalize">{String(attr.skill).toLowerCase().replace('_', ' ')}</span>
                      <span className="font-semibold text-gray-900">{attr.rating}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${attr.rating}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">No attributes yet. Play matches to build your profile.</p>
              </div>
            )}
          </Card>

          {/* Most Active Players */}
          <Card className="md:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Most Active Players</h2>
              <Link href="/community"><Button size="sm" variant="outline">Full Leaderboard</Button></Link>
            </div>
            {leaderboard && leaderboard.length > 0 ? (
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                {leaderboard.map((player: any, i: number) => (
                  <div key={player.userId} className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg">
                    <span className="text-lg font-black text-gray-300">#{i + 1}</span>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{player.name ?? 'Anonymous'}</p>
                      <p className="text-xs text-gray-500">{player.totalMatches} matches</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No data yet.</p>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <TrpcErrorBoundary>
      <AnalyticsPageInner />
    </TrpcErrorBoundary>
  );
}
