import React from 'react';
import { Card } from '../components/common/Card';
import { StatCard } from '../components/common/StatCard';
import { Target, Users, Trophy, Shield, TrendingUp, Award, Star, Zap } from 'lucide-react';

export const PlayerStats: React.FC = () => {
  const performanceData = [
    { month: 'Aug', goals: 4, assists: 2, rating: 7.8 },
    { month: 'Sep', goals: 6, assists: 4, rating: 8.2 },
    { month: 'Oct', goals: 3, assists: 5, rating: 7.9 },
    { month: 'Nov', goals: 5, assists: 3, rating: 8.5 },
    { month: 'Dec', goals: 8, assists: 6, rating: 9.1 },
    { month: 'Jan', goals: 2, assists: 1, rating: 8.0 },
  ];

  const positionStats = [
    { position: 'Striker', appearances: 18, rating: 8.4, goals: 15, assists: 4 },
    { position: 'Right Wing', appearances: 4, rating: 7.8, goals: 2, assists: 5 },
    { position: 'CAM', appearances: 2, rating: 8.9, goals: 1, assists: 2 },
  ];

  const rivalryRecord = [
    { team: 'Red Lions FC', played: 6, won: 4, drawn: 1, lost: 1, goalsDiff: '+5' },
    { team: 'Sunday Legends', played: 5, won: 2, drawn: 1, lost: 2, goalsDiff: '-1' },
    { team: 'Park Rangers', played: 4, won: 3, drawn: 0, lost: 1, goalsDiff: '+3' },
    { team: 'Borough Rovers', played: 3, won: 2, drawn: 1, lost: 0, goalsDiff: '+2' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-8">
      {/* Player Overview */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-green-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl font-bold text-white">MJ</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Marcus Johnson</h1>
        <div className="flex items-center justify-center space-x-4 text-gray-600">
          <span>Position: Striker</span>
          <span>•</span>
          <span>Squad: Northside United</span>
          <span>•</span>
          <span>Season: 2024/25</span>
        </div>
      </div>

      {/* Key Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <StatCard
          title="Goals Scored"
          value={18}
          icon={Target}
          trend={{ value: 12, positive: true }}
          color="green"
        />
        <StatCard
          title="Assists"
          value={11}
          icon={Users}
          trend={{ value: 8, positive: true }}
          color="blue"
        />
        <StatCard
          title="Average Rating"
          value="8.2"
          icon={Star}
          trend={{ value: 3, positive: true }}
          color="orange"
        />
        <StatCard
          title="Clean Sheets"
          value={7}
          icon={Shield}
          color="purple"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Performance Chart */}
        <Card>
          <h2 className="text-xl font-bold text-gray-900 mb-6">Monthly Performance</h2>
          <div className="space-y-4">
            {performanceData.map((month, index) => (
              <div key={month.month} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">{month.month}</span>
                  <div className="flex items-center space-x-4 text-gray-600">
                    <span>{month.goals}G</span>
                    <span>{month.assists}A</span>
                    <span className="font-medium">{month.rating}/10</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(month.goals / 10) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(month.assists / 10) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-orange-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(month.rating / 10) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center space-x-6 mt-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-600 rounded-full"></div>
              <span>Goals</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
              <span>Assists</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
              <span>Rating</span>
            </div>
          </div>
        </Card>

        {/* Position Analysis */}
        <Card>
          <h2 className="text-xl font-bold text-gray-900 mb-6">Position Performance</h2>
          <div className="space-y-4">
            {positionStats.map((pos, index) => (
              <div key={pos.position} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">{pos.position}</h3>
                  <span className="text-sm text-gray-600">{pos.appearances} appearances</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-green-600">{pos.goals}</p>
                    <p className="text-xs text-gray-600">Goals</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{pos.assists}</p>
                    <p className="text-xs text-gray-600">Assists</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-orange-600">{pos.rating}</p>
                    <p className="text-xs text-gray-600">Avg Rating</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Rivalry Records */}
      <Card>
        <h2 className="text-xl font-bold text-gray-900 mb-6">Rivalry Records</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Opposition</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900">Played</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900">Won</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900">Drawn</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900">Lost</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-900">Goal Diff</th>
              </tr>
            </thead>
            <tbody>
              {rivalryRecord.map((record, index) => (
                <tr key={record.team} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="font-medium text-gray-900">{record.team}</span>
                    </div>
                  </td>
                  <td className="text-center py-3 px-4 text-gray-700">{record.played}</td>
                  <td className="text-center py-3 px-4 text-green-600 font-medium">{record.won}</td>
                  <td className="text-center py-3 px-4 text-yellow-600 font-medium">{record.drawn}</td>
                  <td className="text-center py-3 px-4 text-red-600 font-medium">{record.lost}</td>
                  <td className={`text-center py-3 px-4 font-medium ${
                    record.goalsDiff.startsWith('+') ? 'text-green-600' : 
                    record.goalsDiff.startsWith('-') ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {record.goalsDiff}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Recent Achievements */}
      <Card>
        <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Achievements</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg">
            <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Hat-trick Hero</h3>
              <p className="text-sm text-gray-600">Scored 3+ goals in a single match</p>
              <p className="text-xs text-green-600 font-medium">Unlocked 3 days ago</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Assist Master</h3>
              <p className="text-sm text-gray-600">10+ assists in a season</p>
              <p className="text-xs text-blue-600 font-medium">Unlocked 1 week ago</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 p-4 bg-orange-50 rounded-lg">
            <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Derby Day Hero</h3>
              <p className="text-sm text-gray-600">Decisive performance in a rivalry match</p>
              <p className="text-xs text-orange-600 font-medium">Unlocked 2 weeks ago</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 p-4 bg-purple-50 rounded-lg">
            <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Consistent Performer</h3>
              <p className="text-sm text-gray-600">5 consecutive matches with 7+ rating</p>
              <p className="text-xs text-purple-600 font-medium">Unlocked 1 month ago</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};