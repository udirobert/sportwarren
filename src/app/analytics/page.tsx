"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Target, BarChart3, TrendingUp, TrendingDown, Minus, Star, RefreshCcw, Trash2 } from "lucide-react";
import { trpc } from "@/lib/trpc-client";
import { useWallet } from "@/contexts/WalletContext";
import { usePlayerAttributes } from "@/hooks/player/usePlayerAttributes";
import { TrpcErrorBoundary } from "@/components/ui/TrpcErrorBoundary";
import {
  clearStoredEvents,
  getCoreGrowthRecords,
  getStoredEvents,
  type AnalyticsEvent,
  type CoreGrowthEvent,
} from "@/lib/analytics";

const FUNNEL_STEPS: Array<{
  id: CoreGrowthEvent;
  label: string;
  summary: string;
}> = [
  {
    id: "first_match_submitted",
    label: "Activation",
    summary: "First match submitted",
  },
  {
    id: "opponent_verification_invite_shared",
    label: "Viral Trigger",
    summary: "Opponent invite shared",
  },
  {
    id: "channel_connected",
    label: "Retention",
    summary: "First channel connected",
  },
  {
    id: "identity_connected",
    label: "Conversion",
    summary: "Identity connected",
  },
];

const formatPercent = (value: number): string => `${Math.round(value * 100)}%`;

