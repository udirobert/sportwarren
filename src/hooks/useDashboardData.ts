import { useMemo } from 'react';
import type { AsyncState } from './types';
import { createSuccessState } from './types';
import { isSettledMatchStatus, describeMatchForSquad } from '@/lib/match/summary';
import { trpc } from '@/lib/trpc-client';

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
  hasAccount: boolean;
  isVerified: boolean;
  squadId?: string;
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

function formatRelativeDate(value?: string | Date | null) {
  if (!value) {
    return 'Recently';
  }

  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return 'Recently';
  }

  const diffMs = Date.now() - parsed.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return 'Today';
  }

  if (diffDays === 1) {
    return '1 day ago';
  }

  if (diffDays < 7) {
    return `${diffDays} days ago`;
  }

  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks === 1) {
    return '1 week ago';
  }

  if (diffWeeks < 5) {
    return `${diffWeeks} weeks ago`;
  }

  return parsed.toLocaleDateString();
}

function formatRecentMatches(matches: any[], squadId?: string) {
  return matches
    .filter((match) => isSettledMatchStatus(match.status))
    .slice(0, 5)
    .map((match) => {
      const summary = describeMatchForSquad(match, squadId);
      return {
        opponent: summary.opponent,
        result: `${summary.result} ${summary.goalsFor}-${summary.goalsAgainst}`,
        date: formatRelativeDate(match.matchDate),
      };
    });
}

function formatRating(formHistory: Array<{ rating?: number | null }> | undefined) {
  const ratings = (formHistory ?? [])
    .map((entry) => entry.rating)
    .filter((entry): entry is number => typeof entry === 'number' && Number.isFinite(entry));

  if (ratings.length === 0) {
    return '0.0';
  }

  const average = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
  return average.toFixed(1);
}

export function useDashboardData({
  isGuest,
  hasAccount,
  isVerified,
  squadId,
}: UseDashboardDataOptions): UseDashboardDataReturn {
  const profileQuery = trpc.player.getCurrentProfile.useQuery(undefined, {
    enabled: hasAccount && isVerified,
    retry: false,
    staleTime: 30 * 1000,
  });
  const matchesQuery = trpc.match.list.useQuery(
    { squadId, limit: 5 },
    { enabled: !!squadId, staleTime: 30 * 1000 }
  );
  // Query SquadPlayerContext when a squad is active
  const squadContextQuery = trpc.squad.getPlayerContext.useQuery(
    { squadId: squadId! },
    { enabled: !!squadId && hasAccount && isVerified, staleTime: 30 * 1000 }
  );

  const dataState = useMemo<'preview' | 'empty' | 'live'>(() => {
    if (isGuest) {
      return 'preview';
    }

    if (!hasAccount || !isVerified || !profileQuery.data) {
      return 'empty';
    }

    return 'live';
  }, [hasAccount, isGuest, isVerified, profileQuery.data]);

  const data = useMemo<DashboardStats>(() => {
    if (isGuest) {
      return PREVIEW_STATS;
    }

    if (!hasAccount || !isVerified || !profileQuery.data) {
      return EMPTY_STATS;
    }

    // Use squad-scoped stats when a squad is active
    const squadContext = squadContextQuery.data;
    const useSquadStats = !!squadId && squadContext;

    return {
      goals: useSquadStats ? squadContext.goals : profileQuery.data.totalGoals ?? 0,
      assists: useSquadStats ? squadContext.assists : profileQuery.data.totalAssists ?? 0,
      matches: useSquadStats ? squadContext.matchesPlayed : profileQuery.data.totalMatches ?? 0,
      rating: formatRating(profileQuery.data.formHistory),
      recentMatches: formatRecentMatches(matchesQuery.data?.matches ?? [], squadId),
    };
  }, [
    hasAccount,
    isGuest,
    isVerified,
    matchesQuery.data?.matches,
    profileQuery.data,
    squadContextQuery.data,
    squadId,
  ]);

  const loading = !isGuest && hasAccount && isVerified && (
    profileQuery.isLoading || (!!squadId && matchesQuery.isLoading) || (!!squadId && squadContextQuery.isLoading)
  );
  const error = profileQuery.error?.message || matchesQuery.error?.message || squadContextQuery.error?.message || null;

  return {
    ...createSuccessState(data),
    loading,
    error,
    dataState,
    refetch: async () => {
      await profileQuery.refetch();
      if (squadId) {
        await matchesQuery.refetch();
        await squadContextQuery.refetch();
      }
    },
  };
}
