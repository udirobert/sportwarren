/**
 * Sharpness Streak System
 * Tracks weekly activity streaks and provides decay visibility.
 * A "streak week" counts if the player had at least one match or training
 * session within a 7-day window.
 */

import { FITNESS_CONSTANTS } from '../match/constants';

export interface StreakState {
  currentStreak: number;
  longestStreak: number;
  sharpness: number;
  sharpnessLabel: string;
  sharpnessColor: string;
  decayWarning: string | null;
  daysUntilDecay: number;
  streakTier: StreakTier;
  nextMilestone: number;
  xpBonus: number;
}

export type StreakTier = 'cold' | 'warming' | 'hot' | 'on_fire' | 'unstoppable';

const STREAK_TIERS: Record<StreakTier, { min: number; label: string; color: string; xpBonus: number }> = {
  cold:        { min: 0,  label: 'Cold',        color: 'text-gray-400',   xpBonus: 0 },
  warming:     { min: 2,  label: 'Warming Up',  color: 'text-yellow-500', xpBonus: 5 },
  hot:         { min: 4,  label: 'Hot',         color: 'text-orange-500', xpBonus: 10 },
  on_fire:     { min: 8,  label: 'On Fire',     color: 'text-red-500',    xpBonus: 20 },
  unstoppable: { min: 12, label: 'Unstoppable', color: 'text-purple-600', xpBonus: 30 },
};

const STREAK_MILESTONES = [2, 4, 8, 12, 20, 30, 52];

export function getStreakTier(weeks: number): StreakTier {
  if (weeks >= 12) return 'unstoppable';
  if (weeks >= 8)  return 'on_fire';
  if (weeks >= 4)  return 'hot';
  if (weeks >= 2)  return 'warming';
  return 'cold';
}

export function getStreakXPBonus(weeks: number): number {
  const tier = getStreakTier(weeks);
  return STREAK_TIERS[tier].xpBonus;
}

export function getNextMilestone(current: number): number {
  for (const m of STREAK_MILESTONES) {
    if (m > current) return m;
  }
  return current + 10;
}

export function computeStreakState(
  lastActivityDate: Date | null,
  currentStreak: number,
  longestStreak: number,
  sharpness: number,
): StreakState {
  const now = new Date();
  const daysSinceActivity = lastActivityDate
    ? Math.floor((now.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24))
    : 999;

  const daysUntilDecay = Math.max(0, 7 - daysSinceActivity);
  const tier = getStreakTier(currentStreak);
  const tierInfo = STREAK_TIERS[tier];

  let decayWarning: string | null = null;
  if (daysUntilDecay <= 2 && daysUntilDecay > 0) {
    decayWarning = `Play within ${daysUntilDecay} day${daysUntilDecay > 1 ? 's' : ''} to keep your streak!`;
  } else if (daysUntilDecay === 0 && currentStreak > 0) {
    decayWarning = 'Streak at risk! Play today to stay sharp.';
  }

  let sharpnessLabel: string;
  let sharpnessColor: string;
  if (sharpness >= FITNESS_CONSTANTS.THRESHOLDS.ELITE) {
    sharpnessLabel = 'Match Fit';
    sharpnessColor = 'text-green-600';
  } else if (sharpness >= FITNESS_CONSTANTS.THRESHOLDS.FIT) {
    sharpnessLabel = 'Fit';
    sharpnessColor = 'text-green-500';
  } else if (sharpness >= FITNESS_CONSTANTS.THRESHOLDS.TIRED) {
    sharpnessLabel = 'Rusty';
    sharpnessColor = 'text-yellow-500';
  } else {
    sharpnessLabel = 'Cold';
    sharpnessColor = 'text-red-500';
  }

  return {
    currentStreak,
    longestStreak,
    sharpness,
    sharpnessLabel,
    sharpnessColor,
    decayWarning,
    daysUntilDecay,
    streakTier: tier,
    nextMilestone: getNextMilestone(currentStreak),
    xpBonus: tierInfo.xpBonus,
  };
}
