import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { Users, Star, Target, TrendingUp, Calendar, MapPin, Plus, Settings } from 'lucide-react';

export const Squad: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'roster' | 'stats' | 'schedule'>('roster');

  const squadMembers = [
    {
      id: 1,
      name: 'Marcus Johnson',
      position: 'ST',
      rating: 8.2,
      appearances: 24,
      goals: 18,
      assists: 11,
      status: 'available',
      role: 'captain',
    },
    {
      id: 2,
      name: 'Sarah Martinez',
      position: 'GK',
      rating: 8.5,
      appearances: 23,
      goals: 0,
      assists: 2,
      status: 'available',
      role: 'regular',
    },
    {
      id: 3,
      name: 'Jamie Thompson',
      position: 'MF',
      rating: 7.9,
      appearances: 22,
      goals: 8,
      assists: 15,
      status: 'available',
      role: 'regular',
    },
    {
      id: 4,
      name: 'Alex Chen',
      position: 'DF',
      rating: 7.6,
      appearances: 18,
      goals: 2,
      assists: 4,
      status: 'injured',
      role: 'regular',
    },
    {
      id: 5,
      name: 'Emma Wilson',
      position: 'MF',
      rating: 8.1,
      appearances: 20,
      goals: 6,
      assists: 9,
      status: 'available',
      role: 'regular',
    },
    {
      id: 6,
      name: 'Ryan Murphy',
      position: 'DF',
      rating: 7.8,
      appearances: 21,
      goals: 1,
      assists: 3,
      status: 'available',
      role: 'regular',
    },
  ];

  const upcomingMatches = [
    {
      id: 1,
      opponent: 'Grass Roots United',
      date: '2025-01-20',
      time: '14:00',
      venue: 'Regent\'s Park',
      availability: 5,
      total: 6,
    },
    {
      id: 2,
      opponent: 'Borough Rovers',
      date: '2025-01-27',
      time: '15:30',
      venue: 'Hampstead Heath',
      availability: 4,
      total: 6,
    },
  ];

  const teamStats = {
    totalGoals: 45,
    totalAssists: 38,
    avgRating: 8.0,
    winRate: 67,
    cleanSheets: 12,
    matchesPlayed: 24,
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 space-y-6">
      {/* Squad Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Northside United</h1>
        <p className="text-gray-600">Building legends, one match at a time</p>
      </div>

      {/* Squad Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card padding="sm" className="text-center">
          <div className="text-2xl font-bold text-green-600">{teamStats.totalGoals}</div>
          <div className="text-sm text-gray-600">Goals</div>
        </Card>
        <Card padding="sm" className="text-center">
          <div className="text-2xl font-bold text-blue-600">{teamStats.totalAssists}</div>
          <div className="text-sm text-gray-600">Assists</div>
        </Card>
        <Card padding="sm" className="text-center">
          <div className="text-2xl font-bold text-orange-600">{teamStats.avgRating}</div>
          <div className="text-sm text-gray-600">Avg Rating</div>
        </Card>
        <Card padding="sm" className="text-center">
          <div className="text-2xl font-bold text-purple-600">{teamStats.winRate}%</div>
          <div className="text-sm text-gray-600">Win Rate</div>
        </Card>
        <Card padding="sm" className="text-center">
          <div className="text-2xl font-bold text-red-600">{teamStats.cleanSheets}</div>
          <div className="text-sm text-gray-600">Clean Sheets</div>
        </Card>
        <Card padding="sm" className="text-center">
          <div className="text-2xl font-bold text-gray-600">{teamStats.matchesPlayed}</div>
          <div className="text-sm text-gray-600">Matches</div>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { key: 'roster', label: 'Squad Roster', icon: Users },
          { key: 'stats', label: 'Team Stats', icon: TrendingUp },
          { key: 'schedule', label: 'Schedule', icon: Calendar },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as any)}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md transition-all ${
              activeTab === key
                ? 'bg-white text-green-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="font-medium">{label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'roster' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Squad Members</h2>
            <button className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
              <Plus className="w-4 h-4" />
              <span>Add Player</span>
            </button>
          </div>

          <div className="grid gap-4">
            {squadMembers.map((player) => (
              <Card key={player.id} hover>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">
                        {player.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-semibold text-gray-900">{player.name}</h3>
                        {player.role === 'captain' && (
                          <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
                            Captain
                          </span>
                        )}
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          player.status === 'available' ? 'bg-green-100 text-green-800' :
                          player.status === 'injured' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {player.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {player.position} • {player.appearances} appearances
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6 text-center">
                    <div>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-orange-500" />
                        <span className="font-bold text-gray-900">{player.rating}</span>
                      </div>
                      <span className="text-xs text-gray-600">Rating</span>
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-1">
                        <Target className="w-4 h-4 text-green-600" />
                        <span className="font-bold text-gray-900">{player.goals}</span>
                      </div>
                      <span className="text-xs text-gray-600">Goals</span>
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4 text-blue-600" />
                        <span className="font-bold text-gray-900">{player.assists}</span>
                      </div>
                      <span className="text-xs text-gray-600">Assists</span>
                    </div>

                    <button className="p-2 text-gray-400 hover:text-gray-600">
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900">Team Performance</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Scorers</h3>
              <div className="space-y-3">
                {squadMembers
                  .sort((a, b) => b.goals - a.goals)
                  .slice(0, 5)
                  .map((player, index) => (
                    <div key={player.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="w-6 h-6 bg-green-100 text-green-800 rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </span>
                        <span className="font-medium text-gray-900">{player.name}</span>
                      </div>
                      <span className="font-bold text-green-600">{player.goals}</span>
                    </div>
                  ))}
              </div>
            </Card>

            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Assisters</h3>
              <div className="space-y-3">
                {squadMembers
                  .sort((a, b) => b.assists - a.assists)
                  .slice(0, 5)
                  .map((player, index) => (
                    <div key={player.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </span>
                        <span className="font-medium text-gray-900">{player.name}</span>
                      </div>
                      <span className="font-bold text-blue-600">{player.assists}</span>
                    </div>
                  ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'schedule' && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900">Upcoming Matches</h2>
          
          <div className="space-y-4">
            {upcomingMatches.map((match) => (
              <Card key={match.id} hover>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">vs {match.opponent}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(match.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{match.venue}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm text-gray-600 mb-1">Availability</div>
                    <div className="flex items-center space-x-2">
                      <span className={`font-bold ${
                        match.availability >= match.total * 0.8 ? 'text-green-600' :
                        match.availability >= match.total * 0.6 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {match.availability}/{match.total}
                      </span>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            match.availability >= match.total * 0.8 ? 'bg-green-600' :
                            match.availability >= match.total * 0.6 ? 'bg-yellow-600' : 'bg-red-600'
                          }`}
                          style={{ width: `${(match.availability / match.total) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};