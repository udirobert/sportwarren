"use client";

import { useCallback, useMemo } from 'react';
import {
  RPCProtocolVersion,
  type RPCAppSessionAllocation,
} from '@erc7824/nitrolite';
import { isHex, type Hex } from 'viem';
import { trpc } from '@/lib/trpc-client';
import { useYellowSession } from '@/hooks/useYellowSession';
import type { MatchResult, Verification, MatchStatus, TrustTier } from '@/types';
import { calculateTrustScore } from '@/lib/match/verification';
import { getMatchFeeDistribution } from '@/lib/yellow/match-fees';

interface UseMatchVerificationReturn {
  matches: MatchResult[];
  pendingMatches: MatchResult[];
  settledMatches: MatchResult[];
  activeMatch: MatchResult | null;
  loading: boolean;
  error: string | null;
  submitMatchResult: (match: {
    homeSquadId: string;
    awaySquadId: string;
    homeScore: number;
    awayScore: number;
    matchDate?: Date;
    latitude?: number;
    longitude?: number;
  }) => Promise<{ id: string; shareSlug: string }>;
  verifyMatch: (matchId: string, verified: boolean, homeScore?: number, awayScore?: number) => Promise<void>;
  getMatchById: (matchId: string) => MatchResult | undefined;
  refreshMatches: () => Promise<void>;
  hasMore: boolean;
  total: number;
  railEnabledCount: number;
}

interface YellowSettlementInput {
  sessionId: string;
  version: number;
  settlementId: string;
}

interface MatchFeeSessionMetadata {
  homeParticipants?: Hex[];
  awayParticipants?: Hex[];
  platformParticipant?: Hex | null;
}

const DEFAULT_PROTOCOL = RPCProtocolVersion.NitroRPC_0_4;
const DEFAULT_CHALLENGE_WINDOW = 24 * 60 * 60;

function toAtomicAmount(amount: number) {
  return Math.max(0, Math.round(amount * 1_000_000)).toString();
}

function buildSettlementId(sessionId: string, version: number) {
  return `${sessionId}:v${version}`;
}

// Transform DB match to frontend type
function transformMatch(match: any): MatchResult {
  return {
    id: match.id,
    homeTeam: match.homeSquad?.name || 'Unknown',
    awayTeam: match.awaySquad?.name || 'Unknown',
    homeScore: match.homeScore ?? 0,
    awayScore: match.awayScore ?? 0,
    submitter: match.submittedBy,
    submitterTeam: match.submittedBy === match.homeSquadId ? 'home' : 'away',
    timestamp: new Date(match.createdAt),
    status: match.status as MatchStatus,
    verifications: match.verifications?.map((v: any) => ({
      verifier: v.verifier?.name || 'Unknown',
      verifierAddress: v.verifierId,
      verified: v.verified,
      timestamp: new Date(v.createdAt),
      role: 'captain', // TODO: Get from squad membership
      trustTier: v.trustTier as TrustTier,
    })) || [],
    requiredVerifications: 3,
    trustScore: match.verifications ? calculateTrustScore(match.verifications) : 0,
    consensus: {
      homeSubmitted: match.submittedBy === match.homeSquadId,
      awaySubmitted: match.submittedBy === match.awaySquadId,
      homeScore: match.homeScore ?? 0,
      awayScore: match.awayScore ?? 0,
      discrepancy: false,
      resolved: match.status === 'verified' || match.status === 'finalized',
    },
    creResult: match.creResult,
    paymentRail: {
      enabled: Boolean(match.yellowFeeSessionId),
      assetSymbol: process.env.NEXT_PUBLIC_YELLOW_ASSET_SYMBOL || 'USDC',
      sessionId: match.yellowFeeSessionId,
      feeAmount: Number(process.env.NEXT_PUBLIC_YELLOW_MATCH_FEE_AMOUNT || 1),
    },
  };
}

