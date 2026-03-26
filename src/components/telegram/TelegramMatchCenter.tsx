'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Trophy,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  Loader2,
  AlertCircle,
  Zap,
  Users,
  Shield,
  Star,
  TrendingUp,
  Cpu,
} from 'lucide-react';
import type { MiniAppContext, PendingMatch, RecentMatch } from './TelegramMiniAppShell';

interface TelegramMatchCenterProps {
  context: MiniAppContext;
  onRefresh?: () => void;
}

type ViewMode = 'overview' | 'submit' | 'verify' | 'details';

interface MatchSubmissionForm {
  opponentName: string;
  homeScore: string;
  awayScore: string;
  isHome: boolean;
  matchDate?: string;
}

interface VerificationXPSummary {
  totalXP: number;
  attributeGains: Array<{
    attribute: string;
    xp: number;
    oldRating: number;
    newRating: number;
  }>;
}

// Score input component
function ScoreInput({
  value,
  onChange,
  label,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  disabled?: boolean;
}) {
  const increment = () => {
    const current = parseInt(value) || 0;
    if (current < 20) {
      onChange(String(current + 1));
      window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('light');
    }
  };

  const decrement = () => {
    const current = parseInt(value) || 0;
    if (current > 0) {
      onChange(String(current - 1));
      window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('light');
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={decrement}
          disabled={disabled || (parseInt(value) || 0) <= 0}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-700 text-lg font-bold text-white transition hover:bg-slate-600 disabled:opacity-50"
        >
          -
        </button>
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800 text-2xl font-black text-white">
          {value || '0'}
        </div>
        <button
          type="button"
          onClick={increment}
          disabled={disabled}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-700 text-lg font-bold text-white transition hover:bg-slate-600 disabled:opacity-50"
        >
          +
        </button>
      </div>
    </div>
  );
}

// Match result badge
function ResultBadge({ match, squadId: _squadId }: { match: PendingMatch | RecentMatch; squadId: string }) {
  const ourScore = match.isHome ? match.homeScore : match.awayScore;
  const theirScore = match.isHome ? match.awayScore : match.homeScore;

  if (ourScore === null || theirScore === null) {
    return <span className="text-xs text-slate-500">Pending</span>;
  }

  const result = ourScore > theirScore ? 'W' : ourScore < theirScore ? 'L' : 'D';
  const colors = {
    W: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    D: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    L: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  };

  return (
    <span className={`rounded-lg border px-2 py-0.5 text-xs font-bold ${colors[result]}`}>
      {result}
    </span>
  );
}

// Verification progress indicator
function VerificationProgress({ current, required, trustScore }: { current: number; required: number; trustScore?: number }) {
  const percentage = Math.min((current / required) * 100, 100);
  
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Users className="h-3 w-3 text-slate-500" />
          <span className="text-[10px] font-medium text-slate-400">
            Consensus: {current}/{required} captains
          </span>
        </div>
        {trustScore !== undefined && (
          <div className="flex items-center gap-1">
            <Shield className={`h-3 w-3 ${trustScore >= 80 ? 'text-emerald-400' : trustScore >= 50 ? 'text-amber-400' : 'text-slate-500'}`} />
            <span className="text-[10px] font-bold text-slate-400">{trustScore}% Trust</span>
          </div>
        )}
      </div>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-700/50">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            percentage >= 100 ? 'bg-gradient-to-r from-emerald-500 to-cyan-500' : 'bg-slate-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export function TelegramMatchCenter({ context, onRefresh }: TelegramMatchCenterProps) {
  const { squad, matches } = context;
  const [hasTelegramWebApp, setHasTelegramWebApp] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [submitting, setSubmitting] = useState(false);
  const [verifying, setVerifying] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [verificationNote, setVerificationNote] = useState<string | null>(null);
  const [lastXPSummary, setLastXPSummary] = useState<VerificationXPSummary | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<RecentMatch | null>(null);

  const [form, setForm] = useState<MatchSubmissionForm>({
    opponentName: '',
    homeScore: '0',
    awayScore: '0',
    isHome: true,
  });
  const [opponentSuggestions, setOpponentSuggestions] = useState<Array<{ id: string; name: string; shortName: string | null }>>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  useEffect(() => {
    setHasTelegramWebApp(Boolean(window.Telegram?.WebApp));
  }, []);

  useEffect(() => {
    if (viewMode !== 'submit') {
      return;
    }

    const query = form.opponentName.trim();
    if (query.length < 2) {
      setOpponentSuggestions([]);
      return;
    }

    const token = new URLSearchParams(window.location.search).get('token');
    if (!token) {
      setOpponentSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      try {
        setLoadingSuggestions(true);
        const response = await fetch(
          `/api/telegram/mini-app/match/opponents?token=${encodeURIComponent(token)}&q=${encodeURIComponent(query)}`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          setOpponentSuggestions([]);
          return;
        }

        const data = await response.json();
        setOpponentSuggestions(Array.isArray(data?.opponents) ? data.opponents : []);
      } catch {
        setOpponentSuggestions([]);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 180);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [form.opponentName, viewMode]);

  const selectOpponent = (name: string) => {
    setForm((prev) => ({ ...prev, opponentName: name }));
    setOpponentSuggestions([]);
    window.Telegram?.WebApp?.HapticFeedback?.selectionChanged();
  };

  // Handle match submission (extracted for MainButton availability)
  const handleSubmitInternal = useCallback(async () => {
    if (!form.opponentName.trim()) {
      setError('Please enter the opponent name');
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('error');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);
    setVerificationNote(null);

    // Provide feedback if button is MainButton
    window.Telegram?.WebApp?.MainButton?.showProgress();

    try {
      const searchParams = new URLSearchParams(window.location.search);
      const token = searchParams.get('token');

      const response = await fetch('/api/telegram/mini-app/match/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          opponentName: form.opponentName.trim(),
          homeScore: parseInt(form.isHome ? form.homeScore : form.awayScore) || 0,
          awayScore: parseInt(form.isHome ? form.awayScore : form.homeScore) || 0,
          isHome: form.isHome,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit match');
      }

      setSuccess('Match submitted for verification!');
      setLastXPSummary(null);
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');

      // Reset form and go back to overview
      setForm({ opponentName: '', homeScore: '0', awayScore: '0', isHome: true });
      setTimeout(() => {
        setViewMode('overview');
        setSuccess(null);
        onRefresh?.();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit match');
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('error');
    } finally {
      setSubmitting(false);
      window.Telegram?.WebApp?.MainButton?.hideProgress();
    }
  }, [form.opponentName, form.homeScore, form.awayScore, form.isHome, setError, setSubmitting, setSuccess, setVerificationNote, onRefresh]);

  // Integration with Telegram native buttons
  useEffect(() => {
    const webApp = window.Telegram?.WebApp;
    if (!webApp) return;

    // Back Button integration
    const handleBack = () => {
      setViewMode('overview');
      webApp.HapticFeedback.impactOccurred('light');
    };

    if (viewMode !== 'overview') {
      webApp.BackButton.show();
      webApp.BackButton.onClick(handleBack);
    } else {
      webApp.BackButton.hide();
      webApp.BackButton.offClick(handleBack);
    }

    // Main Button integration (for submission)
    if (viewMode === 'submit' && form.opponentName.trim() && !submitting) {
      webApp.MainButton.setText('SUBMIT RESULT');
      webApp.MainButton.onClick(handleSubmitInternal);
      webApp.MainButton.enable();
      webApp.MainButton.show();
    } else {
      webApp.MainButton.hide();
      webApp.MainButton.offClick(handleSubmitInternal);
    }

    return () => {
      webApp.BackButton.offClick(handleBack);
      webApp.MainButton.offClick(handleSubmitInternal);
    };
  }, [viewMode, form.opponentName, submitting, handleSubmitInternal]);

  // Aggregate stats from recent matches
  const recentStats = useMemo(() => {
    let wins = 0, draws = 0, losses = 0, goalsFor = 0, goalsAgainst = 0;

    matches.recent.forEach(match => {
      const ourScore = match.isHome ? match.homeScore : match.awayScore;
      const theirScore = match.isHome ? match.awayScore : match.homeScore;

      if (ourScore !== null && theirScore !== null) {
        goalsFor += ourScore;
        goalsAgainst += theirScore;

        if (ourScore > theirScore) wins++;
        else if (ourScore < theirScore) losses++;
        else draws++;
      }
    });

    return { wins, draws, losses, goalsFor, goalsAgainst, total: matches.recent.length };
  }, [matches.recent]);

  // Format relative date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  const formatAttributeLabel = (attribute: string) =>
    attribute
      .split('_')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');

  // Handle match verification
  const handleVerify = async (matchId: string, approve: boolean) => {
    setVerifying(matchId);
    setError(null);
    setSuccess(null);
    setVerificationNote(null);
    setLastXPSummary(null);

    try {
      const searchParams = new URLSearchParams(window.location.search);
      const token = searchParams.get('token');

      const response = await fetch('/api/telegram/mini-app/match/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          matchId,
          verified: approve,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify match');
      }

      if (data.xpSummary?.totalXP) {
        setLastXPSummary(data.xpSummary as VerificationXPSummary);
      }

      if (data.newStatus === 'verified') {
        setSuccess(
          data.xpSummary?.totalXP
            ? `Consensus reached! +${data.xpSummary.totalXP} XP awarded.`
            : 'Match verified successfully.',
        );
      } else if (data.newStatus === 'disputed') {
        setSuccess('Match marked as disputed.');
      } else {
        setSuccess('Verification recorded. Awaiting opposing team captain.');
      }

      if (data.requiresYellowSettlement) {
        setVerificationNote(
          'Yellow match-fee settlement is pending final blockchain resolution.',
        );
      }

      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');
      onRefresh?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify match');
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('error');
    } finally {
      setVerifying(null);
    }
  };

  // Open details for a recent match
  const openDetails = (match: RecentMatch) => {
    setSelectedMatch(match);
    setViewMode('details');
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('light');
  };

  // Render match submission form
  if (viewMode === 'submit') {
    return (
      <div className="p-4 pb-20">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={() => setViewMode('overview')}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-slate-400 transition hover:bg-white/10 hover:text-white"
          >
            ←
          </button>
          <div>
            <h2 className="text-lg font-bold text-white">Log Match Result</h2>
            <p className="text-xs text-slate-400">Manual result entry for verification</p>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* Opponent Input */}
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
              Opponent Squad
            </label>
            <input
              type="text"
              value={form.opponentName}
              onChange={(e) => setForm({ ...form, opponentName: e.target.value })}
              placeholder="Enter exact squad name..."
              className="w-full rounded-2xl border border-white/10 bg-slate-800/50 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-emerald-500/50 focus:outline-none transition-shadow"
            />
            {loadingSuggestions && (
              <p className="mt-2 text-[11px] text-slate-500">Searching squads...</p>
            )}
            {!loadingSuggestions && opponentSuggestions.length > 0 && (
              <div className="mt-2 space-y-1 rounded-xl border border-white/10 bg-slate-900/80 p-2">
                {opponentSuggestions.map((opponent) => (
                  <button
                    key={opponent.id}
                    type="button"
                    onClick={() => selectOpponent(opponent.name)}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs text-slate-200 transition hover:bg-white/5"
                  >
                    <span className="font-medium">{opponent.name}</span>
                    {opponent.shortName && <span className="text-[10px] text-slate-500">{opponent.shortName}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Home/Away Toggle */}
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
              Venue
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setForm({ ...form, isHome: true })}
                className={`flex-1 rounded-xl border py-3 text-sm font-bold transition-all ${
                  form.isHome
                    ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_-5px_rgba(16,185,129,0.3)]'
                    : 'border-white/10 bg-slate-800/50 text-slate-400 hover:border-white/20'
                }`}
              >
                Home
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, isHome: false })}
                className={`flex-1 rounded-xl border py-3 text-sm font-bold transition-all ${
                  !form.isHome
                    ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400 shadow-[0_0_15px_-5px_rgba(6,182,212,0.3)]'
                    : 'border-white/10 bg-slate-800/50 text-slate-400 hover:border-white/20'
                }`}
              >
                Away
              </button>
            </div>
          </div>

          {/* Score Input */}
          <div className="rounded-2xl border border-white/10 bg-slate-800/30 p-6">
            <div className="flex items-center justify-center gap-8">
              <ScoreInput
                value={form.homeScore}
                onChange={(v) => setForm({ ...form, homeScore: v })}
                label={form.isHome ? squad.name : form.opponentName || 'Opponent'}
                disabled={submitting}
              />
              <div className="text-2xl font-black text-slate-700">-</div>
              <ScoreInput
                value={form.awayScore}
                onChange={(v) => setForm({ ...form, awayScore: v })}
                label={form.isHome ? form.opponentName || 'Opponent' : squad.name}
                disabled={submitting}
              />
            </div>
          </div>

          {/* Fail-safe button for users who don't see MainButton */}
          {!hasTelegramWebApp && (
            <button
              onClick={handleSubmitInternal}
              disabled={submitting || !form.opponentName.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-4 text-sm font-black text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Submit Result
            </button>
          )}

          <div className="flex items-center gap-2 justify-center text-[10px] text-slate-500 uppercase tracking-widest font-bold">
            <Shield className="h-3 w-3" />
            Consensus and Trust Oracles active
          </div>
        </div>
      </div>
    );
  }

  // Handle match details view
  if (viewMode === 'details' && selectedMatch) {
    const isHome = selectedMatch.isHome;
    const ourScore = isHome ? selectedMatch.homeScore : selectedMatch.awayScore;
    const theirScore = isHome ? selectedMatch.awayScore : selectedMatch.homeScore;
    const result = ourScore! > theirScore! ? 'W' : ourScore! < theirScore! ? 'L' : 'D';
    
    return (
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewMode('overview')}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-slate-400 transition hover:bg-white/10 hover:text-white"
          >
            ←
          </button>
          <div>
            <h2 className="text-lg font-bold text-white">Match Resolution</h2>
            <p className="text-xs text-slate-400">{selectedMatch.status.toUpperCase()} • {formatDate(selectedMatch.matchDate)}</p>
          </div>
        </div>

        {/* Result Card */}
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/50 shadow-2xl">
           <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-4 py-8 flex items-center justify-center gap-8 text-center">
             <div className="flex-1">
               <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{isHome ? squad.name : selectedMatch.opponent}</p>
               <p className={`text-4xl font-black ${isHome && result === 'W' ? 'text-emerald-400' : 'text-white'}`}>{selectedMatch.homeScore}</p>
             </div>
             <div className="text-slate-700 font-bold text-2xl">VS</div>
             <div className="flex-1">
               <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{!isHome ? squad.name : selectedMatch.opponent}</p>
               <p className={`text-4xl font-black ${!isHome && result === 'W' ? 'text-emerald-400' : 'text-white'}`}>{selectedMatch.awayScore}</p>
             </div>
           </div>
           
           <div className="px-4 py-4 border-t border-white/5 grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-cyan-400" />
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Trust Engine</p>
                  <p className="text-sm font-bold text-white">{selectedMatch.trustScore}% Score</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-400" />
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase">XP Awarded</p>
                  <p className="text-sm font-bold text-white">+{selectedMatch.xpGained || 0} XP</p>
                </div>
              </div>
           </div>
        </div>

        {/* Verification Engine Logs (Mini version of web commentary) */}
        <section className="bg-black/40 rounded-2xl border border-cyan-500/20 p-4 font-mono">
           <div className="flex items-center gap-2 mb-3">
             <Cpu className="h-3 w-3 text-cyan-400 animate-pulse" />
             <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-[0.2em]">Verification Logs</span>
           </div>
           
           <div className="space-y-1.5 text-[10px]">
             <p className="text-slate-500"><span className="text-slate-600">[OK]</span> Initializing phygital consensus node...</p>
             <p className="text-slate-500"><span className="text-slate-600">[OK]</span> Verifying GPS geofence benchmarks...</p>
             {selectedMatch.verificationDetails?.weather && (
               <p className="text-cyan-400/80"><span className="text-cyan-500">[*]</span> Weather Oracle: {selectedMatch.verificationDetails.weather.temperature}°C, {selectedMatch.verificationDetails.weather.conditions}</p>
             )}
             <p className="text-emerald-400"><span className="text-emerald-500">[OK]</span> Score consensus reached between captains.</p>
             <p className="text-white font-bold mt-2 pt-2 border-t border-white/5">RESULT IMMUTABLE • XP MINTED</p>
           </div>
        </section>

        <button
          onClick={() => setViewMode('overview')}
          className="w-full rounded-2xl bg-white/5 border border-white/10 py-4 text-sm font-bold text-slate-300 hover:bg-white/10 transition"
        >
          Back to Center
        </button>
      </div>
    );
  }

  // Main overview
  return (
    <div className="space-y-4 p-4">
      {/* Quick Stats Header */}
      <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#09111f] p-4 shadow-xl">
        <div className="absolute -right-4 -top-8 h-32 w-32 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -left-4 -bottom-8 h-32 w-32 rounded-full bg-cyan-500/10 blur-3xl" />
        
        <div className="relative flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Season Record</h2>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">{recentStats.wins}-{recentStats.draws}-{recentStats.losses}</span>
              <span className="text-[10px] font-bold text-slate-500 capitalize">{recentStats.total} Matches</span>
            </div>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 p-0.5 shadow-lg shadow-emerald-500/20">
            <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-[#09111f]">
               <Trophy className="h-6 w-6 text-emerald-400" />
            </div>
          </div>
        </div>
      </section>

      {/* Log Match Button */}
      <button
        onClick={() => {
          setViewMode('submit');
          setError(null);
          setSuccess(null);
          setVerificationNote(null);
          setLastXPSummary(null);
          window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('medium');
        }}
        className="group flex w-full items-center gap-4 rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 to-transparent p-5 transition shadow-sm hover:shadow-emerald-500/10 active:scale-[0.98]"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 group-hover:bg-emerald-500/30 transition-colors">
          <Plus className="h-6 w-6 text-emerald-400" />
        </div>
        <div className="flex-1 text-left">
          <p className="font-black text-white text-base">Log Result</p>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Submit new match</p>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 transition group-hover:bg-emerald-500/20">
          <ChevronRight className="h-5 w-5 text-slate-500 transition group-hover:text-emerald-400" />
        </div>
      </button>

      {(success || verificationNote || lastXPSummary) && (
        <section className="space-y-3 rounded-2xl border border-white/10 bg-slate-900/60 p-4 shadow-inner">
          {success && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/5 px-4 py-3 text-sm font-medium text-emerald-300">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400/10 shrink-0">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              {success}
            </div>
          )}

          {verificationNote && (
            <div className="flex items-center gap-2 rounded-xl border border-amber-400/20 bg-amber-400/5 px-4 py-3 text-sm font-medium text-amber-300">
               <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-400/10 shrink-0">
                <AlertCircle className="h-4 w-4" />
              </div>
              {verificationNote}
            </div>
          )}

          {lastXPSummary && (
            <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4 animate-in fade-in slide-in-from-top-4">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/15">
                    <TrendingUp className="h-5 w-5 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400/80">XP Reward Summary</h3>
                    <p className="text-xl font-black text-white">+{lastXPSummary.totalXP} TOTAL XP</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {lastXPSummary.attributeGains.map((gain) => (
                  <div
                    key={`${gain.attribute}-${gain.xp}`}
                    className="flex items-center justify-between rounded-xl border border-white/5 bg-slate-800/50 px-3 py-2.5"
                  >
                    <div>
                      <p className="text-xs font-bold text-white uppercase tracking-wider">
                        {formatAttributeLabel(gain.attribute)}
                      </p>
                      <div className="mt-0.5 flex items-center gap-2">
                         <span className="text-[10px] font-black text-cyan-400">+{gain.xp} XP</span>
                         <span className="text-[10px] text-slate-500">•</span>
                         <span className="text-[10px] text-slate-500">{gain.oldRating} → {gain.newRating}</span>
                      </div>
                    </div>
                    {gain.newRating > gain.oldRating && (
                      <div className="flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-amber-400 border border-amber-500/20">
                        <Star className="h-3 w-3 fill-amber-500/50" />
                        Level Up
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Pending Verification */}
      {matches.pending.length > 0 && (
        <section className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900 to-[#09111f]">
          <div className="border-b border-white/5 px-4 py-3 bg-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-cyan-400" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Pending Consensus
                </span>
              </div>
              <span className="flex h-5 items-center justify-center rounded-lg bg-rose-500/10 border border-rose-500/50 px-2 text-[10px] font-black text-rose-400">
                {matches.pending.length} ACTION REQUIRED
              </span>
            </div>
          </div>

          <div className="divide-y divide-white/5">
            {matches.pending.map((match) => (
              <div key={match.id} className="p-4 bg-slate-800/20 group hover:bg-slate-800/40 transition">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-white">vs {match.opponent}</span>
                      <ResultBadge match={match} squadId={context.squadId} />
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      <span>{formatDate(match.matchDate)}</span>
                      <span className="text-slate-700 font-black">•</span>
                      <span>{match.isHome ? 'Home Ground' : 'Away Trip'}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-black text-white italic">
                      {match.homeScore ?? '-'} : {match.awayScore ?? '-'}
                    </p>
                  </div>
                </div>

                {/* Verification Progress */}
                <div className="mt-4 mb-4">
                  <VerificationProgress
                    current={match.verificationCount}
                    required={match.requiredVerifications}
                    trustScore={match.trustScore}
                  />
                </div>

                {/* Verification Buttons */}
                <div className="flex gap-2">
                  {match.canVerify ? (
                    <>
                      <button
                        onClick={() => handleVerify(match.id, true)}
                        disabled={verifying === match.id}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-500 text-white py-3 text-xs font-black uppercase tracking-widest transition hover:opacity-90 active:scale-95 disabled:opacity-50 shadow-lg shadow-emerald-500/10"
                      >
                        {verifying === match.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        )}
                        Verify
                      </button>
                      <button
                        onClick={() => handleVerify(match.id, false)}
                        disabled={verifying === match.id}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-800 border border-white/10 py-3 text-xs font-black uppercase tracking-widest text-slate-300 transition hover:bg-slate-700 active:scale-95 disabled:opacity-50"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Dispute
                      </button>
                    </>
                  ) : (
                    <div className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[11px] font-bold text-slate-400">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500/10 shrink-0">
                         <Clock className="h-3 w-3 text-cyan-400" />
                      </div>
                      {match.submittedByCurrentUser
                        ? 'Submission Pending. Waiting on opponent.'
                        : 'Verified by you. Waiting on consensus.'}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recent Results */}
      {matches.recent.length > 0 && (
        <section className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40">
          <div className="border-b border-white/5 px-4 py-3 bg-white/5">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                Recent Results
              </span>
            </div>
          </div>

          <div className="divide-y divide-white/5">
            {matches.recent.slice(0, 8).map((match) => (
              <button
                key={match.id}
                onClick={() => openDetails(match)}
                className="w-full flex items-center justify-between gap-3 px-4 py-4 hover:bg-white/5 transition text-left"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-bold text-white">vs {match.opponent}</span>
                    <ResultBadge match={match} squadId={context.squadId} />
                  </div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{formatDate(match.matchDate)}</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-black text-white italic">
                      {match.homeScore ?? '-'} : {match.awayScore ?? '-'}
                    </p>
                    {match.trustScore > 0 && (
                      <div className="flex items-center gap-1 justify-end opacity-60">
                         <Shield className="h-2.5 w-2.5 text-cyan-400" />
                         <span className="text-[9px] font-bold text-slate-400">{match.trustScore}%</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    {match.xpGained !== null && match.xpGained > 0 && (
                      <div className="flex items-center gap-1 rounded-lg bg-emerald-400/10 border border-emerald-400/20 px-2 py-1">
                        <Zap className="h-3 w-3 text-emerald-400" />
                        <span className="text-[10px] font-black text-emerald-400">+{match.xpGained}</span>
                      </div>
                    )}
                    <ChevronRight className="h-4 w-4 text-slate-700" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {matches.pending.length === 0 && matches.recent.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-white/5 bg-slate-800/20 py-16 text-center">
          <div className="mb-4 rounded-3xl bg-slate-700/30 p-6">
            <Trophy className="h-10 w-10 text-slate-600" />
          </div>
          <p className="text-base font-black text-white px-8">Your Season Awaits</p>
          <p className="mt-2 text-sm text-slate-500 px-12">Log your first match to start tracking your professional progress.</p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}

export default TelegramMatchCenter;
