/**
 * Player Mock Data - Single Source of Truth
 * Consolidated from:
 * - src/hooks/player/usePlayerAttributes.ts (mock data)
 * - src/components/player/PlayerReputation.tsx (Marcus Johnson data)
 * - src/components/match/MatchVerification.tsx (playerStats)
 * - src/app/squad/page.tsx (MOCK_PLAYERS)
 */

import type { PlayerAttributes, Player, SkillRating, FormRating, PlayerXP } from '@/types';

/**
 * Default skill ratings for a new player
 */
export const DEFAULT_SKILL_RATINGS: SkillRating[] = [
  { skill: 'pace', rating: 75, xp: 1200, xpToNextLevel: 1500, maxRating: 99, verified: true, lastUpdated: new Date(), history: [74, 74, 75, 75, 75] },
  { skill: 'shooting', rating: 87, xp: 3400, xpToNextLevel: 4000, maxRating: 99, verified: true, lastUpdated: new Date(), history: [86, 86, 87, 87, 87] },
  { skill: 'passing', rating: 72, xp: 1800, xpToNextLevel: 2000, maxRating: 99, verified: true, lastUpdated: new Date(), history: [71, 71, 72, 72, 72] },
  { skill: 'dribbling', rating: 78, xp: 2100, xpToNextLevel: 2500, maxRating: 99, verified: true, lastUpdated: new Date(), history: [77, 77, 78, 78, 78] },
  { skill: 'defending', rating: 45, xp: 800, xpToNextLevel: 1000, maxRating: 70, verified: true, lastUpdated: new Date(), history: [45, 45, 45, 45, 45] },
  { skill: 'physical', rating: 68, xp: 1500, xpToNextLevel: 1800, maxRating: 85, verified: true, lastUpdated: new Date(), history: [67, 67, 68, 68, 68] },
];

/**
 * Default form rating
 */
export const DEFAULT_FORM_RATING: FormRating = {
  current: 2,
  history: [7.5, 8.0, 7.0, 8.5, 8.5],
  trend: 'up',
};

/**
 * Default player XP
 */
export const DEFAULT_PLAYER_XP: PlayerXP = {
  level: 12,
  totalXP: 15420,
  seasonXP: 3200,
  nextLevelXP: 16000,
};

/**
 * Marcus Johnson - Primary test user
 */
export const MARCUS_JOHNSON: PlayerAttributes = {
  address: 'ADDR_MARCUS_001',
  playerName: 'Marcus Johnson',
  position: 'ST',
  totalMatches: 47,
  totalGoals: 38,
  totalAssists: 24,
  reputationScore: 850,
  verifiedStats: true,
  skills: DEFAULT_SKILL_RATINGS,
  form: DEFAULT_FORM_RATING,
  xp: DEFAULT_PLAYER_XP,
  achievements: [
    {
      id: 'ach_001',
      title: 'Hat-trick Hero',
      description: 'Score 3 goals in a single match',
      dateEarned: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      rarity: 'rare',
      verified: true,
      icon: 'target',
    },
    {
      id: 'ach_002',
      title: 'Assist King',
      description: 'Provide 10 assists in a season',
      dateEarned: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      rarity: 'epic',
      verified: true,
      icon: 'users',
    },
  ],
  careerHighlights: [
    {
      id: 'highlight_001',
      title: 'Derby Day Hero',
      description: 'Scored winner in local derby',
      date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      matchId: 'match_001',
      verified: true,
    },
  ],
  endorsements: [
    {
      endorser: 'Coach Thompson',
      endorserRole: 'coach',
      skill: 'shooting',
      rating: 9,
      comment: 'Clinical finisher, great positioning',
      date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      verified: true,
    },
  ],
  professionalInterest: [
    {
      scoutName: 'Sarah Williams',
      organization: 'Regional Academy',
      interestLevel: 'interested',
      notes: 'Impressive goal record, watching development',
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    },
  ],
};

/**
 * Squad players list
 */