export function useMatchVerification(squadId?: string): UseMatchVerificationReturn {
  const utils = trpc.useUtils();
  const yellowSession = useYellowSession();
  // Fetch matches with tRPC
  const {
    data,
    isLoading,
    error,
    refetch
  } = trpc.match.list.useQuery(
    {
      squadId,
      limit: 20,
    },
    {
      enabled: !!squadId,
      staleTime: 5 * 1000, // 5 seconds
    }
  );

  // Mutations
  const submitMutation = trpc.match.submit.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const verifyMutation = trpc.match.verify.useMutation({
    onSuccess: () => {
      refetch();
    },
  });
  const settleFeeMutation = trpc.match.settleFeeSession.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const matches = squadId ? (data?.matches.map(transformMatch) || []) : [];
  const pendingMatches = useMemo(
    () => matches.filter((match) => match.status === 'pending'),
    [matches],
  );
  const settledMatches = useMemo(
    () => matches.filter((match) => match.status !== 'pending'),
    [matches],
  );
  const railEnabledCount = useMemo(
    () => matches.reduce((count, match) => count + (match.paymentRail?.enabled ? 1 : 0), 0),
    [matches],
  );
  const hasMore = data?.hasMore || false;
  const total = data?.total || 0;

  const getSquadLeaderWallets = useCallback(async (targetSquadId: string) => {
    const squad = await utils.squad.getById.fetch({ id: targetSquadId });
    return (squad.members || [])
      .filter((member: any) => member.role === 'captain' || member.role === 'vice_captain')
      .map((member: any) => member.user?.walletAddress)
      .filter((walletAddress: string | null | undefined): walletAddress is Hex => Boolean(walletAddress) && isHex(walletAddress))
      .slice(0, 1);
  }, [utils.squad.getById]);

  const createYellowMatchFeeLock = useCallback(async (
    match: {
      homeSquadId: string;
      awaySquadId: string;
      homeScore: number;
      awayScore: number;
      matchDate?: Date;
    },
  ): Promise<YellowSettlementInput | undefined> => {
    if (
      !yellowSession.enabled ||
      yellowSession.status !== 'authenticated' ||
      !yellowSession.accountAddress
    ) {
      return undefined;
    }

    const participant = yellowSession.accountAddress as Hex;
    if (!isHex(participant)) {
      return undefined;
    }

    const [homeLeaders, awayLeaders] = await Promise.all([
      getSquadLeaderWallets(match.homeSquadId),
      getSquadLeaderWallets(match.awaySquadId),
    ]);
    const platformParticipant = process.env.NEXT_PUBLIC_YELLOW_PLATFORM_WALLET;
    const participants = Array.from(
      new Set([
        ...homeLeaders,
        ...awayLeaders,
        ...(platformParticipant && isHex(platformParticipant) ? [platformParticipant as Hex] : []),
      ]),
    ) as Hex[];
    if (participants.length < 2) {
      return undefined;
    }
    if (!participants.includes(participant)) {
      return undefined;
    }

    const asset = (process.env.NEXT_PUBLIC_YELLOW_ASSET_SYMBOL || yellowSession.assetSymbol || 'USDC').toLowerCase();
    const feeAmount = Number(process.env.NEXT_PUBLIC_YELLOW_MATCH_FEE_AMOUNT || 1);
    const allocations: RPCAppSessionAllocation[] = participants.map((sessionParticipant) => ({
      participant: sessionParticipant,
      asset,
      amount: toAtomicAmount(feeAmount),
    }));

    const result = await yellowSession.createSession({
      definition: {
        application: `sportwarren-match-fee-${match.homeSquadId}-${match.awaySquadId}-${Date.now()}`,
        protocol: DEFAULT_PROTOCOL,
        participants,
        weights: participants.map((sessionParticipant) => {
          if (platformParticipant && sessionParticipant.toLowerCase() === platformParticipant.toLowerCase()) {
            return 0;
          }
          return 50;
        }),
        quorum: 50,
        challenge: DEFAULT_CHALLENGE_WINDOW,
      },
      allocations,
      sessionData: JSON.stringify({
        squadId,
        homeSquadId: match.homeSquadId,
        awaySquadId: match.awaySquadId,
        homeScore: match.homeScore,
        awayScore: match.awayScore,
        matchDate: match.matchDate?.toISOString() ?? new Date().toISOString(),
        asset,
        feeAmount,
        homeParticipants: homeLeaders,
        awayParticipants: awayLeaders,
        platformParticipant: platformParticipant && isHex(platformParticipant) ? platformParticipant : null,
      }),
    });

    return {
      sessionId: result.appSessionId,
      version: result.version,
      settlementId: buildSettlementId(result.appSessionId, result.version),
    };
  }, [getSquadLeaderWallets, squadId, yellowSession]);

  const submitMatchResult = useCallback(async (
    match: {
      homeSquadId: string;
      awaySquadId: string;
      homeScore: number;
      awayScore: number;
      matchDate?: Date;
      latitude?: number;
      longitude?: number;
    }
  ): Promise<{ id: string; shareSlug: string }> => {
    const yellowSettlement = await createYellowMatchFeeLock(match);
    const result = await submitMutation.mutateAsync({
      ...match,
      yellowSettlement,
    });
    return { id: result.id, shareSlug: result.shareSlug ?? result.id };
  }, [createYellowMatchFeeLock, submitMutation]);

  const verifyMatch = useCallback(async (
    matchId: string,
    verified: boolean,
    homeScore?: number,
    awayScore?: number
  ): Promise<void> => {
    const result = await verifyMutation.mutateAsync({
      matchId,
      verified,
      homeScore,
      awayScore,
    });

    if (
      !result.requiresYellowSettlement ||
      !yellowSession.enabled ||
      yellowSession.status !== 'authenticated' ||
      !yellowSession.accountAddress
    ) {
      return;
    }

    const match = await utils.match.getById.fetch({ id: matchId });
    if (!match.yellowFeeSessionId || !isHex(match.yellowFeeSessionId)) {
      return;
    }

    const participant = yellowSession.accountAddress as Hex;
    if (!isHex(participant)) {
      return;
    }

    const sessions = await yellowSession.getAppSessions(participant);
    const existingSession = sessions.find((session: { appSessionId: string }) => session.appSessionId === match.yellowFeeSessionId);
    if (!existingSession) {
      return;
    }

    const distribution = getMatchFeeDistribution(
      { homeScore: match.homeScore, awayScore: match.awayScore },
      result.newStatus as 'verified' | 'disputed',
      Number(process.env.NEXT_PUBLIC_YELLOW_MATCH_FEE_AMOUNT || 1),
    );
    const asset = (process.env.NEXT_PUBLIC_YELLOW_ASSET_SYMBOL || yellowSession.assetSymbol || 'USDC').toLowerCase();
    const metadata = existingSession.sessionData
      ? JSON.parse(existingSession.sessionData) as MatchFeeSessionMetadata
      : null;
    const allocations: RPCAppSessionAllocation[] = existingSession.participants.map((sessionParticipant: Hex) => {
      if (metadata?.platformParticipant && sessionParticipant.toLowerCase() === metadata.platformParticipant.toLowerCase()) {
        return {
          participant: sessionParticipant,
          asset,
          amount: toAtomicAmount(distribution.platformAmount),
        };
      }

      const isHomeParticipant = metadata?.homeParticipants?.some(
        (homeParticipant) => homeParticipant.toLowerCase() === sessionParticipant.toLowerCase(),
      );
      return {
        participant: sessionParticipant,
        asset,
        amount: toAtomicAmount(isHomeParticipant ? distribution.homeAmount : distribution.awayAmount),
      };
    });

    const closeResult = await yellowSession.closeSession({
      appSessionId: match.yellowFeeSessionId,
      allocations,
      sessionData: JSON.stringify({
        matchId,
        status: result.newStatus,
        homeScore: match.homeScore,
        awayScore: match.awayScore,
        asset,
      }),
    });

    await settleFeeMutation.mutateAsync({
      matchId,
      yellowSettlement: {
        sessionId: closeResult.appSessionId,
        version: closeResult.version,
        settlementId: buildSettlementId(closeResult.appSessionId, closeResult.version),
      },
    });
  }, [settleFeeMutation, utils.match.getById, verifyMutation, yellowSession]);

  const getMatchById = useCallback((matchId: string) => {
    return matches.find(m => m.id === matchId);
  }, [matches]);

  const refreshMatches = useCallback(async () => {
    await refetch();
  }, [refetch]);

  return {
    matches,
    pendingMatches,
    settledMatches,
    activeMatch: matches[0] || null,
    loading:
      isLoading ||
      submitMutation.isPending ||
      verifyMutation.isPending ||
      settleFeeMutation.isPending ||
      yellowSession.status === 'connecting',
    error: error?.message || submitMutation.error?.message || verifyMutation.error?.message || null,
    submitMatchResult,
    verifyMatch,
    getMatchById,
    refreshMatches,
    hasMore,
    total,
    railEnabledCount,
  };
}

// Hook for single match details
export function useMatchDetails(matchId: string) {
  const { data, isLoading, error, refetch } = trpc.match.getById.useQuery(
    { id: matchId },
    {
      enabled: !!matchId,
      staleTime: 5 * 1000,
    }
  );

  return {
    match: data ? transformMatch(data) : null,
    loading: isLoading,
    error: error?.message || null,
    refresh: refetch,
  };
}
