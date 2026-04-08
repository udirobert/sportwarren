import { AVATAR_BADGES } from './badges';
import {
  getAvatarArchetype,
  getAvatarFormState,
  getAvatarFrameTier,
  getInitials,
} from './presentation';
import type { AvatarBadgeKey, AvatarPresentation } from './types';

interface BuildDerivedAvatarInput {
  userId: string;
  name: string;
  imageUrl?: string | null;
  level?: number;
  xp?: number;
  totalMatches?: number;
  totalGoals?: number;
  totalAssists?: number;
  role?: string | null;
  position?: string | null;
  reputationScore?: number;
}

function pickDerivedBadge(input: {
  role?: string | null;
  totalMatches: number;
  totalGoals: number;
  totalAssists: number;
  reputationScore: number;
}): AvatarBadgeKey | undefined {
  if (input.role === 'captain') {
    return 'captain';
  }

  if (input.totalMatches >= 50) {
    return 'club_legend';
  }

  if (input.totalGoals >= 25) {
    return 'sharpshooter';
  }

  if (input.totalAssists >= 15) {
    return 'playmaker';
  }

  if (input.totalMatches >= 10 || input.reputationScore >= 115) {
    return 'verified_warrior';
  }

  if (input.totalMatches >= 1) {
    return 'first_verified_match';
  }

  return undefined;
}

export function buildDerivedAvatarPresentation(input: BuildDerivedAvatarInput): AvatarPresentation {
  const name = input.name || 'Player';
  const totalMatches = input.totalMatches ?? 0;
  const totalGoals = input.totalGoals ?? 0;
  const totalAssists = input.totalAssists ?? 0;
  const reputationScore = input.reputationScore ?? (100 + totalMatches);
  const level = input.level ?? 1;
  const sharpness = Math.min(90, 50 + totalMatches * 3);
  const badgeKey = pickDerivedBadge({
    role: input.role,
    totalMatches,
    totalGoals,
    totalAssists,
    reputationScore,
  });

  return {
    userId: input.userId,
    name,
    imageUrl: input.imageUrl,
    initials: getInitials(name),
    level,
    xp: input.xp ?? level * 1000,
    frameTier: getAvatarFrameTier(level),
    archetype: getAvatarArchetype({
      goals: totalGoals,
      assists: totalAssists,
      sharpness,
      reputationScore,
      isCaptain: input.role === 'captain',
      position: input.position,
    }),
    formState: getAvatarFormState({
      sharpness,
      totalMatches,
      totalGoals,
      totalAssists,
      reputationScore,
    }),
    badge: badgeKey ? AVATAR_BADGES[badgeKey] : undefined,
    captaincyActive: input.role === 'captain',
    verifiedGlow: totalMatches > 0,
    recentUnlock: null,
  };
}
