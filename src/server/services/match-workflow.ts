import algosdk from 'algosdk';
import type { PrismaClient } from '@prisma/client';
import { isAddress, type Address } from 'viem';
import { chainlinkService } from './blockchain/chainlink';
import { finalizeMatchFeeSettlement } from './blockchain/yellow-recovery';
import {
  yellowService,
  type YellowClientSettlement,
  type YellowVerifiedSettlement,
} from './blockchain/yellow';
import {
  distributeMatchRewards,
  postTreasuryLedgerEntryOnce,
} from './economy/treasury-ledger';
import { createPendingMatchSubmission } from './match-submission';
import { PEER_RATING } from '@/lib/match/constants';
import { getDigitalTwinService } from './ai/digital-twin';

export type MatchWorkflowErrorCode =
  | 'NOT_FOUND'
  | 'BAD_REQUEST'
  | 'FORBIDDEN'
  | 'CONFLICT';

export class MatchWorkflowError extends Error {
  constructor(
    public readonly code: MatchWorkflowErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'MatchWorkflowError';
  }
}

interface MatchVerificationThresholdInput {
  shareSlug?: string | null;
}

type YellowSettlementInput = Pick<YellowClientSettlement, 'sessionId' | 'version' | 'settlementId'>;

interface SubmitMatchResultInput {
  prisma: PrismaClient;
  homeSquadId: string;
  awaySquadId: string;
  homeScore: number;
  awayScore: number;
  submittedBy: string;
  submittedByMembershipId?: string; // Membership context for multi-squad attribution
  matchDate?: Date;
  latitude?: number;
  longitude?: number;
  yellowSettlement?: YellowSettlementInput;
  sessionId?: string;
  isSociallyTrusted?: boolean;
  hasKeeper?: boolean;
}

interface VerifyMatchResultInput {
  prisma: PrismaClient;
  matchId: string;
  verifierId: string;
  verified: boolean;
  homeScore?: number;
  awayScore?: number;
  yellowSettlement?: YellowSettlementInput;
}

type RecoverableMatch = {
  id: string;
  homeSquadId: string;
  awaySquadId: string;
  homeScore: number | null;
  awayScore: number | null;
  status: string;
  yellowFeeSessionId: string | null;
  yellowFeeSettledAt: Date | null;
  updatedAt: Date;
};

export function getRequiredMatchVerifications(
  match: MatchVerificationThresholdInput,
): number {
  return match.shareSlug ? 2 : 3;
}

export async function getMatchParticipantCandidates(
  prisma: PrismaClient,
  homeSquadId: string,
  awaySquadId: string,
) {
  const members = await prisma.squadMember.findMany({
    where: {
      squadId: { in: [homeSquadId, awaySquadId] },
      role: { in: ['captain', 'vice_captain'] },
    },
    include: {
      user: {
        select: { walletAddress: true },
      },
    },
    orderBy: { joinedAt: 'asc' },
  });

  const participants = new Map<string, Address>();
  for (const member of members) {
    const walletAddress = member.user?.walletAddress;
    if (!walletAddress || !isAddress(walletAddress)) {
      continue;
    }

    participants.set(walletAddress.toLowerCase(), walletAddress as Address);
  }

  const platformWallet = process.env.NEXT_PUBLIC_YELLOW_PLATFORM_WALLET;
  if (platformWallet && isAddress(platformWallet)) {
    participants.set(platformWallet.toLowerCase(), platformWallet as Address);
  }

  return Array.from(participants.values());
}

/**
 * Checks if two squads have a recurring relationship for "Social Trust" verification.
 * Threshold: 3+ completed matches between these specific squads.
 */
export async function checkSocialTrust(
  prisma: PrismaClient,
  squadA: string,
  squadB: string
): Promise<boolean> {
  const recurringMatchCount = await prisma.match.count({
    where: {
      OR: [
        { homeSquadId: squadA, awaySquadId: squadB },
        { homeSquadId: squadB, awaySquadId: squadA },
      ],
      status: { in: ['verified', 'finalized'] },
    },
  });

  return recurringMatchCount >= 3;
}

