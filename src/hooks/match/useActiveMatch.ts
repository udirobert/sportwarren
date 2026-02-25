"use client";

import { useState, useCallback, useEffect } from 'react';
import type { MatchEvent, MatchResult } from '@/types';

interface ActiveMatchState {
  homeScore: number;
  awayScore: number;
  events: MatchEvent[];
  startTime: Date | null;
  isActive: boolean;
  evidence: {
    photos: string[];
    voiceNotes: string[];
    gpsLocation?: { lat: number; lng: number };
  };
}

interface UseActiveMatchReturn {
  matchState: ActiveMatchState;
  startMatch: () => void;
  endMatch: () => MatchResult | null;
  addGoal: (team: 'home' | 'away', playerId?: string, playerName?: string) => void;
  removeGoal: (team: 'home' | 'away') => void;
  addEvent: (type: MatchEvent['type'], playerId?: string, playerName?: string, details?: string) => void;
  addEvidence: (type: 'photo' | 'voice', data: string) => void;
  captureGPS: () => Promise<void>;
  canSubmit: boolean;
}

export function useActiveMatch(
  homeTeam: string,
  awayTeam: string,
  onSubmit?: (result: MatchResult) => void
): UseActiveMatchReturn {
  const [matchState, setMatchState] = useState<ActiveMatchState>({
    homeScore: 0,
    awayScore: 0,
    events: [],
    startTime: null,
    isActive: false,
    evidence: {
      photos: [],
      voiceNotes: [],
    },
  });

  const startMatch = useCallback(() => {
    setMatchState({
      homeScore: 0,
      awayScore: 0,
      events: [],
      startTime: new Date(),
      isActive: true,
      evidence: {
        photos: [],
        voiceNotes: [],
      },
    });
  }, []);

  const endMatch = useCallback((): MatchResult | null => {
    if (!matchState.isActive) return null;

    const result: MatchResult = {
      id: `match_${Date.now()}`,
      homeTeam,
      awayTeam,
      homeScore: matchState.homeScore,
      awayScore: matchState.awayScore,
      submitter: 'Current User', // Get from wallet
      submitterTeam: 'home', // Determine based on user's team
      timestamp: new Date(),
      verifications: [],
      status: 'pending',
      requiredVerifications: 3,
      trustScore: 0,
      evidence: {
        photos: matchState.evidence.photos.map((url, i) => ({
          id: `photo_${i}`,
          url,
          timestamp: new Date(),
          uploadedBy: 'Current User',
          type: 'photo',
        })),
        voiceLogs: matchState.evidence.voiceNotes.map((url, i) => ({
          id: `voice_${i}`,
          url,
          timestamp: new Date(),
          uploadedBy: 'Current User',
          type: 'voice',
        })),
        gps: matchState.evidence.gpsLocation ? {
          lat: matchState.evidence.gpsLocation.lat,
          lng: matchState.evidence.gpsLocation.lng,
          timestamp: Date.now(),
        } : undefined,
      },
      consensus: {
        homeSubmitted: true,
        awaySubmitted: false,
        homeScore: matchState.homeScore,
        awayScore: matchState.awayScore,
        discrepancy: false,
        resolved: false,
      },
    };

    setMatchState(prev => ({ ...prev, isActive: false }));
    
    if (onSubmit) {
      onSubmit(result);
    }

    return result;
  }, [matchState, homeTeam, awayTeam, onSubmit]);

  const addGoal = useCallback((team: 'home' | 'away', playerId?: string, playerName?: string) => {
    setMatchState(prev => {
      const scorer = playerName || (team === 'home' ? homeTeam : awayTeam);
      const newEvent: MatchEvent = {
        id: `event_${Date.now()}`,
        type: 'goal',
        player: scorer,
        playerId,
        details: `${scorer} scored for ${team === 'home' ? homeTeam : awayTeam}`,
        timestamp: new Date(),
        minute: prev.startTime 
          ? Math.floor((Date.now() - prev.startTime.getTime()) / 60000)
          : undefined,
      };

      return {
        ...prev,
        homeScore: team === 'home' ? prev.homeScore + 1 : prev.homeScore,
        awayScore: team === 'away' ? prev.awayScore + 1 : prev.awayScore,
        events: [newEvent, ...prev.events],
      };
    });
  }, [homeTeam, awayTeam]);

  const removeGoal = useCallback((team: 'home' | 'away') => {
    setMatchState(prev => {
      if (team === 'home' && prev.homeScore === 0) return prev;
      if (team === 'away' && prev.awayScore === 0) return prev;

      const scorer = team === 'home' ? homeTeam : awayTeam;
      const newEvent: MatchEvent = {
        id: `event_${Date.now()}`,
        type: 'goal',
        player: scorer,
        details: `Goal removed for ${scorer}`,
        timestamp: new Date(),
      };

      return {
        ...prev,
        homeScore: team === 'home' ? Math.max(0, prev.homeScore - 1) : prev.homeScore,
        awayScore: team === 'away' ? Math.max(0, prev.awayScore - 1) : prev.awayScore,
        events: [newEvent, ...prev.events],
      };
    });
  }, [homeTeam, awayTeam]);

  const addEvent = useCallback((
    type: MatchEvent['type'],
    playerId?: string,
    playerName?: string,
    details?: string
  ) => {
    setMatchState(prev => {
      const newEvent: MatchEvent = {
        id: `event_${Date.now()}`,
        type,
        player: playerName,
        playerId,
        details,
        timestamp: new Date(),
        minute: prev.startTime 
          ? Math.floor((Date.now() - prev.startTime.getTime()) / 60000)
          : undefined,
      };

      return {
        ...prev,
        events: [newEvent, ...prev.events],
      };
    });
  }, []);

  const addEvidence = useCallback((type: 'photo' | 'voice', data: string) => {
    setMatchState(prev => ({
      ...prev,
      evidence: {
        ...prev.evidence,
        photos: type === 'photo' ? [...prev.evidence.photos, data] : prev.evidence.photos,
        voiceNotes: type === 'voice' ? [...prev.evidence.voiceNotes, data] : prev.evidence.voiceNotes,
      },
    }));
  }, []);

  const captureGPS = useCallback(async () => {
    if (!navigator.geolocation) {
      console.warn('Geolocation not supported');
      return;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      });

      setMatchState(prev => ({
        ...prev,
        evidence: {
          ...prev.evidence,
          gpsLocation: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
        },
      }));
    } catch (err) {
      console.error('Failed to capture GPS:', err);
    }
  }, []);

  // Auto-capture GPS when match starts
  useEffect(() => {
    if (matchState.isActive && !matchState.evidence.gpsLocation) {
      captureGPS();
    }
  }, [matchState.isActive, matchState.evidence.gpsLocation, captureGPS]);

  const canSubmit = matchState.isActive && matchState.events.length > 0;

  return {
    matchState,
    startMatch,
    endMatch,
    addGoal,
    removeGoal,
    addEvent,
    addEvidence,
    captureGPS,
    canSubmit,
  };
}
