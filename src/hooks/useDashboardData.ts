import { useState, useEffect, useCallback } from 'react';
import type { AsyncState } from './types';
import { createLoadingState, createSuccessState } from './types';

interface DashboardStats {
  goals: number;
  assists: number;
  matches: number;
  rating: string;
  recentMatches: Array<{
    opponent: string;
    result: string;
    date: string;
  }>;
}

interface UseDashboardDataReturn extends AsyncState<DashboardStats> {
  dataState: 'preview' | 'empty' | 'live';
  refetch: () => Promise<void>;
}

interface UseDashboardDataOptions {
  isGuest: boolean;
  userAddress?: string;
}

const PREVIEW_STATS: DashboardStats = {
  goals: 12,
  assists: 8,
  matches: 15,
  rating: '7.8',
  recentMatches: [
    { opponent: 'Red Lions FC', result: 'W 3-1', date: '2 days ago' },
    { opponent: 'Sunday Legends', result: 'D 2-2', date: '1 week ago' },
    { opponent: 'Park Rangers', result: 'W 4-1', date: '2 weeks ago' },
  ],
};

const EMPTY_STATS: DashboardStats = {
  goals: 0,
  assists: 0,
  matches: 0,
  rating: '0.0',
  recentMatches: [],
};

export function useDashboardData({ isGuest, userAddress }: UseDashboardDataOptions): UseDashboardDataReturn {
  const [state, setState] = useState<AsyncState<DashboardStats>>({
    data: null,
    loading: true,
    error: null,
  });
  const [dataState, setDataState] = useState<'preview' | 'empty' | 'live'>('empty');

  const fetchData = useCallback(async () => {
    if (isGuest) {
      setDataState('preview');
      setState(createSuccessState(PREVIEW_STATS));
      return;
    }

    if (!userAddress) {
      setDataState('empty');
      setState(createSuccessState(EMPTY_STATS));
      return;
    }

    try {
      setState(createLoadingState());

      // If we are in the 'Dev/Guest' phase, we skip the real fetch to avoid 404s
      // until the backend routes are actually implemented.
      const IS_BACKEND_READY = false; // Toggle this once API is live

      if (!IS_BACKEND_READY) {
        await new Promise(resolve => setTimeout(resolve, 300));
        setDataState('empty');
        setState(createSuccessState(EMPTY_STATS));
        return;
      }

      // Fetch from API
      const response = await fetch(`/api/player/${userAddress}/dashboard`);

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const data = await response.json();
      setDataState('live');
      setState(createSuccessState(data));
    } catch {
      if (userAddress && !isGuest) {
        console.warn('Dashboard API not found. Reverting to an empty state for real users.');
      }

      setDataState(isGuest ? 'preview' : 'empty');
      setState(createSuccessState(isGuest ? PREVIEW_STATS : EMPTY_STATS));
    }
  }, [isGuest, userAddress]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    ...state,
    dataState,
    refetch: fetchData,
  };
}
