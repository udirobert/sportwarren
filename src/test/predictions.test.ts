import { describe, expect, it } from 'vitest';
import { generatePrediction } from '@/server/services/personalization/predictions';
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
