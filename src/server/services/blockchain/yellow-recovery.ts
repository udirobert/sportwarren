import { RPCChannelStatus } from '@erc7824/nitrolite';
import type { Match, PrismaClient, TransferOffer } from '@prisma/client';
import { isAddress, type Address } from 'viem';
import { getMatchFeeDistribution } from '@/lib/yellow/match-fees';
import { postTreasuryLedgerEntryOnce } from '../economy/treasury-ledger';
import {
  yellowService,
  type YellowVerifiedSettlement,
} from './yellow';

const DEFAULT_STALE_AFTER_MS = 15 * 60 * 1000;

type RecoverableMatch = Pick<
  Match,
  | 'id'
  | 'homeSquadId'
  | 'awaySquadId'
  | 'homeScore'
  | 'awayScore'
  | 'status'
  | 'yellowFeeSessionId'
  | 'yellowFeeSettledAt'
  | 'updatedAt'
>;

type RecoverableTransferOffer = Pick<
  TransferOffer,
  | 'id'
  | 'fromSquadId'
  | 'toSquadId'
  | 'playerId'
  | 'amount'
  | 'status'
  | 'offerType'
  | 'yellowSessionId'
  | 'expiresAt'
  | 'updatedAt'
>;

export interface YellowRecoveryReportItem {
  id: string;
  sessionId: string;
  version?: number;
  status?: string;
  reason: string;
}

export interface YellowRecoveryReport {
  scannedAt: string;
  railEnabled: boolean;
  fixedMatches: YellowRecoveryReportItem[];
  fixedTransfers: YellowRecoveryReportItem[];
  stuckMatches: YellowRecoveryReportItem[];
  stuckTransfers: YellowRecoveryReportItem[];
  errors: YellowRecoveryReportItem[];
}

function isMissingSchemaObjectError(error: unknown, modelName?: string) {
  if (!error || typeof error !== 'object' || !('code' in error)) {
    return false;
  }

  const code = (error as { code?: string }).code;
  if (code !== 'P2021' && code !== 'P2022') {
    return false;
  }

  if (!modelName || !('meta' in error)) {
    return true;
  }

  const meta = (error as { meta?: { modelName?: string } }).meta;
  return !meta?.modelName || meta.modelName === modelName;
}

async function getSquadLeaderWallets(prisma: PrismaClient, squadId: string) {
  const members = await prisma.squadMember.findMany({
    where: {
      squadId,
      role: { in: ['captain', 'vice_captain'] },
    },
    include: {
      user: {
        select: { walletAddress: true },
      },
    },
    orderBy: { joinedAt: 'asc' },
    take: 2,
  });

  const unique = new Map<string, Address>();
  for (const member of members) {
    const walletAddress = member.user?.walletAddress;
    if (!walletAddress || !isAddress(walletAddress)) {
      continue;
    }

    unique.set(walletAddress.toLowerCase(), walletAddress as Address);
  }

  return Array.from(unique.values());
}

async function getMatchParticipantCandidates(prisma: PrismaClient, match: RecoverableMatch) {
  const [home, away] = await Promise.all([
    getSquadLeaderWallets(prisma, match.homeSquadId),
    getSquadLeaderWallets(prisma, match.awaySquadId),
  ]);

  const platform = process.env.NEXT_PUBLIC_YELLOW_PLATFORM_WALLET;
  const participants = [...home, ...away];

  if (platform && isAddress(platform)) {
    participants.push(platform as Address);
  }

  return participants;
}

async function getTransferParticipantCandidates(prisma: PrismaClient, offer: RecoverableTransferOffer) {
  const [from, to] = await Promise.all([
    getSquadLeaderWallets(prisma, offer.fromSquadId),
    getSquadLeaderWallets(prisma, offer.toSquadId),
  ]);

  return [...from, ...to];
}

async function movePlayerToSquad(prisma: PrismaClient, offer: RecoverableTransferOffer) {
  const currentMembership = await prisma.squadMember.findUnique({
    where: {
      squadId_userId: {
        squadId: offer.toSquadId,
        userId: offer.playerId,
      },
    },
  });

  const destinationMembership = await prisma.squadMember.findUnique({
    where: {
      squadId_userId: {
        squadId: offer.fromSquadId,
        userId: offer.playerId,
      },
    },
  });

  await prisma.$transaction(async (tx) => {
    if (currentMembership) {
      await tx.squadMember.delete({
        where: {
          squadId_userId: {
            squadId: offer.toSquadId,
            userId: offer.playerId,
          },
        },
      });
    }

    if (!destinationMembership) {
      await tx.squadMember.create({
        data: {
          squadId: offer.fromSquadId,
          userId: offer.playerId,
          role: 'player',
        },
      });
    }
  });
}

