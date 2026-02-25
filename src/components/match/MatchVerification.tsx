import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Shield, Check, X, Clock, Users, AlertCircle, Trophy, Camera, Mic, MapPin } from 'lucide-react';
import type { MatchResult, Verification, MatchStatus, TrustTier } from '@/types';

interface PlayerStats {
  playerId: string;
  playerName: string;
  goals: number;
  assists: number;
  rating: number;
  verified: boolean;
}

export const MatchVerification: React.FC = () => {
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<MatchResult | null>(null);
  const [playerStats, setPlayerStats] = useState<PlayerStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [userAddress] = useState('ADDR1234567890ABCDEF'); // Mock user address

  // Mock data for demonstration
  useEffect(() => {
    const mockMatches: MatchResult[] = [
      {
        id: 'match_001',
        homeTeam: 'Northside United',
        awayTeam: 'Red Lions FC',
        homeScore: 3,
        awayScore: 1,
        submitter: 'Marcus Johnson',
        submitterTeam: 'home',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        verifications: [
          {
            verifier: 'Jamie Thompson',
            verifierAddress: 'ADDR_JAMIE_123',
            verified: true,
            timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
            role: 'player',
            trustTier: 'gold',
          },
          {
            verifier: 'Sarah Martinez',
            verifierAddress: 'ADDR_SARAH_456',
            verified: true,
            timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
            role: 'player',
            trustTier: 'silver',
          },
          {
            verifier: 'Referee Mike',
            verifierAddress: 'ADDR_MIKE_789',
            verified: true,
            timestamp: new Date(Date.now() - 30 * 60 * 1000),
            role: 'referee',
            trustTier: 'platinum',
          },
        ],
        status: 'verified',
        requiredVerifications: 3,
        trustScore: 95,
      },
      {
        id: 'match_002',
        homeTeam: 'Northside United',
        awayTeam: 'Sunday Legends',
        homeScore: 2,
        awayScore: 2,
        submitter: 'Emma Wilson',
        submitterTeam: 'home',
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        verifications: [
          {
            verifier: 'Alex Chen',
            verifierAddress: 'ADDR_ALEX_321',
            verified: true,
            timestamp: new Date(Date.now() - 20 * 60 * 1000),
            role: 'player',
            trustTier: 'bronze',
          },
        ],
        status: 'pending',
        requiredVerifications: 3,
        trustScore: 30,
      },
      {
        id: 'match_003',
        homeTeam: 'Park Rangers',
        awayTeam: 'Northside United',
        homeScore: 1,
        awayScore: 4,
        submitter: 'Ryan Murphy',
        submitterTeam: 'away',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        verifications: [
          {
            verifier: 'Marcus Johnson',
            verifierAddress: 'ADDR_MARCUS_654',
            verified: false,
            timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
            role: 'captain',
            trustTier: 'gold',
          },
          {
            verifier: 'Jamie Thompson',
            verifierAddress: 'ADDR_JAMIE_123',
            verified: false,
            timestamp: new Date(Date.now() - 2.5 * 60 * 60 * 1000),
            role: 'player',
            trustTier: 'gold',
          },
        ],
        status: 'disputed',
        requiredVerifications: 3,
        trustScore: 10,
      },
    ];

    const mockPlayerStats: PlayerStats[] = [
      {
        playerId: 'player_001',
        playerName: 'Marcus Johnson',
        goals: 2,
        assists: 1,
        rating: 8.5,
        verified: true,
      },
      {
        playerId: 'player_002',
        playerName: 'Jamie Thompson',
        goals: 1,
        assists: 2,
        rating: 8.0,
        verified: true,
      },
      {
        playerId: 'player_003',
        playerName: 'Emma Wilson',
        goals: 0,
        assists: 1,
        rating: 7.5,
        verified: false,
      },
    ];

    setMatches(mockMatches);
    setPlayerStats(mockPlayerStats);
  }, []);

  const handleVerifyMatch = async (matchId: string, verified: boolean) => {
    setLoading(true);
    try {
      // In production, this would submit a verification transaction to Algorand
      const newVerification: Verification = {
        verifier: 'Current User',
        verifierAddress: userAddress,
        verified,
        timestamp: new Date(),
        role: 'captain',
        trustTier: 'gold',
      };

      setMatches(matches.map(match => {
        if (match.id === matchId) {
          const updatedVerifications = [...match.verifications, newVerification];
          const verifiedCount = updatedVerifications.filter(v => v.verified).length;
          const disputedCount = updatedVerifications.filter(v => !v.verified).length;
          
          let status: MatchResult['status'] = 'pending';
          if (verifiedCount >= match.requiredVerifications) {
            status = 'verified';
          } else if (disputedCount >= 2) {
            status = 'disputed';
          }

          return {
            ...match,
            verifications: updatedVerifications,
            status,
          };
        }
        return match;
      }));

      console.log(`Match ${matchId} ${verified ? 'verified' : 'disputed'} by user`);
    } catch (error) {
      console.error('Failed to verify match:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: MatchResult['status']) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'disputed': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: MatchResult['status']) => {
    switch (status) {
      case 'verified': return Check;
      case 'disputed': return X;
      case 'pending': return Clock;
      default: return AlertCircle;
    }
  };

  const canVerify = (match: MatchResult) => {
    return match.status === 'pending' && 
           !match.verifications.some(v => v.verifier === 'Current User');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Match Verification</h1>
        <p className="text-gray-600">Blockchain-verified match results and statistics</p>
      </div>

      {/* Verification Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card padding="sm" className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {matches.filter(m => m.status === 'verified').length}
          </div>
          <div className="text-sm text-gray-600">Verified Matches</div>
        </Card>
        <Card padding="sm" className="text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {matches.filter(m => m.status === 'pending').length}
          </div>
          <div className="text-sm text-gray-600">Pending Verification</div>
        </Card>
        <Card padding="sm" className="text-center">
          <div className="text-2xl font-bold text-red-600">
            {matches.filter(m => m.status === 'disputed').length}
          </div>
          <div className="text-sm text-gray-600">Disputed Results</div>
        </Card>
        <Card padding="sm" className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {playerStats.filter(p => p.verified).length}
          </div>
          <div className="text-sm text-gray-600">Verified Players</div>
        </Card>
      </div>

      {/* Match Results */}
      <Card>
        <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Match Results</h2>
        
        <div className="space-y-4">
          {matches.map((match) => {
            const StatusIcon = getStatusIcon(match.status);
            const verifiedCount = match.verifications.filter(v => v.verified).length;
            const disputedCount = match.verifications.filter(v => !v.verified).length;

            return (
              <Card key={match.id} className="border-l-4 border-l-blue-500" hover>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-3">
                      <div className="text-center">
                        <div className="font-semibold text-gray-900">{match.homeTeam}</div>
                        <div className="text-2xl font-bold text-green-600">{match.homeScore}</div>
                      </div>
                      
                      <div className="text-gray-400 font-bold">VS</div>
                      
                      <div className="text-center">
                        <div className="font-semibold text-gray-900">{match.awayTeam}</div>
                        <div className="text-2xl font-bold text-red-600">{match.awayScore}</div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <StatusIcon className="w-5 h-5" />
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(match.status)}`}>
                          {match.status.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                      <span>Submitted by {match.submitter}</span>
                      <span>{match.timestamp.toLocaleString()}</span>
                      <span>{verifiedCount} verified • {disputedCount} disputed</span>
                    </div>

                    {/* Verification Progress */}
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${(verifiedCount / match.requiredVerifications) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-600">
                        {verifiedCount}/{match.requiredVerifications} required
                      </span>
                    </div>
                  </div>

                  {/* Verification Actions */}
                  <div className="flex flex-col space-y-2 ml-6">
                    {canVerify(match) && (
                      <>
                        <button
                          onClick={() => handleVerifyMatch(match.id, true)}
                          disabled={loading}
                          className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-300 transition-colors"
                        >
                          <Check className="w-4 h-4" />
                          <span>Verify</span>
                        </button>
                        <button
                          onClick={() => handleVerifyMatch(match.id, false)}
                          disabled={loading}
                          className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:bg-gray-300 transition-colors"
                        >
                          <X className="w-4 h-4" />
                          <span>Dispute</span>
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setSelectedMatch(selectedMatch?.id === match.id ? null : match)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Details
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {selectedMatch?.id === match.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-3">Verification History</h4>
                    <div className="space-y-2">
                      {match.verifications.map((verification, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            {verification.verified ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <X className="w-4 h-4 text-red-600" />
                            )}
                            <span className="font-medium text-gray-900">{verification.verifier}</span>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              verification.role === 'referee' ? 'bg-purple-100 text-purple-800' :
                              verification.role === 'player' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {verification.role}
                            </span>
                          </div>
                          <span className="text-sm text-gray-600">
                            {verification.timestamp.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </Card>

      {/* Player Statistics */}
      <Card>
        <h2 className="text-xl font-bold text-gray-900 mb-6">Verified Player Statistics</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Player</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900">Goals</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900">Assists</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900">Rating</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900">Status</th>
              </tr>
            </thead>
            <tbody>
              {playerStats.map((player) => (
                <tr key={player.playerId} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-gray-600" />
                      </div>
                      <span className="font-medium text-gray-900">{player.playerName}</span>
                    </div>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className="font-bold text-green-600">{player.goals}</span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className="font-bold text-blue-600">{player.assists}</span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <div className="flex items-center justify-center space-x-1">
                      <Trophy className="w-4 h-4 text-orange-500" />
                      <span className="font-bold text-gray-900">{player.rating}</span>
                    </div>
                  </td>
                  <td className="text-center py-3 px-4">
                    {player.verified ? (
                      <span className="inline-flex items-center space-x-1 bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                        <Check className="w-3 h-3" />
                        <span>Verified</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
                        <Clock className="w-3 h-3" />
                        <span>Pending</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};