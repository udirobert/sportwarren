/**
 * Position-aware starting baselines for new player twins.
 *
 * Maps each on-pitch position to a `baseAttributes` profile — the
 * chess.com 700-ELO equivalent. The numbers are deliberately
 * uneven so a fresh twin looks like a specialist, not a generalist:
 * a centre-back lands strong in DEF/PHY and weak in PAC/SHO; a
 * winger lands strong in PAC/DRI and weak in DEF.
 *
 * This is the "starting position in the hierarchy" — every player
 * sees their card and immediately knows where they're behind and
 * where they're ahead, which is the engagement lever.
 *
 * IMPORTANT: these baselines are seed-time only. After creation,
 * attributes only move via verified third-party proof (peer ratings,
 * Strava sync, sim outcomes, real matches). The "stats are never
 * self-editable" rule from AGENTS.md applies.
 */

import type { AttributeKey } from './twin-types';

type BaseAttributes = Record<AttributeKey, number>;

// Position codes normalised to upper-case (matches User.position usage
// across the codebase — GK, CB, FB/LB/RB, CM/CDM/CAM, W/LW/RW, ST).
type PositionCode =
  | 'GK'
  | 'CB'
  | 'LB' | 'RB' | 'FB'
  | 'CDM' | 'CM' | 'CAM'
  | 'LW' | 'RW' | 'W'
  | 'ST' | 'CF';

const BASELINES: Record<PositionCode, BaseAttributes> = {
  GK:  { pace: 38, shooting: 25, passing: 45, dribbling: 30, defending: 55, physical: 60 },
  CB:  { pace: 42, shooting: 32, passing: 52, dribbling: 40, defending: 68, physical: 62 },
  LB:  { pace: 60, shooting: 38, passing: 55, dribbling: 52, defending: 60, physical: 55 },
  RB:  { pace: 60, shooting: 38, passing: 55, dribbling: 52, defending: 60, physical: 55 },
  FB:  { pace: 60, shooting: 38, passing: 55, dribbling: 52, defending: 60, physical: 55 },
  CDM: { pace: 45, shooting: 42, passing: 60, dribbling: 50, defending: 65, physical: 60 },
  CM:  { pace: 52, shooting: 50, passing: 62, dribbling: 58, defending: 52, physical: 55 },
  CAM: { pace: 55, shooting: 58, passing: 64, dribbling: 64, defending: 38, physical: 48 },
  LW:  { pace: 68, shooting: 55, passing: 55, dribbling: 65, defending: 32, physical: 48 },
  RW:  { pace: 68, shooting: 55, passing: 55, dribbling: 65, defending: 32, physical: 48 },
  W:   { pace: 68, shooting: 55, passing: 55, dribbling: 65, defending: 32, physical: 48 },
  ST:  { pace: 60, shooting: 68, passing: 48, dribbling: 58, defending: 28, physical: 55 },
  CF:  { pace: 60, shooting: 68, passing: 48, dribbling: 58, defending: 28, physical: 55 },
};

// Average of all positions — used when position is unknown / missing.
// Computed once at module load so it's stable.
const NEUTRAL_BASELINE: BaseAttributes = (() => {
  const positions = Object.values(BASELINES);
  const sum: BaseAttributes = { pace: 0, shooting: 0, passing: 0, dribbling: 0, defending: 0, physical: 0 };
  for (const p of positions) {
    for (const k of Object.keys(sum) as AttributeKey[]) sum[k] += p[k];
  }
  for (const k of Object.keys(sum) as AttributeKey[]) {
    sum[k] = Math.round(sum[k] / positions.length);
  }
  return sum;
})();

/**
 * Resolve a starting attribute profile for a player at a given position.
 * Falls back to the neutral baseline when position is unknown.
 */
export function baselineForPosition(position: string | null | undefined): BaseAttributes {
  if (!position) return { ...NEUTRAL_BASELINE };
  const code = position.toUpperCase() as PositionCode;
  const found = BASELINES[code];
  return found ? { ...found } : { ...NEUTRAL_BASELINE };
}

/**
 * Overall rating — the chess.com-style single number that ranks
 * players against each other. Weighted average of the 6 attributes
 * with the position-relevant ones counted slightly more, plus a small
 * level + prestige bonus capped to prevent runaway inflation.
 *
 * Range: 0-99, matching the per-attribute scale. Comparable across
 * positions because the weighting accounts for what each role values.
 */
export function computeOverall(
  attrs: BaseAttributes,
  position: string | null | undefined,
  level = 1,
  prestige = 0,
): number {
  const weights = positionWeights(position);
  let weightedSum = 0;
  let totalWeight = 0;
  for (const k of Object.keys(attrs) as AttributeKey[]) {
    const w = weights[k];
    weightedSum += attrs[k] * w;
    totalWeight += w;
  }
  const base = weightedSum / totalWeight;
  const bonus = Math.min(10, (level - 1) * 0.5 + prestige * 1.5);
  return Math.max(0, Math.min(99, Math.round(base + bonus)));
}

function positionWeights(position: string | null | undefined): Record<AttributeKey, number> {
  const code = (position ?? '').toUpperCase();
  // Default equal weighting
  const equal: Record<AttributeKey, number> = {
    pace: 1, shooting: 1, passing: 1, dribbling: 1, defending: 1, physical: 1,
  };
  if (code === 'GK') return { pace: 0.5, shooting: 0.3, passing: 1, dribbling: 0.5, defending: 1.5, physical: 1.5 };
  if (code === 'CB') return { pace: 1, shooting: 0.5, passing: 1, dribbling: 0.8, defending: 1.8, physical: 1.5 };
  if (code === 'LB' || code === 'RB' || code === 'FB') return { pace: 1.4, shooting: 0.6, passing: 1.1, dribbling: 1.1, defending: 1.4, physical: 1.2 };
  if (code === 'CDM') return { pace: 0.9, shooting: 0.7, passing: 1.4, dribbling: 1, defending: 1.5, physical: 1.3 };
  if (code === 'CM') return { pace: 1, shooting: 1, passing: 1.5, dribbling: 1.2, defending: 1, physical: 1.1 };
  if (code === 'CAM') return { pace: 1.1, shooting: 1.3, passing: 1.5, dribbling: 1.4, defending: 0.5, physical: 0.9 };
  if (code === 'LW' || code === 'RW' || code === 'W') return { pace: 1.6, shooting: 1.2, passing: 1.1, dribbling: 1.5, defending: 0.4, physical: 0.9 };
  if (code === 'ST' || code === 'CF') return { pace: 1.3, shooting: 1.7, passing: 0.9, dribbling: 1.3, defending: 0.3, physical: 1.2 };
  return equal;
}

/**
 * Group-relative comparison for an attribute. Returns a verdict tag
 * we surface on the preview card next to each bar.
 */
export function compareToGroup(
  myValue: number,
  groupValues: number[],
): { groupAvg: number; verdict: 'ahead' | 'parity' | 'behind' } {
  if (groupValues.length === 0) return { groupAvg: myValue, verdict: 'parity' };
  const sum = groupValues.reduce((s, v) => s + v, 0);
  const groupAvg = Math.round(sum / groupValues.length);
  const diff = myValue - groupAvg;
  if (diff >= 4) return { groupAvg, verdict: 'ahead' };
  if (diff <= -4) return { groupAvg, verdict: 'behind' };
  return { groupAvg, verdict: 'parity' };
}
