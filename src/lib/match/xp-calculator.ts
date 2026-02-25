/**
 * XP Calculator for Player Attributes
 * Determines XP gains from match performance
 */

import type { MatchResult, SkillRating, AttributeType } from '@/types';

// Base XP for different match outcomes
export const BASE_XP = {
  win: 100,
  draw: 50,
  loss: 25,
  goal: 50,
  assist: 40,
  cleanSheet: 75,
  appearance: 20,
};

// Multipliers based on match significance
export const MATCH_MULTIPLIERS = {
  league: 1.0,
  cup: 1.5,
  playoff: 2.0,
  derby: 1.75,
  friendly: 0.5,
};

// Position-based attribute weights
export const POSITION_ATTRIBUTE_WEIGHTS: Record<string, AttributeType[]> = {
  GK: ['gk_diving', 'gk_handling', 'gk_reflexes', 'gk_positioning', 'physical'],
  DF: ['defending', 'physical', 'passing', 'pace'],
  MF: ['passing', 'dribbling', 'physical', 'defending', 'pace'],
  ST: ['shooting', 'pace', 'physical', 'dribbling'],
  WG: ['dribbling', 'pace', 'shooting', 'passing'],
};

interface XPGainBreakdown {
  total: number;
  base: number;
  performance: number;
  team: number;
  byAttribute: Record<AttributeType, number>;
}

/**
 * Calculate XP gain for a player from a match
 */
export function calculateMatchXP(
  match: MatchResult,
  playerStats: {
    goals: number;
    assists: number;
    position: string;
    isCleanSheet: boolean;
    minutesPlayed: number;
    matchRating: number; // 1-10
  },
  matchType: keyof typeof MATCH_MULTIPLIERS = 'league'
): XPGainBreakdown {
  const multiplier = MATCH_MULTIPLIERS[matchType];
  
  // Base XP for appearance
  let baseXP = BASE_XP.appearance;
  
  // Team result XP
  const isWin = match.homeScore > match.awayScore;
  const isDraw = match.homeScore === match.awayScore;
  const teamXP = isWin ? BASE_XP.win : isDraw ? BASE_XP.draw : BASE_XP.loss;
  
  // Performance XP
  let performanceXP = 0;
  performanceXP += playerStats.goals * BASE_XP.goal;
  performanceXP += playerStats.assists * BASE_XP.assist;
  if (playerStats.isCleanSheet) performanceXP += BASE_XP.cleanSheet;
  
  // Match rating bonus (rating 7+ gives bonus)
  if (playerStats.matchRating >= 7) {
    performanceXP += (playerStats.matchRating - 6) * 10;
  }
  
  // Calculate attribute-specific XP
  const relevantAttributes = POSITION_ATTRIBUTE_WEIGHTS[playerStats.position] || 
    POSITION_ATTRIBUTE_WEIGHTS.MF;
  
  const byAttribute: Record<string, number> = {};
  const attributeXP = Math.floor((baseXP + teamXP + performanceXP) / relevantAttributes.length);
  
  for (const attr of relevantAttributes) {
    byAttribute[attr] = Math.floor(attributeXP * multiplier);
  }
  
  const total = Math.floor(
    (baseXP + teamXP + performanceXP) * multiplier
  );
  
  return {
    total,
    base: Math.floor(baseXP * multiplier),
    team: Math.floor(teamXP * multiplier),
    performance: Math.floor(performanceXP * multiplier),
    byAttribute: byAttribute as Record<AttributeType, number>,
  };
}

/**
 * Calculate XP needed for next attribute level
 * Uses exponential curve: each level requires more XP
 */
export function xpForNextLevel(currentRating: number): number {
  // FIFA-style: 0-99 rating system
  // Level 1 (rating 1) -> 50 XP
  // Level 50 (rating 50) -> 2500 XP
  // Level 99 (rating 99) -> 9800 XP
  return Math.floor(currentRating * currentRating * 0.5 + 50);
}

/**
 * Calculate new rating after gaining XP
 */
export function calculateNewRating(
  currentRating: number,
  currentXP: number,
  xpGained: number
): { newRating: number; newXP: number; levelsGained: number } {
  let rating = currentRating;
  let xp = currentXP + xpGained;
  let levelsGained = 0;
  
  const maxRating = 99;
  
  while (xp >= xpForNextLevel(rating) && rating < maxRating) {
    xp -= xpForNextLevel(rating);
    rating++;
    levelsGained++;
  }
  
  // Cap at max
  if (rating >= maxRating) {
    rating = maxRating;
    xp = 0;
  }
  
  return { newRating: rating, newXP: xp, levelsGained };
}

/**
 * Calculate form based on last 5 match ratings
 * Returns -5 to +5 (FIFA-style form arrows)
 */
export function calculateForm(matchRatings: number[]): {
  current: number;
  trend: 'up' | 'down' | 'stable';
} {
  if (matchRatings.length < 3) {
    return { current: 0, trend: 'stable' };
  }
  
  const recent = matchRatings.slice(-5);
  const average = recent.reduce((a, b) => a + b, 0) / recent.length;
  
  // Convert 1-10 rating to -5 to +5 form
  let form = Math.round((average - 5) * 1.25);
  form = Math.max(-5, Math.min(5, form));
  
  // Determine trend
  let trend: 'up' | 'down' | 'stable' = 'stable';
  if (recent.length >= 2) {
    const lastTwo = recent.slice(-2);
    const diff = lastTwo[1] - lastTwo[0];
    if (diff > 0.5) trend = 'up';
    else if (diff < -0.5) trend = 'down';
  }
  
  return { current: form, trend };
}

/**
 * Get form arrow display
 */
export function getFormArrow(form: number): string {
  if (form >= 4) return '↑↑';
  if (form >= 2) return '↑';
  if (form >= 1) return '↗';
  if (form === 0) return '→';
  if (form >= -1) return '↘';
  if (form >= -3) return '↓';
  return '↓↓';
}

/**
 * Get form color
 */
export function getFormColor(form: number): string {
  if (form >= 3) return 'text-green-600';
  if (form >= 1) return 'text-green-500';
  if (form === 0) return 'text-gray-500';
  if (form >= -2) return 'text-yellow-500';
  return 'text-red-500';
}

/**
 * Calculate derby bonus XP
 */
export function calculateDerbyBonus(
  baseXP: number,
  isWinner: boolean,
  isRivalryMatch: boolean
): number {
  if (!isRivalryMatch) return 0;
  
  // Winner gets 50% bonus, loser gets 10% bonus (for participating)
  const multiplier = isWinner ? 0.5 : 0.1;
  return Math.floor(baseXP * multiplier);
}
