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

export interface CreateMatchCommentaryEntryInput {
  id: string;
  tick: number;
  text: string;
  type: MatchCommentary['type'];
}

export function createInitialMatchSimulationSnapshot(venue: string): MatchSimulationSnapshot {
  return {
    ball: { x: 50, y: 50, vx: 0, vy: 0, ownerId: null },
    ballState: 'controlled',
    players: [],
    commentary: [createMatchCommentaryEntry({
      id: 'init-0',
      tick: 0,
      text: `Preview canvas ready for ${venue}.`,
      type: 'incident',
    })],
    latestEvent: '',
    time: 0,
    tempo: 1,
    score: { home: 0, away: 0 },
    matchPhase: 'first_half',
  };
}

export function createMatchCommentaryEntry({ id, tick, text, type }: CreateMatchCommentaryEntryInput): MatchCommentary {
  const clockMin = Math.floor(tick / 60);
  const clockSec = tick % 60;

  return {
    id,
    time: `${clockMin}:${clockSec.toString().padStart(2, '0')}`,
    text,
    type,
  };
}

export function createMatchSimulationSnapshot(input: MatchSimulationSnapshot): MatchSimulationSnapshot {
  return {
    ball: { ...input.ball },
    ballState: input.ballState,
    players: [...input.players],
    commentary: [...input.commentary],
    latestEvent: input.latestEvent,
    time: input.time,
    tempo: input.tempo,
    score: { ...input.score },
    matchPhase: input.matchPhase,
  };
}
