'use server';

import { prisma } from '@/lib/db';
import { commitmentFraming } from '@/server/services/personalization/commitment-framing';
import { generateInference } from '@/lib/ai/inference';

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

  // A preview credential authorizes its owner, not arbitrary session IDs.
  const attended = await prisma.sessionAttendee.findUnique({
    where: {
      sessionId_profileId: { sessionId: currentSessionId, profileId: player.playerProfile.id },
    },
    select: { id: true },
  });
  if (!attended) return { ...empty, error: 'You did not attend this session' };

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

export interface CommentResult {
  ok: boolean;
  line: string;
  /** True when no provider was available and the deterministic line was used. */
  fallback: boolean;
  error?: string;
}

const FALLBACK_CALLS = [
  'Squeezed down to {d}m and still standing. That’s the whole story.',
  'Closed down hard at {t} — {d}m of trouble, dealt with.',
  'They came in waves at {t}. {d}m out and the ball survived.',
];

/**
 * One commentator line per pressure event. Explicit tap only (controls
 * inference spend): the event row's "Get the call" button. Falls back to a
 * deterministic line when no provider is configured — the UI never breaks.
 *
 * Same auth shape as commitToNextSession: a preview credential authorizes
 * its owner, and only for sessions they attended.
 */
export async function commentOnPressure(
  playerToken: string,
  sessionId: string,
  mmss: string,
  distM: number,
): Promise<CommentResult> {
  const player = await prisma.user.findUnique({
    where: { walletAddress: playerToken },
    include: { playerProfile: true },
  });
  if (!player?.playerProfile) return { ok: false, line: '', fallback: true, error: 'Player not found' };

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      squad: { select: { name: true } },
      matches: { include: { playerStats: true } },
    },
  });
  if (!session) return { ok: false, line: '', fallback: true, error: 'Session not found' };

  const attended = await prisma.sessionAttendee.findUnique({
    where: { sessionId_profileId: { sessionId, profileId: player.playerProfile.id } },
    select: { id: true },
  });
  if (!attended) return { ok: false, line: '', fallback: true, error: 'You did not attend this session' };

  const myStats = session.matches
    .flatMap((m) => m.playerStats)
    .filter((s) => s.profileId === player.playerProfile!.id);
  const goals = myStats.reduce((s, st) => s + st.goals, 0);
  const assists = myStats.reduce((s, st) => s + st.assists, 0);
  const context =
    goals + assists > 0
      ? `${player.name ?? 'The player'} put up ${goals} goals and ${assists} assists for ${session.squad.name} that night.`
      : `A quiet night on the scoresheet for ${session.squad.name} — the work was off the ball.`;

  try {
    const res = await generateInference(
      [
        {
          role: 'user',
          content: `One commentator line, 20 words max, spicy but kind, grassroots kickabout — never cruel, never about anyone except the ball carrier. Facts: squeezed to ${distM.toFixed(1)}m (estimated) at ${mmss}. Context: ${context} Plain language, no jargon, ASCII only.`,
        },
      ],
      { tier: 'text', max_tokens: 80, temperature: 0.8 },
    );
    const line = res?.content.trim().split('\n')[0]?.slice(0, 140);
    if (line) return { ok: true, line, fallback: false };
  } catch {
    // Fall through to the deterministic line.
  }
  const pick = FALLBACK_CALLS[mmss.length % FALLBACK_CALLS.length];
  return {
    ok: true,
    line: pick.replace('{d}', distM.toFixed(1)).replace('{t}', mmss),
    fallback: true,
  };
}
