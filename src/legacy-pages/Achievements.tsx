import React, { useState } from 'react';
import { Card } from '@/components/common/Card';
import { Trophy, Target, Users, Shield, Star, Zap, Crown, Award, Lock } from 'lucide-react';

export const Achievements: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'unlocked' | 'locked' | 'seasonal'>('unlocked');

  const unlockedAchievements = [
    {
      id: 1,
      title: 'Hat-trick Hero',
      description: 'Score 3+ goals in a single match',
      icon: Target,
      rarity: 'rare',
      unlockedDate: '2025-01-13',
      points: 100,
      category: 'scoring',
    },
    {
      id: 2,
      title: 'Assist Master',
      description: 'Record 10+ assists in a season',
      icon: Users,
      rarity: 'epic',
      unlockedDate: '2025-01-10',
      points: 150,
      category: 'playmaking',
    },
    {
      id: 3,
      title: 'Derby Day Hero',
      description: 'Score the winning goal in a rivalry match',
      icon: Crown,
      rarity: 'legendary',
      unlockedDate: '2025-01-06',
      points: 250,
      category: 'clutch',
    },
    {
      id: 4,
      title: 'Consistent Performer',
      description: '5 consecutive matches with 7+ rating',
      icon: Star,
      rarity: 'rare',
      unlockedDate: '2024-12-20',
      points: 100,
      category: 'consistency',
    },
    {
      id: 5,
      title: 'Team Player',
      description: 'Complete a match with more assists than goals',
      icon: Users,
      rarity: 'common',
      unlockedDate: '2024-12-15',
      points: 50,
      category: 'teamwork',
    },
  ];

  const lockedAchievements = [
    {
      id: 6,
      title: 'Golden Boot Winner',
      description: 'Finish as top scorer in your league',
      icon: Award,
      rarity: 'legendary',
      progress: { current: 18, required: 25 },
      points: 500,
      category: 'scoring',
    },
    {
      id: 7,
      title: 'Clean Sheet King',
      description: 'Keep 15+ clean sheets in a season',
      icon: Shield,
      rarity: 'epic',
      progress: { current: 7, required: 15 },
      points: 200,
      category: 'defending',
    },
    {
      id: 8,
      title: 'Century Maker',
      description: 'Play 100 matches for your squad',
      icon: Trophy,
      rarity: 'epic',
      progress: { current: 24, required: 100 },
      points: 300,
      category: 'loyalty',
    },
    {
      id: 9,
      title: 'Perfect Season',
      description: 'Win every match in a season',
      icon: Crown,
      rarity: 'mythic',
      progress: { current: 0, required: 1 },
      points: 1000,
      category: 'winning',
    },
  ];

  const seasonalAchievements = [
    {
      id: 10,
      title: 'Winter Warrior',
      description: 'Score in 5 matches during winter months',
      icon: Zap,
      rarity: 'rare',
      progress: { current: 3, required: 5 },
      points: 100,
      category: 'seasonal',
      timeLeft: 'Ends Jan 31',
    },
    {
      id: 11,
      title: 'New Year, New Goals',
      description: 'Score 10 goals in January',
      icon: Target,
      rarity: 'epic',
      progress: { current: 2, required: 10 },
      points: 150,
      category: 'seasonal',
      timeLeft: 'Ends Jan 31',
    },
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'from-gray-500 to-gray-600';
      case 'rare': return 'from-blue-500 to-blue-600';
      case 'epic': return 'from-purple-500 to-purple-600';
      case 'legendary': return 'from-yellow-500 to-yellow-600';
      case 'mythic': return 'from-pink-500 to-red-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getRarityBorder = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-300';
      case 'rare': return 'border-blue-300';
      case 'epic': return 'border-purple-300';
      case 'legendary': return 'border-yellow-300';
      case 'mythic': return 'border-pink-300';
      default: return 'border-gray-300';
    }
  };

  const totalPoints = unlockedAchievements.reduce((sum, achievement) => sum + achievement.points, 0);

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 space-y-6">
      {/* Achievements Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center mx-auto mb-4">
          <Trophy className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Achievements</h1>
        <p className="text-gray-600 mb-4">Building your legend, one achievement at a time</p>
        
        <div className="flex items-center justify-center space-x-6 text-center">
          <div>
            <div className="text-2xl font-bold text-yellow-600">{unlockedAchievements.length}</div>
            <div className="text-sm text-gray-600">Unlocked</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">{totalPoints}</div>
            <div className="text-sm text-gray-600">Points</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">{lockedAchievements.length}</div>
            <div className="text-sm text-gray-600">In Progress</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { key: 'unlocked', label: 'Unlocked', count: unlockedAchievements.length },
          { key: 'locked', label: 'In Progress', count: lockedAchievements.length },
          { key: 'seasonal', label: 'Seasonal', count: seasonalAchievements.length },
        ].map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as any)}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md transition-all ${
              activeTab === key
                ? 'bg-white text-green-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span className="font-medium">{label}</span>
            <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'unlocked' && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900">Your Achievements</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            {unlockedAchievements.map((achievement) => {
              const Icon = achievement.icon;
              return (
                <Card key={achievement.id} className={`border-2 ${getRarityBorder(achievement.rarity)} relative overflow-hidden`}>
                  <div className="flex items-center space-x-4">
                    <div className={`w-16 h-16 bg-gradient-to-br ${getRarityColor(achievement.rarity)} rounded-xl flex items-center justify-center`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">{achievement.title}</h3>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          achievement.rarity === 'legendary' ? 'bg-yellow-100 text-yellow-800' :
                          achievement.rarity === 'epic' ? 'bg-purple-100 text-purple-800' :
                          achievement.rarity === 'rare' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {achievement.rarity}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-2">{achievement.description}</p>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">
                          Unlocked: {new Date(achievement.unlockedDate).toLocaleDateString()}
                        </span>
                        <span className="font-medium text-green-600">+{achievement.points} pts</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Rarity glow effect */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${getRarityColor(achievement.rarity)}`}></div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'locked' && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900">Achievements in Progress</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            {lockedAchievements.map((achievement) => {
              const Icon = achievement.icon;
              const progress = (achievement.progress.current / achievement.progress.required) * 100;
              
              return (
                <Card key={achievement.id} className="border-2 border-gray-300 relative overflow-hidden opacity-90">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gray-400 rounded-xl flex items-center justify-center relative">
                      <Icon className="w-8 h-8 text-white" />
                      <div className="absolute inset-0 bg-black bg-opacity-30 rounded-xl flex items-center justify-center">
                        <Lock className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-700">{achievement.title}</h3>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          achievement.rarity === 'mythic' ? 'bg-pink-100 text-pink-800' :
                          achievement.rarity === 'legendary' ? 'bg-yellow-100 text-yellow-800' :
                          achievement.rarity === 'epic' ? 'bg-purple-100 text-purple-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {achievement.rarity}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-3">{achievement.description}</p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">
                            {achievement.progress.current} / {achievement.progress.required}
                          </span>
                          <span className="font-medium text-gray-600">+{achievement.points} pts</span>
                        </div>
                        
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'seasonal' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Seasonal Challenges</h2>
            <span className="text-sm text-gray-600">Limited time achievements</span>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            {seasonalAchievements.map((achievement) => {
              const Icon = achievement.icon;
              const progress = (achievement.progress.current / achievement.progress.required) * 100;
              
              return (
                <Card key={achievement.id} className="border-2 border-orange-300 relative overflow-hidden bg-gradient-to-br from-orange-50 to-red-50">
                  <div className="flex items-center space-x-4">
                    <div className={`w-16 h-16 bg-gradient-to-br ${getRarityColor(achievement.rarity)} rounded-xl flex items-center justify-center`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">{achievement.title}</h3>
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-orange-100 text-orange-800">
                          Limited Time
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-2">{achievement.description}</p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">
                            {achievement.progress.current} / {achievement.progress.required}
                          </span>
                          <span className="font-medium text-orange-600">{achievement.timeLeft}</span>
                        </div>
                        
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-orange-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                        
                        <div className="text-right">
                          <span className="text-sm font-medium text-green-600">+{achievement.points} pts</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Seasonal glow effect */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-red-500"></div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};