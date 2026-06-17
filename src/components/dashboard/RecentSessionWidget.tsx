'use client';

import React from 'react';
import Link from 'next/link';
import { CalendarDays, Users, Swords, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { trpc } from '@/lib/trpc-client';

interface SessionMatch {
  id: string;
  homeScore: number | null;
  awayScore: number | null;
  status: string;
}

interface SessionData {
  id: string;
  name: string;
  date: Date | string;
  status: string;
  attendeeCount: number;
  matchCount: number;
  matches: SessionMatch[];
}

export function RecentSessionWidget({ squadId }: { squadId: string | undefined }) {
  const { data: sessions, isLoading } = trpc.session.listBySquadWithMatches.useQuery(
    { squadId: squadId || '', limit: 1 },
    { enabled: !!squadId, staleTime: 15_000 },
  );

  const session: SessionData | undefined = sessions?.[0] as SessionData | undefined;

  if (isLoading) {
    return (
      <Card>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
            <div className="h-3 w-24 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
          </div>
        </div>
        <div className="h-14 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
      </Card>
    );
  }

  if (!session) {
    return (
      <Card>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
            <CalendarDays className="w-5 h-5 text-violet-600 dark:text-violet-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Recent Sessions</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">No sessions yet</p>
          </div>
          <Link
            href="/sessions"
            className="text-[10px] font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400 hover:text-violet-500 transition-colors"
          >
            New
          </Link>
        </div>
      </Card>
    );
  }

  const totalGoals = session.matches.reduce(
    (sum: number, m: SessionMatch) => sum + (m.homeScore ?? 0) + (m.awayScore ?? 0),
    0,
  );
  const recentMatch = session.matches[session.matches.length - 1];

  const dateLabel = new Date(session.date).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <Card>
      <Link href={`/sessions/${session.id}`} className="block">
        <div className="flex items-start gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center shrink-0 shadow-lg shadow-violet-500/20">
            <CalendarDays className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                {session.name}
              </h3>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{dateLabel}</p>
          </div>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
              session.status === 'completed'
                ? 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                : session.status === 'balanced'
                ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
            }`}
          >
            {session.status}
          </span>
        </div>

        {/* Quick stats row */}
        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-2">
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {session.attendeeCount}
          </span>
          <span className="flex items-center gap-1">
            <Swords className="w-3 h-3" />
            {session.matchCount} match{session.matchCount === 1 ? '' : 'es'}
          </span>
          <span className="text-gray-300 dark:text-gray-600">·</span>
          <span className="font-semibold text-gray-700 dark:text-gray-300">
            {totalGoals} goal{totalGoals === 1 ? '' : 's'}
          </span>
        </div>

        {/* Mini match pills or latest result */}
        {session.matches.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            {session.matches.slice(-4).map((m: SessionMatch) => {
              const isSettled = m.status === 'verified' || m.status === 'finalized';
              const isPending = m.status === 'pending';
              return (
                <span
                  key={m.id}
                  className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold ${
                    isSettled
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                      : isPending
                      ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {m.homeScore ?? '?'}:{m.awayScore ?? '?'}
                </span>
              );
            })}
          </div>
        )}

        {session.matches.length === 0 && (
          <p className="text-xs text-gray-400 italic">No matches recorded yet</p>
        )}

        {/* Bottom action: recent match highlight */}
        {recentMatch && (recentMatch.homeScore !== null || recentMatch.awayScore !== null) && (
          <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <span className="text-[10px] text-gray-400">
              Latest: {recentMatch.homeScore ?? '?'} - {recentMatch.awayScore ?? '?'}
              {recentMatch.status === 'verified' && (
                <span className="ml-1 text-emerald-500">✓</span>
              )}
            </span>
            <span className="text-[10px] font-bold text-violet-600 dark:text-violet-400">
              View session →
            </span>
          </div>
        )}
      </Link>
    </Card>
  );
}
