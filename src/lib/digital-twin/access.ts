import { isEnabled } from '@/lib/feature-flags';
import type { UserPreferences } from '@/types';

export type DigitalTwin3DAccessState = 'hidden' | 'teaser' | 'locked' | 'unlocked';

export interface ResolveDigitalTwin3DAccessInput {
  preferences: Pick<UserPreferences, 'unlockedFeatures' | 'usagePatterns'>;
  hasPremiumAccess?: boolean;
  hasStreakAccess?: boolean;
  isLowPowerMode?: boolean;
  prefersReducedMotion?: boolean;
}

export interface DigitalTwin3DAccessResult {
  state: DigitalTwin3DAccessState;
  canSeeEntryPoint: boolean;
  canLaunch: boolean;
  reason: 'flag_disabled' | 'capability_limited' | 'eligible' | 'upgrade_required';
}

export const DIGITAL_TWIN_3D_UNLOCK_KEY = 'digital-twin-3d';
export const DIGITAL_TWIN_3D_TEASER_KEY = 'digital-twin-3d-teaser';
export const DIGITAL_TWIN_3D_USAGE_KEY = 'digital-twin-3d';
const DIGITAL_TWIN_3D_STREAK_USAGE_THRESHOLD = 3;

export function resolveDigitalTwin3DAccess({
  preferences,
  hasPremiumAccess = false,
  hasStreakAccess = false,
  isLowPowerMode = false,
  prefersReducedMotion = false,
}: ResolveDigitalTwin3DAccessInput): DigitalTwin3DAccessResult {
  if (!isEnabled('DIGITAL_TWIN_3D')) {
    return {
      state: 'hidden',
      canSeeEntryPoint: false,
      canLaunch: false,
      reason: 'flag_disabled',
    };
  }

  if (isLowPowerMode || prefersReducedMotion) {
    return {
      state: 'teaser',
      canSeeEntryPoint: true,
      canLaunch: false,
      reason: 'capability_limited',
    };
  }

  const unlockedFeatures = preferences.unlockedFeatures ?? [];
  const mostUsedFeatures = preferences.usagePatterns?.mostUsedFeatures ?? [];
  const hasLocalUnlock = unlockedFeatures.includes(DIGITAL_TWIN_3D_UNLOCK_KEY);
  const hasSeenTeaser = unlockedFeatures.includes(DIGITAL_TWIN_3D_TEASER_KEY);
  const engagementCount = mostUsedFeatures.filter(feature => feature === DIGITAL_TWIN_3D_USAGE_KEY).length;
  const qualifiesViaUsage = engagementCount >= DIGITAL_TWIN_3D_STREAK_USAGE_THRESHOLD;
  const isEligible = hasPremiumAccess || hasStreakAccess || hasLocalUnlock || qualifiesViaUsage;

  if (isEligible) {
    return {
      state: 'unlocked',
      canSeeEntryPoint: true,
      canLaunch: true,
      reason: 'eligible',
    };
  }

  return {
    state: hasSeenTeaser ? 'locked' : 'teaser',
    canSeeEntryPoint: true,
    canLaunch: false,
    reason: 'upgrade_required',
  };
}
