"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  Sparkles,
  Swords,
  Zap,
  Star,
  Award,
  Target,
  Shield,
  ChevronDown,
  Filter,
  Clock,
  CalendarDays,
} from 'lucide-react';

// ────────────────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────────────────

interface MomentItem {
  id: string;
  kind: string;
  tier: string;
  label: string;
  detail: string | null;
  renderedKey: string | null;
  renderedAt: string | null;
  createdAt: string;
}

interface MomentsResponse {
  moments: MomentItem[];
  nextCursor: string | null;
  hasMore: boolean;
  kinds: string[];
  totalCount: number;
}

// ────────────────────────────────────────────────────────────────────────────
// Kind config — icons, colours, labels
// ────────────────────────────────────────────────────────────────────────────

interface KindConfig {
  icon: React.ReactNode;
  label: string;
  color: string; // Tailwind bg/text classes
}

const KIND_CONFIG: Record<string, KindConfig> = {
  twin_created: {
    icon: <Sparkles className="w-4 h-4" />,
    label: 'Twin Created',
    color: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
  },
  level_up: {
    icon: <Zap className="w-4 h-4" />,
    label: 'Level Up',
    color: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  },
  sim_complete: {
    icon: <Swords className="w-4 h-4" />,
    label: 'Simulation',
    color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  },
  achievement: {
    icon: <Award className="w-4 h-4" />,
    label: 'Achievement',
    color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  },
  coaching_hired: {
    icon: <Star className="w-4 h-4" />,
    label: 'Coaching Hired',
    color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  },
  coaching_expired: {
    icon: <Clock className="w-4 h-4" />,
    label: 'Coaching Expired',
    color: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  },
  attestation_milestone: {
    icon: <Shield className="w-4 h-4" />,
    label: 'Milestone',
    color: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
  },
  season_end: {
    icon: <Trophy className="w-4 h-4" />,
    label: 'Season End',
    color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  },
  record_broken: {
    icon: <Target className="w-4 h-4" />,
    label: 'Record Broken',
    color: 'bg-red-500/20 text-red-300 border-red-500/30',
  },
  match_imported: {
    icon: <CalendarDays className="w-4 h-4" />,
    label: 'Historical Match',
    color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  },
};

function getKindConfig(kind: string): KindConfig {
  return KIND_CONFIG[kind] ?? {
    icon: <Sparkles className="w-4 h-4" />,
    label: kind.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    color: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  };
}

// ────────────────────────────────────────────────────────────────────────────
// Tier badge
// ────────────────────────────────────────────────────────────────────────────

const TIER_STYLES: Record<string, string> = {
  standard: 'bg-slate-500/15 text-slate-400',
  premium: 'bg-amber-500/15 text-amber-400',
  streak_reward: 'bg-emerald-500/15 text-emerald-400',
  partner: 'bg-blue-500/15 text-blue-400',
  internal: 'bg-rose-500/15 text-rose-400',
};

// ────────────────────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────────────────────

interface SquadMomentsGalleryProps {
  subjectType: 'squad' | 'player';
  subjectId: string;
}

