/**
 * useMatchPreview Hook
 * Provides simulation and win probability for upcoming matches
 */

import { trpc } from '@/lib/trpc-client';
import { useMemo } from 'react';

export function useMatchPreview(homeSquadId?: string, awaySquadId?: string) {
  const { data, isLoading, error, refetch } = trpc.match.preview.useQuery(
    { 
      homeSquadId: homeSquadId || '', 
      awaySquadId: awaySquadId || '' 
    },
    { 
      enabled: !!homeSquadId && !!awaySquadId,
      staleTime: 1000 * 60 * 5, // 5 minute cache
    }
  );

  const stats = useMemo(() => {
    if (!data) return null;

    const { probability } = data;
    const favorite = probability.homeWin > probability.awayWin ? 'home' : 'away';
    const favoriteMargin = Math.abs(probability.homeWin - probability.awayWin);
    
    let confidence: 'low' | 'medium' | 'high' = 'low';
    if (favoriteMargin > 0.4) confidence = 'high';
    else if (favoriteMargin > 0.2) confidence = 'medium';

    return {
      favorite,
      confidence,
      isCloseMatch: favoriteMargin < 0.15,
      homeWinPct: Math.round(probability.homeWin * 100),
      awayWinPct: Math.round(probability.awayWin * 100),
      drawPct: Math.round(probability.draw * 100),
    };
  }, [data]);

  return {
    simulation: data,
    stats,
    isLoading,
    error,
    refresh: refetch,
  };
}