export async function finalizeMatchFeeSettlement(
  prisma: PrismaClient,
  match: RecoverableMatch,
  status: 'verified' | 'disputed',
  settlement: Pick<YellowVerifiedSettlement, 'sessionId' | 'settlementId' | 'version'>,
) {
  if (!match.yellowFeeSessionId || match.yellowFeeSettledAt) {
    return { alreadySettled: true };
  }

  const distribution = getMatchFeeDistribution(match, status, yellowService.getMatchFeeAmount());

  if (distribution.homeAmount > 0) {
    await postTreasuryLedgerEntryOnce({
      prisma,
      squadId: match.homeSquadId,
      amountDelta: distribution.homeAmount,
      type: 'income',
      category: 'match_fee',
      description: `Match fee payout for match ${match.id}`,
      txHash: settlement.settlementId,
    });
  }

  if (distribution.awayAmount > 0) {
    await postTreasuryLedgerEntryOnce({
      prisma,
      squadId: match.awaySquadId,
      amountDelta: distribution.awayAmount,
      type: 'income',
      category: 'match_fee',
      description: `Match fee payout for match ${match.id}`,
      txHash: settlement.settlementId,
    });
  }

  await prisma.match.update({
    where: { id: match.id },
    data: {
      yellowFeeSettledAt: new Date(),
    },
  });

  return { alreadySettled: false };
}

export async function finalizeTransferOfferOutcome(
  prisma: PrismaClient,
  offer: RecoverableTransferOffer,
  outcome: 'accepted' | 'rejected' | 'cancelled',
  settlement: Pick<YellowVerifiedSettlement, 'settlementId' | 'version' | 'sessionId'>,
) {
  if (offer.status !== 'pending') {
    return { alreadyApplied: true };
  }

  await prisma.transferOffer.update({
    where: { id: offer.id },
    data: { status: outcome },
  });

  if (outcome === 'accepted') {
    await postTreasuryLedgerEntryOnce({
      prisma,
      squadId: offer.toSquadId,
      amountDelta: offer.amount,
      type: 'income',
      category: 'transfer_in',
      description: `Transfer settled for player ${offer.playerId}`,
      txHash: settlement.settlementId,
    });
    await movePlayerToSquad(prisma, offer);
    return { alreadyApplied: false };
  }

  await postTreasuryLedgerEntryOnce({
    prisma,
    squadId: offer.fromSquadId,
    amountDelta: offer.amount,
    type: 'income',
    category: 'transfer_in',
    description:
      outcome === 'cancelled'
        ? `Escrow refunded after cancellation for player ${offer.playerId}`
        : `Escrow refunded for player ${offer.playerId}`,
    txHash: settlement.settlementId,
  });

  return { alreadyApplied: false };
}

async function findRecoverableMatches(prisma: PrismaClient) {
  try {
    return await prisma.match.findMany({
      where: {
        yellowFeeSessionId: { not: null },
        yellowFeeSettledAt: null,
        status: { in: ['verified', 'disputed'] },
      },
      select: {
        id: true,
        homeSquadId: true,
        awaySquadId: true,
        homeScore: true,
        awayScore: true,
        status: true,
        yellowFeeSessionId: true,
        yellowFeeSettledAt: true,
        updatedAt: true,
      },
    });
  } catch (error) {
    if (isMissingSchemaObjectError(error, 'Match')) {
      console.warn('Yellow recovery: match recovery schema is missing; skipping match recovery.');
      return [];
    }

    throw error;
  }
}

async function findRecoverableTransferOffers(prisma: PrismaClient) {
  try {
    return await prisma.transferOffer.findMany({
      where: {
        yellowSessionId: { not: null },
        status: 'pending',
      },
      select: {
        id: true,
        fromSquadId: true,
        toSquadId: true,
        playerId: true,
        amount: true,
        status: true,
        offerType: true,
        yellowSessionId: true,
        expiresAt: true,
        updatedAt: true,
      },
    });
  } catch (error) {
    if (isMissingSchemaObjectError(error, 'TransferOffer')) {
      console.warn('Yellow recovery: transfer recovery schema is missing; skipping transfer recovery.');
      return [];
    }

    throw error;
  }
}

