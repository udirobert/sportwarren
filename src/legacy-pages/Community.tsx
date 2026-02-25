import React, { useState } from 'react';
import { Card } from '@/components/common/Card';
import { MessageCircle, Trophy, Users, Flame, Target, Shield, Crown, Star } from 'lucide-react';

export const Community: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'rivalries' | 'leaderboards' | 'challenges'>('rivalries');

  const rivalries = [
    {
      id: 1,
      opponent: 'Red Lions FC',
      record: { wins: 4, draws: 1, losses: 1 },
      nextMatch: '2025-02-15',
      rivalry: 'heated',
      lastResult: 'W 4-2',
      streak: 3,
      banterCount: 15,
    },
    {
      id: 2,
      opponent: 'Sunday Legends',
      record: { wins: 2, draws: 1, losses: 2 },
      nextMatch: '2025-02-08',
      rivalry: 'competitive',
      lastResult: 'L 1-3',
      streak: -1,
      banterCount: 8,
    },
    {
      id: 3,
      opponent: 'Park Rangers',
      record: { wins: 3, draws: 0, losses: 1 },
      nextMatch: '2025-02-22',
      rivalry: 'friendly',
      lastResult: 'W 3-1',
      streak: 2,
      banterCount: 4,
    },
  ];

  const leaderboards = [
    {
      category: 'Top Scorers (Local)',
      players: [
        { name: 'Marcus Johnson', team: 'Northside United', value: 18, position: 1 },
        { name: 'Tom Bradley', team: 'Red Lions FC', value: 16, position: 2 },
        { name: 'Alex Rodriguez', team: 'Sunday Legends', value: 15, position: 3 },
        { name: 'Chris Walker', team: 'Park Rangers', value: 12, position: 4 },
        { name: 'Jamie Thompson', team: 'Northside United', value: 8, position: 5 },
      ],
    },
    {
      category: 'Clean Sheet Kings',
      players: [
        { name: 'Sarah Martinez', team: 'Northside United', value: 12, position: 1 },
        { name: 'Mike Johnson', team: 'Borough Rovers', value: 10, position: 2 },
        { name: 'Danny Torres', team: 'Red Lions FC', value: 8, position: 3 },
      ],
    },
  ];

  const challenges = [
    {
      id: 1,
      title: 'January Goal Rush',
      description: 'Score the most goals in January',
      participants: 24,
      reward: 'Golden Boot Badge',
      endDate: '2025-01-31',
      currentLeader: 'Marcus Johnson (5 goals)',
      userPosition: 1,
    },
    {
      id: 2,
      title: 'Assist Master',
      description: 'Record 10+ assists this month',
      participants: 18,
      reward: 'Playmaker Badge',
      endDate: '2025-01-31',
      currentLeader: 'Emma Wilson (7 assists)',
      userPosition: 3,
    },
    {
      id: 3,
      title: 'Derby Hero Challenge',
      description: 'Score in your next rivalry match',
      participants: 32,
      reward: 'Derby Legend Badge',
      endDate: '2025-02-28',
      currentLeader: 'Multiple players tied',
      userPosition: null,
    },
  ];

  const getRivalryColor = (rivalry: string) => {
    switch (rivalry) {
      case 'heated': return 'text-red-600 bg-red-100';
      case 'competitive': return 'text-orange-600 bg-orange-100';
      case 'friendly': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 space-y-6">
      {/* Community Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Community Hub</h1>
        <p className="text-gray-600">Connect with your local football community</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { key: 'rivalries', label: 'Rivalries', icon: Flame },
          { key: 'leaderboards', label: 'Leaderboards', icon: Trophy },
          { key: 'challenges', label: 'Challenges', icon: Target },
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
      {activeTab === 'rivalries' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Squad Rivalries</h2>
            <span className="text-sm text-gray-600">Building legends through competition</span>
          </div>

          <div className="space-y-4">
            {rivalries.map((rivalry) => (
              <Card key={rivalry.id} hover className="relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-3 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">{rivalry.opponent}</h3>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${getRivalryColor(rivalry.rivalry)}`}>
                          {rivalry.rivalry}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>
                          Record: {rivalry.record.wins}W-{rivalry.record.draws}D-{rivalry.record.losses}L
                        </span>
                        <span>Last: {rivalry.lastResult}</span>
                        <span>Next: {new Date(rivalry.nextMatch).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${
                        rivalry.streak > 0 ? 'text-green-600' : 
                        rivalry.streak < 0 ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {rivalry.streak > 0 ? `+${rivalry.streak}` : rivalry.streak}
                      </div>
                      <div className="text-xs text-gray-600">Streak</div>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center space-x-1">
                        <MessageCircle className="w-4 h-4 text-blue-600" />
                        <span className="font-semibold text-gray-900">{rivalry.banterCount}</span>
                      </div>
                      <div className="text-xs text-gray-600">Banter</div>
                    </div>

                    <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                      View Details
                    </button>
                  </div>
                </div>

                {/* Rivalry intensity indicator */}
                <div className={`absolute bottom-0 left-0 right-0 h-1 ${
                  rivalry.rivalry === 'heated' ? 'bg-red-500' :
                  rivalry.rivalry === 'competitive' ? 'bg-orange-500' : 'bg-green-500'
                }`}></div>
              </Card>
            ))}
          </div>

          {/* Banter Feed */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Latest Banter</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-gray-900">
                    <span className="font-semibold">Red Lions FC</span>: "Ready for another beating on Sunday? 😈"
                  </p>
                  <p className="text-sm text-gray-600">2 hours ago</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-gray-900">
                    <span className="font-semibold">Marcus Johnson</span>: "Bring it on! Last time we scored 4 past you 🔥"
                  </p>
                  <p className="text-sm text-gray-600">1 hour ago</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'leaderboards' && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900">Local Leaderboards</h2>
          
          <div className="grid lg:grid-cols-2 gap-6">
            {leaderboards.map((board, index) => (
              <Card key={index}>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{board.category}</h3>
                <div className="space-y-3">
                  {board.players.map((player) => (
                    <div key={player.position} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          player.position === 1 ? 'bg-yellow-100 text-yellow-800' :
                          player.position === 2 ? 'bg-gray-100 text-gray-800' :
                          player.position === 3 ? 'bg-orange-100 text-orange-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {player.position === 1 ? <Crown className="w-4 h-4" /> : player.position}
                        </div>
                        <div>
                          <p className={`font-medium ${
                            player.name === 'Marcus Johnson' || player.name === 'Sarah Martinez' || player.name === 'Jamie Thompson'
                              ? 'text-green-600' : 'text-gray-900'
                          }`}>
                            {player.name}
                          </p>
                          <p className="text-sm text-gray-600">{player.team}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-gray-900">{player.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>

          {/* Position Leaderboards */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Position Rankings</h3>
            <div className="grid md:grid-cols-4 gap-4">
              {['Goalkeepers', 'Defenders', 'Midfielders', 'Forwards'].map((position) => (
                <div key={position} className="text-center p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">{position}</h4>
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {position === 'Forwards' ? '#1' : position === 'Goalkeepers' ? '#1' : '#3'}
                  </div>
                  <div className="text-sm text-gray-600">Local Ranking</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'challenges' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Active Challenges</h2>
            <span className="text-sm text-gray-600">Prove your skills</span>
          </div>

          <div className="space-y-4">
            {challenges.map((challenge) => (
              <Card key={challenge.id} hover>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{challenge.title}</h3>
                      {challenge.userPosition === 1 && (
                        <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
                          Leading!
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-600 mb-3">{challenge.description}</p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{challenge.participants} participants</span>
                      </div>
                      <div>Ends: {new Date(challenge.endDate).toLocaleDateString()}</div>
                      <div>Leader: {challenge.currentLeader}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center space-x-2 mb-2">
                      <Star className="w-5 h-5 text-yellow-500" />
                      <span className="font-medium text-gray-900">{challenge.reward}</span>
                    </div>
                    {challenge.userPosition && (
                      <div className="text-sm text-green-600 font-medium mb-2">
                        Your Position: #{challenge.userPosition}
                      </div>
                    )}
                    <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                      Join Challenge
                    </button>
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