export const MOCK_SQUAD_PLAYERS: Player[] = [
  { id: 'p1', address: 'ADDR_MARCUS_001', name: 'Marcus Johnson', position: 'ST', status: 'available' },
  { id: 'p2', address: 'ADDR_JAMIE_123', name: 'Jamie Thompson', position: 'MF', status: 'available' },
  { id: 'p3', address: 'ADDR_SARAH_456', name: 'Sarah Martinez', position: 'DF', status: 'available' },
  { id: 'p4', address: 'ADDR_ALEX_321', name: 'Alex Chen', position: 'GK', status: 'available' },
  { id: 'p5', address: 'ADDR_EMMA_789', name: 'Emma Wilson', position: 'MF', status: 'injured' },
  { id: 'p6', address: 'ADDR_RYAN_654', name: 'Ryan Murphy', position: 'DF', status: 'available' },
  { id: 'p7', address: 'ADDR_LUCAS_987', name: 'Lucas Brown', position: 'WG', status: 'available' },
  { id: 'p8', address: 'ADDR_NOAH_147', name: 'Noah Davis', position: 'ST', status: 'available' },
];

/**
 * Match verification player stats
 */
export const MOCK_MATCH_PLAYER_STATS = [
  {
    playerId: 'player_001',
    playerName: 'Marcus Johnson',
    goals: 2,
    assists: 1,
    rating: 8.5,
    verified: true,
  },
  {
    playerId: 'player_002',
    playerName: 'Jamie Thompson',
    goals: 1,
    assists: 2,
    rating: 8.0,
    verified: true,
  },
  {
    playerId: 'player_003',
    playerName: 'Emma Wilson',
    goals: 0,
    assists: 1,
    rating: 7.5,
    verified: false,
  },
];

/**
 * Available players for transfer market
 * Extended type with transfer-specific fields
 */
export interface TransferMarketPlayer {
  id: string;
  name: string;
  position: string;
  age: number;
  overall: number;
  askingPrice: number;
  currentClub: string;
  contractExpiry: Date;
  reputationScore: number;
  reputationTier: 'bronze' | 'silver' | 'gold' | 'platinum';
  isDraftEligible: boolean;
  marketValuation: number;
}

export const MOCK_AVAILABLE_PLAYERS: TransferMarketPlayer[] = [
  { id: 'tp1', name: 'Alex Thompson', position: 'ST', age: 24, overall: 78, askingPrice: 2500, currentClub: 'Riverside FC', contractExpiry: new Date('2025-06-30'), reputationScore: 450, reputationTier: 'silver', isDraftEligible: true, marketValuation: 2800 },
  { id: 'tp2', name: 'Jordan Lee', position: 'MF', age: 22, overall: 75, askingPrice: 1800, currentClub: 'City United', contractExpiry: new Date('2025-12-31'), reputationScore: 300, reputationTier: 'bronze', isDraftEligible: true, marketValuation: 1950 },
  { id: 'tp3', name: 'Sam Rodriguez', position: 'DF', age: 28, overall: 82, askingPrice: 3200, currentClub: 'Northside United', contractExpiry: new Date('2025-05-15'), reputationScore: 880, reputationTier: 'platinum', isDraftEligible: false, marketValuation: 12000 },
  { id: 'tp4', name: 'Casey Kim', position: 'GK', age: 26, overall: 80, askingPrice: 2800, currentClub: 'East Enders', contractExpiry: new Date('2026-01-01'), reputationScore: 620, reputationTier: 'gold', isDraftEligible: false, marketValuation: 7500 },
  { id: 'tp5', name: 'Morgan Taylor', position: 'WG', age: 21, overall: 73, askingPrice: 1500, currentClub: 'Youth Academy', contractExpiry: new Date('2025-08-20'), reputationScore: 150, reputationTier: 'bronze', isDraftEligible: true, marketValuation: 1400 },
];

/**
 * Helper to calculate overall rating from skills
 */
export const calculateOverallRating = (skills: SkillRating[]): number => {
  if (skills.length === 0) return 0;
  const total = skills.reduce((sum, skill) => sum + skill.rating, 0);
  return Math.round(total / skills.length);
};

/**
 * Helper to get position from top attributes
 */
export const detectPosition = (skills: SkillRating[]): string => {
  const sorted = [...skills].sort((a, b) => b.rating - a.rating);
  const topSkill = sorted[0]?.skill;

  switch (topSkill) {
    case 'gk_diving':
    case 'gk_reflexes':
      return 'GK';
    case 'defending':
      return 'DF';
    case 'passing':
      return 'MF';
    case 'shooting':
      return 'ST';
    case 'pace':
    case 'dribbling':
      return 'WG';
    default:
      return 'MF';
  }
};

/**
 * Helper to get top 3 attributes
 */
export const getTopAttributes = (skills: SkillRating[], count = 3): SkillRating[] => {
  return [...skills].sort((a, b) => b.rating - a.rating).slice(0, count);
};
