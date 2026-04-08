import type { AvatarPresentation } from './types';

export interface AvatarChangeSummary {
  changed: boolean;
  title: string;
  subtitle: string;
  type: 'verified' | 'achievement' | 'legendary';
}

export function summarizeAvatarUpgrade(
  before: AvatarPresentation | null | undefined,
  after: AvatarPresentation | null | undefined,
): AvatarChangeSummary | null {
  if (!before || !after) {
    return null;
  }

  if (before.frameTier !== after.frameTier) {
    return {
      changed: true,
      title: 'Avatar Upgraded',
      subtitle: `New frame tier: ${after.frameTier.replace('_', ' ')}`,
      type: 'legendary',
    };
  }

  if (before.badge?.key !== after.badge?.key && after.badge) {
    return {
      changed: true,
      title: 'Badge Unlocked',
      subtitle: `${after.badge.label} is now featured on your avatar.`,
      type: 'achievement',
    };
  }

  if (before.archetype !== after.archetype && after.archetype) {
    return {
      changed: true,
      title: 'Identity Evolved',
      subtitle: `Your current playing archetype is ${after.archetype}.`,
      type: 'verified',
    };
  }

  if (before.formState !== after.formState) {
    return {
      changed: true,
      title: 'Form Updated',
      subtitle: `Your avatar now reflects ${after.formState.replace('_', ' ')} form.`,
      type: 'verified',
    };
  }

  return null;
}
