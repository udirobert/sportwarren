'use client';

import { useEffect, useState, useCallback, type ReactNode } from 'react';
import { Loader2, AlertCircle, RefreshCw, Link2, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useTelegram } from '@/hooks/useTelegram';
import { useTelegramSession } from '@/hooks/useTelegramSession';
import { useTelegramOnboarding } from '@/hooks/useTelegramOnboarding';
import { TelegramNavigation, type TabId } from './TelegramNavigation';

export interface PlayerContext {
  id: string;
  name: string | null;
  avatar: string | null;
  position: string | null;
  level: number;
  totalXP: number;
  seasonXP: number;
  sharpness: number;
  reputationScore: number;
  stats: { matches: number; goals: number; assists: number; };
  attributes: Array<{ attribute: string; rating: number; xp: number; xpToNext: number; }>;
}

export interface SquadMember {
  userId: string;
  name: string | null;
  avatar: string | null;
  role: string;
  position: string | null;
}

export interface SquadContext {
  id: string;
  name: string;
  shortName: string | null;
  homeGround: string | null;
  memberCount: number;
  members: SquadMember[];
  form: string[];
  formation?: string;
}

export interface PendingMatch {
  id: string;
  opponent: string;
  homeScore: number | null;
  awayScore: number | null;
  isHome: boolean;
  matchDate: string;
  verificationCount: number;
  requiredVerifications: number;
  canVerify: boolean;
  submittedByCurrentUser: boolean;
  alreadyVerifiedByCurrentUser: boolean;
  trustScore: number;
}

export interface RecentMatch {
  id: string;
  opponent: string;
  homeScore: number | null;
  awayScore: number | null;
  isHome: boolean;
  matchDate: string;
  status: string;
  xpGained: number | null;
  trustScore: number;
  verificationDetails: any;
}

export interface TreasuryTransaction {
  id: string;
  type: string;
  category: string;
  amount: number;
  description: string | null;
  createdAt: string;
  verified: boolean;
}

export interface TreasuryContext {
  balance: number;
  currency: string;
  pendingTopUps: number;
  recentTransactions: TreasuryTransaction[];
}

export interface TonContext {
  enabled: boolean;
  walletAddress: string | null;
  presets: number[];
}

export interface MiniAppContext {
  squadId: string;
  squadName: string;
  chatId: string | null;
  userId: string;
  player: PlayerContext | null;
  squad: SquadContext;
  matches: {
    pending: PendingMatch[];
    recent: RecentMatch[];
    nextMatch: {
      id: string;
      opponent: string;
      matchDate: string;
      isHome: boolean;
      venue: string;
      homeFormation: string;
      awayFormation: string;
      scoutingReport: string;
      keyThreats: string[];
      keyOpportunities: string[];
      tacticalInsight: string;
      intelLevel: number;
      winProbability: { home: number; away: number; draw: number; };
    } | null;
  };
  treasury: TreasuryContext;
  ton: TonContext;
}

interface TelegramMiniAppShellProps {
  renderSquad?: (context: MiniAppContext, refresh: () => void, navigate: (tab: TabId) => void) => ReactNode;
  renderMatch?: (context: MiniAppContext, refresh: () => void) => ReactNode;
  renderProfile?: (context: MiniAppContext, refresh: () => void) => ReactNode;
  renderTreasury?: (context: MiniAppContext, refresh: () => void) => ReactNode;
}

