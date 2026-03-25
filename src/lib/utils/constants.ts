/**
 * SportWarren Constants
 * Centralized display names, mappings, and constants
 */

import type { AttributeType, PlayerPosition, TrustTier } from '@/types';

// ============================================================================
// ATTRIBUTE MAPPINGS
// ============================================================================

export const ATTRIBUTE_NAMES: Record<AttributeType, string> = {
  pace: 'Pace',
  shooting: 'Shooting',
  passing: 'Passing',
  dribbling: 'Dribbling',
  defending: 'Defending',
  physical: 'Physical',
  gk_diving: 'GK Diving',
  gk_handling: 'GK Handling',
  gk_kicking: 'GK Kicking',
  gk_reflexes: 'GK Reflexes',
  gk_speed: 'GK Speed',
  gk_positioning: 'GK Positioning',
};

export const ATTRIBUTE_ICONS: Record<AttributeType, string> = {
  pace: '⚡',
  shooting: '🎯',
  passing: '👟',
  dribbling: '🎩',
  defending: '🛡️',
  physical: '💪',
  gk_diving: '🥅',
  gk_handling: '🧤',
  gk_kicking: '🦶',
  gk_reflexes: '⚡',
  gk_speed: '🏃',
  gk_positioning: '📍',
};

// ============================================================================
// POSITION MAPPINGS
// ============================================================================

export const POSITION_NAMES: Record<PlayerPosition, string> = {
  GK: 'Goalkeeper',
  DF: 'Defender',
  MF: 'Midfielder',
  ST: 'Striker',
  WG: 'Winger',
};

export const POSITION_COLORS: Record<PlayerPosition, string> = {
  GK: 'bg-yellow-100 text-yellow-800',
  DF: 'bg-blue-100 text-blue-800',
  MF: 'bg-green-100 text-green-800',
  ST: 'bg-red-100 text-red-800',
  WG: 'bg-purple-100 text-purple-800',
};

// ============================================================================
// TRUST TIER MAPPINGS
// ============================================================================

export const TRUST_TIER_WEIGHTS: Record<TrustTier, number> = {
  bronze: 10,
  silver: 25,
  gold: 40,
  platinum: 60,
};

export const TRUST_TIER_NAMES: Record<TrustTier, string> = {
  bronze: 'Bronze',
  silver: 'Silver',
  gold: 'Gold',
  platinum: 'Platinum',
};

export const TRUST_TIER_ICONS: Record<TrustTier, string> = {
  platinum: '💎',
  gold: '🥇',
  silver: '🥈',
  bronze: '🥉',
};

// ============================================================================
// FORM MAPPINGS
// ============================================================================

export const FORM_ARROWS: Record<number, string> = {
  5: '↑↑',
  4: '↑',
  3: '↑',
  2: '→',
  1: '→',
  0: '→',
  [-1]: '→',
  [-2]: '↓',
  [-3]: '↓',
  [-4]: '↓',
  [-5]: '↓↓',
};

export const FORM_LABELS: Record<number, string> = {
  5: 'Exceptional',
  4: 'Great',
  3: 'Good',
  2: 'Stable',
  1: 'Stable',
  0: 'Average',
  [-1]: 'Average',
  [-2]: 'Below Average',
  [-3]: 'Poor',
  [-4]: 'Poor',
  [-5]: 'Very Poor',
};

// ============================================================================
// RARITY MAPPINGS
// ============================================================================

export const RARITY_NAMES: Record<string, string> = {
  common: 'Common',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
};

export const RARITY_ORDER = ['common', 'rare', 'epic', 'legendary'] as const;

// ============================================================================
// XP CALCULATION CONSTANTS
// ============================================================================

export const BASE_XP = {
  goal: 50,
  assist: 30,
  clean_sheet: 40,
  win: 25,
  draw: 10,
  loss: 5,
  appearance: 10,
  man_of_match: 100,
  hat_trick: 150,
};

export const MATCH_MULTIPLIERS = {
  league: 1.0,
  cup: 1.2,
  friendly: 0.8,
  playoff: 1.5,
  derby: 1.5,
};

export const POSITION_ATTRIBUTE_WEIGHTS: Record<string, Partial<Record<AttributeType, number>>> = {
  ST: { shooting: 1.5, pace: 1.3, physical: 1.2, dribbling: 1.1, passing: 0.8, defending: 0.3 },
  MF: { passing: 1.5, dribbling: 1.3, pace: 1.1, physical: 1.0, shooting: 0.9, defending: 0.7 },
  DF: { defending: 1.5, physical: 1.4, pace: 1.1, passing: 0.9, dribbling: 0.6, shooting: 0.3 },
  GK: { gk_diving: 1.5, gk_reflexes: 1.4, gk_positioning: 1.3, gk_handling: 1.2, gk_kicking: 0.9, gk_speed: 0.7 },
  WG: { pace: 1.5, dribbling: 1.4, passing: 1.2, shooting: 1.1, physical: 0.8, defending: 0.3 },
};

// ============================================================================
// VERIFICATION CONSTANTS
// ============================================================================

export const VERIFICATION_THRESHOLDS = {
  autoVerify: 75,
  reviewRequired: 30,
  minVerifications: 3,
  reputationThreshold: 50,
};

// ============================================================================
// TRANSACTION CATEGORY LABELS
// ============================================================================

export const TRANSACTION_CATEGORY_LABELS: Record<string, string> = {
  match_fee: 'Match Fee',
  sponsor: 'Sponsorship',
  prize: 'Prize Money',
  transfer_in: 'Player Sale',
  wages: 'Player Wages',
  transfer_out: 'Player Purchase',
  facility: 'Facility Cost',
};

// ============================================================================
// CHALLENGE TYPE LABELS
// ============================================================================

export const CHALLENGE_TYPE_LABELS: Record<string, string> = {
  goal_scoring: 'Goal Scoring',
  playmaking: 'Playmaking',
  defensive: 'Defensive',
  consistency: 'Consistency',
  special: 'Special',
};
