import React from 'react';
import { Card } from '../components/common/Card';
import { StatCard } from '../components/common/StatCard';
import { Target, Users, Trophy, TrendingUp, Calendar, MapPin, Clock, Star, Zap, Shield } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const recentMatches = [
    {
      id: 1,
      opponent: 'Red Lions FC',
      result: 'W 4-2',
      date: '2025-01-13',
      venue: 'Hackney Marshes',
      playerRating: 8.5,
      goals: 2,
      assists: 1,
    },
    {
      id: 2,
      opponent: 'Sunday Legends',
      result: 'L 1-3',
      date: '2025-01-06',
      venue: 'Clapham Common',
      playerRating: 6.2,
      goals: 0,
      assists: 0,
    },
    {
      id: 3,
      opponent: 'Park Rangers',
      result: 'W 3-1',
      date: '2024-12-30',
      venue: 'Victoria Park',
      playerRating: 9.1,
      goals: 1,
      assists: 2,
    },
  ];

  const upcomingFixtures = [
    {
      id: 1,
      opponent: 'Grass Roots United',
      date: '2025-01-20',
      time: '14:00',
      venue: 'Regent\'s Park',
      competition: 'League Cup',
    },
    {
      id: 2,
      opponent: 'Borough Rovers',
      date: '2025-01-27',
      time: '15:30',
      venue: 'Hampstead Heath',
      competition: 'Sunday League',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-3 md:px-6 py-4 md:py-6 space-y-6 md:space-y-8">
      {/* Welcome Header */}
      <div className="text-center mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
          Welcome back, <span className="text-green-600">Marcus</span>
        </h1>
        <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto px-2">
          Ready to build your legend? Your squad has been busy while you were away.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
        <StatCard
          title="Season Goals"
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
          title="Matches Played"
          value={24}
          icon={Trophy}
          color="orange"
        />
        <StatCard
          title="Win Rate"
          value="67%"
          icon={TrendingUp}
          trend={{ value: 5, positive: true }}
          color="purple"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
        {/* Recent Matches */}
        <Card className="space-y-4 md:space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg md:text-xl font-bold text-gray-900">Recent Matches</h2>
            <button className="text-green-600 hover:text-green-700 active:text-green-800 font-medium text-sm touch-manipulation">
              View All
            </button>
          </div>

          <div className="space-y-3 md:space-y-4">
            {recentMatches.map((match) => (
              <div key={match.id} className="border border-gray-200 rounded-lg p-3 md:p-4 hover:border-gray-300 active:border-gray-400 transition-colors touch-manipulation">
                <div className="flex items-center justify-between mb-2 md:mb-3">
                  <div className="flex items-center space-x-2 md:space-x-3 min-w-0 flex-1">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      match.result.startsWith('W') ? 'bg-green-500' : 
                      match.result.startsWith('L') ? 'bg-red-500' : 'bg-yellow-500'
                    }`}></div>
                    <h3 className="font-semibold text-gray-900 text-sm md:text-base truncate">{match.opponent}</h3>
                    <span className={`text-xs md:text-sm font-bold flex-shrink-0 ${
                      match.result.startsWith('W') ? 'text-green-600' : 
                      match.result.startsWith('L') ? 'text-red-600' : 'text-yellow-600'
                    }`}>
                      {match.result}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 md:space-x-2 text-xs md:text-sm text-gray-500 flex-shrink-0">
                    <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="hidden sm:inline">{new Date(match.date).toLocaleDateString()}</span>
                    <span className="sm:hidden">{new Date(match.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs md:text-sm">
                  <div className="flex items-center space-x-2 md:space-x-4 text-gray-600 min-w-0 flex-1">
                    <div className="flex items-center space-x-1 min-w-0">
                      <MapPin className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                      <span className="truncate">{match.venue}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 md:space-x-4 flex-shrink-0">
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3 md:w-4 md:h-4 text-yellow-500" />
                      <span className="font-medium">{match.playerRating}</span>
                    </div>
                    <div className="text-gray-600 text-xs">
                      {match.goals}G {match.assists}A
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Upcoming Fixtures */}
        <Card className="space-y-4 md:space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg md:text-xl font-bold text-gray-900">Upcoming Fixtures</h2>
            <button className="text-green-600 hover:text-green-700 active:text-green-800 font-medium text-sm touch-manipulation">
              View Calendar
            </button>
          </div>

          <div className="space-y-3 md:space-y-4">
            {upcomingFixtures.map((fixture) => (
              <div key={fixture.id} className="border border-gray-200 rounded-lg p-3 md:p-4 hover:border-gray-300 active:border-gray-400 transition-colors touch-manipulation">
                <div className="flex items-center justify-between mb-2 md:mb-3">
                  <h3 className="font-semibold text-gray-900 text-sm md:text-base truncate flex-1 min-w-0">{fixture.opponent}</h3>
                  <span className="text-xs font-medium bg-green-100 text-green-800 px-2 py-1 rounded-full flex-shrink-0 ml-2">
                    {fixture.competition}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs md:text-sm text-gray-600">
                  <div className="flex items-center space-x-2 md:space-x-4 min-w-0 flex-1">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                      <span className="hidden sm:inline">{new Date(fixture.date).toLocaleDateString()}</span>
                      <span className="sm:hidden">{new Date(fixture.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 md:w-4 md:h-4" />
                      <span>{fixture.time}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 flex-shrink-0">
                    <MapPin className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="truncate max-w-24 md:max-w-none">{fixture.venue}</span>
                  </div>
                </div>
              </div>
            ))}

            <button className="w-full py-3 md:py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-green-300 hover:text-green-600 active:border-green-400 transition-colors text-sm md:text-base touch-manipulation">
              + Add Match Availability
            </button>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <button className="flex flex-col items-center space-y-2 md:space-y-3 p-4 md:p-6 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 active:border-green-400 active:bg-green-100 transition-all group touch-manipulation">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 group-active:scale-105 transition-transform">
              <Target className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <span className="font-medium text-gray-900 text-sm md:text-base">Log Match</span>
          </button>

          <button className="flex flex-col items-center space-y-2 md:space-y-3 p-4 md:p-6 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 active:border-blue-400 active:bg-blue-100 transition-all group touch-manipulation">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 group-active:scale-105 transition-transform">
              <Users className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <span className="font-medium text-gray-900 text-sm md:text-base">Check Squad</span>
          </button>

          <button className="flex flex-col items-center space-y-2 md:space-y-3 p-4 md:p-6 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 active:border-orange-400 active:bg-orange-100 transition-all group touch-manipulation">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-600 rounded-xl flex items-center justify-center group-hover:scale-110 group-active:scale-105 transition-transform">
              <Zap className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <span className="font-medium text-gray-900 text-sm md:text-base">View Stats</span>
          </button>

          <button className="flex flex-col items-center space-y-2 md:space-y-3 p-4 md:p-6 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 active:border-purple-400 active:bg-purple-100 transition-all group touch-manipulation">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 group-active:scale-105 transition-transform">
              <Shield className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <span className="font-medium text-gray-900 text-sm md:text-base">Rivalries</span>
          </button>
        </div>
      </Card>

      {/* Squad Activity Feed */}
      <Card>
        <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6">Squad Activity</h2>
        <div className="space-y-3 md:space-y-4">
          <div className="flex items-start space-x-3 md:space-x-4 p-3 md:p-4 bg-green-50 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-900 text-sm md:text-base">
                <span className="font-semibold">Jamie Thompson</span> scored a hat-trick against 
                <span className="font-semibold"> Park Rangers</span> 🔥
              </p>
              <p className="text-xs md:text-sm text-gray-600 mt-1">2 hours ago</p>
            </div>
          </div>

          <div className="flex items-start space-x-3 md:space-x-4 p-3 md:p-4 bg-blue-50 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-900 text-sm md:text-base">
                <span className="font-semibold">Sarah Martinez</span> unlocked the 
                <span className="font-semibold">"Clean Sheet Hero"</span> achievement
              </p>
              <p className="text-xs md:text-sm text-gray-600 mt-1">5 hours ago</p>
            </div>
          </div>

          <div className="flex items-start space-x-3 md:space-x-4 p-3 md:p-4 bg-orange-50 rounded-lg">
            <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-900 text-sm md:text-base">
                <span className="font-semibold">Sunday Legends</span> challenged your squad to a 
                <span className="font-semibold">revenge match</span> 🥊
              </p>
              <p className="text-xs md:text-sm text-gray-600 mt-1">1 day ago</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};