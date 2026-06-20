/**
 * Spectator scoreboard — server fetches initial state, hands off to
 * <WatchClient /> which polls /api/session/watch every 2s.
 *
 * URL is the squad's shortName so the captain can drop a single short
 * link into the WA group at the start of the night.
 */

import React from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { WatchClient } from './WatchClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: Promise<{ squadShortName: string }>;
}

export default async function WatchPage({ params }: PageProps) {
  const { squadShortName } = await params;

  const squad = await prisma.squad.findFirst({
    where: {
      OR: [
        { shortName: squadShortName.toUpperCase() },
        { shortName: squadShortName },
      ],
    },
  });

  if (!squad) notFound();

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

  const initial = {
    squad: { name: squad.name, shortName: squad.shortName },
    session: session
      ? {
          id: session.id,
          date: session.date.toISOString(),
          status: session.status,
          updatedAt: session.updatedAt.toISOString(),
          isLive: session.status === 'open' || session.status === 'balanced',
          totalGoals: session.matches[0]?.playerStats.reduce((s, st) => s + st.goals, 0) ?? 0,
          leaderboard:
            session.matches[0]?.playerStats.map((s) => ({
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
            })) ?? [],
        }
      : null,
  };

  return <WatchClient squadShortName={squadShortName} initial={initial} />;
}
