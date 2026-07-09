import { describe, expect, it } from 'vitest';
import {
  generatePrediction,
  resolvePrediction,
  type PredictionOutcome,
} from '@/server/services/personalization/predictions';
import type { AttributeKey } from '@/server/services/personalization/twin-types';

type Attrs = Record<AttributeKey, number>;

// A striker-shaped card (strong shooting, weak defending) and a
// centre-back-shaped one (strong defending, weak shooting).
const STRIKER: Attrs = { pace: 60, shooting: 72, passing: 48, dribbling: 58, defending: 28, physical: 55 };
const CB: Attrs = { pace: 42, shooting: 32, passing: 52, dribbling: 40, defending: 70, physical: 62 };

describe('generatePrediction', () => {
  it('is deterministic for the same seed', () => {
    const a = generatePrediction({ position: 'ST', attrs: STRIKER, seed: 'profile-123' });
    const b = generatePrediction({ position: 'ST', attrs: STRIKER, seed: 'profile-123' });
    expect(a).toEqual(b);
  });

  it('varies the bold call across different players at the same position', () => {
    // Enough distinct seeds should surface more than one call from the bucket.
    const calls = new Set(
      Array.from({ length: 20 }, (_, i) =>
        generatePrediction({ position: 'ST', attrs: STRIKER, seed: `p${i}` }).boldCall,
      ),
    );
    expect(calls.size).toBeGreaterThan(1);
  });

  it('picks the strongest attribute as the strength', () => {
    const p = generatePrediction({ position: 'ST', attrs: STRIKER, seed: 's' });
    expect(p.strength.key).toBe('shooting');
    expect(p.strength.value).toBe(72);
    expect(p.strength.label).toBe('Finishing');
  });

  it('picks the weakest attribute as the "prove us wrong" hook', () => {
    const p = generatePrediction({ position: 'ST', attrs: STRIKER, seed: 's' });
    expect(p.weakness.key).toBe('defending');
    expect(p.weakness.value).toBe(28);
  });

  it('routes positions to the right copy bucket', () => {
    expect(generatePrediction({ position: 'GK', attrs: CB, seed: 'x' }).bucket).toBe('GK');
    expect(generatePrediction({ position: 'CB', attrs: CB, seed: 'x' }).bucket).toBe('DEF');
    expect(generatePrediction({ position: 'LB', attrs: CB, seed: 'x' }).bucket).toBe('FB');
    expect(generatePrediction({ position: 'CM', attrs: CB, seed: 'x' }).bucket).toBe('MID');
    expect(generatePrediction({ position: 'CAM', attrs: CB, seed: 'x' }).bucket).toBe('CAM');
    expect(generatePrediction({ position: 'RW', attrs: CB, seed: 'x' }).bucket).toBe('WING');
    expect(generatePrediction({ position: 'ST', attrs: CB, seed: 'x' }).bucket).toBe('ST');
  });

  it('falls back to the engine-room (MID) bucket for unknown positions', () => {
    expect(generatePrediction({ position: null, attrs: CB, seed: 'x' }).bucket).toBe('MID');
    expect(generatePrediction({ position: 'SWEEPER', attrs: CB, seed: 'x' }).bucket).toBe('MID');
  });

  it('always returns a non-empty bold call and predicted line', () => {
    const p = generatePrediction({ position: 'W', attrs: STRIKER, seed: 'winger' });
    expect(p.boldCall.length).toBeGreaterThan(0);
    expect(p.predictedLine.length).toBeGreaterThan(0);
  });
});

describe('resolvePrediction', () => {
  const strikerPred = generatePrediction({ position: 'ST', attrs: STRIKER, seed: 's' });
  const cbPred = generatePrediction({ position: 'CB', attrs: CB, seed: 'c' });

  const baseOutcome: PredictionOutcome = {
    goals: 0, assists: 0, wasTopScorer: false, avgRating: null, weaknessDelta: 0,
  };

  it('marks a striker who scores as answered', () => {
    const v = resolvePrediction(strikerPred, { ...baseOutcome, goals: 2, wasTopScorer: true });
    expect(v.result).toBe('answered');
    expect(v.line).toContain(strikerPred.boldCall);
    expect(v.line).toContain('2 goals');
    expect(v.line).toContain('top scorer');
  });

  it('leaves a striker who did nothing unproven', () => {
    const v = resolvePrediction(strikerPred, { ...baseOutcome, goals: 0, assists: 0 });
    expect(v.result).toBe('unproven');
  });

  it('returns "open" for a keeper with no goals/assists and no rating', () => {
    const v = resolvePrediction(cbPred, baseOutcome);
    // CB with no signal → cannot judge
    expect(v.result).toBe('open');
  });

  it('resolves a defender on peer rating when unrated by goals', () => {
    const good = resolvePrediction(cbPred, { ...baseOutcome, avgRating: 7.2 });
    expect(good.result).toBe('answered');
    const bad = resolvePrediction(cbPred, { ...baseOutcome, avgRating: 4.0 });
    expect(bad.result).toBe('unproven');
  });

  it('appends the doubted-attribute callback when the weakness moved up', () => {
    const v = resolvePrediction(strikerPred, { ...baseOutcome, goals: 1, weaknessDelta: 3 });
    expect(v.line).toContain(`${strikerPred.weakness.label} we doubted? Up 3`);
  });

  it('is deterministic for the same prediction + outcome', () => {
    const o = { ...baseOutcome, goals: 1, assists: 1 };
    expect(resolvePrediction(strikerPred, o)).toEqual(resolvePrediction(strikerPred, o));
  });
});
