/**
 * Match Verification Utilities
 * Consensus logic, trust scoring, and dispute resolution
 */

import type { MatchResult, Verification, TrustTier, MatchConsensus, MatchStatus } from '@/types';

// Trust tier weights for scoring
export const TRUST_TIER_WEIGHTS: Record<TrustTier, number> = {
  bronze: 10,
  silver: 25,
  gold: 40,
  platinum: 60,
};

// Minimum trust score required for auto-verification
export const AUTO_VERIFICATION_THRESHOLD = 75;

// Minimum trust score before flagging for review
export const REVIEW_THRESHOLD = 30;

/**
 * Calculate trust score based on verifications
 * Positive verifications add weight, disputes reduce score
 */
export function calculateTrustScore(verifications: Verification[]): number {
  if (verifications.length === 0) return 0;

  const totalWeight = verifications.reduce((sum, v) => {
    const weight = TRUST_TIER_WEIGHTS[v.trustTier];
    return sum + (v.verified ? weight : -weight * 0.5);
  }, 0);

  const maxPossible = verifications.length * TRUST_TIER_WEIGHTS.platinum;
  return Math.max(0, Math.min(100, (totalWeight / maxPossible) * 100));
}

/**
 * Determine if consensus is reached between both teams
 * Both team captains must submit matching scores
 */
export function checkConsensus(match: MatchResult): MatchConsensus {
  const homeVerifications = match.verifications.filter(
    v => v.role === 'captain' && v.verified
  );
  const awayVerifications = match.verifications.filter(
    v => v.role === 'captain' && v.verified
  );

  const homeSubmitted = homeVerifications.length > 0;
  const awaySubmitted = awayVerifications.length > 0;

  // Get submitted scores from verifications
  const homeScores = new Set(homeVerifications.map(() => match.homeScore));
  const awayScores = new Set(awayVerifications.map(() => match.awayScore));

  const discrepancy = homeSubmitted && awaySubmitted && (
    homeScores.size > 1 || awayScores.size > 1 ||
    !homeScores.has(match.homeScore) ||
    !awayScores.has(match.awayScore)
  );

  return {
    homeSubmitted,
    awaySubmitted,
    homeScore: match.homeScore,
    awayScore: match.awayScore,
    discrepancy,
    resolved: !discrepancy && homeSubmitted && awaySubmitted,
  };
}

/**
 * Determine match status based on verifications and consensus
 */
export function determineMatchStatus(
  match: MatchResult,
  consensus: MatchConsensus
): MatchStatus {
  const verifiedCount = match.verifications.filter(v => v.verified).length;
  const disputedCount = match.verifications.filter(v => !v.verified).length;

  // If there's a discrepancy between teams, mark as disputed
  if (consensus.discrepancy) {
    return 'disputed';
  }

  // If 2+ disputes, mark as disputed
  if (disputedCount >= 2) {
    return 'disputed';
  }

  // If we have required verifications and consensus, mark as verified
  if (verifiedCount >= match.requiredVerifications && consensus.resolved) {
    return 'verified';
  }

  return 'pending';
}

/**
 * Get trust tier based on reputation score
 */
export function getTrustTier(reputationScore: number): TrustTier {
  if (reputationScore >= 8000) return 'platinum';
  if (reputationScore >= 6000) return 'gold';
  if (reputationScore >= 4000) return 'silver';
  return 'bronze';
}

/**
 * Get trust tier color for UI
 */
export function getTrustTierColor(tier: TrustTier): string {
  switch (tier) {
    case 'platinum':
      return 'text-purple-600 bg-purple-100';
    case 'gold':
      return 'text-yellow-600 bg-yellow-100';
    case 'silver':
      return 'text-gray-600 bg-gray-100';
    case 'bronze':
      return 'text-orange-600 bg-orange-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}

/**
 * Get trust tier icon
 */
export function getTrustTierIcon(tier: TrustTier): string {
  switch (tier) {
    case 'platinum':
      return '💎';
    case 'gold':
      return '🥇';
    case 'silver':
      return '🥈';
    case 'bronze':
      return '🥉';
    default:
      return '📊';
  }
}

/**
 * Calculate verification progress percentage
 */
export function getVerificationProgress(match: MatchResult): number {
  const verifiedCount = match.verifications.filter(v => v.verified).length;
  return Math.min(100, (verifiedCount / match.requiredVerifications) * 100);
}

/**
 * Check if user can verify a match
 * User cannot verify their own submission
 * User can only verify once
 */
export function canVerifyMatch(
  match: MatchResult,
  userAddress: string,
  isCaptain: boolean
): { canVerify: boolean; reason?: string } {
  // Check if already verified
  const alreadyVerified = match.verifications.some(
    v => v.verifierAddress === userAddress
  );
  if (alreadyVerified) {
    return { canVerify: false, reason: 'You have already verified this match' };
  }

  // Check if match is already finalized
  if (match.status === 'verified' || match.status === 'finalized') {
    return { canVerify: false, reason: 'Match is already verified' };
  }

  // Only captains can submit/verify
  if (!isCaptain) {
    return { canVerify: false, reason: 'Only team captains can verify matches' };
  }

  return { canVerify: true };
}

/**
 * Resolve a disputed match
 * Returns the resolved score based on evidence weight
 */
export function resolveDispute(match: MatchResult): {
  homeScore: number;
  awayScore: number;
  confidence: number;
} {
  // Group verifications by submitted score
  const scoreGroups = new Map<string, Verification[]>();
  
  for (const v of match.verifications) {
    if (!v.verified) continue;
    const key = `${match.homeScore}-${match.awayScore}`;
    const existing = scoreGroups.get(key) || [];
    existing.push(v);
    scoreGroups.set(key, existing);
  }

  // Find score with highest trust weight
  let bestScore = { home: match.homeScore, away: match.awayScore };
  let maxWeight = 0;
  let totalWeight = 0;

  for (const [key, verifications] of scoreGroups) {
    const weight = verifications.reduce(
      (sum, v) => sum + TRUST_TIER_WEIGHTS[v.trustTier],
      0
    );
    totalWeight += weight;

    if (weight > maxWeight) {
      maxWeight = weight;
      const [home, away] = key.split('-').map(Number);
      bestScore = { home, away };
    }
  }

  const confidence = totalWeight > 0 ? (maxWeight / totalWeight) * 100 : 0;

  return {
    homeScore: bestScore.home,
    awayScore: bestScore.away,
    confidence,
  };
}

/**
 * Format match result for display
 */
export function formatMatchResult(match: MatchResult): string {
  return `${match.homeTeam} ${match.homeScore} - ${match.awayScore} ${match.awayTeam}`;
}

/**
 * Get match status display info
 */
export function getMatchStatusDisplay(status: MatchStatus): {
  label: string;
  color: string;
  icon: string;
} {
  switch (status) {
    case 'verified':
      return {
        label: 'Verified',
        color: 'text-green-600 bg-green-100',
        icon: '✓',
      };
    case 'disputed':
      return {
        label: 'Disputed',
        color: 'text-red-600 bg-red-100',
        icon: '⚠',
      };
    case 'finalized':
      return {
        label: 'Finalized',
        color: 'text-blue-600 bg-blue-100',
        icon: '🔒',
      };
    case 'pending':
    default:
      return {
        label: 'Pending',
        color: 'text-yellow-600 bg-yellow-100',
        icon: '⏳',
      };
  }
}
