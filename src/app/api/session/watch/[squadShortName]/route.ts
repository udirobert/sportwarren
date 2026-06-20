/**
 * Spectator scoreboard data endpoint — polled every 2s by the watch
 * page client component. Returns just the data the page needs.
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ squadShortName: string }> },
) {
  const { squadShortName } = await context.params;

  const squad = await prisma.squad.findFirst({
    where: {
      OR: [
        { shortName: squadShortName.toUpperCase() },
        { shortName: squadShortName },
      ],
    },
  });

  if (!squad) {
    return Response.json({ error: 'not-found' }, { status: 404 });
  }

  const session = await prisma.session.findFirst({
    where: { squadId: squad.id },
    orderBy: { createdAt: 'desc' },
    include: {
      matches: {
        include: {
          playerStats: {
            include: {
              profile: { include: { user: true } },
            },
            orderBy: { goals: 'desc' },
          },
        },
      },
    },
  });

  if (!session) {
    return Response.json({
      squad: { name: squad.name, shortName: squad.shortName },
      session: null,
    });
  }

  const match = session.matches[0];
  const stats = match?.playerStats ?? [];
  const totalGoals = stats.reduce((s, st) => s + st.goals, 0);
  const isLive = session.status === 'open' || session.status === 'balanced';

  return Response.json({
    squad: { name: squad.name, shortName: squad.shortName },
    session: {
      id: session.id,
      date: session.date.toISOString(),
      status: session.status,
      updatedAt: session.updatedAt.toISOString(),
      isLive,
      totalGoals,
      leaderboard: stats.map((s) => ({
        profileId: s.profileId,
        name: s.profile.user.name,
        goals: s.goals,
        avatar: {
          kit: s.profile.user.avatarKitColor,
          accent: s.profile.user.avatarAccentColor,
          skin: s.profile.user.avatarSkinTone,
          hair: s.profile.user.avatarHairColor,
          hairStyle: s.profile.user.avatarHairStyle ?? 'short',
          number: s.profile.user.avatarNumber ?? '',
        },
      })),
    },
  });
}
