/**
 * SportWarren Calculation Utilities
 * Math, ratings, XP, and form calculations
 */

import type { SkillRating, PlayerPosition } from '@/types';
import { BASE_XP, POSITION_ATTRIBUTE_WEIGHTS } from '../match/constants';

// ============================================================================
// RATING CALCULATIONS
// ============================================================================

/**
 * Calculate overall rating from skills (FIFA-style average)
 */
export function calculateOverallRating(skills: SkillRating[]): number {
  if (skills.length === 0) return 0;
  const total = skills.reduce((sum, skill) => sum + skill.rating, 0);
  return Math.round(total / skills.length);
}

/**
 * Calculate weighted overall rating based on position
 */
export function calculatePositionRating(
  skills: SkillRating[],
  position: string
): number {
  const positionKey = position as PlayerPosition;
  const weights = POSITION_ATTRIBUTE_WEIGHTS[positionKey] || POSITION_ATTRIBUTE_WEIGHTS.MF;

  let totalWeight = 0;
  let weightedSum = 0;

  skills.forEach((skill) => {
    // weights is an array of relevant AttributeTypes for this position
    // If the skill is in the relevant list, give it weight 1.5, otherwise 1.0
    const isRelevant = weights.includes(skill.skill);
    const weight = isRelevant ? 1.5 : 1;
    weightedSum += skill.rating * weight;
    totalWeight += weight;
  });

  return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
}

/**
 * Get top N attributes from skills array
 */
export function getTopAttributes(skills: SkillRating[], count: number = 3): SkillRating[] {
  return [...skills].sort((a, b) => b.rating - a.rating).slice(0, count);
}

/**
 * Detect position from top attributes
 */
export function detectPositionFromSkills(skills: SkillRating[]): string {
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
}

// ============================================================================
// XP CALCULATIONS
// ============================================================================

interface MatchStats {
  goals?: number;
  assists?: number;
  cleanSheet?: boolean;
  rating?: number;
  minutesPlayed?: number;
}

interface XPBreakdown {
  total: number;
  breakdown: Array<{ source: string; xp: number }>;
}

/**
 * Calculate XP gain from a match
 */
export function calculateMatchXP(
  stats: MatchStats,
  _matchType: 'league' | 'cup' | 'friendly' | 'playoff' | 'derby' = 'league',
  isWinner: boolean = false
): XPBreakdown {
  const breakdown: Array<{ source: string; xp: number }> = [];

  // Base XP for appearance
  breakdown.push({ source: 'Appearance', xp: BASE_XP.appearance });

  // Goals
  if (stats.goals) {
    breakdown.push({ source: 'Goals', xp: stats.goals * BASE_XP.goal });
  }

  // Assists
  if (stats.assists) {
    breakdown.push({ source: 'Assists', xp: stats.assists * BASE_XP.assist });
  }

  // Clean sheet
  if (stats.cleanSheet) {
    breakdown.push({ source: 'Clean Sheet', xp: BASE_XP.cleanSheet });
  }

  // Win bonus
  if (isWinner) {
    breakdown.push({ source: 'Win Bonus', xp: BASE_XP.win });
  }

  // Hat trick bonus
  if (stats.goals && stats.goals >= 3) {
    breakdown.push({ source: 'Hat Trick!', xp: BASE_XP.hat_trick });
  }

  // Man of the match
  if (stats.rating && stats.rating >= 9) {
    breakdown.push({ source: 'Man of the Match', xp: BASE_XP.man_of_match });
  }

  const total = breakdown.reduce((sum, item) => sum + item.xp, 0);

  return { total, breakdown };
}

/**
 * Calculate XP needed for next level
 */
export function xpForNextLevel(currentRating: number): number {
  // Quadratic curve: higher ratings need more XP
  return Math.floor(100 * Math.pow(currentRating / 10, 1.5));
}

/**
 * Calculate new rating after gaining XP
 */
export function calculateNewRating(
  currentRating: number,
  currentXP: number,
  xpGained: number
): { newRating: number; newXP: number; levelsGained: number } {
  let newRating = currentRating;
  let newXP = currentXP + xpGained;
  let levelsGained = 0;

  // Check for level ups
  while (newXP >= xpForNextLevel(newRating)) {
    newXP -= xpForNextLevel(newRating);
    newRating++;
    levelsGained++;
  }

  return { newRating, newXP, levelsGained };
}

