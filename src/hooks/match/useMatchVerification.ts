"use client";

import { useState, useCallback, useEffect } from 'react';
import type { MatchResult, Verification, MatchStatus, TrustTier, MatchConsensus } from '@/types';

interface UseMatchVerificationReturn {
  matches: MatchResult[];
  activeMatch: MatchResult | null;
  loading: boolean;
  error: string | null;
  submitMatchResult: (match: Omit<MatchResult, 'id' | 'timestamp' | 'verifications' | 'status'>) => Promise<string>;
  verifyMatch: (matchId: string, verified: boolean) => Promise<void>;
  getMatchById: (matchId: string) => MatchResult | undefined;
  refreshMatches: () => Promise<void>;
}

// Mock data for development
const MOCK_MATCHES: MatchResult[] = [
  {
    id: 'match_001',
    homeTeam: 'Northside United',
    awayTeam: 'Red Lions FC',
    homeScore: 3,
    awayScore: 1,
    submitter: 'Marcus Johnson',
    submitterTeam: 'home',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    verifications: [
      {
        verifier: 'Jamie Thompson',
        verifierAddress: 'ADDR_JAMIE_123',
        verified: true,
        timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
        role: 'captain',
        trustTier: 'gold',
      },
      {
        verifier: 'Sarah Martinez',
        verifierAddress: 'ADDR_SARAH_456',
        verified: true,
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
        role: 'player',
        trustTier: 'silver',
      },
      {
        verifier: 'Referee Mike',
        verifierAddress: 'ADDR_MIKE_789',
        verified: true,
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        role: 'referee',
        trustTier: 'platinum',
      },
    ],
    status: 'verified',
    requiredVerifications: 3,
    trustScore: 95,
    consensus: {
      homeSubmitted: true,
      awaySubmitted: true,
      homeScore: 3,
      awayScore: 1,
      discrepancy: false,
      resolved: true,
    },
  },
  {
    id: 'match_002',
    homeTeam: 'Northside United',
    awayTeam: 'Sunday Legends',
    homeScore: 2,
    awayScore: 2,
    submitter: 'Emma Wilson',
    submitterTeam: 'home',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    verifications: [
      {
        verifier: 'Alex Chen',
        verifierAddress: 'ADDR_ALEX_321',
        verified: true,
        timestamp: new Date(Date.now() - 20 * 60 * 1000),
        role: 'player',
        trustTier: 'bronze',
      },
    ],
    status: 'pending',
    requiredVerifications: 3,
    trustScore: 30,
    consensus: {
      homeSubmitted: true,
      awaySubmitted: false,
      discrepancy: false,
      resolved: false,
    },
  },
  {
    id: 'match_003',
    homeTeam: 'Park Rangers',
    awayTeam: 'Northside United',
    homeScore: 1,
    awayScore: 4,
    submitter: 'Ryan Murphy',
    submitterTeam: 'away',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    verifications: [
      {
        verifier: 'Marcus Johnson',
        verifierAddress: 'ADDR_MARCUS_654',
        verified: false,
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
        role: 'captain',
        trustTier: 'gold',
      },
      {
        verifier: 'Jamie Thompson',
        verifierAddress: 'ADDR_JAMIE_123',
        verified: false,
        timestamp: new Date(Date.now() - 2.5 * 60 * 60 * 1000),
        role: 'player',
        trustTier: 'gold',
      },
    ],
    status: 'disputed',
    requiredVerifications: 3,
    trustScore: 10,
    consensus: {
      homeSubmitted: false,
      awaySubmitted: true,
      homeScore: 1,
      awayScore: 4,
      discrepancy: true,
      resolved: false,
    },
  },
];

export function useMatchVerification(): UseMatchVerificationReturn {
  const [matches, setMatches] = useState<MatchResult[]>(MOCK_MATCHES);
  const [activeMatch, setActiveMatch] = useState<MatchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshMatches = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // In production: fetch from Algorand
      // const response = await fetch('/api/matches');
      // const data = await response.json();
      // setMatches(data);
      
      // For now, use mock data
      setMatches(MOCK_MATCHES);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch matches');
    } finally {
      setLoading(false);
    }
  }, []);

  const submitMatchResult = useCallback(async (
    match: Omit<MatchResult, 'id' | 'timestamp' | 'verifications' | 'status'>
  ): Promise<string> => {
    setLoading(true);
    setError(null);
    try {
      const newMatch: MatchResult = {
        ...match,
        id: `match_${Date.now()}`,
        timestamp: new Date(),
        verifications: [],
        status: 'pending',
        trustScore: 0,
        consensus: {
          homeSubmitted: match.submitterTeam === 'home',
          awaySubmitted: match.submitterTeam === 'away',
          homeScore: match.homeScore,
          awayScore: match.awayScore,
          discrepancy: false,
          resolved: false,
        },
      };

      // In production: submit to Algorand
      // await submitMatchToBlockchain(newMatch);

      setMatches(prev => [newMatch, ...prev]);
      setActiveMatch(newMatch);
      return newMatch.id;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit match');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyMatch = useCallback(async (matchId: string, verified: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const userAddress = 'CURRENT_USER_ADDR'; // Get from wallet
      const userTrustTier: TrustTier = 'gold'; // Get from reputation

      const newVerification: Verification = {
        verifier: 'Current User',
        verifierAddress: userAddress,
        verified,
        timestamp: new Date(),
        role: 'captain',
        trustTier: userTrustTier,
      };

      setMatches(prev => prev.map(match => {
        if (match.id !== matchId) return match;

        const updatedVerifications = [...match.verifications, newVerification];
        const verifiedCount = updatedVerifications.filter(v => v.verified).length;
        const disputedCount = updatedVerifications.filter(v => !v.verified).length;

        let status: MatchStatus = 'pending';
        if (verifiedCount >= match.requiredVerifications) {
          status = 'verified';
        } else if (disputedCount >= 2) {
          status = 'disputed';
        }

        // Calculate trust score
        const trustScore = calculateTrustScore(updatedVerifications);

        return {
          ...match,
          verifications: updatedVerifications,
          status,
          trustScore,
        };
      }));

      // In production: submit verification to Algorand
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify match');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getMatchById = useCallback((matchId: string) => {
    return matches.find(m => m.id === matchId);
  }, [matches]);

  // Load matches on mount
  useEffect(() => {
    refreshMatches();
  }, [refreshMatches]);

  return {
    matches,
    activeMatch,
    loading,
    error,
    submitMatchResult,
    verifyMatch,
    getMatchById,
    refreshMatches,
  };
}

// Helper function to calculate trust score
function calculateTrustScore(verifications: Verification[]): number {
  if (verifications.length === 0) return 0;

  const tierWeights: Record<TrustTier, number> = {
    bronze: 10,
    silver: 25,
    gold: 40,
    platinum: 60,
  };

  const totalWeight = verifications.reduce((sum, v) => {
    return sum + (v.verified ? tierWeights[v.trustTier] : -tierWeights[v.trustTier] * 0.5);
  }, 0);

  // Normalize to 0-100 scale
  const maxPossible = verifications.length * 60; // platinum weight
  return Math.max(0, Math.min(100, (totalWeight / maxPossible) * 100));
}
