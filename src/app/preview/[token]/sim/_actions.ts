/**
 * Server actions for the preview sim. The headline action is
 * `claimSimOutcome` — when a player taps "Lock this in" on the sim
 * reveal screen, this applies small attribute deltas to their twin
 * so the next visit to /preview shows the bars actually moved.
 *
 * Pragmatic Tuesday scope (NOT TwinService-routed for v1):
 *   - Direct PlayerTwin.baseAttributes update with 0-99 clamp.
 *   - Per-call deltas capped at +1 / attribute so runaway gains aren't
 *     possible even if a player spam-clicks. Over time the player
 *     approaches a ceiling tied to their position weights, not infinity.
 *   - Client-side localStorage guard (in SimReveal) keeps the UX honest
 *     for the happy path; no server-side idempotency check by design.
 *
 * Post-Tuesday this should be routed through TwinService.recordEvent
 * with kind: 'admin_adjustment' so the full attestation + moment
 * pipeline fires. Tracked in docs/product-calibration.md.
 */

'use server';

import { prisma } from '@/lib/db';
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

function clamp(n: number): number {
  return Math.max(0, Math.min(99, n));
}

/**
 * Compute the per-attribute deltas a single sim grants. The rules:
 *  - Win: +1 to the player's two strongest "in-action" attributes
 *    (SHO if they scored, PAC, DRI) and +1 PHY for endurance.
 *  - Draw: +1 to one attribute the player engaged with.
 *  - Loss: -1 to the weakest of (SHO, PAS) if conceded heavily; else 0.
 *  - Goals scored boost SHO regardless of outcome (visible feedback).
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
    // Pick the position-relevant lever
    const isAttacker = (position ?? '').toUpperCase().match(/ST|CF|LW|RW|W|CAM/);
    if (isAttacker) {
      deltas.pace = (deltas.pace ?? 0) + 1;
    } else {
      deltas.defending = (deltas.defending ?? 0) + 1;
    }
  } else if (outcome === 'draw') {
    deltas.passing = (deltas.passing ?? 0) + 1;
  } else if (outcome === 'loss' && goalsConceded >= 4) {
    // Heavy concede: small dip on the weakest of (SHO, PAS) so the loss is felt
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

  const user = await prisma.user.findUnique({
    where: { walletAddress: token },
    include: { playerProfile: { include: { twin: true } } },
  });

  if (!user || user.chain !== 'preview') return { ok: false, reason: 'not_preview' };

  const profile = user.playerProfile;
  const twin = profile?.twin;
  if (!profile || !twin) return { ok: false, reason: 'no_twin' };

  const before = (twin.baseAttributes as Attrs | null) ?? {
    pace: 50, shooting: 50, passing: 50, dribbling: 50, defending: 50, physical: 50,
  };

  const outcome: Outcome =
    goalsScored > goalsConceded ? 'win' : goalsScored === goalsConceded ? 'draw' : 'loss';

  const deltas = computeDeltas(outcome, user.position, goalsScored, goalsConceded, before);

  const after: Attrs = { ...before };
  for (const k of Object.keys(deltas) as AttributeKey[]) {
    after[k] = clamp(before[k] + (deltas[k] ?? 0));
  }

  await prisma.playerTwin.update({
    where: { id: twin.id },
    data: { baseAttributes: after as object },
  });

  return { ok: true, before, after, deltas };
}
