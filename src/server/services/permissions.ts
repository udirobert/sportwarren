export type SquadRole = 'captain' | 'vice_captain' | 'player';

export async function getSquadMembership(
  prisma: any,
  squadId: string,
  userId: string
) {
  return prisma.squadMember.findUnique({
    where: {
      squadId_userId: {
        squadId,
        userId,
      },
    },
  });
}

export function isSquadLeader(role?: string | null): boolean {
  return role === 'captain' || role === 'vice_captain';
}