export default function SquadMomentsGallery({ subjectType, subjectId }: SquadMomentsGalleryProps) {
  const [moments, setMoments] = useState<MomentItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [kinds, setKinds] = useState<string[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeKindFilter, setActiveKindFilter] = useState<string | null>(null);

  const fetchMoments = useCallback(async (cursor?: string) => {
    const params = new URLSearchParams();
    params.set('limit', '30');
    if (cursor) params.set('cursor', cursor);
    if (activeKindFilter) params.set('kind', activeKindFilter);

    const res = await fetch(`/api/moments/${subjectType}/${subjectId}?${params}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to load moments' }));
      throw new Error(err.error || `Server error (${res.status})`);
    }
    return res.json() as Promise<MomentsResponse>;
  }, [subjectType, subjectId, activeKindFilter]);

  // Initial load — skip if no subjectId
  useEffect(() => {
    if (!subjectId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    fetchMoments()
      .then((data) => {
        setMoments(data.moments);
        setNextCursor(data.nextCursor);
        setHasMore(data.hasMore);
        setKinds(data.kinds);
        setTotalCount(data.totalCount);
      })
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [fetchMoments, subjectId]);

  const handleLoadMore = useCallback(async () => {
    if (!nextCursor || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const data = await fetchMoments(nextCursor);
      setMoments((prev) => [...prev, ...data.moments]);
      setNextCursor(data.nextCursor);
      setHasMore(data.hasMore);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more');
    } finally {
      setIsLoadingMore(false);
    }
  }, [nextCursor, isLoadingMore, fetchMoments]);

  const handleKindFilter = useCallback((kind: string | null) => {
    setActiveKindFilter(kind);
    setMoments([]);
    setNextCursor(null);
    setHasMore(false);
  }, []);

  // ── Empty state ──
  if (!isLoading && moments.length === 0 && !error) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-950">
        {/* Subtle grid overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.08)_0%,transparent_50%)]" />
        <div className="relative flex flex-col items-center text-center py-12 px-6">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
            <CalendarDays className="h-8 w-8 text-indigo-400" />
          </div>
          <h3 className="text-lg font-black uppercase tracking-tight text-white mb-2">
            No Moments Yet
          </h3>
          <p className="text-sm text-slate-400 max-w-sm">
            Moments appear here when twin events fire — level ups, simulations, and imported match history.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-black uppercase tracking-tight text-white">
            Moments
          </h2>
          {!isLoading && (
            <span className="text-xs text-slate-500 font-mono">
              {totalCount} total
            </span>
          )}
        </div>

        {/* Kind filter */}
        {kinds.length > 1 && (
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <div className="flex gap-1 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => handleKindFilter(null)}
                className={`whitespace-nowrap rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                  activeKindFilter === null
                    ? 'bg-white/15 text-white'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                }`}
              >
                All
              </button>
              {kinds.map((kind) => {
                const cfg = getKindConfig(kind);
                return (
                  <button
                    key={kind}
                    onClick={() => handleKindFilter(kind)}
                    className={`whitespace-nowrap rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors border ${
                      activeKindFilter === kind
                        ? cfg.color + ' border-current'
                        : 'bg-white/5 text-slate-400 hover:bg-white/10 border-transparent'
                    }`}
                  >
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs font-semibold text-red-200">
          {error}
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading && (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-xl bg-white/[0.04] border border-white/10"
            />
          ))}
        </div>
      )}

      {/* Moments list */}
      {!isLoading && moments.length > 0 && (
        <div className="space-y-1.5">
          <AnimatePresence mode="popLayout">
            {moments.map((moment) => {
              const kindCfg = getKindConfig(moment.kind);
              const tierStyle = TIER_STYLES[moment.tier] ?? TIER_STYLES.standard;

              // Parse W/L/D from label for match_imported moments
              const isMatch = moment.kind === 'match_imported';
              const matchResult = isMatch ? moment.label.match(/^([WLD])/) : null;

              return (
                <motion.div
                  key={moment.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="group flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 transition-all hover:border-white/[0.12] hover:bg-white/[0.04]"
                >
                  {/* Kind icon */}
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${kindCfg.color}`}>
                    {kindCfg.icon}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {/* W/L/D badge for match_imported */}
                      {isMatch && matchResult && (
                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                          matchResult[1] === 'W' ? 'bg-emerald-500/20 text-emerald-300' :
                          matchResult[1] === 'L' ? 'bg-red-500/20 text-red-300' :
                          'bg-yellow-500/20 text-yellow-300'
                        }`}>
                          {matchResult[1]}
                        </span>
                      )}
                      <span className="text-sm font-bold text-white truncate">
                        {moment.label}
                      </span>
                    </div>
                    {moment.detail && (
                      <p className="text-xs text-slate-500 mt-0.5 truncate">
                        {moment.detail}
                      </p>
                    )}
                  </div>

                  {/* Right side: date, tier, rendered image link */}
                  <div className="flex shrink-0 items-center gap-2">
                    {moment.tier !== 'standard' && (
                      <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${tierStyle}`}>
                        {moment.tier.replace('_', ' ')}
                      </span>
                    )}
                    {moment.renderedKey && (
                      <a
                        href={`/api/storage/${moment.renderedKey}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg bg-white/10 px-2 py-1 text-[9px] font-bold text-emerald-400 hover:bg-white/15 transition-colors"
                      >
                        View
                      </a>
                    )}
                    <span className="text-[10px] text-slate-600 whitespace-nowrap font-mono">
                      {formatDate(new Date(moment.createdAt))}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Load more */}
      {hasMore && (
        <div className="flex justify-center pt-2">
          <button
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-6 py-3 text-xs font-bold text-slate-300 hover:bg-white/15 transition-colors disabled:opacity-50 disabled:cursor-wait"
          >
            {isLoadingMore ? (
              'Loading...'
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Load more
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────

function formatDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;

  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}
