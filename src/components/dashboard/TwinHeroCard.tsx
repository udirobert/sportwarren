'use client';

import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, ChevronRight, Sparkles, Zap, Shield, Star } from 'lucide-react';
import { trpc } from '@/lib/trpc-client';
import { Skeleton } from '@/components/ui/Skeleton';

const ATTRIBUTE_LABELS: Record<string, string> = {
  pace: 'Pace',
  shooting: 'Shooting',
  passing: 'Passing',
  dribbling: 'Dribbling',
  defending: 'Defending',
  physical: 'Physical',
};

function formatEventKind(kind: string): string {
  return kind.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function formatTimeAgo(isoDate: string): string {
  const now = Date.now();
  const then = new Date(isoDate).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}

export function TwinHeroCard() {
  const { data: twin, isLoading } = trpc.player.getTwinSummary.useQuery(undefined, {
    retry: 1,
    staleTime: 30_000,
  });
  const [isPulsing, setIsPulsing] = React.useState(false);
  const prevXP = React.useRef<number | undefined>(undefined);

  // Pulse when XP changes (indicates data refresh from drill/match)
  React.useEffect(() => {
    if (twin?.xp !== undefined && prevXP.current !== undefined && twin.xp !== prevXP.current) {
      setIsPulsing(true);
      const timer = setTimeout(() => setIsPulsing(false), 300);
      return () => clearTimeout(timer);
    }
    prevXP.current = twin?.xp;
  }, [twin?.xp]);

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-gray-900 to-black border border-gray-800 p-5 animate-pulse">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gray-800" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-24 bg-gray-800 rounded" />
            <div className="h-2 w-full bg-gray-800 rounded" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="h-8 bg-gray-800 rounded-lg" />
          <div className="h-8 bg-gray-800 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!twin) {
    return null;
  }

  const xpProgress = twin.xpToNext > 0
    ? Math.round(((twin.xp % (twin.xp + twin.xpToNext)) / (twin.xp + twin.xpToNext)) * 100)
    : 0;

  return (
    <Link href="/profile">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-gradient-to-br from-gray-900 via-gray-900 to-black border border-gray-800 p-5 relative overflow-hidden cursor-pointer group hover:border-green-500/30 transition-colors"
      >
        {/* Background decoration */}
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
          <Brain className="w-32 h-32 text-green-400" />
        </div>

        <div className="relative z-10">
          {/* Header: Level + XP */}
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/20">
              <span className="text-lg font-black text-white">{twin.level}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-black text-white uppercase tracking-tight">Your Twin</h3>
                {twin.prestige > 0 && (
                  <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30">
                    <Star className="w-2.5 h-2.5 text-purple-400" />
                    <span className="text-[9px] font-black text-purple-300">{twin.prestige}</span>
                  </div>
                )}
                <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/30">
                  <Shield className="w-2.5 h-2.5 text-blue-400" />
                  <span className="text-[9px] font-black text-blue-300">{twin.reputation}</span>
                </div>
              </div>
              {/* XP progress bar */}
              <motion.div
                animate={isPulsing ? { scale: [1, 1.05, 1] } : { scale: 1 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-2"
              >
                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, Math.round((1 - twin.xpToNext / (twin.xp + twin.xpToNext)) * 100))}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
                <span className="text-[10px] font-bold text-gray-400 whitespace-nowrap">
                  {twin.xpToNext.toLocaleString()} XP
                </span>
              </motion.div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-green-400 transition-colors flex-shrink-0" />
          </div>

          {/* Top attributes */}
          {twin.topAttributes.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mb-3">
              {twin.topAttributes.map(attr => (
                <div key={attr.key} className="rounded-lg bg-white/5 border border-white/10 px-3 py-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-wide">
                      {ATTRIBUTE_LABELS[attr.key] || attr.key}
                    </span>
                    <span className="text-xs font-black text-white">{attr.value}</span>
                  </div>
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500/60 rounded-full"
                      style={{ width: `${Math.min(100, attr.value)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Active modifiers */}
          {twin.activeModifiers.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {twin.activeModifiers.slice(0, 3).map(mod => (
                <div
                  key={mod.id}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/25"
                >
                  <Zap className="w-2.5 h-2.5 text-amber-400" />
                  <span className="text-[9px] font-bold text-amber-300 uppercase">
                    {mod.source}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Footer: Last event + Next milestone */}
          <div className="flex items-center justify-between pt-3 border-t border-white/5">
            {twin.lastEvent ? (
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-green-400 flex-shrink-0" />
                <span className="text-[10px] text-gray-400">
                  <span className="text-gray-300 font-semibold">{formatEventKind(twin.lastEvent.kind)}</span>
                  {' · '}
                  {formatTimeAgo(twin.lastEvent.createdAt)}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-gray-600 flex-shrink-0" />
                <span className="text-[10px] text-gray-600">No events yet</span>
              </div>
            )}

            {twin.nextMilestone && (
              <span className="text-[10px] font-bold text-gray-500 uppercase">
                {twin.nextMilestone.current}/{twin.nextMilestone.threshold}
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
