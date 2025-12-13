import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Target, Users, Clock, MapPin, Plus, Mic, Camera, FileText, Minus } from 'lucide-react';

export const MatchTracker: React.FC = () => {
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [matchEvents, setMatchEvents] = useState<any[]>([]);
  const [isRecording, setIsRecording] = useState(false);

  const squadPlayers = [
    { id: 1, name: 'Marcus Johnson', position: 'ST', status: 'available' },
    { id: 2, name: 'Sarah Martinez', position: 'GK', status: 'available' },
    { id: 3, name: 'Jamie Thompson', position: 'MF', status: 'available' },
    { id: 4, name: 'Alex Chen', position: 'DF', status: 'injured' },
    { id: 5, name: 'Emma Wilson', position: 'MF', status: 'available' },
    { id: 6, name: 'Ryan Murphy', position: 'DF', status: 'available' },
  ];

  const addEvent = (type: string, player?: string, details?: string) => {
    const newEvent = {
      id: Date.now(),
      type,
      player,
      details,
      time: new Date().toLocaleTimeString(),
    };
    setMatchEvents([newEvent, ...matchEvents]);
  };

  const addGoal = (team: 'home' | 'away') => {
    if (team === 'home') {
      setHomeScore(homeScore + 1);
      addEvent('goal', 'Marcus Johnson', 'Home goal scored');
    } else {
      setAwayScore(awayScore + 1);
      addEvent('goal', 'Opposition', 'Away goal conceded');
    }
  };

  const removeGoal = (team: 'home' | 'away') => {
    if (team === 'home' && homeScore > 0) {
      setHomeScore(homeScore - 1);
      addEvent('goal-removed', 'Marcus Johnson', 'Home goal removed');
    } else if (team === 'away' && awayScore > 0) {
      setAwayScore(awayScore - 1);
      addEvent('goal-removed', 'Opposition', 'Away goal removed');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-3 md:px-6 py-4 md:py-6 space-y-4 md:space-y-6">
      {/* Match Header */}
      <Card className="animate-fade-in-up">
        <div className="text-center space-y-3 md:space-y-4">
          <div className="flex items-center justify-center space-x-3 md:space-x-4 text-sm md:text-base">
            <div className="flex items-center space-x-1 md:space-x-2">
              <MapPin className="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
              <span className="text-gray-700">Hackney Marshes</span>
            </div>
            <div className="flex items-center space-x-1 md:space-x-2">
              <Clock className="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
              <span className="text-gray-700">Live Match</span>
            </div>
          </div>

          {/* Score Display */}
          <div className="flex items-center justify-center space-x-4 md:space-x-8">
            <div className="text-center flex-1">
              <h3 className="text-sm md:text-lg font-semibold text-gray-900 mb-2">Northside United</h3>
              <div className="text-3xl md:text-4xl font-bold text-green-600">{homeScore}</div>
            </div>
            
            <div className="text-lg md:text-2xl font-bold text-gray-400">VS</div>
            
            <div className="text-center flex-1">
              <h3 className="text-sm md:text-lg font-semibold text-gray-900 mb-2">Red Lions FC</h3>
              <div className="text-3xl md:text-4xl font-bold text-red-600">{awayScore}</div>
            </div>
          </div>

          {/* Score Control Buttons */}
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <div className="space-y-2">
              <Button
                onClick={() => addGoal('home')}
                variant="success"
                size="lg"
                fullWidth
                icon={Plus}
                iconPosition="left"
                className="shadow-lg shadow-green-500/30"
              >
                Home Goal
              </Button>
              <Button
                onClick={() => removeGoal('home')}
                disabled={homeScore === 0}
                variant="ghost"
                size="sm"
                fullWidth
                icon={Minus}
                iconPosition="left"
                animate={false}
              >
                Remove
              </Button>
            </div>
            
            <div className="space-y-2">
              <Button
                onClick={() => addGoal('away')}
                variant="danger"
                size="lg"
                fullWidth
                icon={Plus}
                iconPosition="left"
                className="shadow-lg shadow-red-500/30"
              >
                Away Goal
              </Button>
              <Button
                onClick={() => removeGoal('away')}
                disabled={awayScore === 0}
                variant="ghost"
                size="sm"
                fullWidth
                icon={Minus}
                iconPosition="left"
                animate={false}
              >
                Remove
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card 
          padding="sm" 
          hover 
          onClick={() => addEvent('goal', 'Marcus Johnson', 'Quick goal logged')}
          className="stagger-item animate-scale-in group cursor-pointer border-2 border-transparent hover:border-orange-400"
        >
          <div className="w-full text-center space-y-2 touch-manipulation">
            <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mx-auto shadow-lg group-hover:shadow-orange-500/50 group-hover:scale-110 transition-all duration-300">
              <Target className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </div>
            <div className="text-xs md:text-sm font-semibold text-gray-900">Goal</div>
          </div>
        </Card>

        <Card 
          padding="sm" 
          hover 
          onClick={() => addEvent('assist', 'Jamie Thompson', 'Assist recorded')}
          className="stagger-item animate-scale-in group cursor-pointer border-2 border-transparent hover:border-blue-400"
        >
          <div className="w-full text-center space-y-2 touch-manipulation">
            <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto shadow-lg group-hover:shadow-blue-500/50 group-hover:scale-110 transition-all duration-300">
              <Users className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </div>
            <div className="text-xs md:text-sm font-semibold text-gray-900">Assist</div>
          </div>
        </Card>

        <Card 
          padding="sm" 
          hover
          className={`stagger-item animate-scale-in group cursor-pointer border-2 ${isRecording ? 'border-red-400 bg-red-50' : 'border-transparent'} hover:border-green-400`}
        >
          <button
            onClick={() => setIsRecording(!isRecording)}
            className="w-full text-center space-y-2 touch-manipulation"
          >
            <div className={`w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br rounded-xl flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition-all duration-300 ${
              isRecording 
                ? 'from-red-500 to-red-600 shadow-red-500/50 animate-pulse' 
                : 'from-green-500 to-green-600 group-hover:shadow-green-500/50'
            }`}>
              <Mic className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </div>
            <div className="text-xs md:text-sm font-semibold text-gray-900">
              {isRecording ? 'Recording...' : 'Voice Log'}
            </div>
          </button>
        </Card>

        <Card 
          padding="sm" 
          hover 
          onClick={() => addEvent('photo', 'System', 'Photo captured')}
          className="stagger-item animate-scale-in group cursor-pointer border-2 border-transparent hover:border-purple-400"
        >
          <div className="w-full text-center space-y-2 touch-manipulation">
            <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto shadow-lg group-hover:shadow-purple-500/50 group-hover:scale-110 transition-all duration-300">
              <Camera className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </div>
            <div className="text-xs md:text-sm font-semibold text-gray-900">Photo</div>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 md:gap-6">
        {/* Match Events */}
        <Card>
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-lg md:text-xl font-bold text-gray-900">Match Events</h2>
            <button className="text-green-600 hover:text-green-700 active:text-green-800 font-medium text-sm touch-manipulation">
              Add Event
            </button>
          </div>

          <div className="space-y-2 md:space-y-3 max-h-64 md:max-h-80 overflow-y-auto">
            {matchEvents.length === 0 ? (
              <div className="text-center py-6 md:py-8 text-gray-500">
                <FileText className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm md:text-base">No events logged yet</p>
                <p className="text-xs md:text-sm">Start tracking match events!</p>
              </div>
            ) : (
              matchEvents.map((event) => (
                <div key={event.id} className="flex items-start space-x-2 md:space-x-3 p-2 md:p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-900 text-xs md:text-sm">{event.type.toUpperCase()}</span>
                      <span className="text-xs text-gray-500">{event.time}</span>
                    </div>
                    <p className="text-xs md:text-sm text-gray-700">{event.player}</p>
                    {event.details && (
                      <p className="text-xs text-gray-500 mt-1">{event.details}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Squad Availability */}
        <Card>
          <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6">Squad Status</h2>
          
          <div className="space-y-2 md:space-y-3">
            {squadPlayers.map((player) => (
              <div key={player.id} className="flex items-center justify-between p-2 md:p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-2 md:space-x-3 min-w-0 flex-1">
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                    player.status === 'available' ? 'bg-green-500' :
                    player.status === 'injured' ? 'bg-red-500' : 'bg-yellow-500'
                  }`}></div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 text-sm md:text-base truncate">{player.name}</p>
                    <p className="text-xs md:text-sm text-gray-600">{player.position}</p>
                  </div>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full flex-shrink-0 ${
                  player.status === 'available' ? 'bg-green-100 text-green-800' :
                  player.status === 'injured' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {player.status}
                </span>
              </div>
            ))}
          </div>

          <button className="w-full mt-3 md:mt-4 py-2 md:py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-green-300 hover:text-green-600 active:border-green-400 transition-colors text-sm md:text-base touch-manipulation">
            + Add Player
          </button>
        </Card>
      </div>

      {/* Voice Recording Interface */}
      {isRecording && (
        <Card className="border-red-200 bg-red-50">
          <div className="text-center space-y-3 md:space-y-4">
            <div className="flex items-center justify-center space-x-2 md:space-x-3">
              <div className="w-3 h-3 md:w-4 md:h-4 bg-red-600 rounded-full animate-pulse"></div>
              <span className="text-red-800 font-medium text-sm md:text-base">Recording match commentary...</span>
            </div>
            <p className="text-xs md:text-sm text-red-700 px-2">
              Say something like: "Marcus scored a great goal in the 23rd minute, assisted by Jamie"
            </p>
            <div className="flex items-center justify-center space-x-3 md:space-x-4">
              <button
                onClick={() => setIsRecording(false)}
                className="bg-red-600 text-white px-4 py-2 md:py-3 rounded-lg hover:bg-red-700 active:bg-red-800 transition-colors text-sm md:text-base touch-manipulation"
              >
                Stop Recording
              </button>
              <button
                onClick={() => {
                  setIsRecording(false);
                  addEvent('voice-note', 'AI Transcription', 'Voice note processed and added to match events');
                }}
                className="bg-green-600 text-white px-4 py-2 md:py-3 rounded-lg hover:bg-green-700 active:bg-green-800 transition-colors text-sm md:text-base touch-manipulation"
              >
                Save & Process
              </button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};