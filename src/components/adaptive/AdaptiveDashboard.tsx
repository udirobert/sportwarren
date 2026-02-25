import React, { useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/common/StatCard';
import { ProgressiveDisclosure } from '@/components/adaptive/ProgressiveDisclosure';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { Target, Users, Trophy, TrendingUp, Calendar, Zap, Shield, Star, Sparkles } from 'lucide-react';

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
            value={18}
            icon={Target}
            color="green"
            onClick={() => trackFeatureUsage('stats-goals')}
          />
          <StatCard
            title="Assists"
            value={11}
            icon={Users}
            color="blue"
            onClick={() => trackFeatureUsage('stats-assists')}
          />
          <StatCard
            title="Matches"
            value={24}
            icon={Trophy}
            color="orange"
            onClick={() => trackFeatureUsage('stats-matches')}
          />
          <StatCard
            title="Rating"
            value="8.2"
            icon={Star}
            color="purple"
            onClick={() => trackFeatureUsage('stats-rating')}
          />
        </div>
      ),
    },
    {
      id: 'recent-matches',
      priority: 90,
      requiredLevel: 'basic',
      category: 'matches',
      component: (
        <Card>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Matches</h2>
          <div className="space-y-3">
            {[
              { opponent: 'Red Lions FC', result: 'W 4-2', date: '2025-01-13' },
              { opponent: 'Sunday Legends', result: 'L 1-3', date: '2025-01-06' },
            ].map((match, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">{match.opponent}</h3>
                  <p className="text-sm text-gray-600">{match.date}</p>
                </div>
                <span className={`font-bold ${
                  match.result.startsWith('W') ? 'text-green-600' : 'text-red-600'
                }`}>
                  {match.result}
                </span>
              </div>
            ))}
          </div>
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
  ], [preferences, trackFeatureUsage]);

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