import type { PrismaClient } from '@prisma/client';
import { buildAvatarPresentationFromSummary } from '@/lib/avatar/adapters';
import type { AvatarPresentation } from '@/lib/avatar/types';
import { resolveAvatarImageUrl } from './avatar-source';

export async function getAvatarPresentation(
  prisma: PrismaClient,
  userId: string,
  squadId?: string,
): Promise<AvatarPresentation | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      playerProfile: true,
      platformIdentities: {
        where: { platform: 'telegram' },
        select: {
          platform: true,
          photoUrl: true,
        },
      },
      squads: {
        include: {
          squad: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    return null;
  }

  const profile = user.playerProfile;
  const membership = squadId
    ? user.squads.find((entry) => entry.squadId === squadId) ?? user.squads[0]
    : user.squads[0];

  const totalMatches = profile?.totalMatches ?? 0;
  const totalGoals = profile?.totalGoals ?? 0;
  const totalAssists = profile?.totalAssists ?? 0;
  const reputationScore = profile?.reputationScore ?? 100;
  const level = profile?.level ?? 1;
  const totalXP = profile?.totalXP ?? 0;
  const isCaptain = membership?.role === 'captain';
  return {
    ...buildAvatarPresentationFromSummary({
      id: user.id,
      name: user.name || 'Player',
      avatar: resolveAvatarImageUrl(user),
      level,
      totalXP,
      totalMatches,
      totalGoals,
      totalAssists,
      role: membership?.role,
      position: user.position,
      reputationScore,
    }),
    squadAccent: membership
      ? {
          squadId: membership.squad.id,
          squadName: membership.squad.name,
          primaryColor: isCaptain ? '#f59e0b' : '#10b981',
          secondaryColor: '#0f172a',
          crestUrl: null,
        }
      : undefined,
  };
}
