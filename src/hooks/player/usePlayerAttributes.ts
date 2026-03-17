"use client";

import { useCallback } from 'react';
import { trpc } from '@/lib/trpc-client';
import { useWallet } from '@/contexts/WalletContext';
import type { PlayerAttributes, AttributeType } from '@/types';

interface UsePlayerAttributesReturn {
  attributes: PlayerAttributes | null;
  loading: boolean;
  error: string | null;
  refreshAttributes: () => Promise<void>;
  getAttributeProgress: (attribute: AttributeType) => { current: number; next: number; percentage: number } | null;
}

// Transform DB profile to frontend type
function transformProfile(profile: any): PlayerAttributes {
  const attributeMap: Record<string, AttributeType> = {
    'pace': 'pace',
    'shooting': 'shooting',
    'passing': 'passing',
    'dribbling': 'dribbling',
    'defending': 'defending',
    'physical': 'physical',
  };

  return {
    address: profile.userId,
    playerName: profile.user?.name || 'Unknown',
    position: (profile.user?.position as any) || 'MF',
    totalMatches: profile.totalMatches,
    totalGoals: profile.totalGoals,
    totalAssists: profile.totalAssists,
    reputationScore: profile.reputationScore,
    verifiedStats: true,
    skills: profile.attributes
      .filter((a: any) => attributeMap[a.attribute])
      .map((a: any) => ({
        skill: attributeMap[a.attribute],
        rating: a.rating,
        xp: a.xp,
        xpToNextLevel: a.xpToNext,
        lastUpdated: new Date(a.updatedAt),
        history: a.history.slice(-5),
      })),
    achievements: profile.achievements?.length > 0 ? profile.achievements : [
      // Mock achievements for new users - shows potential progression
      { id: 'first-match', name: 'First Steps', description: 'Play your first verified match', icon: '⚽', unlockedAt: null },
      { id: 'goal-scorer', name: 'Goal Getter', description: 'Score your first goal', icon: '🎯', unlockedAt: null },
      { id: 'team-player', name: 'Team Player', description: 'Provide your first assist', icon: '🤝', unlockedAt: null },
      { id: 'consistent', name: 'Consistent Performer', description: 'Play 5 matches in a season', icon: '📊', unlockedAt: null },
      { id: 'leader', name: 'Captain Material', description: 'Lead your squad to victory', icon: '👑', unlockedAt: null },
    ],
    careerHighlights: profile.highlights?.length > 0 ? profile.highlights : [
      // Mock career highlights - placeholder for future accomplishments
      // { type: 'debut', description: 'First match for Hackney Marshes FC', date: new Date() },
      // { type: 'motm', description: 'Man of the Match performance', date: new Date() },
    ],
    xp: {
      totalXP: profile.totalXP,
      seasonXP: profile.seasonXP,
      nextLevelXP: profile.level * 1000,
      level: profile.level,
    },
    form: {
      current: 0, // TODO: Calculate from form_entries
      history: [],
      trend: 'stable',
    },
  };
}

export function usePlayerAttributes(userId?: string): UsePlayerAttributesReturn {
  const { 
    data: profile, 
    isLoading, 
    error, 
    refetch 
  } = trpc.player.getProfile.useQuery(
    { userId: userId || '' },
    {
      enabled: !!userId,
      staleTime: 30 * 1000, // 30 seconds
    }
  );

  const attributes = profile ? transformProfile(profile) : null;

  const getAttributeProgress = useCallback((attribute: AttributeType) => {
    if (!profile) return null;

    const attr = profile.attributes.find((a: any) => a.attribute === attribute);
    if (!attr) return null;

    return {
      current: attr.xp,
      next: attr.xpToNext,
      percentage: (attr.xp / attr.xpToNext) * 100,
    };
  }, [profile]);

  const refreshAttributes = useCallback(async () => {
    await refetch();
  }, [refetch]);

  return {
    attributes,
    loading: isLoading,
    error: error?.message || null,
    refreshAttributes,
    getAttributeProgress,
  };
}

export function useCurrentPlayerAttributes(enabled: boolean = true): UsePlayerAttributesReturn {
  const { isVerified } = useWallet();
  const {
    data: profile,
    isLoading,
    error,
    refetch
  } = trpc.player.getCurrentProfile.useQuery(undefined, {
    enabled: enabled && isVerified,
    retry: false,
    staleTime: 30 * 1000,
  });

  const attributes = profile ? transformProfile(profile) : null;

  const getAttributeProgress = useCallback((attribute: AttributeType) => {
    if (!profile) return null;

    const attr = profile.attributes.find((a: any) => a.attribute === attribute);
    if (!attr) return null;

    return {
      current: attr.xp,
      next: attr.xpToNext,
      percentage: (attr.xp / attr.xpToNext) * 100,
    };
  }, [profile]);

  const refreshAttributes = useCallback(async () => {
    await refetch();
  }, [refetch]);

  return {
    attributes,
    loading: isLoading,
    error: error?.message || null,
    refreshAttributes,
    getAttributeProgress,
  };
}

// Hook for player form
export function usePlayerForm(userId?: string, limit: number = 5) {
  const { data, isLoading, error } = trpc.player.getForm.useQuery(
    { userId: userId || '', limit },
    {
      enabled: !!userId,
      staleTime: 60 * 1000,
    }
  );

  return {
    form: data?.map((entry: any) => ({
      matchId: entry.matchId,
      rating: entry.rating,
      formValue: entry.formValue,
      date: new Date(entry.createdAt),
    })) || [],
    loading: isLoading,
    error: error?.message || null,
  };
}

// Hook for leaderboard
export function useLeaderboard(
  type: 'overall' | 'attribute' | 'goals' | 'assists' | 'matches' = 'overall',
  attribute?: AttributeType,
  limit: number = 10
) {
  const { data, isLoading, error } = trpc.player.getLeaderboard.useQuery(
    { type, attribute, limit },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  return {
    leaderboard: data || [],
    loading: isLoading,
    error: error?.message || null,
  };
}
