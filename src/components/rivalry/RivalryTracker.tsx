"use client";

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  Swords, Trophy, History, TrendingUp, Flame, 
  Calendar, MapPin, Users, Star 
} from 'lucide-react';
import type { Rivalry, RivalryMatch } from '@/types';

// Mock rivalries
const MOCK_RIVALRIES: Rivalry[] = [
  {
    id: 'r1',
    squadA: 'Northside United',
    squadB: 'Red Lions FC',
    name: 'The Hackney Derby',
    description: 'The most intense rivalry in the league, dating back to 2018',
    history: [
      { matchId: 'm1', date: new Date('2025-01-13'), squadAScore: 3, squadBScore: 1, winner: 'Northside United', significance: 'league', memorable: true },
      { matchId: 'm2', date: new Date('2024-11-20'), squadAScore: 2, squadBScore: 2, significance: 'cup', memorable: false },
      { matchId: 'm3', date: new Date('2024-09-15'), squadAScore: 1, squadBScore: 0, winner: 'Northside United', significance: 'league', memorable: true },
      { matchId: 'm4', date: new Date('2024-05-10'), squadAScore: 0, squadBScore: 2, winner: 'Red Lions FC', significance: 'league', memorable: false },
      { matchId: 'm5', date: new Date('2024-03-22'), squadAScore: 4, squadBScore: 3, winner: 'Northside United', significance: 'playoff', memorable: true },
    ],
    stats: { played: 5, squadAWins: 3, squadBWins: 1, draws: 1, squadAGoals: 10, squadBGoals: 7 },
    intensity: 9,
    derbyBonuses: { winnerXPBoost: 0.5, loserXPPenalty: 0.1, reputationBonus: 500, fanEngagementBonus: 1000 },
  },
  {
    id: 'r2',
    squadA: 'Northside United',
    squadB: 'Sunday Legends',
    name: 'The Sunday Showdown',
    description: 'Friendly but competitive local rivalry',
    history: [
      { matchId: 'm6', date: new Date('2025-01-06'), squadAScore: 2, squadBScore: 2, significance: 'friendly', memorable: false },
      { matchId: 'm7', date: new Date('2024-12-01'), squadAScore: 3, squadBScore: 0, winner: 'Northside United', significance: 'league', memorable: false },
    ],
    stats: { played: 2, squadAWins: 1, squadBWins: 0, draws: 1, squadAGoals: 5, squadBGoals: 2 },
    intensity: 5,
    derbyBonuses: { winnerXPBoost: 0.3, loserXPPenalty: 0.05, reputationBonus: 200, fanEngagementBonus: 500 },
  },
];

interface RivalryTrackerProps {
  userSquad?: string;
}