export function TelegramMiniAppShell({
  renderSquad,
  renderMatch,
  renderProfile,
  renderTreasury,
}: TelegramMiniAppShellProps) {
  const CONTEXT_CACHE_KEY = 'squad_context';
  const { isReady, safeArea, isOnline, hapticImpact, hapticNotification, hapticSelection, cloudStorage, webApp, requestFullscreen, enableVerticalSwipes } = useTelegram();

  const {
    sessionToken,
    sessionBootstrapped,
    requiresSquadOnboarding,
    setRequiresSquadOnboarding,
    error,
    setError,
    openSquadSetup,
  } = useTelegramSession();

  const [activeTab, setActiveTab] = useState<TabId>('squad');
  const [context, setContext] = useState<MiniAppContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isTabTransitioning, setIsTabTransitioning] = useState(false);

  const loadContext = useCallback(async (showRefresh = false) => {
    if (!sessionBootstrapped) return;
    if (!sessionToken) { setLoading(false); return; }

    if (showRefresh) { setRefreshing(true); } else { setLoading(true); }
    setError(null);

    try {
      const response = await fetch(`/api/telegram/mini-app/context?token=${encodeURIComponent(sessionToken)}`, { cache: 'no-store' });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 409 && data?.code === 'NO_SQUAD') {
          setRequiresSquadOnboarding(true);
          setContext(null);
          setError(null);
          return;
        }
        throw new Error(data.error || 'Failed to load context');
      }

      setContext(data);
      setRequiresSquadOnboarding(false);
      void cloudStorage.set(CONTEXT_CACHE_KEY, JSON.stringify(data));
      hapticNotification('success');
    } catch (err) {
      const fallbackContextRaw = await cloudStorage.get(CONTEXT_CACHE_KEY);
      let fallbackContext: MiniAppContext | null = null;
      if (fallbackContextRaw) {
        try { fallbackContext = JSON.parse(fallbackContextRaw) as MiniAppContext; } catch { fallbackContext = null; }
      }

      if (fallbackContext) {
        setContext(fallbackContext);
        setError(isOnline
          ? 'Using your last synced squad snapshot. Pull to refresh or tap Retry when connection recovers.'
          : 'You are offline. Showing your last synced squad snapshot.');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to load context');
      }
      hapticNotification('error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [sessionToken, isOnline, sessionBootstrapped, cloudStorage, hapticNotification, setRequiresSquadOnboarding, setError]);

  const onboarding = useTelegramOnboarding(sessionToken, loadContext, setRequiresSquadOnboarding);

  const handleRefresh = useCallback(() => {
    hapticImpact('light');
    loadContext(true);
  }, [hapticImpact, loadContext]);

  // Initialize Telegram WebApp immersive features
  useEffect(() => {
    if (isReady && webApp) {
      requestFullscreen();
      enableVerticalSwipes();
      webApp.setHeaderColor('#09111f');
      webApp.setBackgroundColor('#09111f');
      webApp.BackButton?.hide();
      webApp.MainButton?.hide();
      webApp.SecondaryButton?.hide();

      const handleReload = () => { handleRefresh(); };
      webApp.onEvent('reload_page', handleReload);
      return () => { webApp.offEvent('reload_page', handleReload); };
    }
  }, [isReady, webApp, requestFullscreen, enableVerticalSwipes, handleRefresh]);

  useEffect(() => {
    if (!sessionBootstrapped || requiresSquadOnboarding) { setLoading(false); return; }
    void loadContext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionToken, sessionBootstrapped, requiresSquadOnboarding]);

  const handleTabChange = (tabId: TabId) => {
    if (tabId !== activeTab) {
      hapticSelection();
      webApp?.MainButton?.hide();
      webApp?.SecondaryButton?.hide();
      webApp?.BackButton?.hide();
      setIsTabTransitioning(true);
      setActiveTab(tabId);
      window.setTimeout(() => setIsTabTransitioning(false), 220);
    }
  };

  const renderTabSkeleton = () => (
    <div className="space-y-4 p-4">
      <div className="h-24 animate-pulse rounded-2xl bg-white/5" />
      <div className="h-20 animate-pulse rounded-2xl bg-white/5" />
      <div className="h-28 animate-pulse rounded-2xl bg-white/5" />
    </div>
  );

  // Loading state
  if (loading || !isReady) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#09111f] px-4">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-emerald-400/20 blur-xl" />
            <div className="relative rounded-full bg-emerald-400/10 p-4">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-slate-300">Loading SportWarren</p>
            <p className="mt-1 text-xs text-slate-500">Connecting to your squad...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!sessionToken) {
    const hasError = Boolean(error);
    return (
      <main className="flex min-h-screen flex-col justify-center bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.12),_transparent_45%),linear-gradient(180deg,_#09111f_0%,_#0d1526_100%)] px-4 py-8">
        <div className="mx-auto w-full max-w-md">
          <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-2xl shadow-black/30">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300">
              <Link2 className="h-7 w-7" />
            </div>
            <h1 className="mt-4 text-2xl font-bold text-white">Your squad. Right in Telegram.</h1>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Track matches. Verify scores. Build your legacy. All without leaving Telegram.
            </p>

            {hasError ? (
              <div className="mt-5 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
                <p className="text-sm font-medium text-amber-200">{error}</p>
              </div>
            ) : (
              <div className="mt-5 space-y-3 rounded-2xl border border-white/5 bg-white/5 p-4 text-sm text-slate-300">
                <p>Track matches & build your squad's legacy — right here in Telegram.</p>
                <p>Create a new squad or join an existing one to get started.</p>
              </div>
            )}

            <button
              onClick={openSquadSetup}
              disabled={loading}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              {loading ? 'Setting up...' : 'Get Started'}
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (requiresSquadOnboarding) {
    return (
      <main className="flex min-h-screen flex-col justify-center bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.12),_transparent_45%),linear-gradient(180deg,_#09111f_0%,_#0d1526_100%)] px-4 py-8">
        <div className="mx-auto w-full max-w-md rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-2xl shadow-black/30">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300">
            <Link2 className="h-7 w-7" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-white">Stop playing ghost matches.</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Log the score. Track your stats. Build your legacy. Every match. Every stat. Forever.
          </p>

          {onboarding.onboardingNotice && (
            <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
              {onboarding.onboardingNotice}
            </div>
          )}

          {onboarding.onboardingMode === 'menu' && (
            <div className="mt-5 space-y-3">
              <button
                onClick={() => { onboarding.setOnboardingNotice(null); onboarding.setOnboardingMode('create'); }}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-emerald-300"
              >
                Create Your Squad <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => { onboarding.setOnboardingNotice(null); onboarding.setOnboardingMode('join'); }}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 font-semibold text-white transition hover:bg-white/10"
              >
                Join Existing Squad <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {onboarding.onboardingMode === 'create' && (
            <div className="mt-5 space-y-3">
              <input value={onboarding.createSquadName} onChange={(e) => onboarding.setCreateSquadName(e.target.value)} placeholder="Squad name" className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none" />
              <input value={onboarding.createShortName} onChange={(e) => onboarding.setCreateShortName(e.target.value.toUpperCase())} placeholder="Short name (2-5 chars)" maxLength={5} className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none" />
              <input value={onboarding.createHomeGround} onChange={(e) => onboarding.setCreateHomeGround(e.target.value)} placeholder="Home ground (optional)" className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none" />
              <button onClick={() => void onboarding.handleCreateSquad()} disabled={onboarding.onboardingBusy || Boolean(onboarding.createValidationError)} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:opacity-60">
                {onboarding.onboardingBusy ? (<><Loader2 className="h-4 w-4 animate-spin" />Creating Squad...</>) : ('Create Squad')}
              </button>
              {onboarding.showCreateValidationError && (<p className="px-1 text-xs text-amber-300">{onboarding.createValidationError}</p>)}
              <button onClick={() => onboarding.setOnboardingMode('menu')} className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10">Back</button>
            </div>
          )}

          {onboarding.onboardingMode === 'join' && (
            <div className="mt-5 space-y-3">
              <input value={onboarding.joinQuery} onChange={(e) => onboarding.setJoinQuery(e.target.value)} placeholder="Search squads" className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none" />
              <div className="max-h-60 space-y-2 overflow-y-auto rounded-xl border border-white/10 bg-white/[0.03] p-2">
                {onboarding.joinLoading && (<div className="flex items-center justify-center gap-2 px-2 py-4 text-xs text-slate-400"><Loader2 className="h-3.5 w-3.5 animate-spin" />Loading squads...</div>)}
                {!onboarding.joinLoading && onboarding.joinOptions.length === 0 && (<div className="px-2 py-4 text-xs text-slate-500">No squads found. Try another search.</div>)}
                {!onboarding.joinLoading && onboarding.joinOptions.map((option) => (
                  <button key={option.id} onClick={() => void onboarding.handleJoinSquad(option)} disabled={onboarding.onboardingBusy} className="flex w-full items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-left text-white transition hover:bg-white/10 disabled:opacity-60">
                    <div>
                      <p className="text-sm font-semibold">{option.name}</p>
                      <p className="text-[11px] text-slate-400">{option.shortName ? `${option.shortName} · ` : ''}{option.memberCount} members</p>
                    </div>
                    {option.alreadyMember ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2 py-1 text-[10px] font-semibold text-cyan-300"><CheckCircle2 className="h-3 w-3" />Open</span>
                    ) : (<span className="text-xs font-semibold text-emerald-300">Join</span>)}
                  </button>
                ))}
              </div>
              <button onClick={() => onboarding.setOnboardingMode('menu')} className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10">Back</button>
            </div>
          )}
        </div>
      </main>
    );
  }

  if (!context) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#09111f] px-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="rounded-full bg-rose-400/10 p-4">
            <AlertCircle className="h-8 w-8 text-rose-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">Connection Error</p>
            <p className="mt-1 max-w-xs text-xs text-slate-400">{error || 'Failed to load squad context'}</p>
          </div>
          <button onClick={() => loadContext()} className="mt-2 flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700">
            <RefreshCw className="h-4 w-4" />Try Again
          </button>
        </div>
      </main>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'squad': return renderSquad ? renderSquad(context, handleRefresh, handleTabChange) : null;
      case 'match': return renderMatch ? renderMatch(context, handleRefresh) : null;
      case 'profile': return renderProfile ? renderProfile(context, handleRefresh) : null;
      case 'treasury': return renderTreasury ? renderTreasury(context, handleRefresh) : null;
      default: return null;
    }
  };

  return (
    <main
      className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.12),_transparent_40%),linear-gradient(180deg,_#09111f_0%,_#0d1526_100%)]"
      style={{ paddingTop: `${safeArea.top}px`, paddingBottom: `${safeArea.bottom}px`, paddingLeft: `${safeArea.left}px`, paddingRight: `${safeArea.right}px` }}
    >
      <header className="sticky top-0 z-20 border-b border-white/5 bg-[#09111f]/90 px-4 py-3 backdrop-blur-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/10">
              <span className="text-lg">⚽</span>
            </div>
            <div>
              <h1 className="text-sm font-bold text-white">{context.squad.name}</h1>
              <p className="text-[10px] text-slate-400">{context.squad.memberCount} members</p>
            </div>
          </div>
          <button onClick={handleRefresh} disabled={refreshing} className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-slate-400 transition hover:bg-white/10 hover:text-white disabled:opacity-50">
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      {(!isOnline || error) && (
        <div className="mx-4 mt-3 rounded-xl border border-amber-400/20 bg-amber-400/10 px-3 py-2">
          <p className="text-[11px] text-amber-200">{!isOnline ? 'You are offline. Data may be stale until connection returns.' : error}</p>
        </div>
      )}

      <div className="relative flex-1 overflow-y-auto pb-20">
        {refreshing && (
          <div className="sticky top-0 z-10 flex justify-center py-2">
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/80 px-3 py-1 text-[11px] text-slate-300 backdrop-blur">
              <RefreshCw className="h-3.5 w-3.5 animate-spin text-emerald-400" /><span>Refreshing...</span>
            </div>
          </div>
        )}
        {isTabTransitioning ? renderTabSkeleton() : renderTabContent()}
      </div>

      <TelegramNavigation
        activeTab={activeTab}
        pendingCount={context.matches.pending.length}
        pendingTopUps={context.treasury.pendingTopUps}
        safeAreaBottom={safeArea.bottom}
        onTabChange={handleTabChange}
      />
    </main>
  );
}

export type { TabId };
