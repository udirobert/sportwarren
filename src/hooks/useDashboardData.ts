import { useState, useEffect, useCallback } from 'react';
import type { AsyncState } from './types';
import { createErrorState, createLoadingState, createSuccessState } from './types';

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
  refetch: () => Promise<void>;
}

// Default/mock data for development
const DEFAULT_STATS: DashboardStats = {
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

export function useDashboardData(userAddress?: string): UseDashboardDataReturn {
  const [state, setState] = useState<AsyncState<DashboardStats>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchData = useCallback(async () => {
    if (!userAddress) {
      setState(createSuccessState(DEFAULT_STATS));
      return;
    }

    try {
      setState(createLoadingState());

      // Fetch from API
      const response = await fetch(`/api/player/${userAddress}/dashboard`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const data = await response.json();
      setState(createSuccessState(data));
    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      const errorState = createErrorState(err);
      setState({ ...errorState, loading: false });
      
      // Fallback to default data if API fails
      setState(createSuccessState(DEFAULT_STATS));
    }
  }, [userAddress]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    ...state,
    refetch: fetchData,
  };
}