/**
 * Calculate attribute progress percentage
 */
export function calculateAttributeProgress(
  currentXP: number,
  currentRating: number
): number {
  const required = xpForNextLevel(currentRating);
  return Math.min(100, Math.round((currentXP / required) * 100));
}

// ============================================================================
// FORM CALCULATIONS
// ============================================================================

/**
 * Calculate FIFA-style form (-5 to +5) from last 5 match ratings
 */
export function calculateForm(matchRatings: number[]): number {
  if (matchRatings.length === 0) return 0;

  const recent = matchRatings.slice(-5);
  const average = recent.reduce((a, b) => a + b, 0) / recent.length;

  // Convert 1-10 rating to -5 to +5 form
  if (average >= 9) return 5;
  if (average >= 8) return 4;
  if (average >= 7.5) return 3;
  if (average >= 7) return 2;
  if (average >= 6.5) return 1;
  if (average >= 5.5) return 0;
  if (average >= 5) return -1;
  if (average >= 4.5) return -2;
  if (average >= 4) return -3;
  if (average >= 3) return -4;
  return -5;
}

/**
 * Get form trend direction
 */
export function getFormTrend(ratings: number[]): 'up' | 'down' | 'stable' {
  if (ratings.length < 2) return 'stable';

  const recent = ratings.slice(-3);
  const older = ratings.slice(-6, -3);

  if (older.length === 0) return 'stable';

  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;

  const diff = recentAvg - olderAvg;

  if (diff > 0.5) return 'up';
  if (diff < -0.5) return 'down';
  return 'stable';
}

// ============================================================================
// DERBY/RIVALRY CALCULATIONS
// ============================================================================

/**
 * Calculate derby match XP bonus
 */
export function calculateDerbyBonus(
  baseXP: number,
  isWinner: boolean,
  isRivalryMatch: boolean
): { bonusXP: number; multiplier: number } {
  if (!isRivalryMatch) return { bonusXP: 0, multiplier: 1 };

  const multiplier = isWinner ? 1.5 : 0.9;
  const bonusXP = Math.round(baseXP * (multiplier - 1));

  return { bonusXP, multiplier };
}

// ============================================================================
// TREASURY CALCULATIONS
// ============================================================================

interface Transaction {
  type: 'income' | 'expense';
  amount: number;
  timestamp: Date;
}

/**
 * Calculate treasury totals
 */
export function calculateTreasuryTotals(transactions: Transaction[]): {
  income: number;
  expenses: number;
  net: number;
} {
  const income = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return { income, expenses, net: income - expenses };
}

/**
 * Calculate monthly income
 */
export function calculateMonthlyIncome(transactions: Transaction[]): number {
  const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  return transactions
    .filter((t) => t.type === 'income' && t.timestamp > oneMonthAgo)
    .reduce((sum, t) => sum + t.amount, 0);
}
// ============================================================================
// VALUATION & REPUTATION CALCULATIONS
// ============================================================================

/**
 * Get reputation multiplier for market valuation
 */
export function getReputationMultiplier(tier: 'bronze' | 'silver' | 'gold' | 'platinum'): number {
  switch (tier) {
    case 'platinum': return 5.0;
    case 'gold': return 2.5;
    case 'silver': return 1.5;
    default: return 1.0;
  }
}

/**
 * Calculate market valuation based on stats, reputation, and age
 */
export function calculateMarketValuation(params: {
  overall: number;
  reputationTier: 'bronze' | 'silver' | 'gold' | 'platinum';
  age: number;
  form?: number;
}): number {
  // Base value scales exponentially with OVR
  const baseValue = Math.pow(params.overall / 50, 4) * 1000;

  // Reputation is a huge multiplier in the SportWarren ecosystem
  const repMultiplier = getReputationMultiplier(params.reputationTier);

  // Age factor: peak is 23-27. Young prospects have higher valuation due to potential.
  let ageFactor = 1.0;
  if (params.age < 21) ageFactor = 1.4; // Wonderkid bonus
  else if (params.age > 30) ageFactor = 0.7; // Veteran discount

  // Form factor (-5 to +5)
  const formFactor = params.form ? 1 + (params.form * 0.05) : 1.0;

  return Math.round(baseValue * repMultiplier * ageFactor * formFactor);
}
