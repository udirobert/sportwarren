import React from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { getSessionReveal } from '@/server/services/personalization/session-reveal';
import { RosterReveal } from './RosterReveal';

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function SessionRevealPage({ params }: PageProps) {
  const { token } = await params;

  const pointer = await getSessionReveal(token);
  if (!pointer) notFound();

  const [squad, session] = await Promise.all([
    prisma.squad.findUnique({
      where: { id: pointer.squadId },
      select: { name: true, shortName: true },
    }),
    prisma.session.findUnique({
      where: { id: pointer.sessionId },
      select: {
        name: true,
        date: true,
        attendees: {
          select: {
            teamPreference: true,
            profile: {
              select: {
                id: true,
                user: {
                  select: {
                    name: true,
                    position: true,
                    avatarKitColor: true,
                    avatarAccentColor: true,
                    avatarSkinTone: true,
                    avatarHairColor: true,
                    avatarHairStyle: true,
                    avatarNumber: true,
                  },
                },
              },
            },
          },
        },
      },
    }),
  ]);

  if (!squad || !session) notFound();

  const players = session.attendees.map((a) => ({
    profileId: a.profile.id,
    team: a.teamPreference,
    name: a.profile.user.name ?? 'Player',
    position: a.profile.user.position,
    avatar: {
      kit: a.profile.user.avatarKitColor ?? undefined,
      accent: a.profile.user.avatarAccentColor ?? undefined,
      skin: a.profile.user.avatarSkinTone ?? undefined,
      hair: a.profile.user.avatarHairColor ?? undefined,
      hairStyle: a.profile.user.avatarHairStyle ?? 'short',
      number: a.profile.user.avatarNumber ?? '',
    },
  }));

  return (
    <RosterReveal
      revealToken={token}
      squadName={squad.name}
      sessionName={session.name}
      sessionDate={session.date.toISOString()}
      players={players}
    />
  );
}
