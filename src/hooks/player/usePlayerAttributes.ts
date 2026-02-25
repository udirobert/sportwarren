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

// Mock data for development
const MOCK_ATTRIBUTES: PlayerAttributes = {
  address: 'ADDR_MARCUS_001',
  playerName: 'Marcus Johnson',
  totalMatches: 47,
  totalGoals: 38,
  totalAssists: 22,
  reputationScore: 8750,
  verifiedStats: true,
  skills: [
    { skill: 'shooting', rating: 87, xp: 850, xpToNextLevel: 1000, maxRating: 99, verified: true, lastUpdated: new Date('2025-01-10'), history: [85, 86, 86, 87, 87] },
    { skill: 'passing', rating: 82, xp: 720, xpToNextLevel: 1000, maxRating: 99, verified: true, lastUpdated: new Date('2025-01-08'), history: [80, 81, 81, 82, 82] },
    { skill: 'dribbling', rating: 79, xp: 650, xpToNextLevel: 1000, maxRating: 99, verified: true, lastUpdated: new Date('2025-01-05'), history: [78, 78, 79, 79, 79] },
    { skill: 'defending', rating: 65, xp: 420, xpToNextLevel: 1000, maxRating: 99, verified: true, lastUpdated: new Date('2025-01-03'), history: [64, 64, 65, 65, 65] },
    { skill: 'physical', rating: 84, xp: 780, xpToNextLevel: 1000, maxRating: 99, verified: true, lastUpdated: new Date('2025-01-01'), history: [83, 83, 84, 84, 84] },
    { skill: 'pace', rating: 76, xp: 580, xpToNextLevel: 1000, maxRating: 99, verified: true, lastUpdated: new Date('2024-12-28'), history: [75, 76, 76, 76, 76] },
  ],
  form: { current: 2, history: [7.5, 8.0, 8.5, 8.0, 8.5], trend: 'up' },
  xp: { level: 12, totalXP: 12500, seasonXP: 3200, nextLevelXP: 15000 },
  achievements: [
    { id: 'hat_trick_hero', title: 'Hat-trick Hero', description: 'Scored 3+ goals in a single match', dateEarned: new Date('2025-01-13'), rarity: 'rare', verified: true },
    { id: 'assist_master', title: 'Assist Master', description: 'Recorded 10+ assists in a season', dateEarned: new Date('2025-01-10'), rarity: 'epic', verified: true },
    { id: 'derby_hero', title: 'Derby Day Hero', description: 'Scored the winning goal in a rivalry match', dateEarned: new Date('2025-01-06'), rarity: 'legendary', verified: true },
  ],
  careerHighlights: [
    { id: 'highlight_001', title: 'Perfect Hat-trick vs Red Lions', description: 'Scored with left foot, right foot, and header in a 4-1 victory', date: new Date('2025-01-13'), matchId: 'match_001', verified: true },
    { id: 'highlight_002', title: 'Season Top Scorer', description: 'Finished as the league\'s top scorer with 25 goals', date: new Date('2024-12-20'), verified: true },
    { id: 'highlight_003', title: 'Derby Winner', description: 'Scored the decisive goal in the 89th minute against rivals', date: new Date('2024-11-15'), matchId: 'match_derby_001', verified: true },
  ],
  endorsements: [
    { endorser: 'Jamie Thompson', endorserRole: 'teammate', skill: 'Leadership', rating: 9, comment: 'Marcus is an exceptional captain who always motivates the team.', date: new Date('2025-01-12'), verified: true },
    { endorser: 'Red Lions FC Captain', endorserRole: 'opponent', skill: 'Fair Play', rating: 8, comment: 'Always plays with respect and sportsmanship.', date: new Date('2025-01-08'), verified: true },
    { endorser: 'Coach Williams', endorserRole: 'coach', skill: 'Tactical Awareness', rating: 9, comment: 'Excellent understanding of the game and positioning.', date: new Date('2025-01-05'), verified: true },
  ],
  professionalInterest: [
    { scoutName: 'David Martinez', organization: 'Premier League Scouts Network', interestLevel: 'very_interested', notes: 'Exceptional finishing ability and leadership qualities. Recommend for trial.', date: new Date('2025-01-10') },
    { scoutName: 'Sarah Chen', organization: 'Championship Talent ID', interestLevel: 'interested', notes: 'Good technical skills, needs to improve consistency.', date: new Date('2024-12-15') },
  ],
};

export function usePlayerAttributes(playerAddress?: string): UsePlayerAttributesReturn {
  const [attributes, setAttributes] = useState<PlayerAttributes | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshAttributes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // In production: fetch from blockchain/API
      // const response = await fetch(`/api/players/${playerAddress}/attributes`);
      // const data = await response.json();
      
      // For now, use mock data
      setAttributes(MOCK_ATTRIBUTES);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch attributes');
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
