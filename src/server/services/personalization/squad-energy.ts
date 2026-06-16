/**
 * Squad energy refresh — aggregator that lives outside the twin event stream.
 *
 * Squad energy (0-100) is a function of recent match-day participation and
 * RSVP payment compliance. It is not a personal twin attribute, so it does
 * not flow through `TwinService.recordEvent`. Instead, this helper reads the
 * latest RSVPs for a match and writes a single number to `SquadTwin.energy`.
 *
 * Called from:
 *   - `match-workflow.ts` after match verification
 *   - `/api/cron/digital-twin` for squads with no recent verified match
 *
 * Why a separate module: the brief calls energy a "squad-level operational
 * metric, not a twin brain metric". Keeping it out of the event stream keeps
 * the orchestrator focused on twin mutations.
 *
 * KNOWN ISSUE — shared column with TwinService:
 * `SquadTwin.energy` is also written by `TwinService.persistDiff` for
 * `sim_completed` events (via `diff.energyDelta`). The two writers race:
 * a sim deduction can be silently overwritten by the next RSVP recompute,
 * or vice versa. Resolution depends on a vision decision (do twin sims
 * stay in the product?) and is tracked alongside the AGENTS.md / VISION.md
 * pass. For now, RSVP recompute wins because it runs more often.
 */

import type { PrismaClient } from '@prisma/client';
import { prisma as defaultPrisma } from '@/lib/db';

export interface SquadEnergySnapshot {
  squadId: string;
  matchId: string;
  energy: number;
  participationScore: number;
  financialScore: number;
}

export async function refreshSquadEnergy(
  squadId: string,
  matchId: string,
  db: PrismaClient = defaultPrisma,
): Promise<SquadEnergySnapshot | null> {
  const rsvps = await db.matchRsvp.findMany({ where: { matchId } });
  if (rsvps.length === 0) return null;

  const confirmed = rsvps.filter((r) => r.status === 'confirmed').length;
  const paid = rsvps.filter((r) => r.isPaid).length;
  const total = rsvps.length;

  const participationScore = (confirmed / total) * 50;
  const financialScore = (paid / (confirmed || 1)) * 50;
  const energy = Math.round(participationScore + financialScore);

  await db.squadTwin.upsert({
    where: { squadId },
    update: { energy },
    create: { squadId, energy },
  });

  return { squadId, matchId, energy, participationScore, financialScore };
}
