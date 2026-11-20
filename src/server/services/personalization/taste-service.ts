/**
 * Taste service — persistence + consumers for the taste learner.
 *
 * `taste-learner.ts` is pure (weights in, weights out); this module owns the
 * TwinTasteWeight rows, the ActivityEvent audit log, and the read paths the
 * notification gate uses. Every DB call is fail-soft: an unmigrated or
 * unreachable table degrades to neutral weights — the learner must never
 * take notification delivery down with it.
 */

import { prisma } from '@/lib/db';
import {
  TASTE_FACTORS,
  recordSignal,
  explainTaste,
  weightFor,
  isQuiet,
  type TasteSignal,
  type TasteWeights,
} from './taste-learner';

// ────────────────────────────────────────────────────────────────────────────
// Write path — implicit engagement → learned weight
// ────────────────────────────────────────────────────────────────────────────

/** Apply one implicit signal (gallery skip, recap open, card share…) to a
 *  player's taste weights. Returns the change so a UI can acknowledge it
 *  ("Got it: fewer goal moments."). Silent on unknown signal/kind. */
export async function recordTasteSignal(
  userId: string,
  signal: TasteSignal,
  kind: string,
  context: { matchId?: string; playerId?: string } = {},
) {
  if (!kind || !(signal in TASTE_FACTORS)) return null;

  try {
    const row = await prisma.twinTasteWeight.findUnique({
      where: { userId_kind: { userId, kind } },
    });
    const applied = recordSignal({ [kind]: row?.weight ?? 0.5 }, signal, kind);

    await prisma.twinTasteWeight.upsert({
      where: { userId_kind: { userId, kind } },
      create: { userId, kind, weight: applied.after, signals: 1 },
      update: { weight: applied.after, signals: { increment: 1 } },
    });

    // Audit trail — what drove each weight, replayable for the "why" surface
    await prisma.activityEvent.create({
      data: {
        type: 'taste_signal',
        matchId: context.matchId ?? null,
        playerId: context.playerId ?? null,
        source: 'app',
        data: { userId, signal, kind, before: applied.before, after: applied.after },
      },
    });

    return applied;
  } catch (err) {
    // A taste write must never break the surface that produced the signal.
    console.warn('[taste] recordTasteSignal failed:', err);
    return null;
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Read paths — what the gate and the "why" surface need
// ────────────────────────────────────────────────────────────────────────────

/** All learned weights for a user. Returns {} when the table isn't there —
 *  neutral everywhere, no caller ever blocks on taste. */
export async function weightsForUser(userId: string): Promise<TasteWeights> {
  try {
    const rows = await prisma.twinTasteWeight.findMany({
      where: { userId },
      select: { kind: true, weight: true },
    });
    return Object.fromEntries(rows.map((r) => [r.kind, r.weight]));
  } catch {
    return {};
  }
}

/** The weight a dispatch decision should use for this kind (neutral fallback). */
export async function tasteWeightFor(userId: string, kind: string): Promise<number> {
  try {
    const row = await prisma.twinTasteWeight.findUnique({
      where: { userId_kind: { userId, kind } },
      select: { weight: true },
    });
    return row?.weight ?? 0.5;
  } catch {
    return 0.5;
  }
}

/** True when the player has pushed this kind down far enough that a scarce
 *  channel slot shouldn't be spent on it. Neutral/missing → not quiet. */
export async function isKindQuiet(userId: string, kind: string): Promise<boolean> {
  const w = await tasteWeightFor(userId, kind);
  return isQuiet({ [kind]: w }, kind);
}

/** "Why am I seeing this?" — the learner explains itself for a settings or
 *  recap surface. */
export async function explainForUser(userId: string) {
  const weights = await weightsForUser(userId);
  return explainTaste(weights);
}

// Re-export the pure API so consumers import taste concepts from one place.
export { recordSignal, explainTaste, weightFor, isQuiet };
export type { TasteSignal, TasteWeights };
