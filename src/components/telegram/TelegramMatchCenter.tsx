'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Trophy,
  Plus,
  ChevronRight,
  AlertCircle,
  Zap,
  Users,
  Shield,
  Calendar,
  Sword,
  Target,
  Sparkles,
} from 'lucide-react';
import type { MiniAppContext, PendingMatch, RecentMatch } from './TelegramMiniAppShell';
import { PitchCanvas } from '@/components/squad/PitchCanvas';

interface TelegramMatchCenterProps {
  context: MiniAppContext;
  onRefresh?: () => void;
}

type ViewMode = 'overview' | 'submit' | 'verify' | 'details' | 'preview';

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
    <span className={`rounded-lg border px-2 py-0.5 text-xs font-bold ${colors[result as keyof typeof colors]}`}>
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
  const [_verifying, setVerifying] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [_verificationNote, setVerificationNote] = useState<string | null>(null);
  const [_lastXPSummary, setLastXPSummary] = useState<VerificationXPSummary | null>(null);
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
  }, [form.opponentName, form.homeScore, form.awayScore, form.isHome, onRefresh]);

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

  const _formatAttributeLabel = (attribute: string) =>
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

  // --- RENDER MODES ---

  if (viewMode === 'preview' && matches.nextMatch) {
    const nextMatch = matches.nextMatch;
    return (
      <div className="p-4 space-y-6 pb-20">
        <div className="flex items-center gap-3">
          <button onClick={() => setViewMode('overview')} className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-slate-400">←</button>
          <div>
            <h2 className="text-lg font-bold text-white">Tactical Preview</h2>
            <p className="text-xs text-slate-400">Match Prep vs {nextMatch.opponent}</p>
          </div>
        </div>

        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/50">
          <div className="border-b border-white/5 bg-white/5 px-4 py-3">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-emerald-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Formation Setup</span>
                </div>
                <span className="text-xs font-black text-white italic">{nextMatch.homeFormation}</span>
             </div>
          </div>
          <div className="p-4 bg-slate-950/50">
            <PitchCanvas formation={nextMatch.homeFormation as any} lineup={[]} players={[]} readOnly size="sm" showPlayerNames={false} />
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-slate-800/30 p-4">
           <div className="mb-3 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Win Probability</span>
              <span className="text-[10px] font-bold text-emerald-400">AI Model v2.4</span>
           </div>
           <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-700">
              <div className="h-full bg-emerald-500" style={{ width: `${nextMatch.winProbability.home}%` }} />
              <div className="h-full bg-slate-500" style={{ width: `${nextMatch.winProbability.draw}%` }} />
              <div className="h-full bg-rose-500" style={{ width: `${nextMatch.winProbability.away}%` }} />
           </div>
           <div className="mt-2 flex justify-between text-[10px] font-bold text-slate-400">
              <span>Win {nextMatch.winProbability.home}%</span>
              <span>Draw {nextMatch.winProbability.draw}%</span>
              <span>Loss {nextMatch.winProbability.away}%</span>
           </div>
        </section>

        <section className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-5">
           <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-violet-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-violet-400">AI Staff Briefing</span>
           </div>
           <p className="text-sm italic leading-relaxed text-slate-300">"{nextMatch.tacticalInsight}"</p>
        </section>

        <section className="space-y-4">
           <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-cyan-400" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Opposition Scouting</span>
           </div>
           <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-5">
              <p className="text-xs leading-relaxed text-slate-400 mb-4">{nextMatch.scoutingReport}</p>
              <div className="space-y-3">
                 <div>
                    <p className="mb-2 text-[9px] font-black uppercase tracking-widest text-rose-400/70">Key Threats</p>
                    <div className="flex flex-wrap gap-2">
                       {nextMatch.keyThreats.map((threat, i) => (
                         <span key={i} className="rounded-lg bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 text-[10px] font-bold text-rose-300">{threat}</span>
                       ))}
                    </div>
                 </div>
                 <div>
                    <p className="mb-2 text-[9px] font-black uppercase tracking-widest text-emerald-400/70">Opportunities</p>
                    <div className="flex flex-wrap gap-2">
                       {nextMatch.keyOpportunities.map((opp, i) => (
                         <span key={i} className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-[10px] font-bold text-emerald-300">{opp}</span>
                       ))}
                    </div>
                 </div>
              </div>
           </div>
        </section>

        <button onClick={() => setViewMode('overview')} className="w-full rounded-2xl bg-white/5 border border-white/10 py-4 text-sm font-bold text-slate-300">Close Preview</button>
      </div>
    );
  }

  if (viewMode === 'submit') {
    return (
      <div className="p-4 pb-20">
        <div className="mb-6 flex items-center gap-3">
          <button onClick={() => setViewMode('overview')} className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-slate-400">←</button>
          <div>
            <h2 className="text-lg font-bold text-white">Log Match Result</h2>
            <p className="text-xs text-slate-400">Manual entry for verification</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Opponent Squad</label>
            <input
              type="text"
              value={form.opponentName}
              onChange={(e) => setForm({ ...form, opponentName: e.target.value })}
              placeholder="Enter squad name..."
              className="w-full rounded-2xl border border-white/10 bg-slate-800/50 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none"
            />
            {loadingSuggestions && <p className="mt-2 text-[11px] text-slate-500">Searching...</p>}
            {!loadingSuggestions && opponentSuggestions.length > 0 && (
              <div className="mt-2 space-y-1 rounded-xl border border-white/10 bg-slate-900/80 p-2">
                {opponentSuggestions.map((opponent) => (
                  <button key={opponent.id} type="button" onClick={() => selectOpponent(opponent.name)} className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs text-slate-200 hover:bg-white/5">
                    <span>{opponent.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Venue</label>
            <div className="flex gap-2">
              <button type="button" onClick={() => setForm({ ...form, isHome: true })} className={`flex-1 rounded-xl border py-3 text-sm font-bold ${form.isHome ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400' : 'border-white/10 bg-slate-800/50 text-slate-400'}`}>Home</button>
              <button type="button" onClick={() => setForm({ ...form, isHome: false })} className={`flex-1 rounded-xl border py-3 text-sm font-bold ${!form.isHome ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400' : 'border-white/10 bg-slate-800/50 text-slate-400'}`}>Away</button>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-800/30 p-6">
            <div className="flex items-center justify-center gap-8">
              <ScoreInput value={form.homeScore} onChange={(v) => setForm({ ...form, homeScore: v })} label={form.isHome ? squad.name : form.opponentName || 'Opponent'} disabled={submitting} />
              <div className="text-2xl font-black text-slate-700">-</div>
              <ScoreInput value={form.awayScore} onChange={(v) => setForm({ ...form, awayScore: v })} label={form.isHome ? form.opponentName || 'Opponent' : squad.name} disabled={submitting} />
            </div>
          </div>

          {!hasTelegramWebApp && (
            <button onClick={handleSubmitInternal} disabled={submitting || !form.opponentName.trim()} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-4 text-sm font-black text-white">Submit Result</button>
          )}
        </div>
      </div>
    );
  }

  if (viewMode === 'details' && selectedMatch) {
    const isHome = selectedMatch.isHome;
    const ourScore = isHome ? selectedMatch.homeScore : selectedMatch.awayScore;
    const theirScore = isHome ? selectedMatch.awayScore : selectedMatch.homeScore;
    const result = ourScore! > theirScore! ? 'W' : ourScore! < theirScore! ? 'L' : 'D';
    
    return (
      <div className="p-4 space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setViewMode('overview')} className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-slate-400">←</button>
          <div>
            <h2 className="text-lg font-bold text-white">Match Resolution</h2>
            <p className="text-xs text-slate-400">{selectedMatch.status.toUpperCase()} • {formatDate(selectedMatch.matchDate)}</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/50">
           <div className="bg-slate-800 px-4 py-8 flex items-center justify-center gap-8 text-center">
             <div className="flex-1">
               <p className="text-xs font-bold text-slate-500 uppercase mb-1">{isHome ? squad.name : selectedMatch.opponent}</p>
               <p className={`text-4xl font-black ${isHome && result === 'W' ? 'text-emerald-400' : 'text-white'}`}>{selectedMatch.homeScore}</p>
             </div>
             <div className="text-slate-700 font-bold text-2xl">VS</div>
             <div className="flex-1">
               <p className="text-xs font-bold text-slate-500 uppercase mb-1">{!isHome ? squad.name : selectedMatch.opponent}</p>
               <p className={`text-4xl font-black ${!isHome && result === 'W' ? 'text-emerald-400' : 'text-white'}`}>{selectedMatch.awayScore}</p>
             </div>
           </div>
           <div className="px-4 py-4 border-t border-white/5 grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-cyan-400" />
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase text-left">Trust</p>
                  <p className="text-sm font-bold text-white">{selectedMatch.trustScore}%</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-400" />
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase text-left">XP</p>
                  <p className="text-sm font-bold text-white">+{selectedMatch.xpGained || 0}</p>
                </div>
              </div>
           </div>
        </div>

        <button onClick={() => setViewMode('overview')} className="w-full rounded-2xl bg-white/5 border border-white/10 py-4 text-sm font-bold text-slate-300">Back</button>
      </div>
    );
  }

  // --- OVERVIEW MODE ---
  const nextMatch = matches.nextMatch;

  return (
    <div className="space-y-4 p-4 pb-20">
      {nextMatch && (
        <section className="relative overflow-hidden rounded-[2rem] border border-cyan-500/30 bg-[#09111f] p-6 shadow-2xl">
          <div className="relative">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-cyan-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">Next Fixture</span>
              </div>
              <div className="rounded-full bg-white/5 px-3 py-1 text-[10px] font-bold text-slate-400">
                {new Date(nextMatch.matchDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
              </div>
            </div>

            <div className="mb-6 flex items-center justify-between gap-4">
              <div className="flex-1 text-center">
                <Shield className="mx-auto mb-2 h-8 w-8 text-slate-400" />
                <p className="truncate text-xs font-black text-white uppercase">{squad.name}</p>
              </div>
              <span className="text-lg font-black text-slate-600 italic">VS</span>
              <div className="flex-1 text-center">
                <Sword className="mx-auto mb-2 h-8 w-8 text-cyan-400" />
                <p className="truncate text-xs font-black text-white uppercase">{nextMatch.opponent}</p>
              </div>
            </div>

            <button
              onClick={() => setViewMode('preview')}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 py-4 text-sm font-black text-white"
            >
              PREPARE FOR MATCH
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      )}

      <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#09111f] p-4 shadow-xl">
        <div className="relative flex items-center justify-between">
          <div className="space-y-1 text-left">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-500">Season Record</h2>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">{recentStats.wins}-{recentStats.draws}-{recentStats.losses}</span>
              <span className="text-[10px] font-bold text-slate-500">{recentStats.total} Matches</span>
            </div>
          </div>
          <Trophy className="h-8 w-8 text-emerald-400" />
        </div>
      </section>

      <button
        onClick={() => setViewMode('submit')}
        className="group flex w-full items-center gap-4 rounded-3xl border border-white/10 bg-white/5 p-4"
      >
        <Plus className="h-5 w-5 text-slate-400" />
        <div className="flex-1 text-left">
          <p className="font-bold text-white text-sm">Log Previous Result</p>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">Administrative Action</p>
        </div>
        <ChevronRight className="h-5 w-5 text-slate-700" />
      </button>

      {(success || error) && (
        <div className={`flex items-center gap-2 rounded-xl border p-4 text-sm ${error ? 'border-rose-500/30 bg-rose-500/10 text-rose-300' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'}`}>
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error || success}
        </div>
      )}

      {matches.pending.length > 0 && (
        <section className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40">
          <div className="border-b border-white/5 px-4 py-3 bg-white/5 text-left">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Action Required</span>
          </div>
          <div className="divide-y divide-white/5">
            {matches.pending.map((match) => (
              <div key={match.id} className="p-4 bg-slate-800/20 text-left">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-white">vs {match.opponent}</span>
                  <ResultBadge match={match} squadId={context.squadId} />
                </div>
                <VerificationProgress current={match.verificationCount} required={match.requiredVerifications} />
                <div className="mt-4 flex gap-2">
                  {match.canVerify && (
                    <button onClick={() => handleVerify(match.id, true)} className="flex-1 rounded-xl bg-emerald-500 text-white py-2 text-xs font-black uppercase">Verify</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {matches.recent.length > 0 && (
        <section className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40">
          <div className="border-b border-white/5 px-4 py-3 bg-white/5 text-left">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Recent Results</span>
          </div>
          <div className="divide-y divide-white/5">
            {matches.recent.slice(0, 5).map((match) => (
              <button key={match.id} onClick={() => openDetails(match)} className="w-full flex items-center justify-between p-4 hover:bg-white/5">
                <div className="text-left">
                  <p className="text-sm font-bold text-white">vs {match.opponent}</p>
                  <p className="text-[10px] text-slate-500">{formatDate(match.matchDate)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-black text-white">{match.homeScore}:{match.awayScore}</span>
                  <ChevronRight className="h-4 w-4 text-slate-700" />
                </div>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default TelegramMatchCenter;
