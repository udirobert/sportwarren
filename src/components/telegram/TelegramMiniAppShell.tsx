'use client';

import { useEffect, useState, useMemo, useCallback, useRef, type ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';
import { Home, Trophy, User, Wallet, Bot, Loader2, AlertCircle, RefreshCw, Link2, ArrowRight } from 'lucide-react';

// Types for the enhanced Mini App context
export interface PlayerContext {
  id: string;
  name: string | null;
  position: string | null;
  level: number;
  totalXP: number;
  seasonXP: number;
  sharpness: number;
  reputationScore: number;
  stats: {
    matches: number;
    goals: number;
    assists: number;
  };
  attributes: Array<{
    attribute: string;
    rating: number;
    xp: number;
    xpToNext: number;
  }>;
}

export interface SquadMember {
  userId: string;
  name: string | null;
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
  };
  treasury: TreasuryContext;
  ton: TonContext;
}

type TabId = 'squad' | 'match' | 'profile' | 'treasury' | 'ai';

interface Tab {
  id: TabId;
  label: string;
  icon: typeof Home;
  badge?: number;
}

interface TelegramMiniAppShellProps {
  children?: ReactNode;
  renderSquad?: (context: MiniAppContext, refresh: () => void, navigate: (tab: TabId) => void) => ReactNode;
  renderMatch?: (context: MiniAppContext, refresh: () => void) => ReactNode;
  renderProfile?: (context: MiniAppContext, refresh: () => void) => ReactNode;
  renderTreasury?: (context: MiniAppContext, refresh: () => void) => ReactNode;
  renderAI?: (context: MiniAppContext, refresh: () => void) => ReactNode;
}