export const RivalryTracker: React.FC<RivalryTrackerProps> = ({ 
  userSquad = 'Northside United' 
}) => {
  const [selectedRivalry, setSelectedRivalry] = useState<Rivalry | null>(null);

  const userRivalries = MOCK_RIVALRIES.filter(
    r => r.squadA === userSquad || r.squadB === userSquad
  );

  if (selectedRivalry) {
    return (
      <RivalryDetail 
        rivalry={selectedRivalry} 
        userSquad={userSquad}
        onBack={() => setSelectedRivalry(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-4">
          <Swords className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Rivalries</h1>
        <p className="text-gray-600">Track your biggest rivalries and derby history</p>
      </div>

      {/* Rivalries List */}
      <div className="space-y-4">
        {userRivalries.map((rivalry) => {
          const isUserSquadA = rivalry.squadA === userSquad;
          const opponent = isUserSquadA ? rivalry.squadB : rivalry.squadA;
          const userWins = isUserSquadA ? rivalry.stats.squadAWins : rivalry.stats.squadBWins;
          const opponentWins = isUserSquadA ? rivalry.stats.squadBWins : rivalry.stats.squadAWins;
          const userGoals = isUserSquadA ? rivalry.stats.squadAGoals : rivalry.stats.squadBGoals;
          const opponentGoals = isUserSquadA ? rivalry.stats.squadBGoals : rivalry.stats.squadAGoals;

          return (
            <Card 
              key={rivalry.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedRivalry(rivalry)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{rivalry.name}</h3>
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(rivalry.intensity, 3) }).map((_, i) => (
                        <Flame key={i} className="w-4 h-4 text-red-500" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{rivalry.description}</p>
                  
                  <div className="flex items-center space-x-6 text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">{userSquad}</span>
                      <span className="text-lg font-bold text-green-600">{userWins}</span>
                    </div>
                    <div className="text-gray-400">vs</div>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-red-600">{opponentWins}</span>
                      <span className="font-medium text-gray-900">{opponent}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                    <span>{rivalry.stats.played} matches played</span>
                    <span>•</span>
                    <span>{userGoals}-{opponentGoals} aggregate</span>
                  </div>
                </div>
                <div className="text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {userRivalries.length === 0 && (
        <Card className="text-center py-12">
          <Swords className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Rivalries Yet</h3>
          <p className="text-gray-600">Play more matches against the same teams to build rivalries</p>
        </Card>
      )}
    </div>
  );
};

// Rivalry Detail View
interface RivalryDetailProps {
  rivalry: Rivalry;
  userSquad: string;
  onBack: () => void;
}

const RivalryDetail: React.FC<RivalryDetailProps> = ({ rivalry, userSquad, onBack }) => {
  const isUserSquadA = rivalry.squadA === userSquad;
  const opponent = isUserSquadA ? rivalry.squadB : rivalry.squadA;
  const userWins = isUserSquadA ? rivalry.stats.squadAWins : rivalry.stats.squadBWins;
  const opponentWins = isUserSquadA ? rivalry.stats.squadBWins : rivalry.stats.squadAWins;
  const userGoals = isUserSquadA ? rivalry.stats.squadAGoals : rivalry.stats.squadBGoals;
  const opponentGoals = isUserSquadA ? rivalry.stats.squadBGoals : rivalry.stats.squadAGoals;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button onClick={onBack} variant="outline">
        ← Back to Rivalries
      </Button>

      {/* Header */}
      <Card className="bg-gradient-to-br from-red-500 to-orange-600 text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">{rivalry.name}</h1>
          <p className="text-red-100">{rivalry.description}</p>
          <div className="flex items-center justify-center space-x-2 mt-3">
            {Array.from({ length: rivalry.intensity }).map((_, i) => (
              <Flame key={i} className="w-5 h-5 text-yellow-300" />
            ))}
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="text-center">
          <div className="text-3xl font-bold text-green-600">{userWins}</div>
          <div className="text-sm text-gray-600">{userSquad} Wins</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-gray-600">{rivalry.stats.draws}</div>
          <div className="text-sm text-gray-600">Draws</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-red-600">{opponentWins}</div>
          <div className="text-sm text-gray-600">{opponent} Wins</div>
        </Card>
      </div>

      {/* Head to Head */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
          Head to Head
        </h3>
        <div className="flex items-center justify-center space-x-8 py-4">
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900">{userGoals}</div>
            <div className="text-sm text-gray-600">{userSquad}</div>
          </div>
          <div className="text-2xl font-bold text-gray-400">Goals</div>
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900">{opponentGoals}</div>
            <div className="text-sm text-gray-600">{opponent}</div>
          </div>
        </div>
      </Card>

      {/* Derby Bonuses */}
      {rivalry.derbyBonuses && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Star className="w-5 h-5 mr-2 text-yellow-500" />
            Derby Bonuses
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-800 font-medium">Winner XP Boost</p>
              <p className="text-2xl font-bold text-green-600">+{Math.round(rivalry.derbyBonuses.winnerXPBoost * 100)}%</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <p className="text-sm text-red-800 font-medium">Loser XP Penalty</p>
              <p className="text-2xl font-bold text-red-600">-{Math.round(rivalry.derbyBonuses.loserXPPenalty * 100)}%</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800 font-medium">Reputation Bonus</p>
              <p className="text-2xl font-bold text-blue-600">+{rivalry.derbyBonuses.reputationBonus}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-800 font-medium">Fan Engagement</p>
              <p className="text-2xl font-bold text-purple-600">+{rivalry.derbyBonuses.fanEngagementBonus}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Match History */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <History className="w-5 h-5 mr-2 text-purple-600" />
          Match History
        </h3>
        <div className="space-y-3">
          {rivalry.history.map((match, idx) => (
            <MatchHistoryRow 
              key={match.matchId} 
              match={match} 
              squadA={rivalry.squadA}
              squadB={rivalry.squadB}
              isLatest={idx === 0}
            />
          ))}
        </div>
      </Card>
    </div>
  );
};

// Match history row
const MatchHistoryRow: React.FC<{ 
  match: RivalryMatch; 
  squadA: string; 
  squadB: string;
  isLatest: boolean;
}> = ({ match, squadA, squadB, isLatest }) => {
  const significanceColors: Record<string, string> = {
    league: 'bg-blue-100 text-blue-800',
    cup: 'bg-purple-100 text-purple-800',
    playoff: 'bg-red-100 text-red-800',
    friendly: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className={`flex items-center justify-between p-3 rounded-lg ${
      isLatest ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'
    }`}>
      <div className="flex items-center space-x-4">
        <div className="text-center min-w-[60px]">
          <div className="text-sm text-gray-500">{match.date.toLocaleDateString()}</div>
          <span className={`text-xs px-2 py-0.5 rounded ${significanceColors[match.significance]}`}>
            {match.significance}
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <span className={`font-medium ${match.winner === squadA ? 'text-green-600' : 'text-gray-700'}`}>
            {squadA}
          </span>
          <div className="flex items-center space-x-1 bg-gray-800 text-white px-3 py-1 rounded">
            <span className="font-bold">{match.squadAScore}</span>
            <span>-</span>
            <span className="font-bold">{match.squadBScore}</span>
          </div>
          <span className={`font-medium ${match.winner === squadB ? 'text-green-600' : 'text-gray-700'}`}>
            {squadB}
          </span>
        </div>
      </div>
      {match.memorable && (
        <div className="flex items-center space-x-1 text-yellow-600">
          <Star className="w-4 h-4 fill-current" />
          <span className="text-sm">Memorable</span>
        </div>
      )}
    </div>
  );
};
