import { describe, expect, it, beforeEach, vi } from 'vitest';

vi.mock('@/lib/feature-flags', () => ({
  isEnabled: vi.fn(),
}));

vi.mock('@/lib/trpc-client', () => ({
  trpc: {
    squad: {
      getDigitalTwin: {
        useQuery: vi.fn(),
      },
    },
  },
}));

import { isEnabled } from '@/lib/feature-flags';
import { trpc } from '@/lib/trpc-client';
import { useDigitalTwinBroadcastAccess } from '@/hooks/useDigitalTwinBroadcastAccess';
import { renderHook } from '@testing-library/react';
import type { UserPreferences } from '@/types';

const mockedIsEnabled = vi.mocked(isEnabled);
const mockedTwinQuery = vi.mocked(trpc.squad.getDigitalTwin.useQuery);

function createPreferences(overrides: Partial<UserPreferences> = {}): UserPreferences {
  return {
    theme: 'system',
    notifications: true,
    compactMode: false,
    onboardingCompleted: false,
    preferredChain: 'algorand',
    primaryRole: 'player',
    sportsInterests: ['football'],
    experienceLevel: 'beginner',
    preferredFeatures: {
      statistics: 'basic',
      social: 'moderate',
      gamification: 'light',
      notifications: 'moderate',
    },
    uiComplexity: 'simple',
    dashboardLayout: 'minimal',
    usagePatterns: {
      mostUsedFeatures: [],
      timeSpentInSections: {},
      lastActiveFeatures: [],
      completedOnboarding: false,
    },
    unlockedFeatures: ['dashboard'],
    dismissedTutorials: [],
    featureDiscoveryLevel: 0,
    dashboardCustomization: {
      hiddenWidgets: [],
      pinnedWidgets: [],
      widgetOrder: [],
    },
    ...overrides,
  };
}

describe('useDigitalTwinBroadcastAccess', () => {
  beforeEach(() => {
    mockedIsEnabled.mockReset();
    mockedIsEnabled.mockReturnValue(true);
    mockedTwinQuery.mockReset();
    mockedTwinQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
    } as never);
  });

  it('uses server-backed premium access when enabled', () => {
    mockedTwinQuery.mockReturnValue({
      data: {
        digitalTwin3dEnabled: true,
        digitalTwin3dTier: 'premium',
        seasonPoints: 0,
        squadEnergy: 20,
      },
      isLoading: false,
    } as never);

    const { result } = renderHook(() => useDigitalTwinBroadcastAccess({
      squadId: 'squad-1',
      preferences: createPreferences(),
    }));

    expect(result.current.access.canLaunch).toBe(true);
    expect(result.current.access.state).toBe('unlocked');
  });

  it('uses server-backed streak reward tier as an unlock signal', () => {
    mockedTwinQuery.mockReturnValue({
      data: {
        digitalTwin3dEnabled: false,
        digitalTwin3dTier: 'streak_reward',
        seasonPoints: 0,
        squadEnergy: 20,
      },
      isLoading: false,
    } as never);

    const { result } = renderHook(() => useDigitalTwinBroadcastAccess({
      squadId: 'squad-1',
      preferences: createPreferences(),
    }));

    expect(result.current.access.canLaunch).toBe(true);
  });

  it('falls back to local heuristics when no server entitlement is present', () => {
    mockedTwinQuery.mockReturnValue({
      data: {
        digitalTwin3dEnabled: false,
        digitalTwin3dTier: null,
        seasonPoints: 12,
        squadEnergy: 90,
      },
      isLoading: false,
    } as never);

    const { result } = renderHook(() => useDigitalTwinBroadcastAccess({
      squadId: 'squad-1',
      preferences: createPreferences(),
      totalMatches: 6,
    }));

    expect(result.current.access.canLaunch).toBe(true);
  });
});
