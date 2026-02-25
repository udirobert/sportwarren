import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { User, Shield, Trophy, Target, Users, Star, TrendingUp, Award, CheckCircle } from 'lucide-react';
import type { PlayerAttributes as PlayerReputationData, SkillRating, Achievement, CareerHighlight } from '@/types';

// Extended types for UI display
interface Endorsement {
  endorser: string;
  endorserRole: 'teammate' | 'opponent' | 'coach' | 'referee';
  skill: string;
  rating: number;
  comment: string;
  date: Date;
  verified: boolean;
}

interface ProfessionalInterest {
  scoutName: string;
  organization: string;
  interestLevel: 'watching' | 'interested' | 'very_interested';
  notes: string;
  date: Date;
}

export const PlayerReputation: React.FC = () => {
  const [playerReputation, setPlayerReputation] = useState<PlayerReputationData | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'skills' | 'achievements' | 'endorsements' | 'scouts'>('overview');
  const [loading, setLoading] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    const mockReputation: PlayerReputationData = {
      address: 'ADDR1234567890ABCDEF',
      playerName: 'Marcus Johnson',
      totalMatches: 47,
      totalGoals: 38,
      totalAssists: 22,
      reputationScore: 8750,
      verifiedStats: true,
      skills: [
        { skill: 'shooting', rating: 87, xp: 850, xpToNextLevel: 1000, maxRating: 99, verified: true, lastUpdated: new Date('2025-01-10'), history: [85, 86, 86, 87, 87] },
        { skill: 'passing', rating: 82, xp: 720, xpToNextLevel: 1000, maxRating: 99, verified: true, lastUpdated: new Date('2025-01-08'), history: [80, 81, 81, 82, 82] },
        { skill: 'dribbling', rating: 79, xp: 650, xpToNextLevel: 1000, maxRating: 99, verified: true, lastUpdated: new Date('2025-01-05'), history: [78, 78, 79, 79, 79] },
        { skill: 'defending', rating: 65, xp: 420, xpToNextLevel: 1000, maxRating: 99, verified: true, lastUpdated: new Date('2025-01-03'), history: [64, 64, 65, 65, 65] },
        { skill: 'physical', rating: 84, xp: 780, xpToNextLevel: 1000, maxRating: 99, verified: true, lastUpdated: new Date('2025-01-01'), history: [83, 83, 84, 84, 84] },
        { skill: 'pace', rating: 76, xp: 580, xpToNextLevel: 1000, maxRating: 99, verified: true, lastUpdated: new Date('2024-12-28'), history: [75, 76, 76, 76, 76] },
      ],
      form: { current: 2, history: [7.5, 8.0, 8.5, 8.0, 8.5], trend: 'up' },
      xp: { level: 12, totalXP: 12500, seasonXP: 3200, nextLevelXP: 15000 },
      achievements: [
        {
          id: 'hat_trick_hero',
          title: 'Hat-trick Hero',
          description: 'Scored 3+ goals in a single match',
          dateEarned: new Date('2025-01-13'),
          rarity: 'rare',
          verified: true,
        },
        {
          id: 'assist_master',
          title: 'Assist Master',
          description: 'Recorded 10+ assists in a season',
          dateEarned: new Date('2025-01-10'),
          rarity: 'epic',
          verified: true,
        },
        {
          id: 'derby_hero',
          title: 'Derby Day Hero',
          description: 'Scored the winning goal in a rivalry match',
          dateEarned: new Date('2025-01-06'),
          rarity: 'legendary',
          verified: true,
        },
      ],
      endorsements: [
        {
          endorser: 'Jamie Thompson',
          endorserRole: 'teammate',
          skill: 'Leadership',
          rating: 9,
          comment: 'Marcus is an exceptional captain who always motivates the team.',
          date: new Date('2025-01-12'),
          verified: true,
        },
        {
          endorser: 'Red Lions FC Captain',
          endorserRole: 'opponent',
          skill: 'Fair Play',
          rating: 8,
          comment: 'Always plays with respect and sportsmanship.',
          date: new Date('2025-01-08'),
          verified: true,
        },
        {
          endorser: 'Coach Williams',
          endorserRole: 'coach',
          skill: 'Tactical Awareness',
          rating: 9,
          comment: 'Excellent understanding of the game and positioning.',
          date: new Date('2025-01-05'),
          verified: true,
        },
      ],
      careerHighlights: [
        {
          id: 'highlight_001',
          title: 'Perfect Hat-trick vs Red Lions',
          description: 'Scored with left foot, right foot, and header in a 4-1 victory',
          date: new Date('2025-01-13'),
          matchId: 'match_001',
          verified: true,
        },
        {
          id: 'highlight_002',
          title: 'Season Top Scorer',
          description: 'Finished as the league\'s top scorer with 25 goals',
          date: new Date('2024-12-20'),
          verified: true,
        },
        {
          id: 'highlight_003',
          title: 'Derby Winner',
          description: 'Scored the decisive goal in the 89th minute against rivals',
          date: new Date('2024-11-15'),
          matchId: 'match_derby_001',
          verified: true,
        },
      ],
      professionalInterest: [
        {
          scoutName: 'David Martinez',
          organization: 'Premier League Scouts Network',
          interestLevel: 'very_interested',
          notes: 'Exceptional finishing ability and leadership qualities. Recommend for trial.',
          date: new Date('2025-01-10'),
        },
        {
          scoutName: 'Sarah Chen',
          organization: 'Championship Talent ID',
          interestLevel: 'interested',
          notes: 'Good technical skills, needs to improve consistency.',
          date: new Date('2024-12-15'),
        },
        {
          scoutName: 'Mike Thompson',
          organization: 'Local Academy',
          interestLevel: 'watching',
          notes: 'Monitoring progress in current season.',
          date: new Date('2024-11-20'),
        },
      ],
    };

    setPlayerReputation(mockReputation);
  }, []);

  const getReputationLevel = (score: number) => {
    if (score >= 9000) return { level: 'Elite', color: 'text-purple-600', bg: 'bg-purple-100' };
    if (score >= 7500) return { level: 'Professional', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (score >= 6000) return { level: 'Advanced', color: 'text-green-600', bg: 'bg-green-100' };
    if (score >= 4000) return { level: 'Intermediate', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { level: 'Beginner', color: 'text-gray-600', bg: 'bg-gray-100' };
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'text-yellow-600 bg-yellow-100';
      case 'epic': return 'text-purple-600 bg-purple-100';
      case 'rare': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getInterestLevelColor = (level: string) => {
    switch (level) {
      case 'very_interested': return 'text-green-600 bg-green-100';
      case 'interested': return 'text-yellow-600 bg-yellow-100';
      case 'watching': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (!playerReputation) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <User className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600">Loading player reputation...</p>
        </div>
      </div>
    );
  }

  const reputationLevel = getReputationLevel(playerReputation.reputationScore);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Player Header */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
              <User className="w-10 h-10 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{playerReputation.playerName}</h1>
                {playerReputation.verifiedStats && (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                )}
              </div>
              <p className="text-gray-600 mb-1">Blockchain Address: {playerReputation.address}</p>
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${reputationLevel.bg} ${reputationLevel.color}`}>
                  {reputationLevel.level} Player
                </span>
                <span className="text-sm text-gray-600">
                  Reputation Score: {playerReputation.reputationScore.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{playerReputation.totalMatches}</div>
            <div className="text-sm text-gray-600">Total Matches</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{playerReputation.totalGoals}</div>
            <div className="text-sm text-gray-600">Goals Scored</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{playerReputation.totalAssists}</div>
            <div className="text-sm text-gray-600">Assists</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{playerReputation.achievements.length}</div>
            <div className="text-sm text-gray-600">Achievements</div>
          </div>
        </div>
      </Card>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { key: 'overview', label: 'Overview', icon: User },
          { key: 'skills', label: 'Skills', icon: TrendingUp },
          { key: 'achievements', label: 'Achievements', icon: Trophy },
          { key: 'endorsements', label: 'Endorsements', icon: Star },
          { key: 'scouts', label: 'Scout Interest', icon: Shield },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as any)}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md transition-all ${
              activeTab === key
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="font-medium">{label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Career Highlights */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Career Highlights</h3>
            <div className="space-y-3">
              {playerReputation.careerHighlights.map((highlight, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Trophy className="w-5 h-5 text-yellow-600 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium text-gray-900">{highlight.title}</h4>
                      {highlight.verified && (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{highlight.description}</p>
                    <p className="text-xs text-gray-500">{highlight.date.toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Achievements */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Achievements</h3>
            <div className="space-y-3">
              {playerReputation.achievements.slice(0, 3).map((achievement) => (
                <div key={achievement.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Award className="w-5 h-5 text-purple-600" />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium text-gray-900">{achievement.title}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${getRarityColor(achievement.rarity)}`}>
                        {achievement.rarity}
                      </span>
                      {achievement.verified && (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{achievement.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'skills' && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Skill Ratings</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {playerReputation.skills.map((skill) => (
              <div key={skill.skill} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">{skill.skill}</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-gray-900">{skill.rating}/{skill.maxRating}</span>
                    {skill.verified && (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    )}
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${(skill.rating / skill.maxRating) * 100}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500">
                  Last updated: {skill.lastUpdated.toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === 'achievements' && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-6">All Achievements</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {playerReputation.achievements.map((achievement) => (
              <div key={achievement.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3 mb-2">
                  <Award className="w-6 h-6 text-purple-600" />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-gray-900">{achievement.title}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${getRarityColor(achievement.rarity)}`}>
                        {achievement.rarity}
                      </span>
                      {achievement.verified && (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                <p className="text-xs text-gray-500">
                  Earned: {achievement.dateEarned.toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === 'endorsements' && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Player Endorsements</h3>
          <div className="space-y-4">
            {playerReputation.endorsements?.map((endorsement, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <div>
                      <h4 className="font-medium text-gray-900">{endorsement.endorser}</h4>
                      <p className="text-sm text-gray-600 capitalize">{endorsement.endorserRole}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <div className="font-bold text-gray-900">{endorsement.rating}/10</div>
                      <div className="text-xs text-gray-600">{endorsement.skill}</div>
                    </div>
                    {endorsement.verified && (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    )}
                  </div>
                </div>
                <p className="text-gray-700 mb-2">"{endorsement.comment}"</p>
                <p className="text-xs text-gray-500">{endorsement.date.toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === 'scouts' && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Professional Scout Interest</h3>
          <div className="space-y-4">
            {playerReputation.professionalInterest?.map((interest, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Shield className="w-5 h-5 text-blue-600" />
                    <div>
                      <h4 className="font-medium text-gray-900">{interest.scoutName}</h4>
                      <p className="text-sm text-gray-600">{interest.organization}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${getInterestLevelColor(interest.interestLevel)}`}>
                    {interest.interestLevel.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <p className="text-gray-700 mb-2">"{interest.notes}"</p>
                <p className="text-xs text-gray-500">{interest.date.toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};