export function TelegramMiniAppShell({
  renderSquad,
  renderMatch,
  renderProfile,
  renderTreasury,
  renderAI,
}: TelegramMiniAppShellProps) {
  const CONTEXT_CACHE_KEY = 'telegram-mini-app:last-context';
  const PULL_THRESHOLD = 72;
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const initialTab = (searchParams.get('tab') as TabId) || 'squad';

  const [activeTab, setActiveTab] = useState<TabId>(initialTab);
  const [context, setContext] = useState<MiniAppContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [isTabTransitioning, setIsTabTransitioning] = useState(false);
  const touchStartYRef = useRef<number | null>(null);
  const pullTriggeredRef = useRef(false);

  // Initialize Telegram WebApp
  useEffect(() => {
    const webApp = window.Telegram?.WebApp;
    if (webApp) {
      webApp.ready();
      webApp.expand();
      webApp.setHeaderColor('#09111f');
      webApp.setBackgroundColor('#09111f');
      webApp.BackButton?.hide();
      webApp.MainButton?.hide();
    }
  }, []);

  // Load context
  const loadContext = useCallback(async (showRefresh = false) => {
    if (!token) {
      setLoading(false);
      return;
    }

    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const response = await fetch(`/api/telegram/mini-app/context?token=${encodeURIComponent(token)}`, {
        cache: 'no-store',
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load context');
      }

      setContext(data);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(CONTEXT_CACHE_KEY, JSON.stringify(data));
      }

      // Haptic feedback on success
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');
    } catch (err) {
      const fallbackContextRaw = typeof window !== 'undefined'
        ? window.localStorage.getItem(CONTEXT_CACHE_KEY)
        : null;
      let fallbackContext: MiniAppContext | null = null;
      if (fallbackContextRaw) {
        try {
          fallbackContext = JSON.parse(fallbackContextRaw) as MiniAppContext;
        } catch {
          fallbackContext = null;
        }
      }

      if (fallbackContext) {
        setContext(fallbackContext);
        setError(isOnline
          ? 'Using your last synced squad snapshot. Pull to refresh or tap Retry when connection recovers.'
          : 'You are offline. Showing your last synced squad snapshot.');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to load context');
      }
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, isOnline]);

  useEffect(() => {
    loadContext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    setIsOnline(window.navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Tab configuration with badges
  const tabs = useMemo<Tab[]>(() => {
    const pendingCount = context?.matches.pending.length || 0;
    const pendingTopUps = context?.treasury.pendingTopUps || 0;

    return [
      { id: 'squad', label: 'Squad', icon: Home },
      { id: 'match', label: 'Match', icon: Trophy, badge: pendingCount > 0 ? pendingCount : undefined },
      { id: 'profile', label: 'Profile', icon: User },
      { id: 'treasury', label: 'TON', icon: Wallet, badge: pendingTopUps > 0 ? pendingTopUps : undefined },
      { id: 'ai', label: 'Staff', icon: Bot },
    ];
  }, [context]);

  // Handle tab change with haptic feedback
  const handleTabChange = (tabId: TabId) => {
    if (tabId !== activeTab) {
      window.Telegram?.WebApp?.HapticFeedback?.selectionChanged();
      // Reset native buttons on tab change to prevent stale UI
      window.Telegram?.WebApp?.MainButton?.hide();
      window.Telegram?.WebApp?.BackButton?.hide();
      setActiveTab(tabId);
      setIsTabTransitioning(true);
      window.setTimeout(() => setIsTabTransitioning(false), 220);
    }
  };

  // Refresh handler
  const handleRefresh = () => {
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('light');
    loadContext(true);
  };

  const renderTabSkeleton = () => (
    <div className="space-y-4 p-4">
      <div className="h-24 animate-pulse rounded-2xl bg-white/5" />
      <div className="h-20 animate-pulse rounded-2xl bg-white/5" />
      <div className="h-28 animate-pulse rounded-2xl bg-white/5" />
    </div>
  );

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    if (event.currentTarget.scrollTop <= 0) {
      touchStartYRef.current = event.touches[0]?.clientY ?? null;
      pullTriggeredRef.current = false;
      setIsPulling(true);
      setPullDistance(0);
    }
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartYRef.current === null || refreshing) {
      return;
    }

    const currentY = event.touches[0]?.clientY ?? touchStartYRef.current;
    const delta = currentY - touchStartYRef.current;

    if (delta <= 0) {
      setPullDistance(0);
      return;
    }

    const dampedDistance = Math.min(110, delta * 0.45);
    setPullDistance(dampedDistance);

    if (dampedDistance >= PULL_THRESHOLD && !pullTriggeredRef.current) {
      pullTriggeredRef.current = true;
      window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('medium');
      handleRefresh();
    }
  };

  const handleTouchEnd = () => {
    touchStartYRef.current = null;
    pullTriggeredRef.current = false;
    setIsPulling(false);
    setPullDistance(0);
  };

  const openConnections = () => {
    const settingsUrl = `${window.location.origin}/settings?tab=connections`;
    const webApp = window.Telegram?.WebApp;

    if (webApp?.openLink) {
      webApp.openLink(settingsUrl);
      return;
    }

    window.open(settingsUrl, '_blank', 'noopener,noreferrer');
  };

  // Loading state
  if (loading) {
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

  if (!token) {
    return (
      <main className="flex min-h-screen flex-col justify-center bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.12),_transparent_45%),linear-gradient(180deg,_#09111f_0%,_#0d1526_100%)] px-4 py-8">
        <div className="mx-auto w-full max-w-md">
          <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-2xl shadow-black/30">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300">
              <Link2 className="h-7 w-7" />
            </div>
            <h1 className="mt-4 text-2xl font-bold text-white">SportWarren Mini App</h1>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Open the full squad dashboard in Telegram after you link this chat to a SportWarren squad.
            </p>

            <div className="mt-5 space-y-3 rounded-2xl border border-white/5 bg-white/5 p-4 text-sm text-slate-300">
              <p>1. Open SportWarren on the web.</p>
              <p>2. Create or join a squad.</p>
              <p>3. Go to Settings &gt; Connections &gt; Telegram.</p>
              <p>4. Return to this chat and type <span className="font-semibold text-emerald-300">/app</span>.</p>
            </div>

            <button
              onClick={openConnections}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-emerald-300"
            >
              Open SportWarren Settings
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </main>
    );
  }

  // Error state
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
          <button
            onClick={() => loadContext()}
            className="mt-2 flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
        </div>
      </main>
    );
  }

  // Render active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'squad':
        return renderSquad ? renderSquad(context, handleRefresh, handleTabChange) : <DefaultSquadTab context={context} />;
      case 'match':
        return renderMatch ? renderMatch(context, handleRefresh) : <DefaultMatchTab context={context} />;
      case 'profile':
        return renderProfile ? renderProfile(context, handleRefresh) : <DefaultProfileTab context={context} />;
      case 'treasury':
        return renderTreasury ? renderTreasury(context, handleRefresh) : <DefaultTreasuryTab context={context} />;
      case 'ai':
        return renderAI ? renderAI(context, handleRefresh) : <DefaultAITab context={context} />;
      default:
        return null;
    }
  };

  return (
    <main className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.12),_transparent_40%),linear-gradient(180deg,_#09111f_0%,_#0d1526_100%)]">
      {/* Header */}
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
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-slate-400 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      {(!isOnline || error) && (
        <div className="mx-4 mt-3 rounded-xl border border-amber-400/20 bg-amber-400/10 px-3 py-2">
          <p className="text-[11px] text-amber-200">
            {!isOnline
              ? 'You are offline. Data may be stale until connection returns.'
              : error}
          </p>
        </div>
      )}

      {/* Content */}
      <div
        className="relative flex-1 overflow-y-auto pb-20"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        {(refreshing || isPulling) && (
          <div className="sticky top-0 z-10 flex justify-center py-2" style={{ transform: `translateY(${Math.min(pullDistance, 26)}px)` }}>
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/80 px-3 py-1 text-[11px] text-slate-300 backdrop-blur">
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin text-emerald-400' : ''}`} />
              <span>{refreshing ? 'Refreshing...' : pullDistance >= PULL_THRESHOLD ? 'Release to refresh' : 'Pull to refresh'}</span>
            </div>
          </div>
        )}
        {isTabTransitioning ? renderTabSkeleton() : renderTabContent()}
      </div>

      {/* Bottom Tab Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-white/5 bg-[#09111f]/95 backdrop-blur-lg">
        <div className="flex items-center justify-around px-2 py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`relative flex flex-1 flex-col items-center gap-1 rounded-xl py-2 transition ${
                  isActive ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <div className="relative">
                  <Icon className={`h-5 w-5 transition ${isActive ? 'scale-110' : ''}`} />
                  {tab.badge !== undefined && (
                    <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] font-medium ${isActive ? 'text-emerald-400' : ''}`}>
                  {tab.label}
                </span>
                {isActive && (
                  <div className="absolute -bottom-2 left-1/2 h-1 w-8 -translate-x-1/2 rounded-full bg-emerald-400/50" />
                )}
              </button>
            );
          })}
        </div>
        {/* Safe area for iOS */}
        <div className="h-safe-area-inset-bottom bg-[#09111f]" />
      </nav>
    </main>
  );
}

