'use client';

import { useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  MapPin,
  Users,
  Wallet,
  Clock,
  ChevronRight,
  Zap,
  Shield,
  Target,
  Activity,
  Sparkles,
} from 'lucide-react';
import type { MiniAppContext } from './TelegramMiniAppShell';
import type { Player, PlayerPosition } from '@/types';
import { FORMATIONS, buildAutoLineup } from '@/lib/formations';
import { PitchCanvas } from '@/components/squad/PitchCanvas';

interface TelegramSquadDashboardProps {
  context: MiniAppContext;
  onNavigate?: (tab: 'match' | 'profile' | 'treasury') => void;
  onRefresh?: () => void;
}

// Form result component with color coding
function FormResult({ result, index }: { result: string; index: number }) {
  const colors = {
    W: 'bg-emerald-500 text-white',
    D: 'bg-amber-500 text-white',
    L: 'bg-rose-500 text-white',
  };

  const labels: Record<string, string> = { W: 'Win', D: 'Draw', L: 'Loss' };
  const label = labels[result] || result;

  return (
    <div
      className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold ${
        colors[result as keyof typeof colors] || 'bg-slate-600 text-slate-300'
      }`}
      style={{ animationDelay: `${index * 50}ms` }}
      aria-label={label}
    >
      {result}
      <span className="sr-only">{label}</span>
    </div>
  );
}

// Calculate form streak
function calculateStreak(form: string[]): { type: 'W' | 'D' | 'L' | 'none'; count: number } {
  if (form.length === 0) return { type: 'none', count: 0 };

  const firstResult = form[0] as 'W' | 'D' | 'L';
  let count = 0;

  for (const result of form) {
    if (result === firstResult) {
      count++;
    } else {
      break;
    }
  }

  return { type: firstResult, count };
}

// Calculate form points (W=3, D=1, L=0)
function calculateFormPoints(form: string[]): number {
  return form.reduce((sum, result) => {
    if (result === 'W') return sum + 3;
    if (result === 'D') return sum + 1;
    return sum;
  }, 0);
}

export function TelegramSquadDashboard({ context, onNavigate }: TelegramSquadDashboardProps) {
  const { squad, matches, treasury, player } = context;

  // Calculate form statistics
  const formStats = useMemo(() => {
    const streak = calculateStreak(squad.form);
    const points = calculateFormPoints(squad.form);
    const maxPoints = squad.form.length * 3;
    const percentage = maxPoints > 0 ? Math.round((points / maxPoints) * 100) : 0;

    return { streak, points, maxPoints, percentage };
  }, [squad.form]);

  // Get next match (first pending or first recent if no pending)
  const nextMatch = matches.pending[0];

  // Build player objects for pitch visualization
  const squadPlayers: Player[] = useMemo(() => {
    return squad.members.map((m) => ({
      id: m.userId,
      address: '',
      name: m.name || 'Player',
      position: (m.position || 'MF') as PlayerPosition,
      status: 'available' as const,
    }));
  }, [squad.members]);

  // Auto-assign players to 4-3-3 slots
  const squadPitchLineup: string[] = useMemo(() => {
    const roles = FORMATIONS['4-3-3'].map((s) => s.role);
    return buildAutoLineup(roles, squadPlayers);
  }, [squadPlayers]);

  // AI Insights based on context
  const aiInsights = useMemo(() => {
    const insights: Array<{ icon: typeof Zap; text: string; type: 'info' | 'warning' | 'success' }> = [];

    // Form-based insights
    if (formStats.streak.type === 'W' && formStats.streak.count >= 3) {
      insights.push({
        icon: TrendingUp,
        text: `${formStats.streak.count} wins in a row! Momentum is with you.`,
        type: 'success',
      });
    } else if (formStats.streak.type === 'L' && formStats.streak.count >= 2) {
      insights.push({
        icon: TrendingDown,
        text: `${formStats.streak.count} losses need addressing. Review tactics.`,
        type: 'warning',
      });
    }

    // Player fitness insight
    if (player && player.sharpness < 40) {
      insights.push({
        icon: Activity,
        text: `Your match sharpness is low (${player.sharpness}%). Log training to improve.`,
        type: 'warning',
      });
    }

    // Pending verifications
    if (matches.pending.length > 0) {
      insights.push({
        icon: Clock,
        text: `${matches.pending.length} match${matches.pending.length > 1 ? 'es' : ''} awaiting verification.`,
        type: 'info',
      });
    }

    // Treasury insight
    if (treasury.pendingTopUps > 0) {
      insights.push({
        icon: Wallet,
        text: `${treasury.pendingTopUps} treasury top-up${treasury.pendingTopUps > 1 ? 's' : ''} pending confirmation.`,
        type: 'info',
      });
    }

    // Default insight if none
    if (insights.length === 0) {
      insights.push({
        icon: Sparkles,
        text: 'Squad is in good shape. Ready for match day!',
        type: 'success',
      });
    }

    return insights.slice(0, 2); // Max 2 insights
  }, [formStats, player, matches.pending, treasury.pendingTopUps]);

  // Format relative date
  const _formatRelativeDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) return `In ${diffDays} days`;
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="space-y-4 p-4">
      {/* Form Card */}
      <section className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-800/50 to-slate-900/50 shadow-xl">
        <div className="border-b border-white/5 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Recent Form</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <span className="font-bold text-white">{formStats.points}</span>
              <span>/ {formStats.maxPoints} pts</span>
            </div>
          </div>
        </div>

        <div className="p-4">
          {/* Form Results */}
          <div className="flex items-center justify-center gap-2">
            {squad.form.length > 0 ? (
              squad.form.map((result, index) => (
                <FormResult key={index} result={result} index={index} />
              ))
            ) : (
              <p className="text-xs text-slate-500">No recent matches</p>
            )}
          </div>

          {/* Streak Info */}
          {formStats.streak.count >= 2 && formStats.streak.type !== 'none' && (
            <div className="mt-3 flex items-center justify-center gap-2">
              {formStats.streak.type === 'W' && <TrendingUp className="h-4 w-4 text-emerald-400" />}
              {formStats.streak.type === 'L' && <TrendingDown className="h-4 w-4 text-rose-400" />}
              {formStats.streak.type === 'D' && <Minus className="h-4 w-4 text-amber-400" />}
              <span className={`text-xs font-medium ${
                formStats.streak.type === 'W' ? 'text-emerald-400' :
                formStats.streak.type === 'L' ? 'text-rose-400' : 'text-amber-400'
              }`}>
                {formStats.streak.count} {formStats.streak.type === 'W' ? 'wins' : formStats.streak.type === 'L' ? 'losses' : 'draws'} in a row
              </span>
            </div>
          )}

          {/* Form Percentage Bar */}
          <div className="mt-4">
            <div
              className="h-1.5 overflow-hidden rounded-full bg-slate-700"
              role="progressbar"
              aria-valuenow={formStats.percentage}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Form points rate"
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
                style={{ width: `${formStats.percentage}%` }}
              />
            </div>
            <p className="mt-1 text-center text-[10px] text-slate-500">
              {formStats.percentage}% points rate from last {squad.form.length} matches
            </p>
          </div>
        </div>
      </section>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Next Match Card */}
        <button
          onClick={() => onNavigate?.('match')}
          className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-900/30 to-slate-900/50 p-4 text-left transition hover:border-cyan-400/30"
          aria-label="Next match details"
        >
          <div className="absolute right-2 top-2 opacity-0 transition group-hover:opacity-100">
            <ChevronRight className="h-4 w-4 text-cyan-400" />
          </div>

          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-400/10">
            <Calendar className="h-4 w-4 text-cyan-400" />
          </div>

          {nextMatch ? (
            <>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Next Match</p>
              <p className="mt-1 truncate text-sm font-bold text-white">vs {nextMatch.opponent}</p>
              <div className="mt-1 flex items-center gap-1.5">
                 <span className="flex h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                 <p className="text-[9px] font-black uppercase tracking-widest text-cyan-400">Tactical Ready</p>
              </div>
            </>
          ) : (
            <>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Next Match</p>
              <p className="mt-1 text-sm font-bold text-slate-400">No upcoming</p>
              <p className="mt-0.5 text-[10px] text-slate-500">Log a match to start</p>
            </>
          )}
        </button>

        {/* Treasury Card */}
        <button
          onClick={() => onNavigate?.('treasury')}
          className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-amber-900/30 to-slate-900/50 p-4 text-left transition hover:border-amber-400/30"
          aria-label="Treasury overview"
        >
          <div className="absolute right-2 top-2 opacity-0 transition group-hover:opacity-100">
            <ChevronRight className="h-4 w-4 text-amber-400" />
          </div>

          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-amber-400/10">
            <Wallet className="h-4 w-4 text-amber-400" />
          </div>

          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Treasury</p>
          <p className="mt-1 text-sm font-bold text-white">
            {treasury.balance.toLocaleString()} {treasury.currency}
          </p>
          {treasury.pendingTopUps > 0 && (
            <p className="mt-0.5 text-[10px] text-amber-400">
              {treasury.pendingTopUps} pending
            </p>
          )}
        </button>

        {/* Player Stats Card */}
        <button
          onClick={() => onNavigate?.('profile')}
          className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-emerald-900/30 to-slate-900/50 p-4 text-left transition hover:border-emerald-400/30"
          aria-label="Your season stats"
        >
          <div className="absolute right-2 top-2 opacity-0 transition group-hover:opacity-100">
            <ChevronRight className="h-4 w-4 text-emerald-400" />
          </div>

          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-400/10">
            <Target className="h-4 w-4 text-emerald-400" />
          </div>

          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Your Season</p>
          {player ? (
            <>
              <p className="mt-1 text-sm font-bold text-white">
                {player.stats.goals}G / {player.stats.assists}A
              </p>
              <p className="mt-0.5 text-[10px] text-slate-400">{player.stats.matches} matches</p>
            </>
          ) : (
            <p className="mt-1 text-sm font-bold text-slate-400">No stats yet</p>
          )}
        </button>

        {/* Squad Card */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-purple-900/30 to-slate-900/50 p-4">
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-purple-400/10">
            <Users className="h-4 w-4 text-purple-400" />
          </div>

          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Squad</p>
          <p className="mt-1 text-sm font-bold text-white">{squad.memberCount} players</p>
          <p className="mt-0.5 text-[10px] text-slate-400">
            {squad.members.filter(m => m.role === 'captain').length} captain
            {squad.members.filter(m => m.role === 'vice_captain').length > 0 && ', 1 vice'}
          </p>
        </div>
      </div>

      {/* Formation Pitch */}
      {squad.memberCount >= 3 && (
        <section className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-green-900/20 to-slate-900/50">
          <div className="border-b border-white/5 px-4 py-3">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-green-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Formation</span>
              <span className="ml-auto text-xs text-slate-500">4-3-3</span>
            </div>
          </div>
          <div className="p-4">
            <PitchCanvas
              formation="4-3-3"
              lineup={squadPitchLineup}
              players={squadPlayers}
              readOnly
              size="sm"
              showPlayerNames
            />
          </div>
        </section>
      )}

      {/* AI Insights Card */}
      <section className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-violet-900/20 to-slate-900/50">
        <div className="border-b border-white/5 px-4 py-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-violet-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">AI Staff Insights</span>
          </div>
        </div>

        <div className="space-y-2 p-4">
          {aiInsights.map((insight, index) => {
            const Icon = insight.icon;
            return (
              <div
                key={index}
                className={`flex items-start gap-3 rounded-xl border p-3 ${
                  insight.type === 'success'
                    ? 'border-emerald-500/20 bg-emerald-500/5'
                    : insight.type === 'warning'
                    ? 'border-amber-500/20 bg-amber-500/5'
                    : 'border-cyan-500/20 bg-cyan-500/5'
                }`}
              >
                <div className={`mt-0.5 rounded-lg p-1.5 ${
                  insight.type === 'success'
                    ? 'bg-emerald-500/10'
                    : insight.type === 'warning'
                    ? 'bg-amber-500/10'
                    : 'bg-cyan-500/10'
                }`}>
                  <Icon className={`h-3.5 w-3.5 ${
                    insight.type === 'success'
                      ? 'text-emerald-400'
                      : insight.type === 'warning'
                      ? 'text-amber-400'
                      : 'text-cyan-400'
                  }`} />
                </div>
                <p className="flex-1 text-xs leading-relaxed text-slate-300">{insight.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Pending Verifications Alert */}
      {matches.pending.length > 0 && (
        <button
          onClick={() => onNavigate?.('match')}
          className="group flex w-full items-center gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 text-left transition hover:border-rose-500/40"
          aria-label={`${matches.pending.length} match${matches.pending.length > 1 ? 'es' : ''} need verification`}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10">
            <Shield className="h-5 w-5 text-rose-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-white">
              {matches.pending.length} match{matches.pending.length > 1 ? 'es' : ''} need verification
            </p>
            <p className="mt-0.5 text-xs text-slate-400">
              Tap to verify and earn XP
            </p>
          </div>
          <ChevronRight className="h-5 w-5 text-slate-500 transition group-hover:text-rose-400" />
        </button>
      )}

      {/* Squad Home Ground */}
      {squad.homeGround && (
        <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/5 px-4 py-3">
          <MapPin className="h-4 w-4 text-slate-500" />
          <span className="text-xs text-slate-400">Home: {squad.homeGround}</span>
        </div>
      )}
    </div>
  );
}

export default TelegramSquadDashboard;