export async function settleMatchFee(
  prisma: PrismaClient,
  match: RecoverableMatch,
  status: 'verified' | 'disputed',
  settlement?: Pick<YellowVerifiedSettlement, 'sessionId' | 'settlementId' | 'version'>,
) {
  if (!match.yellowFeeSessionId || match.yellowFeeSettledAt || !settlement) {
    return { settled: false };
  }

  await finalizeMatchFeeSettlement(prisma, match, status, settlement);
  return { settled: true };
}

async function verifyYellowMatchFeeLock(
  prisma: PrismaClient,
  matchId: string,
  homeSquadId: string,
  awaySquadId: string,
  settlement: YellowSettlementInput,
) {
  const matchFeeAmount = yellowService.getMatchFeeAmount();
  if (!yellowService.isEnabled() || matchFeeAmount <= 0) {
    return null;
  }

  const [homeTreasury, awayTreasury] = await Promise.all([
    prisma.squadTreasury.findUnique({ where: { squadId: homeSquadId } }),
    prisma.squadTreasury.findUnique({ where: { squadId: awaySquadId } }),
  ]);

  const homeHasFunds = (homeTreasury?.balance ?? 0) >= matchFeeAmount;
  const awayHasFunds = (awayTreasury?.balance ?? 0) >= matchFeeAmount;
  if (!homeHasFunds || !awayHasFunds) {
    return null;
  }

  const participants = await getMatchParticipantCandidates(
    prisma,
    homeSquadId,
    awaySquadId,
  );
  const feeSession = await yellowService.verifyClientSettlement({
    settlement,
    participantCandidates: participants,
    applicationPrefixes: ['sportwarren-match-fee-'],
    expectedParticipants: participants,
    expectedSessionData: {
      homeSquadId,
      awaySquadId,
    },
  });

  if (!feeSession.sessionId) {
    return null;
  }

  await prisma.match.update({
    where: { id: matchId },
    data: { yellowFeeSessionId: feeSession.sessionId },
  });

  await postTreasuryLedgerEntryOnce({
    prisma,
    squadId: homeSquadId,
    amountDelta: -matchFeeAmount,
    type: 'expense',
    category: 'match_fee',
    description: `Match fee locked for match ${matchId}`,
    txHash: feeSession.settlementId,
  });

  await postTreasuryLedgerEntryOnce({
    prisma,
    squadId: awaySquadId,
    amountDelta: -matchFeeAmount,
    type: 'expense',
    category: 'match_fee',
    description: `Match fee locked for match ${matchId}`,
    txHash: feeSession.settlementId,
  });

  return feeSession;
}

async function postVerifiedMatchToAlgorand(matchId: string) {
  try {
    const { algodClient, deployerAccount } = await import(
      '@/server/services/blockchain/algorand'
    );
    const appId = parseInt(
      process.env.ALGORAND_MATCH_VERIFICATION_APP_ID || '0',
      10,
    );

    if (appId <= 0 || !deployerAccount) {
      return null;
    }

    const params = await algodClient.getTransactionParams().do();
    const encoder = new TextEncoder();
    const appArgs = [
      encoder.encode('verify_match'),
      algosdk.encodeUint64(parseInt(matchId.replace(/\D/g, '').slice(0, 10), 10) || 1),
      algosdk.encodeUint64(1),
      algosdk.encodeUint64(100),
    ];

    const txn = algosdk.makeApplicationNoOpTxnFromObject({
      sender: deployerAccount.addr.toString(),
      suggestedParams: params,
      appIndex: appId,
      appArgs,
    });

    const signedTxn = txn.signTxn(deployerAccount.sk);
    const { txid } = await algodClient.sendRawTransaction(signedTxn).do();
    return txid;
  } catch (error) {
    console.error('Failed to post verification to Algorand:', error);
    return null;
  }
}

