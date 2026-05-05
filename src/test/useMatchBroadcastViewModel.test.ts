import { describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useMatchBroadcastViewModel } from '@/components/match3d';

describe('useMatchBroadcastViewModel', () => {
  it('derives camera and highlight labels for surge moments', () => {
    const { result } = renderHook(() => useMatchBroadcastViewModel({
      squadId: 'squad-1',
      access: {
        state: 'unlocked',
        canSeeEntryPoint: true,
        canLaunch: true,
        reason: 'eligible',
      },
      twin: {
        squadEnergy: 90,
        seasonPoints: 18,
        digitalAttributes: { attack: 82, defense: 72, teamwork: 79 },
      },
    }));

    expect(result.current.cameraLabel).toBe('Spotlight tracking');
    expect(result.current.highlightLabel).toBe('Momentum spike detected');
    expect(result.current.highlightTone).toBe('surge');
  });
});
