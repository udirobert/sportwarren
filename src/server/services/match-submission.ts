import { randomBytes } from 'crypto';
import type { Prisma, PrismaClient } from '@prisma/client';

type MatchStore = PrismaClient | Prisma.TransactionClient;

export interface PendingMatchSubmissionInput {
  prisma: MatchStore;
  homeSquadId: string;
  awaySquadId: string;
  homeScore: number;
  awayScore: number;
  submittedBy: string;
  submittedByMembershipId?: string; // Membership context for multi-squad attribution
  matchDate?: Date;
  latitude?: number;
  longitude?: number;
  weatherVerified?: boolean;
  locationVerified?: boolean;
  verificationDetails?: unknown;
  agentInsights?: unknown;
  sessionId?: string;
}

export async function createPendingMatchSubmission({
  prisma,
  homeSquadId,
  awaySquadId,
  homeScore,
  awayScore,
  submittedBy,
  submittedByMembershipId,
  matchDate = new Date(),
  latitude,
  longitude,
  weatherVerified = false,
  locationVerified = false,
  verificationDetails = null,
  agentInsights = null,
  sessionId,
}: PendingMatchSubmissionInput) {
  const shareSlug = randomBytes(4).toString('base64url');

  const match = await prisma.match.create({
    data: {
      homeSquadId,
      awaySquadId,
      homeScore,
      awayScore,
      matchDate,
      submittedBy,
      submittedByMembershipId,
      status: 'pending',
      shareSlug,
      latitude,
      longitude,
      weatherVerified,
      locationVerified,
      verificationDetails,
      agentInsights,
      sessionId,
    } as any,
    include: {
      homeSquad: true,
      awaySquad: true,
    },
  });

  await prisma.matchVerification.create({
    data: {
      matchId: match.id,
      verifierId: submittedBy,
      verified: true,
      homeScore,
      awayScore,
      trustTier: 'gold',
    },
  });

  return {
    ...match,
    shareSlug,
    creResult: verificationDetails,
  };
}
