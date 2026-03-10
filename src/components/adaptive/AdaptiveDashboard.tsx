"use client";

import React, { useMemo, useRef } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/common/StatCard';
import { ProgressiveDisclosure } from '@/components/adaptive/ProgressiveDisclosure';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useDashboardData } from '@/hooks/useDashboardData';
import { Target, Users, Trophy, TrendingUp, Calendar, Zap, Star, Sparkles, Briefcase, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/contexts/WalletContext';
import { useMySquads } from '@/hooks/squad/useSquad';
import { useOnboarding } from '@/hooks/useOnboarding';
import { OnboardingChecklist } from '@/components/onboarding/OnboardingChecklist';
import { GuestTour } from '@/components/onboarding/GuestTour';

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

interface DashboardWidget {
  id: string;
  component: React.ReactNode;
  priority: number;
  requiredLevel: 'basic' | 'intermediate' | 'advanced';
  category: 'stats' | 'social' | 'matches' | 'achievements';
  unlockCondition?: () => boolean;
}

export const AdaptiveDashboard: React.FC = () => {
  const { preferences, trackFeatureUsage } = useUserPreferences();
  const { address, isGuest } = useWallet();
  const [isStaffRoomOpen, setIsStaffRoomOpen] = React.useState(false);
  const [forcedSquadId, setForcedSquadId] = React.useState<string | null>(null);
  const userAddress = address || undefined;

  const { data: stats, loading } = useDashboardData(userAddress);
  const router = useRouter();
  const { memberships, loading: squadLoading, refresh: refreshSquads } = useMySquads();
  const { completeChecklistItem, allChecklistDone } = useOnboarding();

  const primarySquadId = forcedSquadId || memberships?.[0]?.squad.id;

  // Show squad creation flow for connected (non-guest) users with no squad
  if (!isGuest && !squadLoading && memberships.length === 0 && !forcedSquadId) {
    return (
      <CreateSquadFlow
        onCreated={async (id) => {
          setForcedSquadId(id);
          await refreshSquads();
          router.push('/squad?tab=overview&new=1');
        }}
      />
    );
  }

  const handleOpenOffice = React.useCallback(() => {
    setIsStaffRoomOpen(true);
    completeChecklistItem('open_office');
  }, [completeChecklistItem]);

  // Define all possible widgets
  const allWidgets: DashboardWidget[] = useMemo(() => [
    {
      id: 'onboarding-checklist',
      priority: 999,
      requiredLevel: 'basic',
      category: 'stats',
      component: (
        <OnboardingChecklist
          onStepAction={(id) => {
            if (id === 'open_office') handleOpenOffice();
            if (id === 'claim_identity') router.push('/');
          }}
        />
      ),
    },
    {
      id: 'pending-actions',
      priority: 160,
      requiredLevel: 'basic',
      category: 'matches',
      component: (
        <PendingActionsPanel squadId={primarySquadId} />
      ),
    },
    {
      id: 'captains-log',
      priority: 150,
      requiredLevel: 'basic',
      category: 'stats',
      component: (
        <CaptainsLog squadId={primarySquadId} />
      ),
    },
    {
      id: 'quick-stats',
      priority: 100,
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
            onClick={() => trackFeatureUsage('stats-goals')}
          />
          <StatCard
            title="Assists"
            value={stats?.assists || 0}
            icon={Users}
            color="blue"
            cmTrend="stable"
            loading={loading}
            onClick={() => trackFeatureUsage('stats-assists')}
          />
          <StatCard
            title="Matches"
            value={stats?.matches || 0}
            icon={Trophy}
            color="orange"
            loading={loading}
            onClick={() => trackFeatureUsage('stats-matches')}
          />
          <StatCard
            title="Rating"
            value={stats?.rating || '0.0'}
            icon={Star}
            color="purple"
            cmTrend="down"
            loading={loading}
            onClick={() => trackFeatureUsage('stats-rating')}
          />
        </div>
      ),
    },
    {
      id: 'event-feed',
      priority: 96,
      requiredLevel: 'basic',
      category: 'stats',
      component: (
        <EventFeed squadId={primarySquadId} />
      ),
    },
    {
      id: 'staff-feed',
      priority: 95,
      requiredLevel: 'basic',
      category: 'stats',
      component: (
        <StaffFeed userId={userAddress || 'demo-user'} />
      ),
    },
    {
      id: 'governance',
      priority: 92,
      requiredLevel: 'basic',
      category: 'social',
      component: <SquadGovernance squadId={primarySquadId || 'guest'} />,
    },    {
      id: 'lens-social',
      priority: 94,
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
      component: <TerritoryControl squadId={primarySquadId || 'guest'} />,
    },
    {
      id: 'training',
      priority: 88,
      requiredLevel: 'basic',
      category: 'stats',
      component: <TrainingCenter userId={userAddress || 'demo-user'} />,
    },
    {
      id: 'recent-matches',
      priority: 90,
      requiredLevel: 'basic',
      category: 'matches',
      component: (
        <Card>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-gray-900">Match Center</h2>
            <div className="flex items-center gap-2">
              <Link href="/match?mode=verify">
                <Button size="sm" variant="outline">Review</Button>
              </Link>
              <Link href="/match?mode=capture">
                <Button size="sm">Submit</Button>
              </Link>
            </div>
          </div>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading matches...</div>
          ) : stats?.recentMatches && stats.recentMatches.length > 0 ? (
            <div className="space-y-3">
              {stats.recentMatches.map((match, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">{match.opponent}</h3>
                    <p className="text-sm text-gray-600">{match.date}</p>
                  </div>
                  <span className={`font-bold ${match.result.startsWith('W') ? 'text-green-600' : 'text-red-600'
                    }`}>
                    {match.result}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Trophy className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No matches yet. Start your season!</p>
              <Link href="/match?mode=capture">
                <Button className="mt-4">Open Match Center</Button>
              </Link>
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
                <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-gray-400 rounded-full mt-2"></div>
                  <div>
                    <p className="text-gray-900 text-sm">No matches played yet</p>
                    <p className="text-xs text-gray-600">Start your first match to see activity</p>
                  </div>
                </div>
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
      id: 'match-engine',
      priority: 98,
      requiredLevel: 'basic',
      category: 'matches',
      component: (
        <div onClick={() => completeChecklistItem('view_match_engine')}>
          <MatchEnginePreview squadId={primarySquadId} />
        </div>
      ),
    },
    {
      id: 'squad-dynamics',
      priority: 89,
      requiredLevel: 'basic',
      category: 'stats',
      component: <SquadDynamics squadId={primarySquadId || 'guest'} />,
    },
    {
      id: 'scouting-report',
      priority: 87,
      requiredLevel: 'basic',
      category: 'social',
      component: <ScoutingReport />,
    },
    {
      id: 'upcoming-fixtures',
      priority: 80,
      requiredLevel: 'basic',
      category: 'matches',
      component: (
        <Card>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Next Match</h2>
          {stats && stats.recentMatches && stats.recentMatches.length > 0 ? (
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">vs {stats.recentMatches[0]?.opponent || 'TBD'}</h3>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{stats.recentMatches[0]?.date || 'TBD'}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-500">No upcoming matches scheduled</p>
              <p className="text-xs text-gray-400 mt-1">Create a squad to start playing</p>
            </div>
          )}
        </Card>
      ),
    },
  ], [preferences, trackFeatureUsage, stats, loading, userAddress, primarySquadId, completeChecklistItem, handleOpenOffice, allChecklistDone]);

  // Filter and sort widgets based on user preferences
  const visibleWidgets = useMemo(() => {
    const hiddenWidgets = preferences.dashboardCustomization?.hiddenWidgets || [];
    const pinnedWidgets = preferences.dashboardCustomization?.pinnedWidgets || [];
    const widgetOrder = preferences.dashboardCustomization?.widgetOrder || [];
    
    // For new users, show only essential widgets
    const isNewUser = preferences.featureDiscoveryLevel < 10 && preferences.dashboardLayout === 'minimal';
    const essentialWidgets = ['onboarding-checklist', 'quick-stats', 'recent-matches'];

    return allWidgets
      .filter(widget => {
        // Hide widgets user has explicitly hidden
        if (hiddenWidgets.includes(widget.id)) return false;
        
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
  }, [allWidgets, preferences]);

  const getLayoutClass = () => {
    switch (preferences.dashboardLayout) {
      case 'minimal': return 'space-y-4';
      case 'balanced': return 'space-y-6';
      case 'comprehensive': return 'space-y-8';
      default: return 'space-y-4';
    }
  };

  return (
    <div className={`max-w-7xl mx-auto px-3 md:px-6 py-4 md:py-6 pb-24 md:pb-6 ${getLayoutClass()}`}>
      <AnimatePresence>
        {isGuest && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="mb-4 overflow-hidden"
          >
            <div className="bg-blue-600 text-white p-2 rounded-lg flex items-center justify-between shadow-lg shadow-blue-500/20">
              <div className="flex items-center space-x-3 px-2">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs font-black uppercase tracking-widest leading-none">Guest Mode Active • Hackney Marshes Demo Experience</span>
              </div>
              <Button id="connect-wallet-btn" size="sm" variant="outline" className="h-7 text-xs border-white/20 hover:bg-white/10 text-white" onClick={() => router.push('/')}>
                Connect Wallet
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <GuestTour />
      <AgenticConcierge />

      <div id="dashboard-header" className="border-b border-gray-200 dark:border-gray-700 pb-3 mb-2">
        {/* Mobile header — compact single row */}
        <div className="flex items-center justify-between md:hidden">
          <div className="min-w-0">
            <h1 className="text-lg font-black text-gray-900 dark:text-white tracking-tight truncate">
              {memberships?.[0]?.squad?.name ?? (isGuest ? 'Demo Squad' : 'My Squad')}
            </h1>
            {address && (
              <p className="text-xs text-gray-400 font-medium">
                {address.slice(0, 6)}…{address.slice(-4)}
              </p>
            )}
          </div>
          <button
            onClick={handleOpenOffice}
            className="ml-3 shrink-0 flex items-center gap-1.5 bg-gray-900 dark:bg-gray-700 text-white text-xs font-black uppercase tracking-widest px-3 py-2 rounded-lg"
          >
            <Briefcase className="w-3 h-3 text-blue-400" />
            Office
          </button>
        </div>
        {/* Desktop header — full */}
        <div className="hidden md:flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              {memberships?.[0]?.squad?.name ?? (isGuest ? 'Demo Squad' : 'My Squad')}
              {address && (
                <span className="text-gray-400 font-medium text-lg ml-2">
                  / {address.slice(0, 6)}…{address.slice(-4)}
                </span>
              )}
            </h1>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
              {memberships?.[0]?.squad?.name ? `${memberships[0].squad.name} • Manager` : (isGuest ? 'Guest Mode • Demo Experience' : 'Connect wallet to get started')}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              onClick={handleOpenOffice}
              size="sm"
              className="bg-gray-900 hover:bg-black text-white border-white/5 font-black uppercase tracking-widest text-xs flex items-center space-x-2 px-4 shadow-xl"
            >
              <Briefcase className="w-3 h-3 text-blue-400" />
              <span>Enter Office</span>
            </Button>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-xs font-black text-gray-400 uppercase">Club Status</div>
                <div className="text-xs font-bold text-green-600">Stable</div>
              </div>
              <div className="w-px h-8 bg-gray-200 dark:bg-gray-700" />
              <div className="text-right">
                <div className="text-xs font-black text-gray-400 uppercase">Rank</div>
                <div className="text-xs font-bold text-gray-900 dark:text-white">#42 Local</div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
        const todayIds = ['pending-actions', 'event-feed', 'staff-feed', 'recent-matches', 'match-engine'];
        const squadIds = ['treasury', 'transfers', 'governance', 'squad-dynamics', 'captains-log'];
        const progressIds = ['quick-stats', 'training', 'achievements', 'scouting-report', 'lens-social', 'nearby-squads', 'territory', 'upcoming-fixtures'];

        const todayWidgets = visibleWidgets.filter(w => todayIds.includes(w.id));
        const squadWidgets = visibleWidgets.filter(w => squadIds.includes(w.id));
        const progressWidgets = visibleWidgets.filter(w => progressIds.includes(w.id));
        const otherWidgets = visibleWidgets.filter(w => ![...todayIds, ...squadIds, ...progressIds].includes(w.id));

        // Mobile: horizontal scroll carousel; desktop: vertical stack
        const Section = ({ title, widgets, href }: { title: string; widgets: typeof visibleWidgets; href?: string }) =>
          widgets.length === 0 ? null : (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{title}</h2>
                {href && (
                  <Link href={href} className="flex items-center gap-0.5 text-[10px] font-bold text-green-600 uppercase tracking-widest min-h-[44px] md:min-h-0">
                    See all <ChevronRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
              {/* Mobile: horizontal snap scroll — capped at 3 cards */}
              <div className="md:hidden -mx-3 px-3">
                <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
                  {widgets.slice(0, 3).map(w => (
                    <div key={w.id} id={w.id} className="snap-start shrink-0 w-[85vw] max-w-sm">
                      {w.component}
                    </div>
                  ))}
                  {widgets.length > 3 && href && (
                    <div className="snap-start shrink-0 w-[60vw] max-w-xs flex items-center justify-center">
                      <Link href={href} className="flex flex-col items-center gap-2 text-green-600 font-bold text-sm min-h-[44px] justify-center">
                        <ChevronRight className="w-6 h-6" />
                        <span>See all</span>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
              {/* Desktop: vertical stack */}
              <div className="hidden md:block space-y-4">
                {widgets.map(w => <div key={w.id} id={w.id}>{w.component}</div>)}
              </div>
            </div>
          );

        return (
          <div className="space-y-8">
            <Section title="Today" widgets={todayWidgets} href="/match" />
            <Section title="Squad" widgets={squadWidgets} href="/squad" />
            <Section title="Progress" widgets={progressWidgets} href="/stats" />
            {otherWidgets.map(w => <div key={w.id} id={w.id}>{w.component}</div>)}
          </div>
        );
      })()}

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
  );
};
