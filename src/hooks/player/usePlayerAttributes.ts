"use client";

import { useState, useCallback, useEffect } from 'react';
import type { PlayerAttributes, SkillRating, AttributeType, Achievement, CareerHighlight } from '@/types';
import { calculateNewRating, xpForNextLevel } from '@/lib/match/xp-calculator';

interface UsePlayerAttributesReturn {
  attributes: PlayerAttributes | null;
  loading: boolean;
  error: string | null;
  updateAttribute: (attribute: AttributeType, xpGained: number) => void;
  refreshAttributes: () => Promise<void>;
  getAttributeProgress: (attribute: AttributeType) => { current: number; next: number; percentage: number } | null;
}

export function usePlayerAttributes(playerAddress?: string): UsePlayerAttributesReturn {
  const [attributes, setAttributes] = useState<PlayerAttributes | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshAttributes = useCallback(async () => {
    if (!playerAddress) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/player/${playerAddress}/attributes`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch player attributes');
      }

      const data = await response.json();
      setAttributes(data);
    } catch (err) {
      console.error('Error fetching player attributes:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch attributes');
      setAttributes(null);
    } finally {
      setLoading(false);
    }
  }, [playerAddress]);

  const updateAttribute = useCallback((attribute: AttributeType, xpGained: number) => {
    setAttributes(prev => {
      if (!prev) return null;

      const skillIndex = prev.skills.findIndex(s => s.skill === attribute);
      if (skillIndex === -1) return prev;

      const skill = prev.skills[skillIndex];
      const { newRating, newXP, levelsGained } = calculateNewRating(
        skill.rating,
        skill.xp,
        xpGained
      );

      const updatedSkills = [...prev.skills];
      updatedSkills[skillIndex] = {
        ...skill,
        rating: newRating,
        xp: newXP,
        xpToNextLevel: xpForNextLevel(newRating),
        lastUpdated: new Date(),
        history: [...skill.history.slice(-4), newRating],
      };

      return {
        ...prev,
        skills: updatedSkills,
        xp: {
          ...prev.xp,
          totalXP: prev.xp.totalXP + xpGained,
          seasonXP: prev.xp.seasonXP + xpGained,
        },
      };
    });
  }, []);

  const getAttributeProgress = useCallback((attribute: AttributeType) => {
    if (!attributes) return null;

    const skill = attributes.skills.find(s => s.skill === attribute);
    if (!skill) return null;

    return {
      current: skill.xp,
      next: skill.xpToNextLevel,
      percentage: (skill.xp / skill.xpToNextLevel) * 100,
    };
  }, [attributes]);

  // Load attributes on mount
  useEffect(() => {
    refreshAttributes();
  }, [refreshAttributes]);

  return {
    attributes,
    loading,
    error,
    updateAttribute,
    refreshAttributes,
    getAttributeProgress,
  };
}
