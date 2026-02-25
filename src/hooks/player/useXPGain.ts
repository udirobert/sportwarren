"use client";

import { useState, useCallback } from 'react';
import type { MatchResult, AttributeType } from '@/types';
import { calculateMatchXP, calculateDerbyBonus, BASE_XP } from '@/lib/match/xp-calculator';

interface XPGainNotification {
  id: string;
  attribute: AttributeType;
  xpGained: number;
  newRating?: number;
  levelsGained: number;
}

interface UseXPGainReturn {
  notifications: XPGainNotification[];
  calculateMatchXPGain: (
    match: MatchResult,
    playerStats: {
      goals: number;
      assists: number;
      position: string;
      isCleanSheet: boolean;
      minutesPlayed: number;
      matchRating: number;
    },
    currentAttributes: Map<AttributeType, { rating: number; xp: number }>,
    matchType?: 'league' | 'cup' | 'playoff' | 'derby' | 'friendly',
    isRivalryMatch?: boolean
  ) => XPGainNotification[];
  dismissNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

export function useXPGain(): UseXPGainReturn {
  const [notifications, setNotifications] = useState<XPGainNotification[]>([]);

  const calculateMatchXPGain = useCallback((
    match: MatchResult,
    playerStats: {
      goals: number;
      assists: number;
      position: string;
      isCleanSheet: boolean;
      minutesPlayed: number;
      matchRating: number;
    },
    currentAttributes: Map<AttributeType, { rating: number; xp: number }>,
    matchType: 'league' | 'cup' | 'playoff' | 'derby' | 'friendly' = 'league',
    isRivalryMatch: boolean = false
  ): XPGainNotification[] => {
    // Calculate base XP breakdown
    const xpBreakdown = calculateMatchXP(match, playerStats, matchType);
    
    // Add derby bonus if applicable
    const isWinner = (match.homeScore > match.awayScore && playerStats.position === 'home') ||
                     (match.awayScore > match.homeScore && playerStats.position === 'away');
    const derbyBonus = calculateDerbyBonus(xpBreakdown.total, isWinner, isRivalryMatch);
    
    const totalXPGained = xpBreakdown.total + derbyBonus;

    // Create notifications for each affected attribute
    const newNotifications: XPGainNotification[] = [];

    for (const [attribute, xpAmount] of Object.entries(xpBreakdown.byAttribute)) {
      const currentAttr = currentAttributes.get(attribute as AttributeType);
      if (!currentAttr) continue;

      // Calculate new rating after XP gain
      const { calculateNewRating } = require('@/lib/match/xp-calculator');
      const { newRating, levelsGained } = calculateNewRating(
        currentAttr.rating,
        currentAttr.xp,
        xpAmount
      );

      const notification: XPGainNotification = {
        id: `xp_${Date.now()}_${attribute}`,
        attribute: attribute as AttributeType,
        xpGained: xpAmount,
        newRating: levelsGained > 0 ? newRating : undefined,
        levelsGained,
      };

      newNotifications.push(notification);
    }

    // Add to notifications state
    setNotifications(prev => [...newNotifications, ...prev].slice(0, 10)); // Keep last 10

    return newNotifications;
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    calculateMatchXPGain,
    dismissNotification,
    clearAllNotifications,
  };
}

// Hook for tracking XP gain history
export function useXPHistory() {
  const [history, setHistory] = useState<Array<{
    date: Date;
    totalXP: number;
    source: string;
    matchId?: string;
  }>>([]);

  const addXPHistory = useCallback((entry: {
    totalXP: number;
    source: string;
    matchId?: string;
  }) => {
    setHistory(prev => [{
      ...entry,
      date: new Date(),
    }, ...prev].slice(0, 50)); // Keep last 50 entries
  }, []);

  const getXPSummary = useCallback((days: number = 7) => {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const recent = history.filter(h => h.date >= cutoff);
    
    return {
      total: recent.reduce((sum, h) => sum + h.totalXP, 0),
      matches: recent.filter(h => h.matchId).length,
      averagePerMatch: recent.filter(h => h.matchId).length > 0
        ? recent.filter(h => h.matchId).reduce((sum, h) => sum + h.totalXP, 0) / recent.filter(h => h.matchId).length
        : 0,
    };
  }, [history]);

  return {
    history,
    addXPHistory,
    getXPSummary,
  };
}

// Utility to format XP gain for display
export function formatXPGain(xp: number): string {
  if (xp >= 1000) return `${(xp / 1000).toFixed(1)}k`;
  return `+${xp}`;
}

// Utility to get XP gain color
export function getXPGainColor(xp: number): string {
  if (xp >= 200) return 'text-purple-600';
  if (xp >= 100) return 'text-green-600';
  if (xp >= 50) return 'text-blue-600';
  return 'text-gray-600';
}
