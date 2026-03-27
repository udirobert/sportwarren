"use client";

import React, { useMemo } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/common/StatCard';
import { ProgressiveDisclosure } from '@/components/adaptive/ProgressiveDisclosure';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useDashboardData } from '@/hooks/useDashboardData';
import { Target, Users, Trophy, TrendingUp, Calendar, Zap, Star, Sparkles, Plus, MessageCircle, Bell, Share2, CheckCircle2, ArrowRight, Smartphone, ExternalLink, ChevronDown, Check, Activity } from 'lucide-react';
import { buildTelegramDeepLink } from '@/lib/telegram/deep-links';
import { AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/contexts/WalletContext';
import { useToast } from '@/contexts/ToastContext';
import { useEnvironment } from '@/contexts/EnvironmentContext';
import { VerificationBanner } from '@/components/common/VerificationBanner';
import { EmptyState } from '@/components/common/EmptyState';
import { getJourneyZeroState } from '@/lib/journey/content';
import { useActiveSquad } from '@/contexts/ActiveSquadContext';
import { useOnboarding } from '@/hooks/useOnboarding';
import { OnboardingChecklist } from '@/components/onboarding/OnboardingChecklist';
import { QuickPersonalization } from '@/components/onboarding/QuickPersonalization';
import { GuestTour } from '@/components/onboarding/GuestTour';
import { trpc } from '@/lib/trpc-client';
import { getDashboardEntryState, type DashboardEntryAction } from '@/lib/dashboard/entry-state';
import { useTactics } from '@/hooks/squad/useTactics';

import dynamic from 'next/dynamic';

// Statically imported (small / always visible)
import { AgentProvider } from '@/context/AgentContext';
import { CreateSquadFlow } from '@/components/squad/CreateSquadFlow';
import { PendingActionsPanel } from '@/components/operations/PendingActionsPanel';

// Dynamically imported (code-split, loaded on demand)
const StaffFeed        = dynamic(() => import('@/components/adaptive/StaffFeed').then(m => ({ default: m.StaffFeed })), { ssr: false });
const NearbyRivals     = dynamic(() => import('@/components/dashboard/NearbyRivals').then(m => ({ default: m.NearbyRivals })), { ssr: false });
const TerritoryControl = dynamic(() => import('@/components/dashboard/TerritoryControl').then(m => ({ default: m.TerritoryControl })), { ssr: false });
const TrainingCenter   = dynamic(() => import('@/components/dashboard/TrainingCenter').then(m => ({ default: m.TrainingCenter })), { ssr: false });
const SquadGovernance  = dynamic(() => import('@/components/dashboard/SquadGovernance').then(m => ({ default: m.SquadGovernance })), { ssr: false });
const SquadDynamics    = dynamic(() => import('@/components/dashboard/SquadDynamics').then(m => ({ default: m.SquadDynamics })), { ssr: false });
const ScoutingReport   = dynamic(() => import('@/components/dashboard/ScoutingReport').then(m => ({ default: m.ScoutingReport })), { ssr: false });
const MatchEnginePreview = dynamic(() => import('@/components/dashboard/MatchEnginePreview').then(m => ({ default: m.MatchEnginePreview })), { ssr: false });
const StaffRoom        = dynamic(() => import('@/components/dashboard/StaffRoom').then(m => ({ default: m.StaffRoom })), { ssr: false });
const AgenticConcierge = dynamic(() => import('@/components/adaptive/AgenticConcierge').then(m => ({ default: m.AgenticConcierge })), { ssr: false });
const LensSocialHub    = dynamic(() => import('@/components/dashboard/LensSocialHub').then(m => ({ default: m.LensSocialHub })), { ssr: false });
const CaptainsLog      = dynamic(() => import('@/components/dashboard/CaptainsLog').then(m => ({ default: m.CaptainsLog })), { ssr: false });
const EventFeed        = dynamic(() => import('@/components/dashboard/EventFeed').then(m => ({ default: m.EventFeed })), { ssr: false });
const CommunicationHub = dynamic(() => import('@/components/dashboard/CommunicationHub').then(m => ({ default: m.CommunicationHub })), { ssr: false });

interface DashboardWidget {
  id: string;
  component: React.ReactNode;
  priority: number;
  requiredLevel: 'basic' | 'intermediate' | 'advanced';
  category: 'stats' | 'social' | 'matches' | 'achievements' | 'squad';
  unlockCondition?: () => boolean;
}

export const AdaptiveDashboard: React.FC = () => {
  const { preferences, trackFeatureUsage } = useUserPreferences();
  const { address, isGuest, hasAccount, hasWallet, authStatus, refreshAuthSignature } = useWallet();
  const { venue } = useEnvironment();
  const { addToast } = useToast();
  const [isStaffRoomOpen, setIsStaffRoomOpen] = React.useState(false);
  const [isTourActive, setIsTourActive] = React.useState(false);
  const [showCreateSquadFlow, setShowCreateSquadFlow] = React.useState(false);
  const [isSquadPickerOpen, setIsSquadPickerOpen] = React.useState(false);
  const squadPickerRef = React.useRef<HTMLDivElement>(null);
  const isVerified = !isGuest && authStatus.state === 'valid';

  // Close squad picker on outside click
  React.useEffect(() => {
    if (!isSquadPickerOpen) return;
    const handler = (e: MouseEvent) => {
      if (squadPickerRef.current && !squadPickerRef.current.contains(e.target as Node)) {
        setIsSquadPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isSquadPickerOpen]);

  const handleVerify = React.useCallback(async () => {
    const ok = await refreshAuthSignature();
    if (!ok) {
      addToast({
        tone: 'error',
        title: 'Verification Failed',
        message: 'We could not verify your wallet. Please try again and approve the signature request.',
      });
    } else {
      addToast({
        tone: 'success',
        title: 'Wallet Verified',
        message: 'Protected features are now unlocked.',
      });
    }
  }, [addToast, refreshAuthSignature]);

  const { activeSquad, activeSquadId: primarySquadId, memberships, setActiveSquad, refresh: refreshSquads } = useActiveSquad();
  const primarySquadName = activeSquad?.squad?.name || null;
  const activeMembersCount = activeSquad?.squad?.memberCount ?? 0;
  const hasOperationalSquad = Boolean(primarySquadId);
  const { data: stats, loading, dataState } = useDashboardData({
    isGuest,
    hasAccount,
    isVerified,
    squadId: primarySquadId,
  });
  const router = useRouter();
  const { data: currentProfile } = trpc.player.getCurrentProfile.useQuery(undefined, {
    enabled: isVerified,
    retry: false,
    staleTime: 30 * 1000,
  });
  const { completeChecklistItem, allChecklistDone, completedCount, totalCount } = useOnboarding();
  const currentUserId = currentProfile?.userId;

  // Fetch squad tactics for MatchEnginePreview
  const { tactics: squadTactics } = useTactics(primarySquadId || undefined);

  // Ticker data queries
  const { data: matchData } = trpc.match.list.useQuery(
    { squadId: primarySquadId || '', limit: 20 },
    { enabled: !!primarySquadId, staleTime: 30 * 1000 }
  );
  const pendingMatchesCount = matchData?.matches?.filter((m: { status: string }) => m.status === 'pending').length ?? 0;

  const handleOpenOffice = React.useCallback(() => {
    setIsStaffRoomOpen(true);
  }, []);

  const [personalizationDone, setPersonalizationDone] = React.useState(false);
  const entryState = useMemo(() => getDashboardEntryState({
    isGuest,
    hasAccount,
    hasWallet,
    isVerified,
    squadCount: memberships.length,
    pendingMatchesCount,
    completedChecklistCount: completedCount,
    totalChecklistCount: totalCount,
    totalMatches: stats?.matches ?? 0,
  }), [
    completedCount,
    hasAccount,
    hasWallet,
    isGuest,
    isVerified,
    memberships.length,
    pendingMatchesCount,
    stats?.matches,
    totalCount,
  ]);
  const matchesZeroState = useMemo(() => getJourneyZeroState(entryState.id, 'dashboard_matches'), [entryState.id]);
  const squadActivityZeroState = useMemo(() => getJourneyZeroState(entryState.id, 'dashboard_squad_activity'), [entryState.id]);
  const nextMatchZeroState = useMemo(() => getJourneyZeroState(entryState.id, 'dashboard_next_match'), [entryState.id]);

  // Define all possible widgets
  const allWidgets: DashboardWidget[] = useMemo(() => {
    const widgets: DashboardWidget[] = [];

    if (!allChecklistDone && !personalizationDone) {
      if (!isGuest) {
        widgets.push({
          id: 'quick-personalization',
          priority: 1000,
          requiredLevel: 'basic',
          category: 'stats',
          component: (
            <QuickPersonalization onComplete={() => setPersonalizationDone(true)} journeyStage={entryState.id} />
          ),
        });
      }
      widgets.push({
        id: 'onboarding-checklist',
        priority: 999,
        requiredLevel: 'basic',
        category: 'stats',
        component: (
          <OnboardingChecklist
            journeyStage={entryState.id}
            onStepAction={(_id) => {
              // tour step actions handled by checklist
            }}
          />
        ),
      });
    }

    widgets.push(
      {
        id: 'match-engine',
        priority: 500, // Top priority
        requiredLevel: 'basic' as const,
        category: 'matches' as const,
        component: (
          <div onClick={() => completeChecklistItem('view_match_engine')}>
            <MatchEnginePreview 
              squadId={primarySquadId} 
              formation={squadTactics?.formation}
            />
          </div>
        ),
      },
      {
      id: 'pending-actions',
      priority: 170,
      requiredLevel: 'basic',
      category: 'matches',
      component: (
        <PendingActionsPanel squadId={primarySquadId} />
      ),
      },
      {
      id: 'captains-log',
      priority: 155,
      requiredLevel: 'basic',
      category: 'stats',
      component: (
        <CaptainsLog squadId={primarySquadId} />
      ),
      },
      {
      id: 'communication-hub',
      priority: 150,
      requiredLevel: 'basic',
      category: 'squad',
      component: (
        <CommunicationHub squadId={primarySquadId} />
      ),
      },
      {
      id: 'quick-stats',
      priority: 200,
      requiredLevel: 'basic',
      category: 'stats',
      component: (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <StatCard
            title="Goals"
            value={stats?.goals || 0}
            icon={Target}
            color="green"
            cmTrend="up"
            loading={loading}
            onClick={() => {
              trackFeatureUsage('stats-goals');
              router.push('/stats');
            }}
          />
          <StatCard
            title="Assists"
            value={stats?.assists || 0}
            icon={Users}
            color="blue"
            cmTrend="stable"
            loading={loading}
            onClick={() => {
              trackFeatureUsage('stats-assists');
              router.push('/stats');
            }}
          />
          <StatCard
            title="Matches"
            value={stats?.matches || 0}
            icon={Trophy}
            color="orange"
            loading={loading}
            onClick={() => {
              trackFeatureUsage('stats-matches');
              router.push('/match?mode=history');
            }}
          />
          <StatCard
            title="Rating"
            value={stats?.rating || '0.0'}
            icon={Star}
            color="purple"
            cmTrend="down"
            loading={loading}
            onClick={() => {
              trackFeatureUsage('stats-rating');
              router.push('/reputation');
            }}
          />
        </div>
      ),
      },
      {
      id: 'event-feed',
      priority: 86,
      requiredLevel: 'basic',
      category: 'stats',
      component: (
        <EventFeed squadId={primarySquadId} />
      ),
      },
      {
      id: 'staff-feed',
      priority: 75,
      requiredLevel: 'basic',
      category: 'stats',
      component: (
        <StaffFeed userId={currentUserId} squadId={primarySquadId} onOpenStaffRoom={handleOpenOffice} />
      ),
      },
      {
      id: 'governance',
      priority: 82,
      requiredLevel: 'basic',
      category: 'social',
      component: primarySquadId ? <SquadGovernance squadId={primarySquadId} /> : null,
      },
      {
      id: 'lens-social',
      priority: 78,
      requiredLevel: 'basic',
      category: 'social',
      component: <LensSocialHub />,
      },
      {
      id: 'nearby-squads',
      priority: 85,
      requiredLevel: 'intermediate',
      category: 'social',
      component: <NearbyRivals />,
      },
      {
      id: 'territory',
      priority: 80,
      requiredLevel: 'advanced',
      category: 'social',
      component: primarySquadId ? <TerritoryControl squadId={primarySquadId} /> : null,
      },
      {
      id: 'training',
      priority: 88,
      requiredLevel: 'basic',
      category: 'stats',
      component: <TrainingCenter userId={currentUserId} />,
      },
      {
      id: 'recent-matches',
      priority: 190,
      requiredLevel: 'basic',
      category: 'matches',
      component: (
        <Card>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-900">Match Center</h2>
              {dataState === 'preview' && (
                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded bg-blue-100 text-blue-700">
                  Preview Data
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Link href="/match">
                <Button size="sm">Match Center</Button>
              </Link>
            </div>
          </div>
          {loading ? (
            <div className="text-center py-8 text-gray-600 dark:text-gray-400">Loading matches...</div>
          ) : stats?.recentMatches && stats.recentMatches.length > 0 ? (
            <div className="space-y-3">
              {stats.recentMatches.map((match, index) => {
                const isWin = match.result.startsWith('W');
                const isDraw = match.result.startsWith('D');
                const xp = isWin ? 150 : isDraw ? 75 : 30;
                return (
                  <div key={index} className={`flex items-center justify-between p-3 rounded-xl border transition-colors hover:shadow-sm ${
                    isWin ? 'border-green-200 bg-green-50/50' :
                    isDraw ? 'border-yellow-200 bg-yellow-50/50' :
                    'border-red-200 bg-red-50/50'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-1.5 h-10 rounded-full ${
                        isWin ? 'bg-green-500' : isDraw ? 'bg-yellow-400' : 'bg-red-400'
                      }`} />
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm">vs {match.opponent}</h3>
                        <p className="text-xs text-gray-700 dark:text-gray-300">{match.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-500 dark:text-gray-400">+{xp} XP</span>
                      <span className={`text-sm font-black px-2.5 py-1 rounded-lg ${
                        isWin ? 'bg-green-100 text-green-700' :
                        isDraw ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {match.result}
                      </span>
                      <Link
                        href={`/settings?tab=connections`}
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        title="Share result"
                      >
                        <Share2 className="w-3.5 h-3.5 text-gray-400 hover:text-green-600" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4">
              <EmptyState
                icon={Trophy}
                title={matchesZeroState.title}
                description={matchesZeroState.description}
                actionLabel={matchesZeroState.actionLabel}
                actionHref={matchesZeroState.actionHref}
              />
              <div className="flex justify-center">
                <Link href="/match?mode=capture">
                  <Button variant="outline" size="sm">Log your first result</Button>
                </Link>
              </div>
            </div>
          )}
        </Card>
      ),
      },
      {
      id: 'advanced-analytics',
      priority: 70,
      requiredLevel: 'advanced',
      category: 'stats',
      unlockCondition: () => preferences.usagePatterns.mostUsedFeatures.includes('stats-goals'),
      component: (
        <ProgressiveDisclosure
          level="advanced"
          feature="advanced-analytics"
          title="Performance Analytics"
          description="Detailed performance insights and trends"
        >
          <Card>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Form Trend</h3>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-green-600 font-medium">Improving</span>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Clutch Factor</h3>
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-orange-600" />
                  <span className="text-orange-600 font-medium">8.5/10</span>
                </div>
              </div>
            </div>
          </Card>
        </ProgressiveDisclosure>
      ),
      },
      {
      id: 'social-feed',
      priority: 60,
      requiredLevel: 'intermediate',
      category: 'social',
      unlockCondition: () => preferences.preferredFeatures.social !== 'minimal',
      component: (
        <ProgressiveDisclosure
          level="intermediate"
          feature="social-feed"
          title="Squad Activity"
          description="See what your teammates are up to"
        >
          <Card>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Squad Activity</h2>
            <div className="space-y-3">
              {stats && stats.recentMatches && stats.recentMatches.length > 0 ? (
                stats.recentMatches.slice(0, 3).map((match, i) => (
                  <div key={i} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-gray-900 text-sm">
                        vs <span className="font-semibold">{match.opponent}</span> — {match.result}
                      </p>
                      <p className="text-xs text-gray-600">{match.date}</p>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState
                  icon={Users}
                  title={squadActivityZeroState.title}
                  description={squadActivityZeroState.description}
                  actionLabel={squadActivityZeroState.actionLabel}
                  actionHref={squadActivityZeroState.actionHref}
                />
              )}
            </div>
          </Card>
        </ProgressiveDisclosure>
      ),
      },
      {
      id: 'achievements',
      priority: 50,
      requiredLevel: 'intermediate',
      category: 'achievements',
      unlockCondition: () => preferences.preferredFeatures.gamification !== 'none',
      component: (
        <ProgressiveDisclosure
          level="intermediate"
          feature="achievements"
          title="Recent Achievements"
          description="Your latest unlocked achievements"
        >
          <Card>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Achievements</h2>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Hat-trick Hero</h3>
                  <p className="text-xs text-gray-600">3 days ago</p>
                </div>
              </div>
            </div>
          </Card>
        </ProgressiveDisclosure>
      ),
      },
      {
      id: 'squad-dynamics',
      priority: 89,
      requiredLevel: 'basic',
      category: 'stats',
      component: <SquadDynamics squadId={primarySquadId} />,
      },
      {
      id: 'scouting-report',
      priority: 87,
      requiredLevel: 'basic',
      category: 'social',
      component: <ScoutingReport squadId={primarySquadId} />,
      },
      {
        id: 'upcoming-fixtures',
        priority: 450, // Higher priority than stats
        requiredLevel: 'basic',
        category: 'matches',
        component: (
          <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50/50 overflow-hidden shadow-lg shadow-emerald-500/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-600" />
                <h2 className="text-lg font-bold text-gray-900">Next Match</h2>
              </div>
              <Link href="/match" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                Full Schedule →
              </Link>
            </div>
            {stats && stats.recentMatches && stats.recentMatches.length > 0 ? (
              <div className="rounded-xl border border-emerald-200 bg-white p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-1">Upcoming Fixture</p>
                    <h3 className="text-xl font-black text-gray-900">vs {stats.recentMatches[0]?.opponent || 'TBD'}</h3>
                    <div className="flex items-center gap-1 mt-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{stats.recentMatches[0]?.date || 'TBD'}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Link href="/squad?tab=tactics">
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                        <Users className="w-3.5 h-3.5 mr-1.5" />
                        Customize Lineup
                      </Button>
                    </Link>
                    <Link href="/squad?tab=tactics">
                      <Button size="sm" variant="outline" className="font-bold border-2">
                        Preview Match
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <EmptyState
                icon={Calendar}
                title={nextMatchZeroState.title}
                description={nextMatchZeroState.description}
                actionLabel={nextMatchZeroState.actionLabel}
                actionHref={nextMatchZeroState.actionHref}
              />
            )}
          </Card>
        ),
      },
    );

    return widgets;
  }, [allChecklistDone, completeChecklistItem, currentUserId, dataState, entryState.id, handleOpenOffice, isGuest, loading, matchesZeroState.actionHref, matchesZeroState.actionLabel, matchesZeroState.description, matchesZeroState.title, nextMatchZeroState.actionHref, nextMatchZeroState.actionLabel, nextMatchZeroState.description, nextMatchZeroState.title, personalizationDone, preferences, primarySquadId, router, squadActivityZeroState.actionHref, squadActivityZeroState.actionLabel, squadActivityZeroState.description, squadActivityZeroState.title, squadTactics?.formation, stats, trackFeatureUsage]);

  // Filter and sort widgets based on user preferences
  const visibleWidgets = useMemo(() => {
    const hiddenWidgets = preferences.dashboardCustomization?.hiddenWidgets || [];
    const pinnedWidgets = preferences.dashboardCustomization?.pinnedWidgets || [];
    const widgetOrder = preferences.dashboardCustomization?.widgetOrder || [];
    const squadScopedWidgets = new Set([
      'pending-actions',
      'captains-log',
      'event-feed',
      'governance',
      'squad-dynamics',
      'territory',
    ]);
    
    // For new users, show only essential widgets
    const isNewUser = preferences.featureDiscoveryLevel < 10 && preferences.dashboardLayout === 'minimal';
    const essentialWidgets = isGuest
      ? ['onboarding-checklist', 'match-engine', 'upcoming-fixtures', 'quick-stats', 'recent-matches', 'staff-feed', 'lens-social']
      : ['onboarding-checklist', 'match-engine', 'upcoming-fixtures', 'quick-stats', 'recent-matches'];

    return allWidgets
      .filter(widget => {
        // Hide widgets user has explicitly hidden
        if (hiddenWidgets.includes(widget.id)) return false;

        if (!hasOperationalSquad && squadScopedWidgets.has(widget.id)) return false;
        
        // For new users, only show essential widgets
        if (isNewUser && !essentialWidgets.includes(widget.id)) return false;

        const complexityMatch =
          widget.requiredLevel === 'basic' ||
          (widget.requiredLevel === 'intermediate' && preferences.uiComplexity !== 'simple') ||
          (widget.requiredLevel === 'advanced' && preferences.uiComplexity === 'advanced');

        const isUnlocked = preferences.unlockedFeatures.includes(widget.id) ||
          widget.requiredLevel === 'basic';

        const categoryMatch =
          (widget.category === 'stats' && preferences.preferredFeatures.statistics !== 'basic') ||
          (widget.category === 'social' && preferences.preferredFeatures.social !== 'minimal') ||
          (widget.category === 'achievements' && preferences.preferredFeatures.gamification !== 'none') ||
          widget.category === 'matches';

        return complexityMatch && (isUnlocked || widget.unlockCondition) &&
          (widget.category === 'matches' || widget.category === 'stats' || categoryMatch);
      })
      .sort((a, b) => {
        // Pinned widgets come first
        const aPinned = pinnedWidgets.includes(a.id);
        const bPinned = pinnedWidgets.includes(b.id);
        if (aPinned && !bPinned) return -1;
        if (!aPinned && bPinned) return 1;
        
        // Then respect custom order if set
        if (widgetOrder.length > 0) {
          const aIndex = widgetOrder.indexOf(a.id);
          const bIndex = widgetOrder.indexOf(b.id);
          if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
          if (aIndex !== -1) return -1;
          if (bIndex !== -1) return 1;
        }
        
        // Then by recent usage
        const aRecentlyUsed = preferences.usagePatterns.lastActiveFeatures.includes(a.id);
        const bRecentlyUsed = preferences.usagePatterns.lastActiveFeatures.includes(b.id);
        if (aRecentlyUsed && !bRecentlyUsed) return -1;
        if (!aRecentlyUsed && bRecentlyUsed) return 1;
        
        return b.priority - a.priority;
      });
  }, [allWidgets, hasOperationalSquad, isGuest, preferences]);

  if (showCreateSquadFlow) {
    return (
      <CreateSquadFlow
        onCreated={async (id) => {
          setActiveSquad(id);
          setShowCreateSquadFlow(false);
          await refreshSquads();
          router.push('/squad?tab=overview&new=1');
        }}
      />
    );
  }

  const entryAccountLabel = isGuest
    ? 'Guest preview'
    : hasWallet
      ? (isVerified ? 'Verified member' : 'Wallet connected')
      : 'Signed in';
  const entryWalletLabel = isGuest
    ? 'Preview only'
    : hasWallet
      ? (isVerified ? 'Verified' : 'Signature needed')
      : 'Not connected';
  const entrySquadLabel = primarySquadName
    ? `${primarySquadName}${activeSquad?.role ? ` • ${activeSquad.role.replace(/_/g, ' ')}` : ''}`
    : entryState.squadLabel;
  const entryFocusLabel = entryState.queueLabel;

  const renderEntryAction = (action: DashboardEntryAction | undefined, tone: 'primary' | 'secondary') => {
    if (!action) return null;

    const className = tone === 'primary'
      ? 'bg-green-600 hover:bg-green-700 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-green-600/20'
      : 'font-black uppercase tracking-widest text-xs';

    if (action.intent === 'verify_wallet') {
      return (
        <Button
          key={action.label}
          size="sm"
          onClick={handleVerify}
          disabled={authStatus.isRefreshing}
          className={className}
          variant={tone === 'secondary' ? 'outline' : undefined}
        >
          {authStatus.isRefreshing ? 'Verifying…' : action.label}
        </Button>
      );
    }

    if (action.intent === 'create_squad') {
      return (
        <Button
          key={action.label}
          size="sm"
          onClick={() => setShowCreateSquadFlow(true)}
          className={className}
          variant={tone === 'secondary' ? 'outline' : undefined}
        >
          {action.label}
        </Button>
      );
    }

    if (action.intent === 'open_staff_room') {
      return (
        <Button
          key={action.label}
          size="sm"
          onClick={handleOpenOffice}
          className={className}
          variant={tone === 'secondary' ? 'outline' : undefined}
        >
          {action.label}
        </Button>
      );
    }

    if (action.intent === 'preview_match') {
      return (
        <Button
          key={action.label}
          size="sm"
          onClick={() => router.push(action.href || '/squad?tab=tactics')}
          className={className}
          variant={tone === 'secondary' ? 'outline' : undefined}
        >
          {action.label}
        </Button>
      );
    }

    if (!action.href) return null;

    return (
      <Link key={action.label} href={action.href}>
        <Button
          id={action.intent === 'open_wallet' ? 'connect-wallet-btn' : undefined}
          size="sm"
          className={className}
          variant={tone === 'secondary' ? 'outline' : undefined}
        >
          {action.label}
        </Button>
      </Link>
    );
  };

  const getLayoutClass = () => {
    switch (preferences.dashboardLayout) {
      case 'minimal': return 'space-y-4';
      case 'balanced': return 'space-y-5';
      case 'comprehensive': return 'space-y-6';
      default: return 'space-y-4';
    }
  };

  // ── New User Onboarding View ──────────────────────────────────────
  if (entryState.isNewUser) {
    return (
      <>
        <div className="max-w-2xl mx-auto px-4 md:px-6 py-6 md:py-10 nav-spacer-top nav-spacer-bottom">
          {/* Onboarding card with large CTA */}
          <Card className="overflow-hidden border-gray-200/80 bg-gradient-to-br from-white via-white to-green-50/30 dark:border-gray-700 dark:from-gray-900 dark:via-gray-900 dark:to-green-950/20">
            <div className="text-center space-y-6">
              <div className="text-[10px] font-black uppercase tracking-[0.22em] text-green-600 dark:text-green-400">
                {entryState.eyebrow}
              </div>
              <h1 className="text-2xl md:text-4xl font-black tracking-tight text-gray-900 dark:text-white">
                {entryState.headline}
              </h1>
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 max-w-lg mx-auto">
                {entryState.description}
              </p>

              {/* Primary CTA — large, centered */}
              {entryState.primaryAction.href ? (
                <Link
                  href={entryState.primaryAction.href}
                  onClick={() => completeChecklistItem(entryState.primaryAction.intent === 'log_match' ? 'verify_match' : 'view_match_engine')}
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-xl shadow-green-500/30 hover:shadow-green-500/50 transition-all duration-200 hover:scale-[1.02]"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  {entryState.primaryAction.label}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              ) : (
                renderEntryAction(entryState.primaryAction, 'primary')
              )}

              {entryState.secondaryAction && (
                <div>
                  {renderEntryAction(entryState.secondaryAction, 'secondary')}
                </div>
              )}

              {/* 3-step visual */}
              {entryState.steps.length > 0 && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-center gap-1 md:gap-2">
                    {entryState.steps.map((step, i) => (
                      <React.Fragment key={step.number}>
                        {i > 0 && (
                          <div className={`w-6 md:w-10 h-px ${step.completed ? 'bg-green-400' : 'bg-gray-300 dark:bg-gray-600'}`} />
                        )}
                        <div className="flex flex-col items-center gap-1.5">
                          <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-sm font-black transition-colors ${
                            step.completed
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-2 border-gray-300 dark:border-gray-600'
                          }`}>
                            {step.completed ? <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5" /> : step.number}
                          </div>
                          <span className={`text-[10px] md:text-xs font-bold uppercase tracking-wide ${
                            step.completed ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            {step.label}
                          </span>
                        </div>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              )}

              {/* Subtle meta line */}
              <div className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">
                {isGuest ? (
                  <span>{venue} preview</span>
                ) : (
                  <span>{entryAccountLabel}</span>
                )}
              </div>
            </div>
          </Card>

          {/* Onboarding checklist — always visible for new users */}
          <div className="mt-4">
            <OnboardingChecklist
              journeyStage={entryState.id}
              onStepAction={(_id) => {}}
            />
          </div>

          {/* Mobile Telegram banner */}
          <div className="md:hidden mt-4 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">📱</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-blue-900 dark:text-blue-100">Get the best mobile experience</p>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">Open SportWarren in Telegram for faster access and instant notifications.</p>
                <a
                  href={buildTelegramDeepLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700"
                >
                  Open in Telegram
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <GuestTour onVisibilityChange={setIsTourActive} />

        {/* Floating Action Button — pulsing for new users */}
        <Link
          href={entryState.primaryAction.href || '/match?mode=capture'}
          className="fixed bottom-6 left-6 z-50 md:hidden bg-green-600 hover:bg-green-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-xl shadow-green-600/40 transition-all active:scale-95 animate-pulse"
          aria-label={entryState.primaryAction.label}
        >
          <Plus className="w-6 h-6" />
        </Link>
      </>
    );
  }

  // ── Returning User Dashboard ──────────────────────────────────────
  return (
    <>
      <div className={`max-w-7xl mx-auto px-3 md:px-6 py-4 md:py-6 nav-spacer-top nav-spacer-bottom ${getLayoutClass()}`}>
      <div className="flex items-center justify-between text-xs font-semibold text-gray-400 uppercase tracking-widest">
        <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-[10px] font-black tracking-[0.18em] text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
          {entryState.surfaceLabel}
        </span>
      </div>

      <div id="dashboard-header" className="mb-4">
        <Card className="overflow-hidden border-gray-200/80 bg-gradient-to-br from-white via-white to-gray-50 dark:border-gray-700 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
          <div className="space-y-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="mb-2 text-[10px] font-black uppercase tracking-[0.22em] text-green-600 dark:text-green-400">
                  {entryState.eyebrow}
                </div>
                <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white md:text-4xl">
                  {entryState.headline}
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-600 dark:text-gray-300 md:text-base">
                  {entryState.description}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-gray-400">
                  {isGuest ? (
                    <span>{venue} preview</span>
                  ) : primarySquadName ? (
                    memberships.length > 1 ? (
                      <div ref={squadPickerRef} className="relative">
                        <button
                          type="button"
                          onClick={() => setIsSquadPickerOpen(!isSquadPickerOpen)}
                          className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.16em] text-gray-500 transition-colors hover:border-gray-400 hover:text-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:border-gray-500 dark:hover:text-gray-100"
                        >
                          {entrySquadLabel}
                          <ChevronDown className={`h-3 w-3 transition-transform ${isSquadPickerOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isSquadPickerOpen && (
                          <div className="absolute left-0 top-full z-50 mt-1 min-w-[200px] overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-900">
                            {memberships.map((m) => (
                              <button
                                key={m.squad.id}
                                type="button"
                                onClick={() => {
                                  setActiveSquad(m.squad.id);
                                  setIsSquadPickerOpen(false);
                                }}
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
                              >
                                <span className="flex-1 truncate">{m.squad.name}</span>
                                {m.squad.id === primarySquadId && (
                                  <Check className="h-3.5 w-3.5 flex-shrink-0 text-green-500" />
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span>{entrySquadLabel}</span>
                    )
                  ) : (
                    <span>{entryAccountLabel}</span>
                  )}
                  {hasWallet && address && (
                    <>
                      <span className="text-gray-300">/</span>
                      <span>{address.slice(0, 6)}…{address.slice(-4)}</span>
                    </>
                  )}
                  {!hasWallet && hasAccount && (
                    <>
                      <span className="text-gray-300">/</span>
                      <span>Wallet optional until you need protected actions</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                {renderEntryAction(entryState.secondaryAction, 'secondary')}
                {renderEntryAction(entryState.primaryAction, 'primary')}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {[
                { label: 'Account', value: entryAccountLabel },
                { label: 'Wallet', value: entryWalletLabel },
                { label: 'Squad', value: primarySquadName ? `${activeMembersCount || 1} active members` : entryState.squadLabel },
                { label: 'Next', value: entryFocusLabel },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-gray-200 bg-white/70 px-4 py-3 dark:border-gray-700 dark:bg-gray-900/70"
                >
                  <div className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">
                    {item.label}
                  </div>
                  <div className="mt-2 text-sm font-bold text-gray-900 dark:text-white">
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <VerificationBanner className="mb-4" />

      {/* Mobile-first Telegram banner */}
      <div className="md:hidden mb-4">
        <Card className="bg-gradient-to-r from-blue-600 to-blue-700 border-blue-500 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-white">📱 Better on Mobile?</h3>
              <p className="text-xs text-blue-100 mt-0.5">
                Open SportWarren in Telegram for a faster, native mobile experience with instant notifications.
              </p>
            </div>
            <a
              href={buildTelegramDeepLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0"
            >
              <Button size="sm" className="bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs">
                Open
              </Button>
            </a>
          </div>
        </Card>
      </div>

      <GuestTour onVisibilityChange={setIsTourActive} />
      {!isTourActive && <AgenticConcierge journeyStage={entryState.id} />}

      <AnimatePresence>
        {isStaffRoomOpen && (
          <AgentProvider>
            <StaffRoom
              squadId={primarySquadId}
              onClose={() => setIsStaffRoomOpen(false)}
            />
          </AgentProvider>
        )}
      </AnimatePresence>

      {(() => {
        const todayIds = ['onboarding-checklist', 'pending-actions', 'event-feed', 'staff-feed', 'recent-matches', 'match-engine', 'quick-stats', 'achievements', 'upcoming-fixtures'];
        const squadIds = ['governance', 'squad-dynamics', 'captains-log', 'communication-hub'];
        const progressIds = ['training', 'scouting-report', 'lens-social', 'nearby-squads', 'territory'];

        const todayWidgets = visibleWidgets.filter(w => todayIds.includes(w.id));
        const squadWidgets = visibleWidgets.filter(w => squadIds.includes(w.id));
        const progressWidgets = visibleWidgets.filter(w => progressIds.includes(w.id));
        const otherWidgets = visibleWidgets.filter(w => ![...todayIds, ...squadIds, ...progressIds].includes(w.id));

        const sectionLayouts: Record<string, Record<string, string>> = {
          Today: {
            'match-engine': 'md:col-span-12',
            'upcoming-fixtures': 'md:col-span-12',
            'pending-actions': 'md:col-span-12 lg:col-span-5 xl:col-span-4',
            'recent-matches': 'md:col-span-12 lg:col-span-7 xl:col-span-8',
            'quick-stats': 'md:col-span-12',
            'event-feed': 'md:col-span-12 lg:col-span-6',
            'staff-feed': 'md:col-span-12 lg:col-span-6',
            'achievements': 'md:col-span-12 lg:col-span-6',
          },
          Squad: {
            'captains-log': 'md:col-span-12 lg:col-span-7',
            'communication-hub': 'md:col-span-12 lg:col-span-5',
            'squad-dynamics': 'md:col-span-12 lg:col-span-6',
            'governance': 'md:col-span-12 lg:col-span-6',
          },
          Progress: {
            'training': 'md:col-span-12 lg:col-span-6',
            'scouting-report': 'md:col-span-12 lg:col-span-6',
            'lens-social': 'md:col-span-12 lg:col-span-6',
            'nearby-squads': 'md:col-span-12 lg:col-span-6',
            'territory': 'md:col-span-12',
          },
        };

        const featuredBySection: Record<string, string[]> = {
          Today: ['onboarding-checklist', 'match-engine', 'upcoming-fixtures'],
          Squad: [],
          Progress: [],
        };

        const getSpan = (title: string, id: string) =>
          sectionLayouts[title]?.[id] ?? 'md:col-span-12 lg:col-span-6';

        const Section = ({ title, widgets }: { title: string; widgets: typeof visibleWidgets }) => {
          if (widgets.length === 0) return null;
          const featuredIds = new Set(featuredBySection[title] ?? []);
          const featured = widgets.filter(w => featuredIds.has(w.id));
          const rest = widgets.filter(w => !featuredIds.has(w.id));

          return (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="section-title">{title}</h2>
              </div>

              {/* Mobile: feature stack + horizontal snap scroll */}
              {featured.length > 0 && (
                <div className="md:hidden space-y-3 mb-3">
                  {featured.map(w => (
                    <div key={w.id} id={w.id}>
                      {w.component}
                    </div>
                  ))}
                </div>
              )}
              {rest.length > 0 && (
                <div className="md:hidden -mx-3 px-3 relative">
                  <div
                    className={`flex gap-3 overflow-x-auto pb-2 snap-x snap-proximity scrollbar-hide scroll-lock-x ${rest.length > 1 ? 'carousel-fade-right' : ''}`}
                    style={{ scrollbarWidth: 'none' }}
                  >
                    {rest.slice(0, 5).map(w => (
                      <div key={w.id} id={w.id} className="snap-start shrink-0 w-[85vw] max-w-sm">
                        {w.component}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Desktop: featured full-width + dense grid */}
              <div className="hidden md:block space-y-3">
                {featured.map(w => (
                  <div key={w.id} id={w.id}>
                    {w.component}
                  </div>
                ))}
                {rest.length > 0 && (
                  <div className="grid grid-cols-12 gap-3 grid-flow-row-dense">
                    {rest.map(w => (
                      <div key={w.id} id={w.id} className={`${getSpan(title, w.id)} min-w-0`}>
                        {w.component}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        };

        return (
          <div className="space-y-3 md:space-y-5">
            <Section title="Today" widgets={todayWidgets} />
            <Section title="Squad" widgets={squadWidgets} />
            <Section title="Progress" widgets={progressWidgets} />
            {otherWidgets.map(w => <div key={w.id} id={w.id}>{w.component}</div>)}
          </div>
        );
      })()}

      {/* Floating Action Button — primary action on mobile */}
      <Link
        href="/squad?tab=tactics"
        className="fixed bottom-6 left-6 z-50 md:hidden bg-emerald-600 hover:bg-emerald-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-xl shadow-emerald-600/40 transition-all active:scale-95"
        aria-label="Set up your lineup"
      >
        <Users className="w-6 h-6" />
      </Link>

      {/* Desktop right sidebar quick-actions strip — always visible */}
      <div className="hidden md:flex fixed right-0 top-1/2 -translate-y-1/2 z-40 flex-col gap-2 pr-2">
        <Link
          href="/match"
          className="group flex flex-col items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-l-xl px-3 py-3 shadow-lg shadow-emerald-600/30 transition-all"
          title="Match Center"
        >
          <Activity className="w-5 h-5" />
          <span className="text-[9px] font-black uppercase tracking-widest leading-none">Match</span>
        </Link>
        <Link
          href="/settings?tab=notifications"
          className="group flex flex-col items-center gap-1 bg-gray-800 hover:bg-gray-700 text-white rounded-l-xl px-3 py-3 shadow-lg transition-all"
          title="Connect Channels"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-[9px] font-black uppercase tracking-widest leading-none">Chat</span>
        </Link>
        <Link
          href="/match?mode=verify"
          className="group flex flex-col items-center gap-1 bg-gray-800 hover:bg-gray-700 text-white rounded-l-xl px-3 py-3 shadow-lg transition-all"
          title="Verify Results"
        >
          <Bell className="w-5 h-5" />
          <span className="text-[9px] font-black uppercase tracking-widest leading-none">Verify</span>
        </Link>
      </div>

      {preferences.featureDiscoveryLevel < 50 && preferences.uiComplexity !== 'simple' && (
        <Card className="mt-8 border-blue-200 bg-blue-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-blue-900">Discover More Features</h3>
              <p className="text-sm text-blue-700">
                Keep using SportWarren to unlock advanced analytics and social features!
              </p>
            </div>
          </div>
        </Card>
      )}
      </div>
    </>
  );
};
