import { describe, expect, it } from 'vitest';
import {
  TASTE_CEILING,
  TASTE_FLOOR,
  TASTE_NEUTRAL,
  TASTE_QUIET_THRESHOLD,
  explainTaste,
  isQuiet,
  prioritize,
  recordSignal,
  weightFor,
  type TasteWeights,
} from '@/server/services/personalization/taste-learner';

function apply(weights: TasteWeights, signal: Parameters<typeof recordSignal>[1], kind: string, n = 1) {
  const w = { ...weights };
  for (let i = 0; i < n; i++) {
    w[kind] = recordSignal(w, signal, kind).after;
  }
  return w;
}

describe('recordSignal', () => {
  it('starts every kind at the neutral weight', () => {
    expect(weightFor({}, 'level_up')).toBe(TASTE_NEUTRAL);
  });

  it.each([
    ['skip', 0.4],
    ['dismiss', 0.325],
    ['open', 0.525],
    ['dwell', 0.54],
    ['share', 0.6],
    ['save', 0.575],
    ['like', 0.56],
  ] as const)('%s multiplies the neutral weight to %s', (signal, expected) => {
    const change = recordSignal({}, signal, 'level_up');
    expect(change.after).toBeCloseTo(expected, 3);
    expect(change.changed).toBe(true);
  });

  it('clamps repeated skips at the floor', () => {
    const w = apply({}, 'skip', 'level_up', 20);
    expect(w.level_up).toBe(TASTE_FLOOR);
  });

  it('clamps repeated shares at the ceiling', () => {
    const w = apply({}, 'share', 'goal_scored', 20);
    expect(w.goal_scored).toBe(TASTE_CEILING);
  });

  it('ignores unknown signals and empty kinds', () => {
    // @ts-expect-error — runtime no-op for unrecognised event types
    expect(recordSignal({}, 'wiggle', 'level_up').changed).toBe(false);
    expect(recordSignal({}, 'skip', '').changed).toBe(false);
  });

  it('returns acknowledge copy for the UI', () => {
    expect(recordSignal({}, 'skip', 'goal_scored').message).toBe('Got it: fewer goal moments.');
    expect(recordSignal({}, 'share', 'level_up').message).toBe('Noted: more level ups.');
  });
});

describe('isQuiet', () => {
  it('is not quiet for a kind nobody signalled on', () => {
    expect(isQuiet({}, 'sim_win')).toBe(false);
  });

  it('goes quiet after two skips (0.5 * 0.8^2 < threshold)', () => {
    const w = apply({}, 'skip', 'sim_win', 2);
    expect(w.sim_win).toBeLessThan(TASTE_QUIET_THRESHOLD);
    expect(isQuiet(w, 'sim_win')).toBe(true);
  });

  it('wakes back up when positive signals lift the weight', () => {
    let w = apply({}, 'skip', 'sim_win', 2);
    w = apply(w, 'share', 'sim_win', 2);
    expect(isQuiet(w, 'sim_win')).toBe(false);
  });
});

describe('prioritize', () => {
  it('orders candidates strongest-first, preserving input order on ties', () => {
    const w: TasteWeights = { level_up: 1.5, sim_win: 0.2 };
    const out = prioritize(w, [
      { kind: 'sim_win' },
      { kind: 'twin_created' }, // neutral
      { kind: 'level_up' },
    ]);
    expect(out.map((o) => o.kind)).toEqual(['level_up', 'twin_created', 'sim_win']);
  });
});

describe('explainTaste', () => {
  it('is honest when nothing has been learned yet', () => {
    const e = explainTaste({});
    expect(e.more).toEqual([]);
    expect(e.fewer).toEqual([]);
    expect(e.summary).toContain('Still learning');
  });

  it('names the kinds it has moved on — the "why am I seeing this" surface', () => {
    let w = apply({}, 'share', 'goal_scored', 3);
    w = apply(w, 'skip', 'attestation_milestone', 3);
    const e = explainTaste(w);
    expect(e.more).toContain('goal moments');
    expect(e.fewer).toContain('on-chain milestones');
    expect(e.summary).toContain('more goal moments');
    expect(e.summary).toContain('fewer on-chain milestones');
  });

  it('does not report kinds hovering near neutral', () => {
    const w: TasteWeights = { level_up: TASTE_NEUTRAL * 1.1, sim_win: TASTE_NEUTRAL * 0.9 };
    const e = explainTaste(w);
    expect(e.more).toEqual([]);
    expect(e.fewer).toEqual([]);
  });
});