export async function runYellowRecovery(
  prisma: PrismaClient,
  options?: { staleAfterMs?: number },
): Promise<YellowRecoveryReport> {
  const status = yellowService.getRailStatus();
  const staleAfterMs = options?.staleAfterMs ?? DEFAULT_STALE_AFTER_MS;
  const report: YellowRecoveryReport = {
    scannedAt: new Date().toISOString(),
    railEnabled: status.enabled,
    fixedMatches: [],
    fixedTransfers: [],
    stuckMatches: [],
    stuckTransfers: [],
    errors: [],
  };

  if (!status.enabled) {
    return report;
  }

  const now = Date.now();

  const [matches, offers] = await Promise.all([
    findRecoverableMatches(prisma),
    findRecoverableTransferOffers(prisma),
  ]);

  for (const match of matches) {
    try {
      const participants = await getMatchParticipantCandidates(prisma, match);
      const sessionSearch = await yellowService.findSessionById(
        match.yellowFeeSessionId!,
        participants,
      );

      if (!sessionSearch) {
        report.stuckMatches.push({
          id: match.id,
          sessionId: match.yellowFeeSessionId!,
          reason: 'Session could not be found on ClearNode for the match participants.',
        });
        continue;
      }

      if (sessionSearch.session.status !== RPCChannelStatus.Closed) {
        if (now - match.updatedAt.getTime() >= staleAfterMs) {
          report.stuckMatches.push({
            id: match.id,
            sessionId: match.yellowFeeSessionId!,
            version: sessionSearch.session.version,
            status: sessionSearch.session.status,
            reason: 'Match fee session is still open past the recovery threshold.',
          });
        }
        continue;
      }

      const settlement = await yellowService.verifyClientSettlement({
        settlement: {
          sessionId: match.yellowFeeSessionId!,
          version: sessionSearch.session.version,
        },
        participantCandidates: participants,
        expectedSessionId: match.yellowFeeSessionId!,
        applicationPrefixes: ['sportwarren-match-fee-'],
        expectedSessionData: { matchId: match.id },
      });

      await finalizeMatchFeeSettlement(
        prisma,
        match,
        match.status as 'verified' | 'disputed',
        settlement,
      );

      report.fixedMatches.push({
        id: match.id,
        sessionId: settlement.sessionId,
        version: settlement.version,
        status: sessionSearch.session.status,
        reason: 'Recovered closed Yellow match fee session and finalized treasury payouts.',
      });
    } catch (error) {
      report.errors.push({
        id: match.id,
        sessionId: match.yellowFeeSessionId || 'unknown',
        reason: error instanceof Error ? error.message : 'Unknown Yellow match recovery error',
      });
    }
  }

  for (const offer of offers) {
    try {
      const participants = await getTransferParticipantCandidates(prisma, offer);
      const sessionSearch = await yellowService.findSessionById(
        offer.yellowSessionId!,
        participants,
      );

      if (!sessionSearch) {
        report.stuckTransfers.push({
          id: offer.id,
          sessionId: offer.yellowSessionId!,
          reason: 'Session could not be found on ClearNode for the transfer participants.',
        });
        continue;
      }

      if (sessionSearch.session.status !== RPCChannelStatus.Closed) {
        const isExpired = offer.expiresAt ? offer.expiresAt.getTime() < now : false;
        if (isExpired || now - offer.updatedAt.getTime() >= staleAfterMs) {
          report.stuckTransfers.push({
            id: offer.id,
            sessionId: offer.yellowSessionId!,
            version: sessionSearch.session.version,
            status: sessionSearch.session.status,
            reason: isExpired
              ? 'Transfer session is still open after offer expiry.'
              : 'Transfer session is still open past the recovery threshold.',
          });
        }
        continue;
      }

      const recipient = sessionSearch.sessionData?.recipient;
      if (recipient !== 'buyer' && recipient !== 'seller') {
        report.errors.push({
          id: offer.id,
          sessionId: offer.yellowSessionId!,
          version: sessionSearch.session.version,
          reason: 'Closed transfer session is missing a recoverable recipient in session data.',
        });
        continue;
      }

      const settlement = await yellowService.verifyClientSettlement({
        settlement: {
          sessionId: offer.yellowSessionId!,
          version: sessionSearch.session.version,
        },
        participantCandidates: participants,
        expectedSessionId: offer.yellowSessionId!,
        applicationPrefixes: ['sportwarren-transfer-'],
        expectedSessionData: {
          offerId: offer.id,
          recipient,
        },
      });

      const outcome = recipient === 'seller'
        ? 'accepted'
        : (offer.expiresAt && offer.expiresAt.getTime() < now ? 'cancelled' : 'rejected');

      await finalizeTransferOfferOutcome(prisma, offer, outcome, settlement);

      report.fixedTransfers.push({
        id: offer.id,
        sessionId: settlement.sessionId,
        version: settlement.version,
        status: sessionSearch.session.status,
        reason: `Recovered closed Yellow transfer session and marked offer ${outcome}.`,
      });
    } catch (error) {
      report.errors.push({
        id: offer.id,
        sessionId: offer.yellowSessionId || 'unknown',
        reason: error instanceof Error ? error.message : 'Unknown Yellow transfer recovery error',
      });
    }
  }

  return report;
}
