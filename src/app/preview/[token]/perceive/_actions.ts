/**
 * Server actions for the perception quiz.
 *
 * The rater submits a choice for a (target, scenario, kind). The
 * unique constraint on PlayerPerception lets us upsert — re-answering
 * overwrites the previous choice. Choices are per (rater, target,
 * scenario, kind) so a rater can answer descriptive AND prescriptive
 * versions of the same scenario.
 */

'use server';

import { prisma } from '@/lib/db';
import { getScenarioById } from '@/server/services/perception/scenarios';

export interface SubmitPerceptionResult {
  ok: boolean;
  reason?: 'not_preview' | 'no_profile' | 'invalid_scenario' | 'self_target' | 'unauthorized';
  givenCount?: number;
}

export async function submitPerception(input: {
  token: string;
  targetProfileId: string;
  scenarioId: string;
  choice: 'a' | 'b' | 'c' | 'd';
  kind: 'descriptive' | 'prescriptive';
}): Promise<SubmitPerceptionResult> {
  const { token, targetProfileId, scenarioId, choice, kind } = input;

  // Validate the scenario exists in the library.
  const scenario = getScenarioById(scenarioId);
  if (!scenario) return { ok: false, reason: 'invalid_scenario' };
  if (kind === 'prescriptive' && !scenario.hasPrescriptive) {
    return { ok: false, reason: 'invalid_scenario' };
  }

  const user = await prisma.user.findUnique({
    where: { walletAddress: token },
    include: { playerProfile: true },
  });
  if (!user || user.chain !== 'preview') return { ok: false, reason: 'not_preview' };
  const rater = user.playerProfile;
  if (!rater) return { ok: false, reason: 'no_profile' };
  if (rater.id === targetProfileId) return { ok: false, reason: 'self_target' };

  // Make sure target is in the same squad as the rater (don't let
  // arbitrary IDs in — rater can only perceive squad-mates).
  const sharedSquad = await prisma.squadMember.findFirst({
    where: {
      user: { playerProfile: { id: targetProfileId } },
      squad: {
        members: { some: { userId: user.id } },
      },
    },
  });
  if (!sharedSquad) return { ok: false, reason: 'unauthorized' };

  // Upsert via the composite unique key.
  await prisma.playerPerception.upsert({
    where: {
      raterId_targetId_scenarioId_kind: {
        raterId: rater.id,
        targetId: targetProfileId,
        scenarioId,
        kind,
      },
    },
    update: { choice },
    create: {
      raterId: rater.id,
      targetId: targetProfileId,
      scenarioId,
      choice,
      kind,
    },
  });

  // Return the rater's total given count for the reciprocity gate.
  const givenCount = await prisma.playerPerception.count({
    where: { raterId: rater.id },
  });

  return { ok: true, givenCount };
}
