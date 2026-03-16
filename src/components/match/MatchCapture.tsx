"use client";

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  Target, Users, Mic, Camera, MapPin, Play, Square, 
  Plus, Minus, FileText, Check, Shield
} from 'lucide-react';
import { useActiveMatch } from '@/hooks/match/useActiveMatch';
import { useEvidenceCapture, formatDuration } from '@/hooks/match/useEvidenceCapture';

interface MatchCaptureProps {
  homeTeam: string;
  awayTeam: string;
  onSubmit?: (result: any) => void;
}

export const MatchCapture: React.FC<MatchCaptureProps> = ({ 
  homeTeam, 
  awayTeam, 
  onSubmit 
}) => {
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [playersPerSide, setPlayersPerSide] = useState(11);
  const [hasKeeper, setHasKeeper] = useState(true);

  const FORMAT_PRESETS = [
    { label: '5v5', players: 5 },
    { label: '7v7', players: 7 },
    { label: '9v9', players: 9 },
    { label: '11v11', players: 11 },
  ];

  const matchFormat = `${playersPerSide}v${playersPerSide}`;
  
  const {
    matchState,
    startMatch,
    endMatch,
    addGoal,
    removeGoal,
    addEvent,
    canSubmit,
  } = useActiveMatch(homeTeam, awayTeam, onSubmit);

  const {
    state: evidenceState,
    startRecording,
    stopRecording,
    capturePhoto,
  } = useEvidenceCapture();

  const handleStartMatch = () => {
    startMatch();
  };

  const handleEndMatch = () => {
    if (canSubmit) {
      setShowSubmitConfirm(true);
    }
  };

  const confirmSubmit = () => {
    const result = endMatch();
    if (result && onSubmit) {
      onSubmit({ ...result, matchFormat, playersPerSide, hasKeeper });
    }
    setShowSubmitConfirm(false);
  };

  const handleVoiceToggle = async () => {
    if (evidenceState.isRecording) {
      const audioUrl = await stopRecording();
      if (audioUrl) {
        addEvent('voice-note', undefined, undefined, 'Voice note recorded');
      }
    } else {
      await startRecording();
    }
  };

  const handlePhotoCapture = async () => {
    const photoUrl = await capturePhoto();
    if (photoUrl) {
      addEvent('photo', undefined, undefined, 'Photo captured as evidence');
    }
  };

  // Match hasn't started yet
  if (!matchState.isActive && matchState.events.length === 0) {
    return (
      <Card className="py-8 px-4 space-y-6 bg-gradient-to-br from-white to-emerald-50/70 border-emerald-200">
        <div className="rounded-2xl border border-emerald-200/70 bg-white/80 px-4 py-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="section-title text-gray-500">Home</div>
            <div className="text-sm font-bold text-gray-900 truncate">{homeTeam}</div>
          </div>
          <div className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600">VS</div>
          <div className="min-w-0 text-right">
            <div className="section-title text-gray-500">Away</div>
            <div className="text-sm font-bold text-gray-900 truncate">{awayTeam}</div>
          </div>
        </div>

        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-600/20">
            <Play className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Set Up Match</h2>
          <p className="text-sm text-gray-500">Configure your format before kick-off</p>
        </div>

        {/* Format presets */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">Players per side</p>
          <div className="grid grid-cols-4 gap-2">
            {FORMAT_PRESETS.map(p => (
              <button
                key={p.label}
                onClick={() => setPlayersPerSide(p.players)}
                className={`py-2 rounded-lg text-sm font-bold border transition-colors ${
                  playersPerSide === p.players
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-green-400'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          {/* Custom slider for non-standard sizes */}
          <div className="mt-3 flex items-center gap-3">
            <span className="text-xs text-gray-500 w-20">Custom: {playersPerSide}v{playersPerSide}</span>
            <input
              type="range" min={3} max={15} value={playersPerSide}
              onChange={e => setPlayersPerSide(Number(e.target.value))}
              className="flex-1 accent-green-600"
            />
          </div>
        </div>

        {/* Keeper toggle */}
        <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-gray-700">Goalkeeper</span>
            <span className="text-xs text-gray-400">(can rotate each week)</span>
          </div>
          <button
            onClick={() => setHasKeeper(v => !v)}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              hasKeeper ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
              hasKeeper ? 'translate-x-5' : 'translate-x-0'
            }`} />
          </button>
        </div>

        <div className="text-center text-xs text-gray-500 font-semibold uppercase tracking-widest">
          {matchFormat} • {hasKeeper ? 'With goalkeeper' : 'No goalkeeper / rotating keeper'}
        </div>

        <Button onClick={handleStartMatch} size="lg" className="w-full h-14 text-base font-bold shadow-lg shadow-green-600/20 active:scale-95 transition-transform">
          Start Match Tracking
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Scoreboard */}
      <Card>
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>Live Match</span>
            {matchState.evidence.gpsLocation && (
              <span className="text-green-600">• GPS Active</span>
            )}
          </div>

          <div className="flex items-center justify-center space-x-8">
            <div className="text-center flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{homeTeam}</h3>
              <div className="text-5xl font-bold text-green-600">{matchState.homeScore}</div>
            </div>
            <div className="text-2xl font-bold text-gray-400">VS</div>
            <div className="text-center flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{awayTeam}</h3>
              <div className="text-5xl font-bold text-red-600">{matchState.awayScore}</div>
            </div>
          </div>

          {/* Score Controls */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Button 
                onClick={() => addGoal('home')} 
                variant="primary"
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Home Goal
              </Button>
              <Button 
                onClick={() => removeGoal('home')} 
                variant="outline"
                disabled={matchState.homeScore === 0}
                className="w-full"
              >
                <Minus className="w-4 h-4 mr-2" />
                Remove
              </Button>
            </div>
            <div className="space-y-2">
              <Button 
                onClick={() => addGoal('away')} 
                variant="primary"
                className="w-full bg-red-600 hover:bg-red-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Away Goal
              </Button>
              <Button 
                onClick={() => removeGoal('away')} 
                variant="outline"
                disabled={matchState.awayScore === 0}
                className="w-full"
              >
                <Minus className="w-4 h-4 mr-2" />
                Remove
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-3">
        <Card padding="sm" className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => addEvent('goal')}>
          <div className="text-center space-y-2">
            <Target className="w-6 h-6 text-orange-600 mx-auto" />
            <div className="text-xs font-medium text-gray-900">Goal</div>
          </div>
        </Card>
        <Card padding="sm" className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => addEvent('assist')}>
          <div className="text-center space-y-2">
            <Users className="w-6 h-6 text-blue-600 mx-auto" />
            <div className="text-xs font-medium text-gray-900">Assist</div>
          </div>
        </Card>
        <Card 
          padding="sm" 
          className={`cursor-pointer hover:shadow-md transition-shadow ${
            evidenceState.isRecording ? 'bg-red-50 border-red-200' : ''
          }`}
          onClick={handleVoiceToggle}
        >
          <div className="text-center space-y-2">
            <Mic className={`w-6 h-6 mx-auto ${evidenceState.isRecording ? 'text-red-600 animate-pulse' : 'text-green-600'}`} />
            <div className="text-xs font-medium text-gray-900">
              {evidenceState.isRecording ? formatDuration(evidenceState.recordingDuration) : 'Voice'}
            </div>
          </div>
        </Card>
        <Card padding="sm" className="cursor-pointer hover:shadow-md transition-shadow" onClick={handlePhotoCapture}>
          <div className="text-center space-y-2">
            <Camera className="w-6 h-6 text-purple-600 mx-auto" />
            <div className="text-xs font-medium text-gray-900">Photo</div>
          </div>
        </Card>
      </div>

      {/* Evidence Preview */}
      {(evidenceState.capturedPhotos.length > 0 || evidenceState.capturedAudio.length > 0) && (
        <Card>
          <h3 className="font-semibold text-gray-900 mb-3">Evidence Captured</h3>
          <div className="flex flex-wrap gap-2">
            {evidenceState.capturedPhotos.map((photo, idx) => (
              <div key={idx} className="relative">
                <img 
                  src={photo} 
                  alt={`Evidence ${idx + 1}`}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              </div>
            ))}
            {evidenceState.capturedAudio.map((_, idx) => (
              <div key={idx} className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg">
                <Mic className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-700">Voice {idx + 1}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Match Events */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Match Events</h3>
          <span className="text-sm text-gray-500">{matchState.events.length} events</span>
        </div>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {matchState.events.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <FileText className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No events yet</p>
            </div>
          ) : (
            matchState.events.map((event) => (
              <div key={event.id} className="flex items-start space-x-3 p-2 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900 text-sm capitalize">
                      {event.type}
                    </span>
                    {event.minute && (
                      <span className="text-xs text-gray-500">{event.minute}&apos;</span>
                    )}
                  </div>
                  {event.player && (
                    <p className="text-sm text-gray-700">{event.player}</p>
                  )}
                  {event.details && (
                    <p className="text-xs text-gray-500 mt-0.5">{event.details}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Submit Button */}
      <Button 
        onClick={handleEndMatch}
        disabled={!canSubmit}
        size="lg"
        className="w-full"
        variant={canSubmit ? "primary" : "outline"}
      >
        <Square className="w-4 h-4 mr-2" />
        End Match & Submit for Verification
      </Button>

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Submit Match Result?</h3>
            <p className="text-gray-600 mb-4">
              You are submitting: <strong>{homeTeam} {matchState.homeScore} - {matchState.awayScore} {awayTeam}</strong>
              <br />
              <span className="text-xs text-gray-500">{matchFormat} • {hasKeeper ? 'With goalkeeper' : 'No goalkeeper'}</span>
            </p>
            <p className="text-sm text-gray-500 mb-6">
              This result will be sent to the opposing team for confirmation. 
              Both teams must agree for the result to be verified on-chain.
            </p>
            <div className="flex space-x-3">
              <Button 
                onClick={() => setShowSubmitConfirm(false)} 
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={confirmSubmit}
                className="flex-1"
              >
                Confirm Submit
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
