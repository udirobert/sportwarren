"use client";

import { useMemo } from 'react';
import type { PlayerAttributes } from '@/types';
import { calculateForm, getFormArrow, getFormColor } from '@/lib/match/xp-calculator';

interface FormDisplay {
  value: number;
  arrow: string;
  color: string;
  trend: 'up' | 'down' | 'stable';
  description: string;
}

interface UsePlayerFormReturn {
  form: FormDisplay;
  recentRatings: number[];
  averageRating: number;
}

export function usePlayerForm(attributes: PlayerAttributes | null): UsePlayerFormReturn {
  return useMemo(() => {
    if (!attributes) {
      return {
        form: {
          value: 0,
          arrow: '→',
          color: 'text-gray-500',
          trend: 'stable',
          description: 'No data',
        },
        recentRatings: [],
        averageRating: 0,
      };
    }

    const { current, trend } = calculateForm(attributes.form.history);
    const arrow = getFormArrow(current);
    const color = getFormColor(current);

    // Get description based on form value
    let description: string;
    if (current >= 4) description = 'Exceptional';
    else if (current >= 2) description = 'Good';
    else if (current >= 1) description = 'Okay';
    else if (current === 0) description = 'Average';
    else if (current >= -2) description = 'Struggling';
    else description = 'Poor';

    const recentRatings = attributes.form.history.slice(-5);
    const averageRating = recentRatings.length > 0
      ? recentRatings.reduce((a, b) => a + b, 0) / recentRatings.length
      : 0;

    return {
      form: {
        value: current,
        arrow,
        color,
        trend,
        description,
      },
      recentRatings,
      averageRating: Number(averageRating.toFixed(1)),
    };
  }, [attributes]);
}

// Hook for tracking form over time (for charts)
export function useFormHistory(attributes: PlayerAttributes | null) {
  return useMemo(() => {
    if (!attributes) return [];

    return attributes.form.history.map((rating, index) => ({
      match: index + 1,
      rating,
      date: new Date(Date.now() - (attributes.form.history.length - index) * 7 * 24 * 60 * 60 * 1000),
    }));
  }, [attributes]);
}

// Hook for comparing player form to team average
export function useFormComparison(
  playerForm: number,
  teamAverageForm: number
): { difference: number; comparison: 'above' | 'below' | 'average' } {
  return useMemo(() => {
    const difference = playerForm - teamAverageForm;
    const comparison = difference > 0.5 ? 'above' : difference < -0.5 ? 'below' : 'average';
    return { difference: Number(difference.toFixed(1)), comparison };
  }, [playerForm, teamAverageForm]);
}
