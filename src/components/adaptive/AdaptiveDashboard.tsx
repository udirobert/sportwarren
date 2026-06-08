"use client";

import React, { useMemo } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/common/StatCard';
import { ProgressiveDisclosure } from '@/components/adaptive/ProgressiveDisclosure';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useDashboardData } from '@/hooks/useDashboardData';
import { Target, Users, Trophy, TrendingUp, Calendar, Zap, Star, Sparkles, MessageCircle, Bell, Share2, Smartphone, Activity, ArrowRight } from 'lucide-react';
import { DashboardSection, type DashboardWidget } from '@/components/adaptive/DashboardSection';
import { DashboardHeader } from '@/components/adaptive/DashboardHeader';
import { NewUserDashboard } from '@/components/adaptive/NewUserDashboard';
import { buildTelegramDeepLink } from '@/lib/telegram/deep-links';
import { TrpcErrorBoundary } from '@/components/ui/TrpcErrorBoundary';
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
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow';
import { trpc } from '@/lib/trpc-client';
import { getDashboardEntryState, type DashboardEntryAction } from '@/lib/dashboard/entry-state';
import { useTactics } from '@/hooks/squad/useTactics';
import { useMatchCenterData } from '@/hooks/match/useMatchCenterData';
import { useDigitalTwinBroadcastAccess } from '@/hooks/useDigitalTwinBroadcastAccess';
import { CelebrationOverlay } from '@/components/ui/CelebrationOverlay';
import { SoccerLoader } from '@/components/ui/SoccerLoader';
import { summarizeAvatarUpgrade } from '@/lib/avatar/diff';

import { QuickLogWidget } from '@/components/dashboard/QuickLogWidget';
import { MatchCoordinationWidget } from '@/components/dashboard/MatchCoordinationWidget';
import { PeerRatingTaskCard } from '@/components/dashboard/PeerRatingTaskCard';
import { SquadDigitalTwinWidget } from '@/components/dashboard/SquadDigitalTwinWidget';
import { DigitalTwinUpgradeGate } from '@/components/dashboard/DigitalTwinUpgradeGate';
import { CoachKiteWidget } from '@/components/dashboard/CoachKiteWidget';
import { SharpnessStreakWidget } from '@/components/dashboard/SharpnessStreakWidget';
import { TwinHeroCard } from '@/components/dashboard/TwinHeroCard';
import { DailyDrillWidget } from '@/components/dashboard/DailyDrillWidget';
import { PostMatchReaction } from '@/components/dashboard/PostMatchReaction';
import { WeeklyChallengesWidget } from '@/components/dashboard/WeeklyChallengesWidget';
import { PrestigeWidget } from '@/components/dashboard/PrestigeWidget';
import { ReferralWidget } from '@/components/dashboard/ReferralWidget';
import { ChallengeButton } from '@/components/squad/ChallengeButton';
import dynamic from 'next/dynamic';
import {
  DIGITAL_TWIN_3D_TEASER_KEY,
  DIGITAL_TWIN_3D_UNLOCK_KEY,
} from '@/lib/digital-twin/access';

// Statically imported (small / always visible)
import { AgentProvider } from '@/context/AgentContext';
import { CreateSquadFlow } from '@/components/squad/CreateSquadFlow';
import { JoinSquadFlow } from '@/components/squad/JoinSquadFlow';
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

