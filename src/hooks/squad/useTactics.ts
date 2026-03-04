"use client";

import { useState, useCallback } from 'react';
import { trpc } from '@/lib/trpc-client';
import type { Tactics, Formation, PlayStyle, TeamInstructions } from '@/types';

interface UseTacticsReturn {
  tactics: Tactics;
  updateFormation: (formation: Formation) => void;
  updatePlayStyle: (style: PlayStyle) => void;
  updateInstructions: (instructions: Partial<TeamInstructions>) => void;
  saveTactics: () => Promise<void>;
  hasChanges: boolean;
  isSaving: boolean;
  isLoading: boolean;
}

const DEFAULT_TACTICS: Tactics = {
  formation: '4-4-2',
  style: 'balanced',
  instructions: {
    width: 'normal',
    tempo: 'normal',
    passing: 'mixed',
    pressing: 'medium',
    defensiveLine: 'normal',
  },
  setPieces: {
    corners: 'near_post',
    freeKicks: 'cross',
    penalties: '',
  },
};

export function useTactics(squadId?: string): UseTacticsReturn {
  const { data: rawData, isLoading } = trpc.squad.getTactics.useQuery(
    { squadId: squadId || '' },
    {
      enabled: !!squadId,
      staleTime: 30 * 1000,
    }
  ) as { data: any; isLoading: boolean };

  const saveMutation = trpc.squad.saveTactics.useMutation();

  // Build tactics from data or use defaults
  const serverTactics: Tactics = rawData
    ? {
        formation: (rawData.formation as Formation) || '4-4-2',
        style: (rawData.playStyle as PlayStyle) || 'balanced',
        instructions: (rawData.instructions as TeamInstructions) || DEFAULT_TACTICS.instructions,
        setPieces: (rawData.setPieces as any) || DEFAULT_TACTICS.setPieces,
      }
    : DEFAULT_TACTICS;

  const [localTactics, setLocalTactics] = useState<Tactics>(serverTactics);
  const hasChanges = JSON.stringify(localTactics) !== JSON.stringify(serverTactics);
  const isSaving = saveMutation.isPending;

  const updateFormation = useCallback((formation: Formation) => {
    setLocalTactics((prev) => ({ ...prev, formation }));
  }, []);

  const updatePlayStyle = useCallback((style: PlayStyle) => {
    setLocalTactics((prev) => ({ ...prev, style }));
  }, []);

  const updateInstructions = useCallback((instructions: Partial<TeamInstructions>) => {
    setLocalTactics((prev) => ({
      ...prev,
      instructions: { ...prev.instructions, ...instructions },
    }));
  }, []);

  const saveTactics = useCallback(async () => {
    if (!squadId) return;

    await saveMutation.mutateAsync({
      squadId,
      formation: localTactics.formation,
      playStyle: localTactics.style,
      instructions: localTactics.instructions,
      setPieces: localTactics.setPieces,
    });
  }, [squadId, localTactics, saveMutation]);

  return {
    tactics: localTactics,
    updateFormation,
    updatePlayStyle,
    updateInstructions,
    saveTactics,
    hasChanges,
    isSaving,
    isLoading,
  };
}
