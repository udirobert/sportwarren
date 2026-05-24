/**
 * Seasonal Prestige System
 * At the end of each season, players can "prestige" to reset their level
 * while keeping permanent cosmetic rewards and stat history.
 */

export interface PrestigeTier {
  level: number;
  name: string;
  color: string;
  borderColor: string;
  minTotalXP: number;
  perks: string[];
}

export const PRESTIGE_TIERS: PrestigeTier[] = [
  {
    level: 0,
    name: 'Rookie',
    color: 'text-gray-500',
    borderColor: 'border-gray-300',
    minTotalXP: 0,
    perks: [],
  },
  {
    level: 1,
    name: 'Bronze',
    color: 'text-amber-700',
    borderColor: 'border-amber-600',
    minTotalXP: 5000,
    perks: ['Bronze nameplate', 'Season 1 badge'],
  },
  {
    level: 2,
    name: 'Silver',
    color: 'text-gray-400',
    borderColor: 'border-gray-400',
    minTotalXP: 15000,
    perks: ['Silver nameplate', 'Exclusive avatar frame', 'Season history access'],
  },
  {
    level: 3,
    name: 'Gold',
    color: 'text-yellow-500',
    borderColor: 'border-yellow-500',
    minTotalXP: 35000,
    perks: ['Gold nameplate', 'Animated avatar frame', 'Custom match card theme'],
  },
  {
    level: 4,
    name: 'Diamond',
    color: 'text-cyan-400',
    borderColor: 'border-cyan-400',
    minTotalXP: 75000,
    perks: ['Diamond nameplate', 'Unique particle effects', 'Hall of Legends entry'],
  },
  {
    level: 5,
    name: 'Legend',
    color: 'text-purple-500',
    borderColor: 'border-purple-500',
    minTotalXP: 150000,
    perks: ['Legendary nameplate', 'Custom goal celebration', 'Permanent leaderboard star'],
  },
];

export function getPrestigeTier(totalLifetimeXP: number): PrestigeTier {
  let tier = PRESTIGE_TIERS[0];
  for (const t of PRESTIGE_TIERS) {
    if (totalLifetimeXP >= t.minTotalXP) {
      tier = t;
    }
  }
  return tier;
}

export function getNextPrestigeTier(totalLifetimeXP: number): PrestigeTier | null {
  const current = getPrestigeTier(totalLifetimeXP);
  const idx = PRESTIGE_TIERS.indexOf(current);
  if (idx < PRESTIGE_TIERS.length - 1) {
    return PRESTIGE_TIERS[idx + 1];
  }
  return null;
}

export function getPrestigeProgress(totalLifetimeXP: number): {
  tier: PrestigeTier;
  nextTier: PrestigeTier | null;
  progress: number;
  xpToNext: number;
} {
  const tier = getPrestigeTier(totalLifetimeXP);
  const nextTier = getNextPrestigeTier(totalLifetimeXP);

  if (!nextTier) {
    return { tier, nextTier: null, progress: 100, xpToNext: 0 };
  }

  const range = nextTier.minTotalXP - tier.minTotalXP;
  const earned = totalLifetimeXP - tier.minTotalXP;
  const progress = Math.min(100, Math.round((earned / range) * 100));
  const xpToNext = nextTier.minTotalXP - totalLifetimeXP;

  return { tier, nextTier, progress, xpToNext };
}

export interface SeasonSummary {
  seasonNumber: number;
  startDate: string;
  endDate: string;
  totalXP: number;
  matchesPlayed: number;
  goals: number;
  assists: number;
  prestigeEarned: number;
  topAchievement: string;
}
