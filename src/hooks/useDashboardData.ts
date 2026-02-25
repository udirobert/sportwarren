import { useState, useEffect } from 'react';

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

interface UseDashboardDataReturn {
  stats: DashboardStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useDashboardData(userAddress?: string): UseDashboardDataReturn {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!userAddress) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch from API
      const response = await fetch(`/api/player/${userAddress}/dashboard`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      
      // Fallback to default data if API fails
      setStats({
        goals: 0,
        assists: 0,
        matches: 0,
        rating: '0.0',
        recentMatches: [],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userAddress]);

  return {
    stats,
    loading,
    error,
    refetch: fetchData,
  };
}
