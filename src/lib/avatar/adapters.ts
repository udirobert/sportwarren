import type { PlayerAttributes } from '@/types';
import { buildDerivedAvatarPresentation } from './builders';
import type { AvatarPresentation } from './types';

export interface PlayerAvatarSummary {
  id: string;
  name?: string | null;
  avatar?: string | null;
  position?: string | null;
  role?: string | null;
  level?: number | null | undefined;
  totalXP?: number | null;
  totalMatches?: number | null;
  totalGoals?: number | null;
  totalAssists?: number | null;
  reputationScore?: number | null;
}

export function buildAvatarPresentationFromSummary(
  summary: PlayerAvatarSummary,
): AvatarPresentation {
  return buildDerivedAvatarPresentation({
    userId: summary.id,
    name: summary.name ?? 'Player',
    imageUrl: summary.avatar,
    position: summary.position ?? null,
    role: summary.role ?? null,
    level: summary.level ?? undefined,
    xp: summary.totalXP ?? undefined,
    totalMatches: summary.totalMatches ?? undefined,
    totalGoals: summary.totalGoals ?? undefined,
    totalAssists: summary.totalAssists ?? undefined,
    reputationScore: summary.reputationScore ?? undefined,
  });
}

export function buildAvatarPresentationFromPlayerAttributes(
  player: PlayerAttributes,
): AvatarPresentation {
  return buildAvatarPresentationFromSummary({
    id: player.address,
    name: player.playerName,
    avatar: player.avatar,
    position: player.position,
    level: player.xp.level,
    totalXP: player.xp.totalXP,
    totalMatches: player.totalMatches,
    totalGoals: player.totalGoals,
    totalAssists: player.totalAssists,
    reputationScore: player.reputationScore,
  });
}