function AnalyticsPageInner() {
  const { address } = useWallet();
  const { attributes, loading: loadingAttrs } = usePlayerAttributes();
  const { data: form, isLoading: loadingForm } = trpc.player.getForm.useQuery(
    { userId: address!, limit: 10 },
    { enabled: !!address }
  );
  const { data: leaderboard } = trpc.player.getLeaderboard.useQuery({ type: 'matches', limit: 5 });
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);

  const avgRating = form && form.length > 0
    ? (form.reduce((sum: number, f: { rating: number }) => sum + f.rating, 0) / form.length).toFixed(1)
    : null;

  const refreshLocalAnalytics = useCallback(() => {
    setEvents(getStoredEvents());
  }, []);

  useEffect(() => {
    refreshLocalAnalytics();
    const handleAnalyticsUpdate = () => refreshLocalAnalytics();
    window.addEventListener("sw-analytics-updated", handleAnalyticsUpdate);
    window.addEventListener("storage", handleAnalyticsUpdate);
    return () => {
      window.removeEventListener("sw-analytics-updated", handleAnalyticsUpdate);
      window.removeEventListener("storage", handleAnalyticsUpdate);
    };
  }, [refreshLocalAnalytics]);

  const growthRecords = useMemo(() => getCoreGrowthRecords(events), [events]);
  const trackedSessions = useMemo(() => new Set(events.map((event) => event.sessionId)).size, [events]);
  const latestEventTimestamp = useMemo(
    () => events.reduce((latest, event) => Math.max(latest, event.timestamp), 0),
    [events],
  );

  const funnelRows = useMemo(() => {
    const stepCounts = FUNNEL_STEPS.map((step) => {
      const sessionCount = new Set(
        growthRecords
          .filter((record) => record.event === step.id)
          .map((record) => record.sessionId),
      ).size;
      return {
        ...step,
        sessionCount,
      };
    });

    return stepCounts.map((step, index) => {
      const previousCount = index === 0 ? trackedSessions : stepCounts[index - 1].sessionCount;
      const conversionFromPrevious = previousCount > 0 ? step.sessionCount / previousCount : 0;
      const conversionFromStart = trackedSessions > 0 ? step.sessionCount / trackedSessions : 0;
      const dropoffFromPrevious = Math.max(previousCount - step.sessionCount, 0);
      return {
        ...step,
        conversionFromPrevious,
        conversionFromStart,
        dropoffFromPrevious,
      };
    });
  }, [growthRecords, trackedSessions]);

  const recentGrowthRecords = useMemo(
    () => [...growthRecords].sort((a, b) => b.timestamp - a.timestamp).slice(0, 8),
    [growthRecords],
  );

  const handleClearLocalAnalytics = () => {
    clearStoredEvents();
    setEvents([]);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 pb-24 md:pb-6 space-y-4 text-gray-900 dark:text-gray-100">
      {/* Contextual nav */}
      <Card className="border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 py-3">
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

      <Card className="border-emerald-200 bg-emerald-50/70">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-lg font-bold text-emerald-900">Growth Funnel Snapshot</h2>
            <p className="text-sm text-emerald-700">
              Local conversion telemetry from this browser session history.
            </p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={refreshLocalAnalytics} className="flex items-center gap-1.5">
              <RefreshCcw className="w-3.5 h-3.5" />
              Refresh
            </Button>
            <Button size="sm" variant="outline" onClick={handleClearLocalAnalytics} className="flex items-center gap-1.5">
              <Trash2 className="w-3.5 h-3.5" />
              Clear Local Events
            </Button>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-emerald-200 bg-white px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Tracked Sessions</p>
            <p className="text-2xl font-black text-gray-900 mt-1">{trackedSessions}</p>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-white px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Core Growth Events</p>
            <p className="text-2xl font-black text-gray-900 mt-1">{growthRecords.length}</p>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-white px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Latest Event</p>
            <p className="text-sm font-semibold text-gray-900 mt-1">
              {latestEventTimestamp > 0 ? new Date(latestEventTimestamp).toLocaleString() : "No events yet"}
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {funnelRows.map((row, index) => (
            <div key={row.id} className="rounded-xl border border-emerald-200 bg-white px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">
                    Step {index + 1} • {row.label}
                  </p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{row.summary}</p>
                </div>
                <p className="text-xl font-black text-gray-900">{row.sessionCount}</p>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-500">From Prev</p>
                  <p className="text-sm font-bold text-gray-900">{formatPercent(row.conversionFromPrevious)}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-500">From Start</p>
                  <p className="text-sm font-bold text-gray-900">{formatPercent(row.conversionFromStart)}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-500">Drop-off</p>
                  <p className="text-sm font-bold text-rose-600">{row.dropoffFromPrevious}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-xl border border-emerald-200 bg-white px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Recent Growth Events</p>
          {recentGrowthRecords.length === 0 ? (
            <p className="text-sm text-gray-600">
              No growth events captured yet. Start with <Link href="/match?mode=capture" className="text-emerald-700 font-semibold">Submit a Match</Link>.
            </p>
          ) : (
            <div className="space-y-2">
              {recentGrowthRecords.map((record, index) => (
                <div key={`${record.sessionId}-${record.timestamp}-${index}`} className="flex flex-col gap-1 rounded-lg border border-gray-100 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold text-gray-900">{record.event}</p>
                    <p className="text-[11px] text-gray-500">{record.stage} • source: {String(record.properties.source ?? "unknown")}</p>
                  </div>
                  <p className="text-[11px] text-gray-500">{new Date(record.timestamp).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
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
                <p className="text-sm font-medium text-gray-700">No form data yet.</p>
                <p className="text-xs text-gray-500 mt-1">Play your first match to start tracking your form and rating trend.</p>
                <Link href="/match?mode=capture"><Button size="sm" className="mt-3">Log Your First Match</Button></Link>
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
                <p className="text-sm font-medium text-gray-700">No attributes yet.</p>
                <p className="text-xs text-gray-500 mt-1">Verified matches unlock skill ratings — goals, assists, and clean sheets each improve different attributes.</p>
                <Link href="/match?mode=capture"><Button size="sm" className="mt-3">Submit a Match</Button></Link>
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
              <div className="text-center py-6">
                <p className="text-sm font-medium text-gray-700">No active players yet.</p>
                <p className="text-xs text-gray-500 mt-1">Submit a verified match result — your squad will appear here.</p>
                <Link href="/match?mode=capture"><Button size="sm" className="mt-3">Be the First</Button></Link>
              </div>
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