export async function submitMatchResult({
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
  yellowSettlement,
  sessionId,
  isSociallyTrusted = false,
  hasKeeper,
}: SubmitMatchResultInput) {
  const [homeSquad, awaySquad] = await Promise.all([
    prisma.squad.findUnique({ where: { id: homeSquadId } }),
    prisma.squad.findUnique({ where: { id: awaySquadId } }),
  ]);

  if (!homeSquad) {
    throw new MatchWorkflowError('NOT_FOUND', 'Home squad not found');
  }

  if (!awaySquad) {
    throw new MatchWorkflowError('NOT_FOUND', 'Away squad not found');
  }

  if (homeSquadId === awaySquadId) {
    throw new MatchWorkflowError(
      'BAD_REQUEST',
      'Home and away squads must be different',
    );
  }

  let weatherVerified = false;
  let locationVerified = false;
  let verificationDetails: unknown = null;
  let agentInsights: unknown = null;
  let socialTrust = isSociallyTrusted;

  // Auto-verify if they are recurring friendly opponents
  if (!socialTrust) {
    socialTrust = await checkSocialTrust(prisma, homeSquadId, awaySquadId);
  }

  if (latitude !== undefined && longitude !== undefined) {
    try {
      const verificationResult = await chainlinkService.verifyMatch({
        latitude,
        longitude,
        timestamp: Math.floor(matchDate.getTime() / 1000),
        homeTeam: homeSquad.name,
        awayTeam: awaySquad.name,
      });

      weatherVerified = verificationResult.weatherVerified;
      locationVerified = verificationResult.locationVerified;
      verificationDetails = verificationResult.details;

      try {
        const { agenticService } = await import('@/server/services/ai/agentic');
        agentInsights = await agenticService.generateMatchReport(
          { homeSquad, awaySquad, homeScore, awayScore },
          verificationResult.details,
        );
      } catch (aiError) {
        console.warn('Agentic insight generation failed:', aiError);
      }
    } catch (error) {
      console.error('Chainlink verification failed during match submission:', error);
    }
  }

    const match = await createPendingMatchSubmission({
      prisma,
      homeSquadId,
      awaySquadId,
      homeScore,
      awayScore,
      matchDate,
      submittedBy,
      submittedByMembershipId,
      latitude,
      longitude,
      weatherVerified,
      locationVerified,
      verificationDetails,
      agentInsights,
      sessionId,
      isSoftVerified: socialTrust,
      hasKeeper,
    });

    if (socialTrust) {
      try {
        await postVerifiedMatchToAlgorand(match.id);
        const seededStats = await prisma.playerMatchStats.findMany({
          where: { matchId: match.id },
        });

        await distributeMatchRewards({
          prisma,
          squadId: homeSquadId,
          matchId: match.id,
          isWinner: homeScore > awayScore,
          isDraw: homeScore === awayScore,
          playerStats: seededStats,
          hasKeeper: match.hasKeeper,
        });

        // Sync Digital Twin progress
        const dtService = getDigitalTwinService(prisma);
        await dtService.syncMatchResult(
          homeSquadId,
          homeScore > awayScore ? 'win' : homeScore === awayScore ? 'draw' : 'loss',
          homeScore,
          awayScore
        );
        
        await dtService.updateSquadEnergy(homeSquadId, match.id);
        await dtService.updateSquadEnergy(awaySquadId, match.id);

        await distributeMatchRewards({
          prisma,
          squadId: awaySquadId,
          matchId: match.id,
          isWinner: awayScore > homeScore,
          isDraw: homeScore === awayScore,
          playerStats: seededStats,
          hasKeeper: match.hasKeeper,
        });

        await dtService.syncMatchResult(
          awaySquadId,
          awayScore > homeScore ? 'win' : homeScore === awayScore ? 'draw' : 'loss',
          awayScore,
          homeScore
        );
      } catch (err) {
        console.warn('Post-soft-verification automation failed:', err);
      }
    }

  if (yellowSettlement) {
    try {
      await verifyYellowMatchFeeLock(
        prisma,
        match.id,
        homeSquadId,
        awaySquadId,
        yellowSettlement,
      );
    } catch (yellowError) {
      console.error('Yellow match fee session setup failed:', yellowError);
    }
  }

  return {
    ...match,
    creResult: verificationDetails,
    requiredVerifications: getRequiredMatchVerifications(match),
  };
}

