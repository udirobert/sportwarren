"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Trophy, Star, Shield, Users, ArrowLeft, Search, Filter, TrendingUp } from "lucide-react";
import { trpc } from "@/lib/trpc-client";
import { TrpcErrorBoundary } from "@/components/ui/TrpcErrorBoundary";
import { Skeleton } from "@/components/ui/Skeleton";
import { useJourneyState } from "@/hooks/useJourneyState";

function LeaderboardPageInner() {
  const [type, setType] = useState<'overall' | 'goals' | 'assists' | 'matches'>('overall');
  const { data: leaderboard, isLoading } = trpc.player.getLeaderboard.useQuery({ 
    type, 
    limit: 50 
  });
  const { memberships } = useJourneyState();
  const primarySquadId = memberships?.[0]?.squad?.id;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 nav-spacer-top nav-spacer-bottom space-y-6 text-gray-900 dark:text-gray-100">
      <div className="flex items-center gap-4">
        <Link href="/community">
          <Button variant="outline" size="sm" className="rounded-full w-8 h-8 p-0">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight">Global Leaderboard</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">The top players in the SportWarren ecosystem</p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {(['overall', 'goals', 'assists', 'matches'] as const).map((t) => (
          <Button
            key={t}
            size="sm"
            variant={type === t ? 'primary' : 'outline'}
            onClick={() => setType(t)}
            className="capitalize rounded-full px-6"
          >
            {t}
          </Button>
        ))}
      </div>

      <Card className="overflow-hidden border-none shadow-xl">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-500 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-500/20">
                <Trophy className="w-6 h-6 text-black" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-500">Season 1</p>
                <h2 className="text-xl font-black uppercase italic">Hall of Fame</h2>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Total Players</p>
              <p className="text-xl font-black uppercase tracking-tight">{leaderboard?.length || '...'}</p>
            </div>
          </div>
        </div>

        <div className="p-0">
          <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 text-[10px] font-black uppercase tracking-widest text-gray-500">
            <div className="col-span-1">Pos</div>
            <div className="col-span-6 md:col-span-7">Player</div>
            <div className="col-span-3 md:col-span-2 text-right">Reputation</div>
            <div className="col-span-2 text-right">Rating</div>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {isLoading ? (
              [...Array(10)].map((_, i) => (
                <div key={i} className="px-6 py-4 flex items-center gap-4">
                  <Skeleton className="h-6 w-6 rounded" />
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ))
            ) : leaderboard && leaderboard.length > 0 ? (
              leaderboard.map((player: any, i: number) => (
                <div 
                  key={player.userId} 
                  className={`grid grid-cols-12 gap-4 px-6 py-4 items-center transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                    i === 0 ? 'bg-yellow-500/5' : ''
                  }`}
                >
                  <div className="col-span-1">
                    <span className={`text-sm font-black ${
                      i === 0 ? 'text-yellow-500' : 
                      i === 1 ? 'text-gray-400' : 
                      i === 2 ? 'text-amber-600' : 
                      'text-gray-400'
                    }`}>
                      {i + 1}
                    </span>
                  </div>
                  <div className="col-span-6 md:col-span-7 flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-sm shrink-0">
                      {player.avatar ? (
                        <img src={player.avatar} alt="" className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        (player.name ?? 'A').charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                          {player.name ?? 'Anonymous'}
                        </p>
                        {player.isCaptain && (
                          <Shield className="w-3 h-3 text-blue-500" />
                        )}
                      </div>
                      <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tight">
                        Level {player.level} • {player.totalMatches} matches
                      </p>
                    </div>
                  </div>
                  <div className="col-span-3 md:col-span-2 text-right">
                    <p className="text-sm font-black text-gray-900 dark:text-white">
                      {(player.reputationScore ?? 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="col-span-2 text-right">
                    <div className="inline-flex items-center gap-1 text-sm font-black text-green-600">
                      <Star className="w-3 h-3 fill-current" />
                      {player.averageRating ?? '0.0'}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-12 text-center">
                <p className="text-gray-500 font-bold">No players found in this category.</p>
              </div>
            )}
          </div>
        </div>
      </Card>

      <Card className="bg-emerald-500 p-6 text-white border-none shadow-xl shadow-emerald-500/20 overflow-hidden relative">
        <TrendingUp className="absolute right-[-20px] bottom-[-20px] w-48 h-48 text-white/10 rotate-12" />
        <div className="relative z-10">
          <h3 className="text-xl font-black uppercase italic mb-2">Climb the Ranks</h3>
          <p className="text-emerald-100 text-sm mb-4 max-w-sm">Play more matches and maintain a high rating to earn XP and climb the global hall of fame.</p>
          <Link href="/match">
            <Button className="bg-white text-emerald-600 hover:bg-white/90 font-black uppercase tracking-widest text-xs h-10 px-6">
              Find Match
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default function LeaderboardPage() {
  return (
    <TrpcErrorBoundary>
      <LeaderboardPageInner />
    </TrpcErrorBoundary>
  );
}
