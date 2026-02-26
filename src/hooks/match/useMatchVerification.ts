"use client";

import { useCallback } from 'react';
import { trpc } from '@/lib/trpc-client';
import type { MatchResult, Verification, MatchStatus, TrustTier } from '@/types';
import { calculateTrustScore } from '@/lib/match/verification';

interface UseMatchVerificationReturn {
  matches: MatchResult[];
  activeMatch: MatchResult | null;
  loading: boolean;
  error: string | null;
  submitMatchResult: (match: {
    homeSquadId: string;
    awaySquadId: string;
    homeScore: number;
    awayScore: number;
    matchDate?: Date;
  }) => Promise<string>;
  verifyMatch: (matchId: string, verified: boolean, homeScore?: number, awayScore?: number) => Promise<void>;
  getMatchById: (matchId: string) => MatchResult | undefined;
  refreshMatches: () => Promise<void>;
  hasMore: boolean;
  total: number;
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
  };
}

export function useMatchVerification(squadId?: string): UseMatchVerificationReturn {
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

  const matches = data?.matches.map(transformMatch) || [];
  const hasMore = data?.hasMore || false;
  const total = data?.total || 0;

  const submitMatchResult = useCallback(async (
    match: {
      homeSquadId: string;
      awaySquadId: string;
      homeScore: number;
      awayScore: number;
      matchDate?: Date;
    }
  ): Promise<string> => {
    const result = await submitMutation.mutateAsync(match);
    return result.id;
  }, [submitMutation]);

  const verifyMatch = useCallback(async (
    matchId: string, 
    verified: boolean,
    homeScore?: number,
    awayScore?: number
  ): Promise<void> => {
    await verifyMutation.mutateAsync({
      matchId,
      verified,
      homeScore,
      awayScore,
    });
  }, [verifyMutation]);

  const getMatchById = useCallback((matchId: string) => {
    return matches.find(m => m.id === matchId);
  }, [matches]);

  const refreshMatches = useCallback(async () => {
    await refetch();
  }, [refetch]);

  return {
    matches,
    activeMatch: matches[0] || null,
    loading: isLoading || submitMutation.isPending || verifyMutation.isPending,
    error: error?.message || submitMutation.error?.message || verifyMutation.error?.message || null,
    submitMatchResult,
    verifyMatch,
    getMatchById,
    refreshMatches,
    hasMore,
    total,
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