/**
 * Ensures PlayerMatchStats exist for all squad members for a match.
 * Default to 90 mins, 0 goals, 0 assists (participation).
 */
export async function ensureMatchParticipationStats(
  prisma: PrismaClient,
  matchId: string,
) {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      playerStats: { select: { profileId: true } },
    },
  });

  if (!match) return;

  // We only seed if no stats exist yet
  // This prevents overwriting manual CRE/Capture entries if they did exist
  if (match.playerStats.length > 0) return;

  const members = await prisma.squadMember.findMany({
    where: {
      squadId: { in: [match.homeSquadId, match.awaySquadId] },
    },
    include: {
      user: {
        include: { playerProfile: { select: { id: true } } },
      },
    },
  });

  const profilesToSeed = members
    .filter((m) => m.user?.playerProfile?.id)
    .map((m) => m.user.playerProfile!.id);

  if (profilesToSeed.length === 0) return;

  // Bulk create participation stats
  await prisma.playerMatchStats.createMany({
    data: profilesToSeed.map((profileId) => ({
      matchId,
      profileId,
      minutesPlayed: 90,
      goals: 0,
      assists: 0,
      cleanSheet: false,
    })),
    skipDuplicates: true,
  });
}

export async function verifyMatchResult({
  prisma,
  matchId,
  verifierId,
  verified,
  homeScore,
  awayScore,
  yellowSettlement,
}: VerifyMatchResultInput) {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { verifications: true },
  });

  if (!match) {
    throw new MatchWorkflowError('NOT_FOUND', 'Match not found');
  }

  if (match.submittedBy === verifierId) {
    throw new MatchWorkflowError(
      'FORBIDDEN',
      'Match submitters cannot verify their own result',
    );
  }

  const existingVerification = match.verifications.find(
    (verification) => verification.verifierId === verifierId,
  );
  if (existingVerification) {
    throw new MatchWorkflowError('CONFLICT', 'Already verified this match');
  }

  if (match.status === 'finalized') {
    throw new MatchWorkflowError('CONFLICT', 'Match is already finalized');
  }

  await prisma.matchVerification.create({
    data: {
      matchId,
      verifierId,
      verified,
      homeScore,
      awayScore,
      trustTier: 'gold',
    },
  });

  const updatedMatch = await prisma.match.findUnique({
    where: { id: matchId },
    include: { verifications: true },
  });

  if (!updatedMatch) {
    throw new MatchWorkflowError('NOT_FOUND', 'Match not found');
  }

  const verifiedCount = updatedMatch.verifications.filter((item) => item.verified).length;
  const disputedCount = updatedMatch.verifications.filter((item) => !item.verified).length;
  const requiredVerifications = getRequiredMatchVerifications(updatedMatch);

  let newStatus = updatedMatch.status;
  if (verifiedCount >= requiredVerifications) {
    newStatus = 'verified';
  } else if (disputedCount >= 2) {
    newStatus = 'disputed';
  }

  let txId = updatedMatch.txId ?? null;
  let yellowSettled = Boolean(updatedMatch.yellowFeeSettledAt);

  if (newStatus !== updatedMatch.status) {
    const participants = await getMatchParticipantCandidates(
      prisma,
      updatedMatch.homeSquadId,
      updatedMatch.awaySquadId,
    );

    const verifiedSettlement =
      yellowSettlement && updatedMatch.yellowFeeSessionId
        ? await yellowService.verifyClientSettlement({
            settlement: yellowSettlement,
            participantCandidates: participants,
            expectedSessionId: updatedMatch.yellowFeeSessionId,
            applicationPrefixes: ['sportwarren-match-fee-'],
            expectedParticipants: participants,
            expectedSessionData: {
              matchId,
              status: newStatus,
            },
          })
        : null;

    if (newStatus === 'verified') {
      txId = await postVerifiedMatchToAlgorand(matchId);
    }

    const resultMatch = await prisma.match.update({
      where: { id: matchId },
      data: {
        status: newStatus,
        txId: txId || undefined,
        peerRatingsCloseAt: newStatus === 'verified' ? new Date(Date.now() + PEER_RATING.WINDOW_HOURS * 60 * 60 * 1000) : undefined,
      },
      include: {
        homeSquad: { include: { groups: { where: { platform: 'telegram' } } } },
        awaySquad: { include: { groups: { where: { platform: 'telegram' } } } },
      }
    });

    if (newStatus === 'verified') {
      // 1. Digital Twin Sync
      try {
        const dtService = getDigitalTwinService(prisma);
        
        const homeWinner = resultMatch.homeScore! > resultMatch.awayScore! ? 'win' : 
                           resultMatch.homeScore! < resultMatch.awayScore! ? 'loss' : 'draw';
        const awayWinner = homeWinner === 'win' ? 'loss' : homeWinner === 'loss' ? 'win' : 'draw';

        await dtService.syncMatchResult(resultMatch.homeSquadId, homeWinner, resultMatch.homeScore!, resultMatch.awayScore!);
        await dtService.syncMatchResult(resultMatch.awaySquadId, awayWinner, resultMatch.awayScore!, resultMatch.homeScore!);
        
        await dtService.updateSquadEnergy(resultMatch.homeSquadId, matchId);
        await dtService.updateSquadEnergy(resultMatch.awaySquadId, matchId);
      } catch (e) {
        console.error('Failed to sync digital twin after verification:', e);
      }
    }

    if (newStatus === 'verified' || newStatus === 'disputed') {
      try {
        if (verifiedSettlement) {
          const settlementResult = await settleMatchFee(
            prisma,
            resultMatch,
            newStatus,
            verifiedSettlement,
          );
          yellowSettled = settlementResult.settled || yellowSettled;
        } else if (
          resultMatch.yellowFeeSessionId
          && !resultMatch.yellowFeeSettledAt
        ) {
          console.warn(
            'Yellow fee session remains unsettled until the client submits a signed settlement.',
          );
        }

        if (newStatus === 'verified') {
          const homeFinalScore = homeScore ?? resultMatch.homeScore ?? 0;
          const awayFinalScore = awayScore ?? resultMatch.awayScore ?? 0;
          const isDraw = homeFinalScore === awayFinalScore;

          // Seeding participation stats before rewards distribution
          await ensureMatchParticipationStats(prisma, matchId);
          const seededStats = await prisma.playerMatchStats.findMany({
            where: { matchId },
          });

          await distributeMatchRewards({
            prisma,
            squadId: resultMatch.homeSquadId,
            matchId: resultMatch.id,
            isWinner: homeFinalScore > awayFinalScore,
            isDraw,
            playerStats: seededStats, // Using seeded participation stats
          });

          // Sync Digital Twin progress
          const dtService = getDigitalTwinService(prisma);
          await dtService.syncMatchResult(
            resultMatch.homeSquadId,
            homeFinalScore > awayFinalScore ? 'win' : isDraw ? 'draw' : 'loss',
            homeFinalScore,
            awayFinalScore
          );

          await distributeMatchRewards({
            prisma,
            squadId: resultMatch.awaySquadId,
            matchId: resultMatch.id,
            isWinner: awayFinalScore > homeFinalScore,
            isDraw,
            playerStats: seededStats, // Using seeded participation stats
          });

          await dtService.syncMatchResult(
            resultMatch.awaySquadId,
            awayFinalScore > homeFinalScore ? 'win' : isDraw ? 'draw' : 'loss',
            awayFinalScore,
            homeFinalScore
          );
        }
      } catch (error) {
        console.error(
          'Failed to settle Yellow match fee or distribute rewards:',
          error,
        );
      }
    }
  }

  return {
    success: true,
    newStatus,
    verificationCount: updatedMatch.verifications.length,
    verifiedCount,
    disputedCount,
    requiredVerifications,
    txId,
    requiresYellowSettlement:
      (newStatus === 'verified' || newStatus === 'disputed')
      && Boolean(updatedMatch.yellowFeeSessionId)
      && !yellowSettled,
  };
}
