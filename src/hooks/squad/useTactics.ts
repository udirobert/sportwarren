"use client";

import { useState, useCallback } from 'react';
import type { Tactics, Formation, PlayStyle, TeamInstructions } from '@/types';

interface UseTacticsReturn {
  tactics: Tactics;
  updateFormation: (formation: Formation) => void;
  updatePlayStyle: (style: PlayStyle) => void;
  updateInstructions: (instructions: Partial<TeamInstructions>) => void;
  saveTactics: () => Promise<void>;
  hasChanges: boolean;
  isSaving: boolean;
}

const DEFAULT_TACTICS: Tactics = {
  formation: '4-3-3',
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

export function useTactics(
  initialTactics?: Tactics,
  onSave?: (tactics: Tactics) => Promise<void>
): UseTacticsReturn {
  const [tactics, setTactics] = useState<Tactics>(initialTactics || DEFAULT_TACTICS);
  const [originalTactics, setOriginalTactics] = useState<Tactics>(initialTactics || DEFAULT_TACTICS);
  const [isSaving, setIsSaving] = useState(false);

  const hasChanges = JSON.stringify(tactics) !== JSON.stringify(originalTactics);

  const updateFormation = useCallback((formation: Formation) => {
    setTactics(prev => ({ ...prev, formation }));
  }, []);

  const updatePlayStyle = useCallback((style: PlayStyle) => {
    setTactics(prev => ({ ...prev, style }));
  }, []);

  const updateInstructions = useCallback((instructions: Partial<TeamInstructions>) => {
    setTactics(prev => ({
      ...prev,
      instructions: { ...prev.instructions, ...instructions },
    }));
  }, []);

  const saveTactics = useCallback(async () => {
    setIsSaving(true);
    try {
      await onSave?.(tactics);
      setOriginalTactics(tactics);
    } finally {
      setIsSaving(false);
    }
  }, [tactics, onSave]);

  return {
    tactics,
    updateFormation,
    updatePlayStyle,
    updateInstructions,
    saveTactics,
    hasChanges,
    isSaving,
  };
}
