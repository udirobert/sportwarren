/**
 * Squad Mock Data - Single Source of Truth
 * Consolidated from:
 * - src/hooks/squad/useTreasury.ts (MOCK_TREASURY)
 * - src/components/squad/Treasury.tsx (MOCK_TREASURY)
 * - src/components/squad/TransferMarket.tsx (MOCK_OFFERS, MOCK_AVAILABLE_PLAYERS)
 * - src/components/rivalry/RivalryTracker.tsx (MOCK_RIVALRIES)
 */

import type { Treasury, TransferOffer, Rivalry, Squad, TreasuryTransaction } from '@/types';
import { MOCK_SQUAD_PLAYERS } from './players';

/**
 * Default treasury data
 */
export const MOCK_TREASURY: Treasury = {
  balance: 12500,
  currency: 'USDC',
  transactions: [
    {
      id: 'txn_001',
      type: 'income',
      category: 'match_fee',
      amount: 500,
      description: 'Match fee - Northside United vs Red Lions',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      verified: true,
    },
    {
      id: 'txn_002',
      type: 'income',
      category: 'sponsor',
      amount: 2000,
      description: 'Local business sponsorship',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      verified: true,
    },
    {
      id: 'txn_003',
      type: 'expense',
      category: 'facility',
      amount: 800,
      description: 'Pitch rental - monthly',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      verified: true,
    },
    {
      id: 'txn_004',
      type: 'expense',
      category: 'wages',
      amount: 1200,
      description: 'Weekly player stipends',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      verified: true,
    },
  ],
  allowances: {
    weeklyWages: 1500,
    transferBudget: 5000,
    facilityUpgrades: 2000,
  },
};

/**
 * Mock transfer offers
 */
export const MOCK_OFFERS: TransferOffer[] = [
  {
    id: 'offer_001',
    fromSquad: 'Red Lions FC',
    toSquad: 'Northside United',
    player: {
      ...MOCK_SQUAD_PLAYERS[0],
      squadNumber: 9,
      contract: {
        type: 'semi-pro',
        wage: 100,
        expiry: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        releaseClause: 2000,
      },
      isCaptain: false,
      isViceCaptain: false,
    },
    offerAmount: 2500,
    offerType: 'transfer',
    status: 'pending',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    expiry: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'offer_002',
    fromSquad: 'Northside United',
    toSquad: 'Sunday Legends',
    player: {
      ...MOCK_SQUAD_PLAYERS[4],
      squadNumber: 15,
      contract: {
        type: 'amateur',
        wage: 50,
        expiry: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      },
      isCaptain: false,
      isViceCaptain: false,
    },
    offerAmount: 800,
    offerType: 'loan',
    status: 'negotiating',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    expiry: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
  },
];

/**
 * Mock rivalries
 */
export const MOCK_RIVALRIES: Rivalry[] = [
  {
    id: 'rivalry_001',
    squadA: 'Northside United',
    squadB: 'Red Lions FC',
    name: 'The Northside Derby',
    description: 'Intense local rivalry dating back 3 seasons',
    history: [
      {
        matchId: 'match_001',
        date: new Date(Date.now() - 2 * 60 * 60 * 1000),
        squadAScore: 3,
        squadBScore: 1,
        winner: 'Northside United',
        significance: 'league',
        memorable: true,
      },
      {
        matchId: 'match_004',
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        squadAScore: 2,
        squadBScore: 2,
        significance: 'cup',
      },
      {
        matchId: 'match_005',
        date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        squadAScore: 1,
        squadBScore: 0,
        winner: 'Northside United',
        significance: 'league',
      },
      {
        matchId: 'match_006',
        date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        squadAScore: 0,
        squadBScore: 2,
        winner: 'Red Lions FC',
        significance: 'league',
        memorable: true,
      },
    ],
    stats: {
      played: 8,
      squadAWins: 5,
      squadBWins: 2,
      draws: 1,
      squadAGoals: 14,
      squadBGoals: 9,
    },
    intensity: 9,
    derbyBonuses: {
      winnerXPBoost: 0.5,
      loserXPPenalty: -0.1,
      reputationBonus: 500,
      fanEngagementBonus: 1000,
    },
  },
  {
    id: 'rivalry_002',
    squadA: 'Northside United',
    squadB: 'Sunday Legends',
    name: 'Weekend Warriors Clash',
    description: 'Friendly but competitive rivalry',
    history: [
      {
        matchId: 'match_002',
        date: new Date(Date.now() - 30 * 60 * 60 * 1000),
        squadAScore: 2,
        squadBScore: 2,
        significance: 'friendly',
      },
      {
        matchId: 'match_007',
        date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        squadAScore: 1,
        squadBScore: 3,
        winner: 'Sunday Legends',
        significance: 'friendly',
      },
    ],
    stats: {
      played: 3,
      squadAWins: 0,
      squadBWins: 1,
      draws: 2,
      squadAGoals: 5,
      squadBGoals: 7,
    },
    intensity: 5,
  },
];

/**
 * Default squad data
 */
export const MOCK_SQUAD: Squad = {
  id: 'squad_001',
  name: 'Northside United',
  shortName: 'NSU',
  founded: new Date('2020-09-01'),
  homeGround: 'Municipal Stadium',
  players: MOCK_SQUAD_PLAYERS.map((p, i) => ({
    ...p,
    squadNumber: i + 1,
    contract: {
      type: 'amateur',
      wage: 50 + i * 10,
      expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
    isCaptain: i === 0,
    isViceCaptain: i === 1,
  })),
  treasury: MOCK_TREASURY,
  tactics: {
    formation: '4-3-3',
    style: 'balanced',
    instructions: {
      width: 'normal',
      tempo: 'normal',
      passing: 'mixed',
      pressing: 'medium',
      defensiveLine: 'normal',
    },
    setPieces: {
      corners: 'near_post',
      freeKicks: 'cross',
      penalties: 'p1',
    },
  },
  reputation: 1250,
};

/**
 * Helper to calculate treasury income/expense totals
 */
export const calculateTreasuryTotals = (treasury: Treasury) => {
  const income = treasury.transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const expenses = treasury.transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  return { income, expenses, net: income - expenses };
};

/**
 * Helper to get rivalry head-to-head record
 */
export const getRivalryRecord = (rivalry: Rivalry, squadName: string): string => {
  const isSquadA = rivalry.squadA === squadName;
  const wins = isSquadA ? rivalry.stats.squadAWins : rivalry.stats.squadBWins;
  const losses = isSquadA ? rivalry.stats.squadBWins : rivalry.stats.squadAWins;
  const draws = rivalry.stats.draws;
  return `${wins}-${draws}-${losses}`;
};
