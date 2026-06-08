import type { AttributeKey } from "@/server/services/personalization/twin-types";
import type { PlayerPosition } from "@/types";

const PA = (pace: number, shooting: number, passing: number, dribbling: number, defending: number, physical: number): Record<AttributeKey, number> => ({
  pace, shooting, passing, dribbling, defending, physical,
});

/**
 * Position-based provisional attributes for the pre-auth player card preview.
 * These are a display concern — the server-side twin uses flat defaults and
 * gets refined through events.
 */
export const PROVISIONAL_ATTRIBUTES: Record<PlayerPosition, Record<AttributeKey, number>> = {
  GK: PA(48, 34, 58, 42, 70, 66),
  DF: PA(60, 45, 62, 52, 74, 72),
  MF: PA(64, 60, 73, 68, 60, 64),
  WG: PA(76, 66, 64, 75, 45, 58),
  ST: PA(72, 76, 58, 68, 38, 66),
};

/**
 * How a few verified matches + squad ratings nudge the provisional estimate
 * toward reality. Positive = attribute grows, negative = attribute shrinks.
 */
export const VERIFIED_DELTAS: Record<PlayerPosition, Partial<Record<AttributeKey, number>>> = {
  GK: { defending: 6, passing: 4, physical: 3, shooting: -2 },
  DF: { defending: 5, physical: 4, passing: 3, pace: -3 },
  MF: { passing: 6, dribbling: 4, pace: 3, defending: -2 },
  WG: { pace: 6, dribbling: 5, shooting: 3, defending: -3 },
  ST: { shooting: 6, pace: 4, dribbling: 3, passing: -2 },
};
