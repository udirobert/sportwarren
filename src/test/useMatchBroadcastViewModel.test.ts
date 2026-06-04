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
        energy: 90,
        prestige: 18,
        baseAttributes: { pace: 75, shooting: 82, passing: 79, defending: 72, dribbling: 70, physical: 68 },
      },
    }));

    expect(result.current.cameraLabel).toBe('Spotlight tracking');
    expect(result.current.highlightLabel).toBe('Momentum spike detected');
    expect(result.current.highlightTone).toBe('surge');
  });

  it('describes capability-limited preview states for gated beta users', () => {
    const { result } = renderHook(() => useMatchBroadcastViewModel({
      squadId: 'squad-2',
      access: {
        state: 'teaser',
        canSeeEntryPoint: true,
        canLaunch: false,
        reason: 'capability_limited',
      },
      twin: {
        energy: 55,
        prestige: 7,
        baseAttributes: { pace: 60, shooting: 58, passing: 63, defending: 66, dribbling: 59, physical: 62 },
      },
    }));

    expect(result.current.stateLabel).toBe('Capability-limited preview');
    expect(result.current.stateDetail).toContain('Reduced motion or low-power constraints');
    expect(result.current.commentary[0]).toContain('preview mode');
    expect(result.current.keyMetrics.find(metric => metric.label === 'Feed')?.value).toBe('Twin baseline only');
  });

  it('surfaces unlocked-but-empty states when twin data is missing', () => {
    const { result } = renderHook(() => useMatchBroadcastViewModel({
      squadId: 'squad-3',
      access: {
        state: 'unlocked',
        canSeeEntryPoint: true,
        canLaunch: true,
        reason: 'eligible',
      },
      twin: null,
      snapshot: null,
    }));

    expect(result.current.stateLabel).toBe('Unlocked, waiting on twin sync');
    expect(result.current.heroTitle).toBe('Broadcast beta is ready for first sessions');
    expect(result.current.keyMetrics.find(metric => metric.label === 'Feed')?.value).toBe('Awaiting twin sync');
  });
});
