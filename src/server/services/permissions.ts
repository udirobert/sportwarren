export type SquadRole = 'captain' | 'vice_captain' | 'player';

export async function getSquadMembership(
  prisma: any,
  squadId: string,
  userId: string,
  asOfDate?: Date
) {
  const now = asOfDate ?? new Date();
  return prisma.squadMember.findFirst({
    where: {
      squadId,
      userId,
      status: 'active',
      // Temporal validity check
      OR: [
        {
          validFrom: { lte: now }, // Started on or before
          OR: [
            { validTo: null },      // Never ended
            { validTo: { gte: now } } // Ended in the future
          ]
        },
        {
          validFrom: null, // No start date = always valid
          validTo: null
        },
        {
          validFrom: null,
          validTo: { gte: now }
        }
      ]
    },
  });
}

/**
 * Get all active memberships for a user across all squads
 */
export async function getUserActiveMemberships(prisma: any, userId: string) {
  return prisma.squadMember.findMany({
    where: {
      userId,
      status: 'active',
    },
    include: {
      squad: true,
    },
  });
}

/**
 * Get the membership that was active for a user at a specific date
 * Useful for determining which squad a match belongs to historically
 */
export async function getMembershipAtDate(
  prisma: any,
  userId: string,
  date: Date
) {
  return prisma.squadMember.findFirst({
    where: {
      userId,
      status: 'active',
      // Membership was valid on this date
      OR: [
        {
          validFrom: { lte: date },
          validTo: null, // Never ended
        },
        {
          validFrom: { lte: date },
          validTo: { gte: date }, // Ended after this date
        },
        {
          validFrom: null, // No start date, treat as always valid
          validTo: null,
        },
        {
          validFrom: null,
          validTo: { gte: date },
        },
      ],
    },
    include: {
      squad: true,
    },
  });
}

export function isSquadLeader(role?: string | null): boolean {
  return role === 'captain' || role === 'vice_captain';
}
