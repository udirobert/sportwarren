import type { PlayerPuck, MatchCommentary, BallState } from '@/lib/match/matchEngine';

export type MatchPhase = 'first_half' | 'halftime' | 'second_half' | 'fulltime';

export interface MatchSimulationBall {
  x: number;
  y: number;
  vx: number;
  vy: number;
  ownerId: string | null;
}

export interface MatchSimulationSnapshot {
  ball: MatchSimulationBall;
  ballState: BallState;
  players: PlayerPuck[];
  commentary: MatchCommentary[];
  latestEvent: string;
  time: number;
  tempo: number;
  score: { home: number; away: number };
  matchPhase: MatchPhase;
}

export function createInitialMatchSimulationSnapshot(venue: string): MatchSimulationSnapshot {
  return {
    ball: { x: 50, y: 50, vx: 0, vy: 0, ownerId: null },
    ballState: 'controlled',
    players: [],
    commentary: [{ id: 'init-0', time: '0:00', text: `Preview canvas ready for ${venue}.`, type: 'incident' }],
    latestEvent: '',
    time: 0,
    tempo: 1,
    score: { home: 0, away: 0 },
    matchPhase: 'first_half',
  };
}
