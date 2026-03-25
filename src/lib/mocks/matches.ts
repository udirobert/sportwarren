/**
 * Match Mock Data - Single Source of Truth
 * Consolidated from:
 * - src/hooks/match/useMatchVerification.ts (MOCK_MATCHES)
 * - src/components/match/MatchVerification.tsx (mockMatches)
 * - src/app/match/page.tsx (MOCK_XP_SUMMARY)
 */

import type { MatchResult, MatchEvent, AttributeType } from '@/types';

/**
 * Default mock matches for development and testing
 */
export const MOCK_MATCHES: MatchResult[] = [
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
      homeScore: 2,
      awayScore: 2,
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

/**
 * Mock match events for timeline/tracking
 */
export const MOCK_MATCH_EVENTS: MatchEvent[] = [
  {
    id: 'event_001',
    type: 'goal',
    player: 'Marcus Johnson',
    playerId: 'player_001',
    details: 'Great finish from inside the box',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    minute: 23,
  },
  {
    id: 'event_002',
    type: 'assist',
    player: 'Jamie Thompson',
    playerId: 'player_002',
    details: 'Perfect through ball',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 60000),
    minute: 23,
  },
  {
    id: 'event_003',
    type: 'goal',
    player: 'Marcus Johnson',
    playerId: 'player_001',
    details: 'Header from corner',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 30 * 60000),
    minute: 67,
  },
];

/**
 * Mock XP summary data for post-match screen
 */
export interface XPSummaryData {
  totalXP: number;
  levelUp: boolean;
  newLevel?: number;
  attributeGains: Array<{
    attribute: AttributeType;
    xp: number;
    oldRating: number;
    newRating: number;
  }>;
  bonuses: Array<{
    name: string;
    xp: number;
  }>;
}

export const MOCK_XP_SUMMARY: XPSummaryData = {
  totalXP: 385,
  levelUp: true,
  newLevel: 13,
  attributeGains: [
    { attribute: 'shooting', xp: 125, oldRating: 87, newRating: 88 },
    { attribute: 'passing', xp: 85, oldRating: 72, newRating: 72 },
    { attribute: 'physical', xp: 60, oldRating: 68, newRating: 68 },
    { attribute: 'pace', xp: 45, oldRating: 75, newRating: 75 },
  ],
  bonuses: [
    { name: 'Match Winner', xp: 50 },
    { name: '2+ Goals', xp: 20 },
  ],
};

/**
 * Helper to get matches by status
 */
export const getMatchesByStatus = (status: MatchResult['status']) =>
  MOCK_MATCHES.filter((m) => m.status === status);

/**
 * Helper to get matches for a team
 */
export const getMatchesByTeam = (teamName: string) =>
  MOCK_MATCHES.filter((m) => m.homeTeam === teamName || m.awayTeam === teamName);

/**
 * Helper to create a new mock match
 */
export const createMockMatch = (
  partial: Partial<MatchResult> & Pick<MatchResult, 'homeTeam' | 'awayTeam' | 'homeScore' | 'awayScore'>
): MatchResult => ({
  id: `match_${Date.now()}`,
  submitter: 'Current User',
  submitterTeam: 'home',
  timestamp: new Date(),
  verifications: [],
  status: 'pending',
  requiredVerifications: 3,
  trustScore: 0,
  consensus: {
    homeSubmitted: partial.submitterTeam === 'home',
    awaySubmitted: partial.submitterTeam === 'away',
    homeScore: partial.homeScore,
    awayScore: partial.awayScore,
    discrepancy: false,
    resolved: false,
  },
  ...partial,
});
