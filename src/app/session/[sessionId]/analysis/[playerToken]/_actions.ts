'use server';

import { prisma } from '@/lib/db';
import { commitmentFraming } from '@/server/services/personalization/commitment-framing';

/** Minimum committed players for a kickabout to happen (both sides of a
 *  5-a-side + subs). A sensible default until per-group config exists. */
const MIN_TO_PLAY = 10;
const NEXT_SESSION_OFFSET_DAYS = 7;

export interface CommitResult {
  ok: boolean;
  inCount: number;
  target: number;
  line: string;
  met: boolean;
  error?: string;
}

/**
 * Peak-end commitment capture: right after the session, the player taps
 * "same time next week? I'm in". Finds (or creates) the squad's next
 * scheduled session and records the commitment. Returns the running
 * social-proof + loss-framing line for the group.
 *
 * Idempotent — tapping again just keeps them 'in'.
 */
export async function commitToNextSession(
  playerToken: string,
  currentSessionId: string,
): Promise<CommitResult> {
  const empty = { ok: false, inCount: 0, target: MIN_TO_PLAY, line: '', met: false };

  const player = await prisma.user.findUnique({
    where: { walletAddress: playerToken },
    include: { playerProfile: true },
  });
  if (!player?.playerProfile) return { ...empty, error: 'Player not found' };

  const current = await prisma.session.findUnique({
    where: { id: currentSessionId },
    select: { squadId: true, date: true },
  });
  if (!current) return { ...empty, error: 'Session not found' };

  // Find the squad's next scheduled session, or create one a week on.
  let next = await prisma.session.findFirst({
    where: { squadId: current.squadId, status: 'scheduled', date: { gt: current.date } },
    orderBy: { date: 'asc' },
    select: { id: true },
  });
  if (!next) {
    const nextDate = new Date(current.date.getTime() + NEXT_SESSION_OFFSET_DAYS * 24 * 60 * 60 * 1000);
    next = await prisma.session.create({
      data: {
        squadId: current.squadId,
        name: 'Next session',
        date: nextDate,
        status: 'scheduled',
      },
      select: { id: true },
    });
  }

  await prisma.sessionAttendee.upsert({
    where: { sessionId_profileId: { sessionId: next.id, profileId: player.playerProfile.id } },
    update: { status: 'in', committedAt: new Date() },
    create: {
      sessionId: next.id,
      profileId: player.playerProfile.id,
      status: 'in',
      committedAt: new Date(),
    },
  });

  const inCount = await prisma.sessionAttendee.count({
    where: { sessionId: next.id, status: 'in' },
  });
  const framing = commitmentFraming(inCount, MIN_TO_PLAY, true);

  return { ok: true, inCount, target: MIN_TO_PLAY, line: framing.line, met: framing.met };
}
