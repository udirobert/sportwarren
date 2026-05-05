import { describe, expect, it } from 'vitest';
import {
  createInitialMatchSimulationSnapshot,
  createMatchCommentaryEntry,
  createMatchSimulationSnapshot,
} from '@/lib/match/matchSimulation';

describe('matchSimulation helpers', () => {
  it('creates a stable initial snapshot', () => {
    const snapshot = createInitialMatchSimulationSnapshot('Hackney Marshes');

    expect(snapshot.matchPhase).toBe('first_half');
    expect(snapshot.score).toEqual({ home: 0, away: 0 });
    expect(snapshot.commentary[0]?.text).toContain('Hackney Marshes');
  });

  it('formats commentary entries from tick time', () => {
    expect(createMatchCommentaryEntry({
      id: '1',
      tick: 125,
      text: 'Shot on target',
      type: 'action',
    })).toEqual({
      id: '1',
      time: '2:05',
      text: 'Shot on target',
      type: 'action',
    });
  });

  it('clones a render snapshot shape safely', () => {
    const snapshot = createInitialMatchSimulationSnapshot('Battersea Park');
    const cloned = createMatchSimulationSnapshot(snapshot);

    expect(cloned).toEqual(snapshot);
    expect(cloned).not.toBe(snapshot);
    expect(cloned.score).not.toBe(snapshot.score);
    expect(cloned.ball).not.toBe(snapshot.ball);
    expect(cloned.commentary).not.toBe(snapshot.commentary);
  });
});