export const AdaptiveDashboard: React.FC = () => {
  const { preferences, trackFeatureUsage, unlockFeature } = useUserPreferences();
  const { address, isGuest, hasAccount, hasWallet, authStatus, refreshAuthSignature } = useWallet();
  const { venue } = useEnvironment();
  const { addToast } = useToast();
  const [isStaffRoomOpen, setIsStaffRoomOpen] = React.useState(false);
  const [isTourActive, setIsTourActive] = React.useState(false);
  const [showCreateSquadFlow, setShowCreateSquadFlow] = React.useState(false);
  const [showJoinSquadFlow, setShowJoinSquadFlow] = React.useState(false);
  const [isSquadPickerOpen, setIsSquadPickerOpen] = React.useState(false);
  const [expandedSections, setExpandedSections] = React.useState<Record<string, boolean>>({
    Today: true,
    Squad: false,
    Progress: false,
  });
  const [avatarCelebration, setAvatarCelebration] = React.useState<{
    visible: boolean;
    title: string;
    subtitle: string;
    type: 'verified' | 'achievement' | 'legendary';
  }>({
    visible: false,
    title: '',
    subtitle: '',
    type: 'verified',
  });
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
  const avatarPresentationQuery = trpc.player.getAvatarPresentation.useQuery(
    { squadId: primarySquadId },
    {
      enabled: isVerified,
      retry: false,
      staleTime: 30 * 1000,
    },
  );
  const avatarPresentation = avatarPresentationQuery.data;
  const { availableOpponents } = useMatchCenterData(primarySquadId);
  const { completeChecklistItem, allChecklistDone, completedCount, totalCount } = useOnboarding();
  const currentUserId = currentProfile?.userId;
  const profileSharpness = currentProfile?.sharpness ?? 50;
  const profileUpdatedAt = currentProfile?.updatedAt ?? null;
  const profileWeeklyStreak = (currentProfile as any)?.weeklyStreak ?? 0;
  const profileLongestStreak = (currentProfile as any)?.longestStreak ?? 0;
  const profileTotalXP = currentProfile?.totalXP ?? 0;
  const profileUserName = currentProfile?.user?.name ?? 'Player';
  const { access: digitalTwin3DAccess } = useDigitalTwinBroadcastAccess({
    squadId: primarySquadId || undefined,
    preferences,
    totalMatches: stats?.matches ?? 0,
    avatarRecentUnlock: (avatarPresentation as any)?.recentUnlock,
  });

  const handleDigitalTwin3DPreview = React.useCallback(() => {
    unlockFeature(DIGITAL_TWIN_3D_TEASER_KEY);
    if (digitalTwin3DAccess.canLaunch) {
      unlockFeature(DIGITAL_TWIN_3D_UNLOCK_KEY);
    }
    trackFeatureUsage('digital-twin-3d', 5_000);
    addToast({
      tone: 'success',
      title: digitalTwin3DAccess.canLaunch ? '3D Broadcast Tracked' : 'Upgrade Path Tracked',
      message: digitalTwin3DAccess.canLaunch
        ? 'Your squad is marked for immersive broadcast rollout.'
        : 'We will keep the 2D experience primary and surface 3D as your squad qualifies.',
    });
    router.push(primarySquadId ? `/broadcast?squadId=${primarySquadId}` : '/broadcast');
  }, [addToast, digitalTwin3DAccess.canLaunch, primarySquadId, router, trackFeatureUsage, unlockFeature]);

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
  const showOnboardingOverlay = !isGuest && hasAccount && !preferences.onboardingCompleted && !personalizationDone;

  const submitMatch = trpc.match.submit.useMutation();

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
          id: 'onboarding-flow',
          priority: 1000,
          requiredLevel: 'basic',
          category: 'stats',
          component: (
            <OnboardingFlow journeyStage={entryState.id} onComplete={() => setPersonalizationDone(true)} completeChecklistItem={completeChecklistItem} />
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

    if (isVerified && currentUserId) {
      widgets.push({
        id: 'twin-hero',
        priority: 998,
        requiredLevel: 'basic',
        category: 'stats',
        component: <TwinHeroCard />,
      });

      if (hasOperationalSquad) {
        widgets.push({
          id: 'post-match-reaction',
          priority: 997,
          requiredLevel: 'basic',
          category: 'stats',
          component: <PostMatchReaction />,
        });
      }

      widgets.push({
        id: 'daily-drill',
        priority: 460,
        requiredLevel: 'basic',
        category: 'stats',
        component: <DailyDrillWidget />,
      });
    }

    if (primarySquadId) {
      widgets.push({
        id: 'match-coordination',
        priority: 475, // Higher than quick-log
        requiredLevel: 'basic',
        category: 'matches',
        component: (
          <MatchCoordinationWidget squadId={primarySquadId} />
        ),
      });

      widgets.push({
        id: 'squad-digital-twin',
        priority: 455,
        requiredLevel: 'basic',
        category: 'squad',
        component: (
          <SquadDigitalTwinWidget squadId={primarySquadId} />
        ),
      });

      widgets.push({
        id: 'digital-twin-3d-gate',
        priority: 452,
        requiredLevel: 'basic',
        category: 'squad',
        component: (
          <DigitalTwinUpgradeGate
            access={digitalTwin3DAccess}
            onPreview={handleDigitalTwin3DPreview}
            squadId={primarySquadId}
          />
        ),
      });

      widgets.push({
        id: 'coach-kite',
        priority: 451,
        requiredLevel: 'basic',
        category: 'matches',
        component: <CoachKiteWidget squadId={primarySquadId} />,
      });

      widgets.push({
        id: 'quick-log',
        priority: 450,
        requiredLevel: 'basic',
        category: 'matches',
        component: (
          <QuickLogWidget
            squadId={primarySquadId}
            homeTeam={primarySquadName || 'My Squad'}
            opponents={availableOpponents}
            onLog={async (data) => {
              try {
                const previousAvatar = avatarPresentation;
                await submitMatch.mutateAsync({
                  homeSquadId: primarySquadId,
                  awaySquadId: data.awaySquadId,
                  homeScore: data.homeScore,
                  awayScore: data.awayScore,
                  matchDate: new Date(),
                  isSociallyTrusted: true,
                });

                addToast({
                  tone: 'success',
                  title: 'Match Logged',
                  message: 'Result submitted to the verification queue.',
                });
                await refreshSquads();
                const refreshedAvatar = (await avatarPresentationQuery.refetch()).data;
                const avatarUpgrade = summarizeAvatarUpgrade(previousAvatar, refreshedAvatar);

                if (avatarUpgrade) {
                  setAvatarCelebration({
                    visible: true,
                    title: avatarUpgrade.title,
                    subtitle: avatarUpgrade.subtitle,
                    type: avatarUpgrade.type,
                  });
                }
              } catch (error) {
                const message = error instanceof Error
                  ? error.message
                  : 'There was an error submitting the match.';

                addToast({
                  tone: 'error',
                  title: 'Submission Failed',
                  message,
                });
              }
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
          <div onClick={() => completeChecklistItem('log_match')} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); completeChecklistItem('log_match'); } }}>
            <MatchEnginePreview
              squadId={primarySquadId}
              formation={squadTactics?.formation}
              playStyle={squadTactics?.style}
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
      component: (
        <TrpcErrorBoundary>
          <LensSocialHub />
        </TrpcErrorBoundary>
      ),
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
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <SoccerLoader size={48} />
              <p className="text-xs font-black uppercase tracking-widest text-emerald-600/60 dark:text-emerald-400/60 animate-pulse">
                Syncing Match Intelligence
              </p>
            </div>
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
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-semibold text-gray-900 text-sm">vs {match.opponent}</h3>
                          {match.status === 'verified' && (
                            <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-emerald-100 text-[8px] font-black text-emerald-700 uppercase tracking-tighter" title="Socially Trusted">
                              <Users className="w-2 h-2" />
                              Trusted
                            </div>
                          )}
                        </div>
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
                      {match.status === 'verified' && (
                        <Link href={`/match/${match.id}/rate`}>
                          <Button size="sm" variant="outline" className="h-7 px-2 text-[10px] font-bold border-primary/30 text-primary hover:bg-primary/10">
                            Rate
                          </Button>
                        </Link>
                      )}
                      {match.id && (
                        <Link
                          href={`/match/${match.id}`}
                          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          title="Share result"
                        >
                          <Share2 className="w-3.5 h-3.5 text-gray-400 hover:text-green-600" />
                        </Link>
                      )}
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
      component: (
        <TrpcErrorBoundary>
          <SquadDynamics squadId={primarySquadId} />
        </TrpcErrorBoundary>
      ),
      },
      {
      id: 'scouting-report',
      priority: 87,
      requiredLevel: 'basic',
      category: 'social',
      component: (
        <TrpcErrorBoundary>
          <ScoutingReport squadId={primarySquadId} />
        </TrpcErrorBoundary>
      ),
      },
      {
        id: 'peer-rating-tasks',
        priority: 460,
        requiredLevel: 'basic',
        category: 'matches',
        component: (
          <TrpcErrorBoundary>
            <PeerRatingTaskCard />
          </TrpcErrorBoundary>
        ),
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

    // === Engagement & Gamification Widgets ===

    // Sharpness Streak
    widgets.push({
      id: 'sharpness-streak',
      priority: 470,
      requiredLevel: 'basic',
      category: 'stats',
      component: (
        <SharpnessStreakWidget
          sharpness={profileSharpness}
          lastActivityDate={profileUpdatedAt ? new Date(profileUpdatedAt) : null}
          currentStreak={profileWeeklyStreak}
          longestStreak={profileLongestStreak}
        />
      ),
    });

    // Weekly Challenges
    widgets.push({
      id: 'weekly-challenges',
      priority: 465,
      requiredLevel: 'basic',
      category: 'achievements',
      component: (
        <WeeklyChallengesWidget
          weeklyStats={{
            goals: stats?.goals ?? 0,
            assists: stats?.assists ?? 0,
            matches: stats?.matches ?? 0,
            ratings: 0,
            wins: 0,
            cleanSheets: 0,
            verifications: 0,
            hatTricks: 0,
          }}
        />
      ),
    });

    // Prestige Progress
    widgets.push({
      id: 'prestige-progress',
      priority: 200,
      requiredLevel: 'basic',
      category: 'achievements',
      component: (
        <PrestigeWidget
          totalLifetimeXP={profileTotalXP}
          onClick={() => router.push('/stats')}
        />
      ),
    });

    // Referral Widget
    if (currentUserId) {
      widgets.push({
        id: 'referral',
        priority: 100,
        requiredLevel: 'basic',
        category: 'social',
        component: (
          <ReferralWidget
            userId={currentUserId}
            playerName={profileUserName}
          />
        ),
      });
    }

    // Challenge Button (inside squad section)
    if (primarySquadId && primarySquadName) {
      widgets.push({
        id: 'squad-challenge',
        priority: 180,
        requiredLevel: 'basic',
        category: 'social',
        component: (
          <Card padding="sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Challenge Rivals</h3>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">Send a match challenge link</p>
              </div>
              <ChallengeButton squadId={primarySquadId} squadName={primarySquadName} />
            </div>
          </Card>
        ),
      });
    }

    return widgets;
  }, [addToast, allChecklistDone, availableOpponents, avatarPresentation, avatarPresentationQuery, completeChecklistItem, currentUserId, dataState, digitalTwin3DAccess, entryState.id, handleDigitalTwin3DPreview, handleOpenOffice, hasOperationalSquad, isGuest, isVerified, loading, matchesZeroState.actionHref, matchesZeroState.actionLabel, matchesZeroState.description, matchesZeroState.title, nextMatchZeroState.actionHref, nextMatchZeroState.actionLabel, nextMatchZeroState.description, nextMatchZeroState.title, personalizationDone, preferences, primarySquadId, primarySquadName, profileSharpness, profileUpdatedAt, profileWeeklyStreak, profileLongestStreak, profileTotalXP, profileUserName, refreshSquads, router, squadActivityZeroState.actionHref, squadActivityZeroState.actionLabel, squadActivityZeroState.description, squadActivityZeroState.title, squadTactics?.formation, squadTactics?.style, stats, submitMatch, trackFeatureUsage]);

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
      : (entryState.id === 'account_ready'
          ? ['onboarding-checklist', 'match-engine', 'quick-stats', 'staff-feed']
          : ['onboarding-checklist', 'match-engine', 'upcoming-fixtures', 'quick-stats', 'recent-matches']);

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
  }, [allWidgets, hasOperationalSquad, isGuest, preferences, entryState.id]);

  if (showCreateSquadFlow) {
    return (
      <CreateSquadFlow
        onCreated={async (id) => {
          setActiveSquad(id);
          setShowCreateSquadFlow(false);
          await refreshSquads();
          router.push('/squad?tab=overview&new=1');
        }}
        onCancel={() => setShowCreateSquadFlow(false)}
      />
    );
  }

  if (showJoinSquadFlow) {
    return (
      <JoinSquadFlow
        onJoined={async (id) => {
          setActiveSquad(id);
          setShowJoinSquadFlow(false);
          await refreshSquads();
          router.push('/squad?tab=overview&new=1');
        }}
        onCancel={() => setShowJoinSquadFlow(false)}
      />
    );
  }

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

    if (action.intent === 'join_squad') {
      return (
        <Button
          key={action.label}
          size="sm"
          onClick={() => setShowJoinSquadFlow(true)}
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

  if (entryState.isNewUser) {
    return (
      <NewUserDashboard
        entryState={entryState}
        isGuest={isGuest}
        venue={venue}
        isTourActive={isTourActive}
        setIsTourActive={setIsTourActive}
        setPersonalizationDone={setPersonalizationDone}
        completeChecklistItem={completeChecklistItem}
        renderEntryAction={renderEntryAction}
      />
    );
  }

  // ── Returning User Dashboard ──────────────────────────────────────
  return (
    <div className={`max-w-7xl mx-auto px-3 md:px-6 py-4 md:py-6 nav-spacer-top nav-spacer-bottom ${getLayoutClass()}`}>
      {/* First-run onboarding overlay — shown fullscreen until personalization is complete */}
      {showOnboardingOverlay && (
        <div className="fixed inset-0 z-[200] bg-gray-950/95 backdrop-blur-sm flex items-center justify-center p-4 nav-spacer-top">
          <div className="w-full max-w-lg">
            <OnboardingFlow
              onComplete={() => setPersonalizationDone(true)}
              journeyStage={entryState.id}
              completeChecklistItem={completeChecklistItem}
            />
          </div>
        </div>
      )}
      <CelebrationOverlay
        isVisible={avatarCelebration.visible}
        type={avatarCelebration.type}
        title={avatarCelebration.title}
        subtitle={avatarCelebration.subtitle}
        onComplete={() => setAvatarCelebration((current) => ({ ...current, visible: false }))}
      />
      <div className="flex items-center justify-between text-xs font-semibold text-gray-400 uppercase tracking-widest">
        <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-[10px] font-black tracking-[0.18em] text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
          {entryState.surfaceLabel}
        </span>
      </div>

      <DashboardHeader
        entryState={entryState}
        avatarPresentation={avatarPresentation}
        currentProfile={currentProfile}
        address={address}
        isGuest={isGuest}
        hasAccount={hasAccount}
        hasWallet={hasWallet}
        isVerified={isVerified}
        venue={venue}
        primarySquadId={primarySquadId}
        primarySquadName={primarySquadName}
        activeMembersCount={activeMembersCount}
        memberships={memberships}
        isSquadPickerOpen={isSquadPickerOpen}
        setIsSquadPickerOpen={setIsSquadPickerOpen}
        setActiveSquad={setActiveSquad}
        squadPickerRef={squadPickerRef}
        authStatus={authStatus}
        renderEntryAction={renderEntryAction}
      />

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

      <OnboardingFlow onVisibilityChange={setIsTourActive} journeyStage={entryState.id} completeChecklistItem={completeChecklistItem} />
      {!isTourActive && <AgenticConcierge journeyStage={entryState.id} />}

      {/* Next-action focus strip — shows the single most important thing to do */}
      <div className="flex items-center gap-2 flex-wrap mb-4">
        <span className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 mr-1">Focus:</span>
        {entryState.primaryAction.href ? (
          <Link href={entryState.primaryAction.href}>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-green-500/15 to-emerald-500/15 border border-green-500/25 px-3 py-1.5 text-xs font-bold text-green-400 hover:bg-green-500/25 transition-colors">
              <Zap className="w-3 h-3" />
              {entryState.primaryAction.label}
              <ArrowRight className="w-3 h-3" />
            </span>
          </Link>
        ) : entryState.primaryAction.intent && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 border border-green-500/20 px-3 py-1.5 text-xs font-bold text-green-400">
            {entryState.primaryAction.label}
          </span>
        )}
        {entryState.secondaryAction && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-3 py-1.5 text-xs font-bold text-gray-400">
            {entryState.secondaryAction.label}
          </span>
        )}
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
        const todayIds = ['quick-log', 'onboarding-checklist', 'pending-actions', 'event-feed', 'staff-feed', 'recent-matches', 'match-engine', 'quick-stats', 'achievements', 'upcoming-fixtures', 'coach-kite'];
        const squadIds = ['governance', 'squad-dynamics', 'captains-log', 'communication-hub', 'squad-digital-twin', 'digital-twin-3d-gate'];
        const progressIds = ['training', 'scouting-report', 'lens-social', 'nearby-squads', 'territory'];

        const todayWidgets = visibleWidgets.filter(w => todayIds.includes(w.id));
        const squadWidgets = visibleWidgets.filter(w => squadIds.includes(w.id));
        const progressWidgets = visibleWidgets.filter(w => progressIds.includes(w.id));
        const otherWidgets = visibleWidgets.filter(w => ![...todayIds, ...squadIds, ...progressIds].includes(w.id));

        const sectionLayouts = {
          Today: {
            'quick-log': 'md:col-span-12',
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
            'squad-digital-twin': 'md:col-span-12 lg:col-span-6',
            'digital-twin-3d-gate': 'md:col-span-12 lg:col-span-6',
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

        const sections = [
          { title: 'Today', widgets: todayWidgets },
          { title: 'Squad', widgets: squadWidgets },
          { title: 'Progress', widgets: progressWidgets },
        ] as const;

        return (
          <div className="space-y-3 md:space-y-5">
            {sections.map(({ title, widgets }) => (
              <DashboardSection
                key={title}
                title={title}
                widgets={widgets}
                isExpanded={expandedSections[title] ?? (title === 'Today')}
                onToggle={() => setExpandedSections(prev => ({ ...prev, [title]: !prev[title] }))}
                layoutMap={sectionLayouts}
                featuredIds={featuredBySection[title] ?? []}
              />
            ))}
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
  );
};
