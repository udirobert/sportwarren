/**
 * Server actions for the live capture screen.
 *
 * These mutate the DB directly, called from the client `<LiveCapture />`
 * component. No tRPC — keep the latency minimum for tap-to-score.
 */

'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

interface CaptainContext {
  userId: string;
  squadId: string;
}

async function resolveCaptain(token: string): Promise<CaptainContext | null> {
  const user = await prisma.user.findUnique({
    where: { walletAddress: token },
    include: {
      squads: { include: { squad: true } },
    },
  });
  if (!user) return null;
  const captainMembership = user.squads.find((m) => m.role === 'captain') ?? user.squads[0];
  if (!captainMembership) return null;
  return { userId: user.id, squadId: captainMembership.squadId };
}

export async function startSession(token: string): Promise<{ sessionId: string; matchId: string }> {
  const captain = await resolveCaptain(token);
  if (!captain) throw new Error('Captain not found');

  // Check for an active session already open for this squad
  const existingOpen = await prisma.session.findFirst({
    where: { squadId: captain.squadId, status: { in: ['open', 'balanced'] } },
    include: { matches: true },
  });
  if (existingOpen) {
    const m = existingOpen.matches[0];
    if (m) {
      return { sessionId: existingOpen.id, matchId: m.id };
    }
  }

  const session = await prisma.session.create({
    data: {
      squadId: captain.squadId,
      name: `Session · ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}`,
      date: new Date(),
      status: 'open',
    },
  });

  const match = await prisma.match.create({
    data: {
      homeSquadId: captain.squadId,
      awaySquadId: captain.squadId,
      playersPerSide: 6,
      hasKeeper: false,
      matchFormat: '6v6',
      homeScore: 0,
      awayScore: 0,
      submittedBy: captain.userId,
      status: 'pending',
      matchDate: new Date(),
      sessionId: session.id,
    },
  });

  // Seed PlayerMatchStats rows for every squad member
  const members = await prisma.squadMember.findMany({
    where: { squadId: captain.squadId },
    include: {
      user: {
        include: { playerProfile: true },
      },
    },
  });

  for (const member of members) {
    if (!member.user.playerProfile) continue;
    await prisma.playerMatchStats.create({
      data: {
        matchId: match.id,
        profileId: member.user.playerProfile.id,
        teamSide: null,
        goals: 0,
        assists: 0,
        minutesPlayed: 0,
      },
    });

    // Add to session attendees
    await prisma.sessionAttendee.upsert({
      where: {
        sessionId_profileId: {
          sessionId: session.id,
          profileId: member.user.playerProfile.id,
        },
      },
      update: {},
      create: {
        sessionId: session.id,
        profileId: member.user.playerProfile.id,
      },
    });
  }

  revalidatePath(`/session/live/${token}`);
  return { sessionId: session.id, matchId: match.id };
}

export async function addGoal(
  token: string,
  matchId: string,
  profileId: string,
): Promise<void> {
  const captain = await resolveCaptain(token);
  if (!captain) throw new Error('Captain not found');

  await prisma.playerMatchStats.update({
    where: {
      matchId_profileId: { matchId, profileId },
    },
    data: { goals: { increment: 1 } },
  });

  // Also bump the match home score (we keep all goals on "home" since the
  // kickabout is internal — see seed-kickabout-session.ts for the rationale)
  await prisma.match.update({
    where: { id: matchId },
    data: { homeScore: { increment: 1 } },
  });

  revalidatePath(`/session/live/${token}`);
}

export async function undoLastGoal(
  token: string,
  matchId: string,
  profileId: string,
): Promise<void> {
  const captain = await resolveCaptain(token);
  if (!captain) throw new Error('Captain not found');

  const current = await prisma.playerMatchStats.findUnique({
    where: { matchId_profileId: { matchId, profileId } },
  });
  if (!current || current.goals <= 0) return;

  await prisma.playerMatchStats.update({
    where: { matchId_profileId: { matchId, profileId } },
    data: { goals: { decrement: 1 } },
  });
  await prisma.match.update({
    where: { id: matchId },
    data: { homeScore: { decrement: 1 } },
  });

  revalidatePath(`/session/live/${token}`);
}

export async function endSession(token: string, sessionId: string, matchId: string): Promise<void> {
  const captain = await resolveCaptain(token);
  if (!captain) throw new Error('Captain not found');

  // Sum goals → final score
  const stats = await prisma.playerMatchStats.findMany({
    where: { matchId },
  });
  const totalGoals = stats.reduce((s, st) => s + st.goals, 0);

  await prisma.match.update({
    where: { id: matchId },
    data: {
      homeScore: totalGoals,
      status: 'verified',
    },
  });

  await prisma.session.update({
    where: { id: sessionId },
    data: { status: 'completed' },
  });

  // Bump PlayerProfile.totalGoals + totalMatches for everyone who scored
  for (const stat of stats) {
    if (stat.goals > 0 || stat.minutesPlayed > 0) {
      await prisma.playerProfile.update({
        where: { id: stat.profileId },
        data: {
          totalGoals: { increment: stat.goals },
          totalMatches: { increment: 1 },
        },
      });
    }
  }

  revalidatePath(`/session/live/${token}`);
}
