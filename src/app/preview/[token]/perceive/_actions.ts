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

export interface PerceptionPeek {
  scenarioId: string;
  kind: 'descriptive' | 'prescriptive';
  myChoice: 'a' | 'b' | 'c' | 'd';
  counts: { a: number; b: number; c: number; d: number; total: number };
  /** Headline computed from how the rater's choice compares to peers. */
  headline: string;
  /** Optional label of the winning choice text (filled in client-side from scenario lib). */
  topChoice: 'a' | 'b' | 'c' | 'd' | null;
}

export interface SubmitPerceptionResult {
  ok: boolean;
  reason?: 'not_preview' | 'no_profile' | 'invalid_scenario' | 'self_target' | 'unauthorized';
  givenCount?: number;
  peek?: PerceptionPeek;
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

  // Build the sneak-peek — aggregate of all ratings on this exact
  // (target, scenario, kind) combo + a headline that frames the
  // rater's choice relative to peers. Drives the "wait, what did
  // the others say?" curiosity that keeps the quiz loop going.
  const peerRatings = await prisma.playerPerception.findMany({
    where: { targetId: targetProfileId, scenarioId, kind },
    select: { choice: true },
  });
  const counts = { a: 0, b: 0, c: 0, d: 0, total: 0 };
  for (const r of peerRatings) {
    const c = r.choice as 'a' | 'b' | 'c' | 'd';
    if (c === 'a' || c === 'b' || c === 'c' || c === 'd') {
      counts[c] += 1;
      counts.total += 1;
    }
  }

  // Find the modal choice
  let topChoice: 'a' | 'b' | 'c' | 'd' | null = null;
  let topCount = -1;
  for (const k of ['a', 'b', 'c', 'd'] as const) {
    if (counts[k] > topCount) {
      topCount = counts[k];
      topChoice = k;
    }
  }

  // Compute the headline relative to the rater's own choice.
  const myCount = counts[choice];
  const others = counts.total - 1; // excluding this rater's own
  let headline: string;
  if (others === 0) {
    headline = 'First to call this one — no one else has weighed in yet';
  } else if (myCount === counts.total) {
    headline = `Consensus — all ${counts.total} lads picked ${choice.toUpperCase()}`;
  } else if (myCount - 1 === 0) {
    headline = `Hot take — you're the only one to pick ${choice.toUpperCase()}`;
  } else if (myCount - 1 === 1) {
    headline = `Spicy — only 1 other lad agrees with you`;
  } else if (myCount >= counts.total / 2 + 1) {
    headline = `Majority view — ${myCount - 1} of ${others} other lads agree`;
  } else {
    const winnerLabel = topChoice ? topChoice.toUpperCase() : '?';
    headline = `Outvoted — most lads went with ${winnerLabel}`;
  }

  return {
    ok: true,
    givenCount,
    peek: {
      scenarioId,
      kind,
      myChoice: choice,
      counts,
      headline,
      topChoice,
    },
  };
}
