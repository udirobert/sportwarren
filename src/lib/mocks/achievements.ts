/**
 * Achievement Mock Data - Single Source of Truth
 * Consolidated from:
 * - src/legacy-pages/Achievements.tsx (hardcoded achievements)
 * - src/components/player/XPGainPopup.tsx (MOCK_NOTIFICATIONS)
 */

import type { Achievement } from '@/types';

/**
 * Achievement categories with their metadata
 */
export const ACHIEVEMENT_CATEGORIES = {
  goals: {
    name: 'Goal Scoring',
    icon: 'target',
    color: 'green',
  },
  assists: {
    name: 'Playmaking',
    icon: 'users',
    color: 'blue',
  },
  matches: {
    name: 'Consistency',
    icon: 'trophy',
    color: 'orange',
  },
  special: {
    name: 'Special',
    icon: 'star',
    color: 'purple',
  },
};

/**
 * All available achievements in the system
 */
export const ALL_ACHIEVEMENTS: Achievement[] = [
  // Goal Scoring Achievements
  {
    id: 'ach_goal_001',
    title: 'First Blood',
    description: 'Score your first goal',
    dateEarned: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
    rarity: 'common',
    verified: true,
    icon: 'target',
  },
  {
    id: 'ach_goal_002',
    title: 'Hat-trick Hero',
    description: 'Score 3 goals in a single match',
    dateEarned: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    rarity: 'rare',
    verified: true,
    icon: 'target',
  },
  {
    id: 'ach_goal_003',
    title: 'Goal Machine',
    description: 'Score 20 goals in a season',
    dateEarned: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    rarity: 'epic',
    verified: true,
    icon: 'target',
  },
  {
    id: 'ach_goal_004',
    title: 'Century Club',
    description: 'Score 100 career goals',
    rarity: 'legendary',
    verified: false,
    icon: 'target',
  },
  
  // Playmaking Achievements
  {
    id: 'ach_assist_001',
    title: 'Provider',
    description: 'Get your first assist',
    dateEarned: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000),
    rarity: 'common',
    verified: true,
    icon: 'users',
  },
  {
    id: 'ach_assist_002',
    title: 'Assist King',
    description: 'Provide 10 assists in a season',
    dateEarned: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    rarity: 'epic',
    verified: true,
    icon: 'users',
  },
  {
    id: 'ach_assist_003',
    title: 'Playmaker',
    description: 'Get 5 assists in a single match',
    rarity: 'legendary',
    verified: false,
    icon: 'users',
  },
  
  // Consistency Achievements
  {
    id: 'ach_match_001',
    title: 'Debut',
    description: 'Play your first match',
    dateEarned: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000),
    rarity: 'common',
    verified: true,
    icon: 'trophy',
  },
  {
    id: 'ach_match_002',
    title: 'Regular',
    description: 'Play 10 matches',
    dateEarned: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000),
    rarity: 'common',
    verified: true,
    icon: 'trophy',
  },
  {
    id: 'ach_match_003',
    title: 'Veteran',
    description: 'Play 50 matches',
    dateEarned: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    rarity: 'rare',
    verified: true,
    icon: 'trophy',
  },
  {
    id: 'ach_match_004',
    title: 'Iron Man',
    description: 'Play every match in a season',
    rarity: 'epic',
    verified: false,
    icon: 'trophy',
  },
  
  // Special Achievements
  {
    id: 'ach_special_001',
    title: 'Derby Hero',
    description: 'Score in a derby match',
    dateEarned: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    rarity: 'rare',
    verified: true,
    icon: 'star',
  },
  {
    id: 'ach_special_002',
    title: 'Clean Sheet',
    description: 'Keep a clean sheet as goalkeeper',
    rarity: 'common',
    verified: false,
    icon: 'star',
  },
  {
    id: 'ach_special_003',
    title: 'Perfect 10',
    description: 'Get a 10.0 match rating',
    rarity: 'legendary',
    verified: false,
    icon: 'star',
  },
  {
    id: 'ach_special_004',
    title: 'Verified Legend',
    description: 'Get 50 matches verified on-chain',
    rarity: 'epic',
    verified: false,
    icon: 'star',
  },
];

/**
 * Mock notifications for XP gain popup
 */
export interface XPNotification {
  id: string;
  type: 'level_up' | 'achievement' | 'bonus';
  title: string;
  message: string;
  xp?: number;
  timestamp: Date;
  read: boolean;
}

export const MOCK_NOTIFICATIONS: XPNotification[] = [
  {
    id: 'notif_001',
    type: 'level_up',
    title: 'Level Up!',
    message: 'You reached Level 13!',
    xp: 0,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: false,
  },
  {
    id: 'notif_002',
    type: 'achievement',
    title: 'Achievement Unlocked',
    message: 'Hat-trick Hero: Score 3 goals in a single match',
    xp: 500,
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    read: true,
  },
  {
    id: 'notif_003',
    type: 'bonus',
    title: 'Derby Bonus',
    message: 'Won the Northside Derby! +50% XP',
    xp: 200,
    timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    read: true,
  },
];

/**
 * Helper to get achievements by rarity
 */
export const getAchievementsByRarity = (rarity: Achievement['rarity']) =>
  ALL_ACHIEVEMENTS.filter((a) => a.rarity === rarity);

/**
 * Helper to get earned achievements
 */
export const getEarnedAchievements = () =>
  ALL_ACHIEVEMENTS.filter((a) => a.verified);

/**
 * Helper to get achievement progress
 */
export const getAchievementProgress = (): {
  total: number;
  earned: number;
  percentage: number;
  byRarity: Record<Achievement['rarity'], { total: number; earned: number }>;
} => {
  const earned = getEarnedAchievements();
  const byRarity = {
    common: { total: 0, earned: 0 },
    rare: { total: 0, earned: 0 },
    epic: { total: 0, earned: 0 },
    legendary: { total: 0, earned: 0 },
  };

  ALL_ACHIEVEMENTS.forEach((a) => {
    byRarity[a.rarity].total++;
    if (a.verified) {
      byRarity[a.rarity].earned++;
    }
  });

  return {
    total: ALL_ACHIEVEMENTS.length,
    earned: earned.length,
    percentage: Math.round((earned.length / ALL_ACHIEVEMENTS.length) * 100),
    byRarity,
  };
};

/**
 * Rarity colors for UI
 */
export const RARITY_COLORS: Record<Achievement['rarity'], { bg: string; text: string; border: string }> = {
  common: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' },
  rare: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
  epic: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300' },
  legendary: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' },
};
