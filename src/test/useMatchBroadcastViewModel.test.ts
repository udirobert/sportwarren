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
        squadEnergy: 55,
        seasonPoints: 7,
        digitalAttributes: { attack: 58, defense: 66, teamwork: 63 },
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
