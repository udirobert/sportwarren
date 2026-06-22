/**
 * Server actions for the preview sim. The headline action is
 * `claimSimOutcome` — when a player taps "Lock this in" on the sim
 * reveal screen, this applies small attribute deltas to their twin
 * so the next visit to /preview shows the bars actually moved.
 *
 * Routed through TwinService.recordEvent({ kind: 'admin_adjustment' })
 * with skipMoment + skipNotification so the full event-sourced
 * pipeline applies the diff (atomic, clamped, attestation row written)
 * without firing Kite signing / moment-card rendering / push
 * notifications — none of which we want for the preview tier.
 *
 * Per-call deltas capped at +1 / attribute so runaway gains aren't
 * possible. The 0-99 clamp lives in the applier itself.
 *
 * Client-side localStorage guard (in SimReveal) keeps the UX honest;
 * no server-side idempotency check by design — see docs/flywheel.md.
 */

'use server';

import { prisma } from '@/lib/db';
import { getPreviewUser } from '../../_lib/get-preview-user';
import { getTwinService } from '@/server/services/personalization/twin-service';
import type { AttributeKey } from '@/server/services/personalization/twin-types';

type Attrs = Record<AttributeKey, number>;
type Outcome = 'win' | 'draw' | 'loss';

export interface ClaimResult {
  ok: boolean;
  reason?: string;
  before?: Attrs;
  after?: Attrs;
  deltas?: Partial<Attrs>;
}

/**
 * Compute the per-attribute deltas a single sim grants. Same rules
 * as before — win → +1 PHY + position-relevant + SHO-if-scored,
 * draw → +1 PAS, heavy loss → -1 on weakest of SHO/PAS.
 */
function computeDeltas(
  outcome: Outcome,
  position: string | null | undefined,
  goalsScored: number,
  goalsConceded: number,
  current: Attrs,
): Partial<Attrs> {
  const deltas: Partial<Attrs> = {};

  if (goalsScored > 0) deltas.shooting = 1;
  if (outcome === 'win') {
    deltas.physical = (deltas.physical ?? 0) + 1;
    const isAttacker = (position ?? '').toUpperCase().match(/ST|CF|LW|RW|W|CAM/);
    if (isAttacker) {
      deltas.pace = (deltas.pace ?? 0) + 1;
    } else {
      deltas.defending = (deltas.defending ?? 0) + 1;
    }
  } else if (outcome === 'draw') {
    deltas.passing = (deltas.passing ?? 0) + 1;
  } else if (outcome === 'loss' && goalsConceded >= 4) {
    const sho = current.shooting ?? 50;
    const pas = current.passing ?? 50;
    if (sho < pas) deltas.shooting = (deltas.shooting ?? 0) - 1;
    else deltas.passing = (deltas.passing ?? 0) - 1;
  }

  // Per-call cap: no single attribute moves by more than ±1 per claim.
  for (const k of Object.keys(deltas) as AttributeKey[]) {
    const v = deltas[k]!;
    deltas[k] = Math.max(-1, Math.min(1, v));
  }
  return deltas;
}

export async function claimSimOutcome(input: {
  token: string;
  goalsScored: number;
  goalsConceded: number;
}): Promise<ClaimResult> {
  const { token, goalsScored, goalsConceded } = input;

  const user = await getPreviewUser(token, {
    include: { playerProfile: { include: { twin: true } } },
  });
  if (!user) return { ok: false, reason: 'not_preview' };

  const profile = user.playerProfile;
  const twin = profile?.twin;
  if (!profile || !twin) return { ok: false, reason: 'no_twin' };

  const before = (twin.baseAttributes as Attrs | null) ?? {
    pace: 50, shooting: 50, passing: 50, dribbling: 50, defending: 50, physical: 50,
  };

  const outcome: Outcome =
    goalsScored > goalsConceded ? 'win' : goalsScored === goalsConceded ? 'draw' : 'loss';

  const deltas = computeDeltas(outcome, user.position, goalsScored, goalsConceded, before);

  // Route through TwinService — single funnel for twin mutations. The
  // admin_adjustment applier copies the diff into TwinState (with clamp
  // + persistence atomic). skipMoment + skipNotification suppress the
  // Kite signing + moment rendering + notification dispatch — none of
  // which we want for the preview tier.
  const twinService = getTwinService();
  await twinService.recordEvent(
    {
      kind: 'admin_adjustment',
      twinId: twin.id,
      reason: `preview sim outcome: ${outcome} (${goalsScored}-${goalsConceded})`,
      moderatorId: 'preview_system',
      diff: {
        attributeDeltas: deltas as Record<AttributeKey, number>,
        xpDelta: 0,
        levelUp: false,
        newLevel: twin.level,
        prestigeDelta: 0,
        matchStatsDelta: {},
        reputationDelta: 0,
      },
    },
    { skipMoment: true, skipNotification: true },
  );

  // Re-read to get the post-event attribute state for the UI.
  const updatedTwin = await prisma.playerTwin.findUnique({
    where: { id: twin.id },
    select: { baseAttributes: true },
  });
  const after = (updatedTwin?.baseAttributes as Attrs | null) ?? before;

  return { ok: true, before, after, deltas };
}
