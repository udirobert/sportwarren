"use client";

import { useCallback } from 'react';
import { trpc } from '@/lib/trpc-client';

interface Squad {
  id: string;
  name: string;
  shortName: string;
  founded: Date;
  homeGround?: string;
  treasuryBalance: number;
  memberCount: number;
}

interface SquadMember {
  id: string;
  name: string;
  avatar?: string;
  role: 'captain' | 'vice_captain' | 'player';
  joinedAt: Date;
  stats?: {
    matches: number;
    goals: number;
    level: number;
  };
}

interface UseSquadReturn {
  squads: Squad[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  total: number;
  refreshSquads: () => Promise<void>;
}

interface UseSquadDetailsReturn {
  squad: Squad | null;
  members: SquadMember[];
  loading: boolean;
  error: string | null;
  refreshSquad: () => Promise<void>;
  joinSquad: () => Promise<void>;
  leaveSquad: () => Promise<void>;
  isJoining: boolean;
  isLeaving: boolean;
}

interface UseMySquadsReturn {
  memberships: Array<{
    squad: Squad;
    role: string;
    joinedAt: Date;
  }>;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

// Transform DB squad to frontend type
function transformSquad(squad: any): Squad {
  return {
    id: squad.id,
    name: squad.name,
    shortName: squad.shortName,
    founded: new Date(squad.founded),
    homeGround: squad.homeGround || undefined,
    treasuryBalance: squad.treasuryBalance,
    memberCount: squad._count?.members || 0,
  };
}

// List all squads
export function useSquads(search?: string): UseSquadReturn {
  const { data, isLoading, error, refetch } = trpc.squad.list.useQuery(
    { search, limit: 20 },
    {
      staleTime: 30 * 1000,
    }
  );

  return {
    squads: data?.squads.map(transformSquad) || [],
    loading: isLoading,
    error: error?.message || null,
    hasMore: data?.hasMore || false,
    total: data?.total || 0,
    refreshSquads: async () => { await refetch(); },
  };
}

// Get single squad details
export function useSquadDetails(squadId?: string): UseSquadDetailsReturn {
  const { data, isLoading, error, refetch } = trpc.squad.getById.useQuery(
    { id: squadId || '' },
    {
      enabled: !!squadId,
      staleTime: 30 * 1000,
    }
  );

  const joinMutation = trpc.squad.join.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const leaveMutation = trpc.squad.leave.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const joinSquad = useCallback(async () => {
    if (!squadId) return;
    await joinMutation.mutateAsync({ squadId });
  }, [squadId, joinMutation]);

  const leaveSquad = useCallback(async () => {
    if (!squadId) return;
    await leaveMutation.mutateAsync({ squadId });
  }, [squadId, leaveMutation]);

  const squad = data ? transformSquad(data) : null;
  
  const members: SquadMember[] = data?.members.map((m: any) => ({
    id: m.user.id,
    name: m.user.name || 'Unknown',
    avatar: m.user.avatar || undefined,
    role: m.role as 'captain' | 'vice_captain' | 'player',
    joinedAt: new Date(m.joinedAt),
    stats: m.user.playerProfile ? {
      matches: m.user.playerProfile.totalMatches,
      goals: m.user.playerProfile.totalGoals,
      level: m.user.playerProfile.level,
    } : undefined,
  })) || [];

  return {
    squad,
    members,
    loading: isLoading,
    error: error?.message || null,
    refreshSquad: async () => { await refetch(); },
    joinSquad,
    leaveSquad,
    isJoining: joinMutation.isPending,
    isLeaving: leaveMutation.isPending,
  };
}

// Get current user's squads
export function useMySquads(): UseMySquadsReturn {
  const { data, isLoading, error, refetch } = trpc.squad.getMySquads.useQuery(
    undefined,
    {
      staleTime: 30 * 1000,
    }
  );

  return {
    memberships: data?.map((m: any) => ({
      squad: transformSquad(m.squad),
      role: m.role,
      joinedAt: new Date(m.joinedAt),
    })) || [],
    loading: isLoading,
    error: error?.message || null,
    refresh: async () => { await refetch(); },
  };
}

// Create squad hook
export function useCreateSquad() {
  const mutation = trpc.squad.create.useMutation();

  return {
    createSquad: mutation.mutateAsync,
    isCreating: mutation.isPending,
    error: mutation.error?.message || null,
  };
}
