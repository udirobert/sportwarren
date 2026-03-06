import React, { useMemo, useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/common/StatCard';
import { ProgressiveDisclosure } from '@/components/adaptive/ProgressiveDisclosure';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useDashboardData } from '@/hooks/useDashboardData';
import { Target, Users, Trophy, TrendingUp, Calendar, Zap, Shield, Star, Sparkles, MapPin, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { CoachKiteInsight } from '@/components/adaptive/CoachKiteInsight';
import { trpc } from '@/lib/trpc-client';

const NearbyRivals: React.FC = () => {
  const [coords, setCoords] = useState<{ lat: number, lon: number } | null>(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => setCoords({ lat: 53.4808, lon: -2.2426 }) // Manchester default
    );
  }, []);

  const { data: squads, isLoading } = trpc.squad.getNearbySquads.useQuery(
    { latitude: coords?.lat || 53.4808, longitude: coords?.lon || -2.2426 },
    { enabled: !!coords, staleTime: 1000 * 60 * 5 }
  );

  const challengeMutation = trpc.squad.createChallenge.useMutation({
    onSuccess: () => {
      alert('Challenge sent successfully!');
    },
    onError: (err) => {
      alert(`Failed to send challenge: ${err.message}`);
    }
  });

  const handleChallenge = (squadId: string) => {
    challengeMutation.mutate({
      toSquadId: squadId,
      proposedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
      message: 'Fancy a match at Hackney Marshes?'
    });
  };

  if (isLoading || !squads) return (
    <Card className="animate-pulse">
      <div className="h-4 w-32 bg-gray-200 rounded mb-4"></div>
      <div className="space-y-3">
        {[1, 2, 3].map(i => <div key={i} className="h-10 bg-gray-100 rounded"></div>)}
      </div>
    </Card>
  );

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <MapPin className="w-5 h-5 text-red-500" />
          <h2 className="text-lg font-bold text-gray-900">Nearby Rivals</h2>
        </div>
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Hackney Marshes</span>
      </div>
      <div className="space-y-3">
        {squads.map(squad => (
          <div key={squad.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100 group">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center text-white font-black text-xs">
                {squad.shortName}
              </div>
              <div>
                <div className="text-sm font-bold text-gray-900">{squad.name}</div>
                <div className="text-[10px] text-gray-500">{squad.location} • {squad.memberCount} players</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-black text-red-600">{squad.distance}km</div>
              <button
                onClick={() => handleChallenge(squad.id)}
                disabled={challengeMutation.isPending}
                className="text-[10px] font-bold text-blue-600 hover:underline opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
              >
                {challengeMutation.isPending ? 'Sending...' : 'Challenge'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

const TerritoryControl: React.FC<{ squadId: string }> = ({ squadId }) => {
  const { data: territory, isLoading } = trpc.squad.getTerritory.useQuery(
    { squadId },
    { staleTime: 1000 * 60 * 10 }
  );

  if (isLoading || !territory) return <div className="h-32 bg-gray-100 animate-pulse rounded-xl"></div>;

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <h2 className="text-lg font-bold text-gray-900">Territory Control</h2>
        </div>
        <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest">Level 4 District</span>
      </div>
      <div className="space-y-4">
        {territory.length === 0 && (
          <p className="text-xs text-gray-500 italic">No pitches claimed yet. Win a verified match to start controlling territory!</p>
        )}
        {territory.map(pitch => (
          <div key={pitch.id} className="space-y-1.5">
            <div className="flex justify-between items-end">
              <span className="text-sm font-bold text-gray-800">{pitch.name}</span>
              <span className={`text-[10px] font-black uppercase ${pitch.isControlling ? 'text-green-600' : 'text-gray-400'}`}>
                {pitch.isControlling ? 'Home Turf' : 'Contested'}
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden flex">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pitch.dominance}%` }}
                className={`h-full ${pitch.isControlling ? 'bg-green-500' : 'bg-blue-500'}`}
              />
            </div>
            <div className="flex justify-between text-[8px] font-bold text-gray-400 uppercase tracking-tighter">
              <span>{pitch.squadWins} Wins</span>
              <span>{pitch.dominance}% Dominance</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

const TrainingCenter: React.FC<{ userId: string }> = ({ userId }) => {
  const { data: training, refetch } = trpc.player.getTrainingData.useQuery({ userId });

  const syncMutation = trpc.player.syncActivity.useMutation({
    onSuccess: () => refetch()
  });

  const handleQuickSync = (type: 'run' | 'hiit' | 'gym') => {
    syncMutation.mutate({
      userId,
      type,
      duration: 30,
      intensity: 'medium',
      source: 'mock_strava'
    });
  };

  if (!training) return null;

  return (
    <Card className="relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Zap className="w-5 h-5 text-orange-500" />
          <h2 className="text-lg font-bold text-gray-900">Training Center</h2>
        </div>
        <div className="flex items-center space-x-1 bg-orange-100 px-2 py-0.5 rounded-full">
          <span className="text-[10px] font-black text-orange-700 uppercase">{training.sharpness}% Sharpness</span>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6 space-y-2">
        <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase">
          <span>Weekly Goal</span>
          <span>{training.weeklyProgress} / {training.weeklyTarget} mins</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, (training.weeklyProgress / training.weeklyTarget) * 100)}%` }}
            className="h-full bg-gradient-to-r from-orange-400 to-orange-600"
          />
        </div>
      </div>

      {/* Quick Sync Actions */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => handleQuickSync('run')}
          disabled={syncMutation.isPending}
          className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-xl hover:bg-orange-50 hover:text-orange-600 transition-all border border-transparent hover:border-orange-200 group"
        >
          <TrendingUp className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-bold uppercase">Sync Run</span>
        </button>
        <button
          onClick={() => handleQuickSync('hiit')}
          disabled={syncMutation.isPending}
          className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-xl hover:bg-orange-50 hover:text-orange-600 transition-all border border-transparent hover:border-orange-200 group"
        >
          <Zap className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-bold uppercase">Sync HIIT</span>
        </button>
        <button
          onClick={() => handleQuickSync('gym')}
          disabled={syncMutation.isPending}
          className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-xl hover:bg-orange-50 hover:text-orange-600 transition-all border border-transparent hover:border-orange-200 group"
        >
          <Users className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-bold uppercase">Sync Gym</span>
        </button>
      </div>

      {syncMutation.isPending && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
        </div>
      )}
    </Card>
  );
};

const SquadGovernance: React.FC<{ squadId: string }> = ({ squadId }) => {
  const { data: proposals, refetch } = trpc.squad.getProposals.useQuery({ squadId });

  const voteMutation = trpc.squad.voteOnProposal.useMutation({
    onSuccess: () => refetch()
  });

  const executeMutation = trpc.squad.executeProposal.useMutation({
    onSuccess: () => refetch()
  });

  if (!proposals || proposals.length === 0) return (
    <Card className="bg-gray-50 border-dashed border-gray-200">
      <div className="text-center py-6">
        <Shield className="w-8 h-8 text-gray-300 mx-auto mb-2" />
        <p className="text-xs text-gray-500 font-medium">No active squad proposals.</p>
      </div>
    </Card>
  );

  return (
    <Card className="border-l-4 border-l-purple-500">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Users className="w-5 h-5 text-purple-600" />
          <h2 className="text-lg font-bold text-gray-900">Squad DAO</h2>
        </div>
        <span className="text-[10px] font-bold text-purple-600 uppercase tracking-widest">Voting Active</span>
      </div>

      <div className="space-y-4">
        {(proposals as any[]).filter((p: any) => p.status === 'active').map((proposal: any) => {
          const yesVotes = proposal.votes.filter((v: any) => v.vote === 'yes').length;
          const noVotes = proposal.votes.filter((v: any) => v.vote === 'no').length;
          const totalVotes = yesVotes + noVotes;
          const progress = totalVotes > 0 ? (yesVotes / proposal.quorum) * 100 : 0;

          return (
            <div key={proposal.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">{proposal.title}</h3>
                  <p className="text-[10px] text-gray-500 line-clamp-1">{proposal.description}</p>
                </div>
                <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                  {proposal.type.replace('_', ' ')}
                </span>
              </div>

              {/* Vote Progress */}
              <div className="mt-3 space-y-1">
                <div className="flex justify-between text-[8px] font-black text-gray-400 uppercase tracking-tighter">
                  <span>Progress to Quorum</span>
                  <span>{yesVotes} / {proposal.quorum} Yes</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, progress)}%` }}
                    className="h-full bg-purple-500"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 flex items-center gap-2">
                <button
                  onClick={() => voteMutation.mutate({ proposalId: proposal.id, vote: 'yes' })}
                  className="flex-1 py-2 bg-white border border-gray-200 rounded-lg text-[10px] font-bold text-green-600 hover:bg-green-50 hover:border-green-200 transition-all"
                >
                  Vote Yes
                </button>
                <button
                  onClick={() => voteMutation.mutate({ proposalId: proposal.id, vote: 'no' })}
                  className="flex-1 py-2 bg-white border border-gray-200 rounded-lg text-[10px] font-bold text-red-600 hover:bg-red-50 hover:border-red-200 transition-all"
                >
                  Vote No
                </button>
                {yesVotes >= proposal.quorum && (
                  <button
                    onClick={() => executeMutation.mutate({ proposalId: proposal.id })}
                    className="px-3 py-2 bg-purple-600 text-white rounded-lg text-[10px] font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-500/20"
                  >
                    Execute
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

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

  // Get user address from wallet or auth
  const userAddress = typeof window !== 'undefined'
    ? localStorage.getItem('userAddress') || undefined
    : undefined;

  const { data: stats, loading } = useDashboardData(userAddress);

  // Define all possible widgets
  const allWidgets: DashboardWidget[] = useMemo(() => [
    {
      id: 'quick-stats',
      priority: 100,
      requiredLevel: 'basic',
      category: 'stats',
      component: (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <StatCard
            title="Goals"
            value={loading ? '...' : stats?.goals || 0}
            icon={Target}
            color="green"
            onClick={() => trackFeatureUsage('stats-goals')}
          />
          <StatCard
            title="Assists"
            value={loading ? '...' : stats?.assists || 0}
            icon={Users}
            color="blue"
            onClick={() => trackFeatureUsage('stats-assists')}
          />
          <StatCard
            title="Matches"
            value={loading ? '...' : stats?.matches || 0}
            icon={Trophy}
            color="orange"
            onClick={() => trackFeatureUsage('stats-matches')}
          />
          <StatCard
            title="Rating"
            value={loading ? '...' : stats?.rating || '0.0'}
            icon={Star}
            color="purple"
            onClick={() => trackFeatureUsage('stats-rating')}
          />
        </div>
      ),
    },
    {
      id: 'governance',
      priority: 92,
      requiredLevel: 'basic',
      category: 'social',
      component: <SquadGovernance squadId="demo-squad-id" />,
    },
    {
      id: 'ai-insights',
      priority: 95,
      requiredLevel: 'basic',
      category: 'stats',
      component: (
        <CoachKiteInsight userId={userAddress || 'demo-user'} />
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
      component: <TerritoryControl squadId="demo-squad-id" />,
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
          <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Matches</h2>
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
              <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-gray-900 text-sm">
                    <span className="font-semibold">Jamie Thompson</span> scored a hat-trick! 🔥
                  </p>
                  <p className="text-xs text-gray-600">2 hours ago</p>
                </div>
              </div>
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
      id: 'upcoming-fixtures',
      priority: 80,
      requiredLevel: 'basic',
      category: 'matches',
      component: (
        <Card>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Next Match</h2>
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">vs Grass Roots United</h3>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>Jan 20, 2:00 PM</span>
              </div>
            </div>
          </div>
        </Card>
      ),
    },
  ], [preferences, trackFeatureUsage, stats, loading]);

  // Filter and sort widgets based on user preferences
  const visibleWidgets = useMemo(() => {
    return allWidgets
      .filter(widget => {
        // Check if widget should be visible based on UI complexity
        const complexityMatch =
          widget.requiredLevel === 'basic' ||
          (widget.requiredLevel === 'intermediate' && preferences.uiComplexity !== 'simple') ||
          (widget.requiredLevel === 'advanced' && preferences.uiComplexity === 'advanced');

        // Check if feature is unlocked
        const isUnlocked = preferences.unlockedFeatures.includes(widget.id) ||
          widget.requiredLevel === 'basic';

        // Check category preferences
        const categoryMatch =
          (widget.category === 'stats' && preferences.preferredFeatures.statistics !== 'basic') ||
          (widget.category === 'social' && preferences.preferredFeatures.social !== 'minimal') ||
          (widget.category === 'achievements' && preferences.preferredFeatures.gamification !== 'none') ||
          widget.category === 'matches'; // Always show matches

        return complexityMatch && (isUnlocked || widget.unlockCondition) &&
          (widget.category === 'matches' || widget.category === 'stats' || categoryMatch);
      })
      .sort((a, b) => {
        // Prioritize recently used features
        const aRecentlyUsed = preferences.usagePatterns.lastActiveFeatures.includes(a.id);
        const bRecentlyUsed = preferences.usagePatterns.lastActiveFeatures.includes(b.id);

        if (aRecentlyUsed && !bRecentlyUsed) return -1;
        if (!aRecentlyUsed && bRecentlyUsed) return 1;

        // Then sort by priority
        return b.priority - a.priority;
      });
  }, [allWidgets, preferences]);

  // Determine layout based on preferences
  const getLayoutClass = () => {
    switch (preferences.dashboardLayout) {
      case 'minimal':
        return 'space-y-4';
      case 'balanced':
        return 'space-y-6';
      case 'comprehensive':
        return 'space-y-8';
      default:
        return 'space-y-4';
    }
  };

  return (
    <div className={`max-w-7xl mx-auto px-3 md:px-6 py-4 md:py-6 ${getLayoutClass()}`}>
      {/* Welcome Header - Always visible but adapts */}
      <div className="text-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Welcome back, <span className="text-green-600">Marcus</span>
        </h1>
        {preferences.uiComplexity !== 'simple' && (
          <p className="text-gray-600">
            {preferences.primaryRole === 'organizer'
              ? 'Your squad is ready for action!'
              : 'Ready to build your legend?'
            }
          </p>
        )}
      </div>

      {/* Adaptive Widget Grid */}
      <div className="space-y-6">
        {visibleWidgets.map((widget) => (
          <div key={widget.id}>
            {widget.component}
          </div>
        ))}
      </div>

      {/* Feature Discovery Hint */}
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