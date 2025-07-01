import React, { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { Trophy, Globe, Coins, Users, Calendar, Target, Star, Crown, Award } from 'lucide-react';

interface GlobalChallenge {
  id: string;
  title: string;
  description: string;
  type: 'goals' | 'assists' | 'clean_sheets' | 'wins' | 'special';
  sponsor: string;
  prizePool: number;
  currency: 'ALGO' | 'USD';
  participants: number;
  maxParticipants?: number;
  startDate: Date;
  endDate: Date;
  status: 'upcoming' | 'active' | 'ended';
  leaderboard: LeaderboardEntry[];
  userRank?: number;
  userProgress?: number;
  requirements: string[];
  featured: boolean;
}

interface LeaderboardEntry {
  rank: number;
  playerName: string;
  playerAddress: string;
  score: number;
  country: string;
  verified: boolean;
}

export const GlobalChallenges: React.FC = () => {
  const [challenges, setChallenges] = useState<GlobalChallenge[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<GlobalChallenge | null>(null);
  const [activeTab, setActiveTab] = useState<'featured' | 'active' | 'upcoming' | 'ended'>('featured');
  const [loading, setLoading] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    const mockChallenges: GlobalChallenge[] = [
      {
        id: 'fifa_world_cup_goals',
        title: 'FIFA World Cup Goals Challenge',
        description: 'Score the most goals during the World Cup period and win exclusive FIFA NFTs and ALGO rewards.',
        type: 'goals',
        sponsor: 'FIFA',
        prizePool: 10000,
        currency: 'ALGO',
        participants: 15420,
        maxParticipants: 50000,
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-03-31'),
        status: 'active',
        leaderboard: [
          { rank: 1, playerName: 'Carlos Rodriguez', playerAddress: 'ADDR...ABC', score: 47, country: 'Brazil', verified: true },
          { rank: 2, playerName: 'Ahmed Hassan', playerAddress: 'ADDR...DEF', score: 43, country: 'Egypt', verified: true },
          { rank: 3, playerName: 'Marcus Johnson', playerAddress: 'ADDR...GHI', score: 38, country: 'UK', verified: true },
          { rank: 4, playerName: 'Yuki Tanaka', playerAddress: 'ADDR...JKL', score: 35, country: 'Japan', verified: true },
          { rank: 5, playerName: 'Sofia Andersson', playerAddress: 'ADDR...MNO', score: 32, country: 'Sweden', verified: true },
        ],
        userRank: 3,
        userProgress: 38,
        requirements: ['Verified player account', 'Minimum 10 matches played', 'Goals must be verified by opponents'],
        featured: true,
      },
      {
        id: 'adidas_assist_master',
        title: 'Adidas Assist Master',
        description: 'Become the ultimate playmaker with the most assists in February.',
        type: 'assists',
        sponsor: 'Adidas',
        prizePool: 5000,
        currency: 'ALGO',
        participants: 8750,
        maxParticipants: 25000,
        startDate: new Date('2025-02-01'),
        endDate: new Date('2025-02-28'),
        status: 'upcoming',
        leaderboard: [],
        requirements: ['Active squad membership', 'Assists verified by teammates'],
        featured: true,
      },
      {
        id: 'nike_clean_sheet_king',
        title: 'Nike Clean Sheet Championship',
        description: 'Goalkeepers and defenders compete for the most clean sheets.',
        type: 'clean_sheets',
        sponsor: 'Nike',
        prizePool: 7500,
        currency: 'ALGO',
        participants: 3200,
        startDate: new Date('2025-01-15'),
        endDate: new Date('2025-04-15'),
        status: 'active',
        leaderboard: [
          { rank: 1, playerName: 'Sarah Martinez', playerAddress: 'ADDR...PQR', score: 12, country: 'Spain', verified: true },
          { rank: 2, playerName: 'David Kim', playerAddress: 'ADDR...STU', score: 11, country: 'South Korea', verified: true },
          { rank: 3, playerName: 'Emma Thompson', playerAddress: 'ADDR...VWX', score: 10, country: 'Australia', verified: true },
        ],
        userRank: 1,
        userProgress: 12,
        requirements: ['Goalkeeper or defender position', 'Match results verified by opponents'],
        featured: false,
      },
      {
        id: 'puma_weekend_warrior',
        title: 'Puma Weekend Warrior',
        description: 'Win the most matches during weekends in January.',
        type: 'wins',
        sponsor: 'Puma',
        prizePool: 3000,
        currency: 'ALGO',
        participants: 12500,
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-01-31'),
        status: 'ended',
        leaderboard: [
          { rank: 1, playerName: 'Team Captain Alex', playerAddress: 'ADDR...YZA', score: 8, country: 'Germany', verified: true },
          { rank: 2, playerName: 'Weekend Legend', playerAddress: 'ADDR...BCD', score: 7, country: 'Netherlands', verified: true },
          { rank: 3, playerName: 'Victory Hunter', playerAddress: 'ADDR...EFG', score: 6, country: 'France', verified: true },
        ],
        requirements: ['Squad captain or co-captain', 'Weekend matches only'],
        featured: false,
      },
      {
        id: 'coca_cola_community_cup',
        title: 'Coca-Cola Community Cup',
        description: 'Special community challenge with multiple categories and massive prizes.',
        type: 'special',
        sponsor: 'Coca-Cola',
        prizePool: 25000,
        currency: 'ALGO',
        participants: 45000,
        maxParticipants: 100000,
        startDate: new Date('2025-03-01'),
        endDate: new Date('2025-05-31'),
        status: 'upcoming',
        leaderboard: [],
        requirements: ['Open to all players', 'Multiple challenge categories', 'Community voting component'],
        featured: true,
      },
    ];

    setChallenges(mockChallenges);
  }, []);

  const handleJoinChallenge = async (challengeId: string) => {
    setLoading(true);
    try {
      // In production, this would interact with Algorand smart contracts
      setChallenges(challenges.map(challenge => {
        if (challenge.id === challengeId) {
          return {
            ...challenge,
            participants: challenge.participants + 1,
          };
        }
        return challenge;
      }));

      console.log(`Joined challenge: ${challengeId}`);
    } catch (error) {
      console.error('Failed to join challenge:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: GlobalChallenge['type']) => {
    switch (type) {
      case 'goals': return Target;
      case 'assists': return Users;
      case 'clean_sheets': return Award;
      case 'wins': return Trophy;
      case 'special': return Star;
      default: return Trophy;
    }
  };

  const getTypeColor = (type: GlobalChallenge['type']) => {
    switch (type) {
      case 'goals': return 'bg-red-100 text-red-800';
      case 'assists': return 'bg-blue-100 text-blue-800';
      case 'clean_sheets': return 'bg-green-100 text-green-800';
      case 'wins': return 'bg-yellow-100 text-yellow-800';
      case 'special': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: GlobalChallenge['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'ended': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredChallenges = challenges.filter(challenge => {
    if (activeTab === 'featured') return challenge.featured;
    return challenge.status === activeTab;
  });

  const formatPrize = (amount: number, currency: string) => {
    if (currency === 'ALGO') {
      return `${amount.toLocaleString()} ALGO`;
    }
    return `$${amount.toLocaleString()}`;
  };

  const getTimeRemaining = (endDate: Date) => {
    const now = new Date();
    const diff = endDate.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (days > 0) {
      return `${days} days remaining`;
    } else {
      return 'Ended';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center mx-auto mb-4">
          <Globe className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Global Challenges</h1>
        <p className="text-gray-600">Compete with players worldwide for ALGO rewards and exclusive prizes</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card padding="sm" className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {challenges.filter(c => c.status === 'active').length}
          </div>
          <div className="text-sm text-gray-600">Active Challenges</div>
        </Card>
        <Card padding="sm" className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {challenges.reduce((sum, c) => sum + c.prizePool, 0).toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Total Prize Pool (ALGO)</div>
        </Card>
        <Card padding="sm" className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {challenges.reduce((sum, c) => sum + c.participants, 0).toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Total Participants</div>
        </Card>
        <Card padding="sm" className="text-center">
          <div className="text-2xl font-bold text-orange-600">
            {challenges.filter(c => c.userRank).length}
          </div>
          <div className="text-sm text-gray-600">Your Active Challenges</div>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { key: 'featured', label: 'Featured', icon: Star },
          { key: 'active', label: 'Active', icon: Trophy },
          { key: 'upcoming', label: 'Upcoming', icon: Calendar },
          { key: 'ended', label: 'Ended', icon: Award },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as any)}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md transition-all ${
              activeTab === key
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="font-medium">{label}</span>
          </button>
        ))}
      </div>

      {/* Challenges Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {filteredChallenges.map((challenge) => {
          const TypeIcon = getTypeIcon(challenge.type);
          const isActive = challenge.status === 'active';
          const canJoin = challenge.status === 'upcoming' || (isActive && (!challenge.maxParticipants || challenge.participants < challenge.maxParticipants));

          return (
            <Card key={challenge.id} className={`relative overflow-hidden ${challenge.featured ? 'border-2 border-purple-300' : ''}`}>
              {challenge.featured && (
                <div className="absolute top-0 right-0 bg-purple-600 text-white px-3 py-1 text-xs font-medium rounded-bl-lg">
                  FEATURED
                </div>
              )}

              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center">
                    <TypeIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{challenge.title}</h3>
                    <p className="text-sm text-gray-600">Sponsored by {challenge.sponsor}</p>
                  </div>
                </div>
                
                <div className="flex flex-col items-end space-y-1">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${getTypeColor(challenge.type)}`}>
                    {challenge.type.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(challenge.status)}`}>
                    {challenge.status.toUpperCase()}
                  </span>
                </div>
              </div>

              <p className="text-gray-700 mb-4">{challenge.description}</p>

              {/* Prize and Participants */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <Coins className="w-4 h-4 text-yellow-600" />
                    <span className="font-bold text-yellow-800">{formatPrize(challenge.prizePool, challenge.currency)}</span>
                  </div>
                  <div className="text-xs text-gray-600">Prize Pool</div>
                </div>
                
                <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span className="font-bold text-blue-800">{challenge.participants.toLocaleString()}</span>
                  </div>
                  <div className="text-xs text-gray-600">Participants</div>
                </div>
              </div>

              {/* User Progress */}
              {challenge.userRank && (
                <div className="mb-4 p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-green-800">Your Progress</span>
                    <span className="text-sm text-green-600">Rank #{challenge.userRank}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Crown className="w-4 h-4 text-yellow-500" />
                    <span className="font-bold text-gray-900">{challenge.userProgress}</span>
                    <span className="text-sm text-gray-600">{challenge.type.replace('_', ' ')}</span>
                  </div>
                </div>
              )}

              {/* Time Remaining */}
              <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
                <span>Ends: {challenge.endDate.toLocaleDateString()}</span>
                <span>{getTimeRemaining(challenge.endDate)}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3">
                {canJoin && (
                  <button
                    onClick={() => handleJoinChallenge(challenge.id)}
                    disabled={loading}
                    className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 disabled:bg-gray-300 transition-colors"
                  >
                    {loading ? 'Joining...' : 'Join Challenge'}
                  </button>
                )}
                
                <button
                  onClick={() => setSelectedChallenge(selectedChallenge?.id === challenge.id ? null : challenge)}
                  className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  {selectedChallenge?.id === challenge.id ? 'Hide' : 'Details'}
                </button>
              </div>

              {/* Expanded Details */}
              {selectedChallenge?.id === challenge.id && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="space-y-4">
                    {/* Requirements */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Requirements</h4>
                      <ul className="space-y-1">
                        {challenge.requirements.map((req, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-center space-x-2">
                            <div className="w-1.5 h-1.5 bg-purple-600 rounded-full"></div>
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Leaderboard */}
                    {challenge.leaderboard.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Current Leaderboard</h4>
                        <div className="space-y-2">
                          {challenge.leaderboard.slice(0, 5).map((entry) => (
                            <div key={entry.rank} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                  entry.rank === 1 ? 'bg-yellow-100 text-yellow-800' :
                                  entry.rank === 2 ? 'bg-gray-100 text-gray-800' :
                                  entry.rank === 3 ? 'bg-orange-100 text-orange-800' :
                                  'bg-blue-100 text-blue-800'
                                }`}>
                                  {entry.rank}
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">{entry.playerName}</div>
                                  <div className="text-xs text-gray-600">{entry.country}</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-gray-900">{entry.score}</div>
                                {entry.verified && (
                                  <div className="text-xs text-green-600">✓ Verified</div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};