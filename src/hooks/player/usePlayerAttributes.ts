"use client";

import { useCallback } from 'react';
import { trpc } from '@/lib/trpc-client';
import { useWallet } from '@/contexts/WalletContext';
import { buildNextLevelXP, buildPlayerFormSnapshot } from '@/lib/player/season-summary';
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

  const achievements = Array.isArray(profile.achievements)
    ? profile.achievements.map((achievement: any) => ({
        ...achievement,
        dateEarned: achievement.dateEarned ? new Date(achievement.dateEarned) : undefined,
      }))
    : [];
  const rawHighlights = Array.isArray(profile.careerHighlights)
    ? profile.careerHighlights
    : Array.isArray(profile.highlights)
      ? profile.highlights
      : [];
  const careerHighlights = rawHighlights.map((highlight: any) => ({
        ...highlight,
        date: new Date(highlight.date),
      }));
  const formEntries = Array.isArray(profile.formHistory) ? profile.formHistory : [];
  const endorsements = Array.isArray(profile.endorsements)
    ? profile.endorsements.map((endorsement: any) => ({
        ...endorsement,
        date: new Date(endorsement.date),
      }))
    : [];
  const professionalInterest = Array.isArray(profile.professionalInterest)
    ? profile.professionalInterest.map((interest: any) => ({
        ...interest,
        date: new Date(interest.date),
      }))
    : [];

  return {
    address: profile.user?.walletAddress || profile.userId,
    playerName: profile.user?.name || 'Unnamed Player',
    position: (profile.user?.position as any) || 'MF',
    avatar: profile.user?.avatar || undefined,
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
        maxRating: a.maxRating,
        verified: true,
        lastUpdated: new Date(a.updatedAt),
        history: Array.isArray(a.history) ? a.history.slice(-5) : [],
      })),
    achievements,
    careerHighlights,
    xp: {
      totalXP: profile.totalXP,
      seasonXP: profile.seasonXP,
      nextLevelXP: buildNextLevelXP(profile.level),
      level: profile.level,
    },
    form: buildPlayerFormSnapshot(formEntries),
    endorsements,
    professionalInterest,
    scoutXP: profile.scoutXP || 0,
    scoutTier: profile.scoutTier || 'rookie',
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
