import { describe, expect, it, beforeEach, vi } from 'vitest';

vi.mock('@/lib/feature-flags', () => ({
  isEnabled: vi.fn(),
}));

import { isEnabled } from '@/lib/feature-flags';
import {
  DIGITAL_TWIN_3D_TEASER_KEY,
  DIGITAL_TWIN_3D_UNLOCK_KEY,
  DIGITAL_TWIN_3D_USAGE_KEY,
  resolveDigitalTwin3DAccess,
} from '@/lib/digital-twin/access';
import type { UserPreferences } from '@/types';

const mockedIsEnabled = vi.mocked(isEnabled);

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

describe('resolveDigitalTwin3DAccess', () => {
  beforeEach(() => {
    mockedIsEnabled.mockReset();
    mockedIsEnabled.mockReturnValue(true);
  });

  it('hides the entry point when the feature flag is disabled', () => {
    mockedIsEnabled.mockReturnValue(false);

    expect(resolveDigitalTwin3DAccess({ preferences: createPreferences() })).toEqual({
      state: 'hidden',
      canSeeEntryPoint: false,
      canLaunch: false,
      reason: 'flag_disabled',
    });
  });

  it('shows a teaser when capability is limited', () => {
    expect(resolveDigitalTwin3DAccess({
      preferences: createPreferences(),
      isLowPowerMode: true,
    })).toEqual({
      state: 'teaser',
      canSeeEntryPoint: true,
      canLaunch: false,
      reason: 'capability_limited',
    });
  });

  it('unlocks access for premium users', () => {
    expect(resolveDigitalTwin3DAccess({
      preferences: createPreferences(),
      hasPremiumAccess: true,
    })).toEqual({
      state: 'unlocked',
      canSeeEntryPoint: true,
      canLaunch: true,
      reason: 'eligible',
    });
  });

  it('unlocks access for locally unlocked users', () => {
    const preferences = createPreferences({
      unlockedFeatures: ['dashboard', DIGITAL_TWIN_3D_UNLOCK_KEY],
    });

    expect(resolveDigitalTwin3DAccess({ preferences }).state).toBe('unlocked');
  });

  it('returns locked after the teaser has been seen but eligibility is still missing', () => {
    const preferences = createPreferences({
      unlockedFeatures: ['dashboard', DIGITAL_TWIN_3D_TEASER_KEY],
    });

    expect(resolveDigitalTwin3DAccess({ preferences })).toEqual({
      state: 'locked',
      canSeeEntryPoint: true,
      canLaunch: false,
      reason: 'upgrade_required',
    });
  });

  it('stays in teaser mode before unlock discovery is recorded', () => {
    expect(resolveDigitalTwin3DAccess({ preferences: createPreferences() })).toEqual({
      state: 'teaser',
      canSeeEntryPoint: true,
      canLaunch: false,
      reason: 'upgrade_required',
    });
  });

  it('unlocks access after repeated feature engagement', () => {
    const preferences = createPreferences({
      usagePatterns: {
        mostUsedFeatures: [DIGITAL_TWIN_3D_USAGE_KEY, DIGITAL_TWIN_3D_USAGE_KEY, DIGITAL_TWIN_3D_USAGE_KEY],
        timeSpentInSections: {},
        lastActiveFeatures: [],
        completedOnboarding: false,
      },
    });

    expect(resolveDigitalTwin3DAccess({ preferences }).canLaunch).toBe(true);
  });
});