// Default tab placeholders (will be replaced with full components)
function DefaultSquadTab({ context }: { context: MiniAppContext }) {
  return (
    <div className="p-4">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-sm text-slate-300">Squad Dashboard - {context.squad.name}</p>
        <p className="mt-1 text-xs text-slate-500">Form: {context.squad.form.join(' ')}</p>
      </div>
    </div>
  );
}

function DefaultMatchTab({ context }: { context: MiniAppContext }) {
  return (
    <div className="p-4">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-sm text-slate-300">Match Center</p>
        <p className="mt-1 text-xs text-slate-500">{context.matches.pending.length} pending verification</p>
      </div>
    </div>
  );
}

function DefaultProfileTab({ context }: { context: MiniAppContext }) {
  return (
    <div className="p-4">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-sm text-slate-300">Player Profile</p>
        <p className="mt-1 text-xs text-slate-500">Level {context.player?.level || 1}</p>
      </div>
    </div>
  );
}

function DefaultTreasuryTab({ context }: { context: MiniAppContext }) {
  return (
    <div className="p-4">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-sm text-slate-300">Treasury</p>
        <p className="mt-1 text-xs text-slate-500">{context.treasury.balance} {context.treasury.currency}</p>
      </div>
    </div>
  );
}

function DefaultAITab({ context }: { context: MiniAppContext }) {
  return (
    <div className="p-4">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-sm text-slate-300">AI Staff Room</p>
        <p className="mt-1 text-xs text-slate-500">Chat with your backroom staff for {context.squad.name}</p>
      </div>
    </div>
  );
}

export type { TabId };
