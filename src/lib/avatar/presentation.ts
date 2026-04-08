import type {
  AvatarArchetype,
  AvatarFormState,
  AvatarFrameTier,
} from './types';

export function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function getAvatarFrameTier(level: number): AvatarFrameTier {
  if (level >= 50) return 'legend';
  if (level >= 35) return 'captain_class';
  if (level >= 20) return 'standout';
  if (level >= 10) return 'regular';
  if (level >= 5) return 'starter';
  return 'rookie';
}

export function getAvatarFormState(input: {
  sharpness: number;
  totalMatches: number;
  totalGoals: number;
  totalAssists: number;
  reputationScore: number;
}): AvatarFormState {
  const goalContribution = input.totalGoals + input.totalAssists;

  if (
    input.sharpness >= 85
    && input.reputationScore >= 130
    && input.totalMatches >= 15
  ) {
    return 'locked_in';
  }

  if (goalContribution >= 20) {
    return 'clutch';
  }

  if (input.reputationScore >= 115 || input.totalMatches >= 10) {
    return 'trusted';
  }

  if (goalContribution >= 8 || input.sharpness >= 75) {
    return 'hot';
  }

  return 'neutral';
}

export function getAvatarArchetype(input: {
  goals: number;
  assists: number;
  sharpness: number;
  reputationScore: number;
  isCaptain: boolean;
  position?: string | null;
}): AvatarArchetype | undefined {
  if (input.position === 'GK') {
    return 'guardian';
  }

  const scores = {
    finisher: input.goals * 3,
    creator: input.assists * 3,
    engine: input.sharpness + input.goals + input.assists,
    anchor: input.reputationScore,
    guardian: input.position === 'GK' ? 999 : 0,
    leader: (input.isCaptain ? 120 : 0) + input.reputationScore,
  } as const;

  const winner = Object.entries(scores).sort((left, right) => right[1] - left[1])[0];
  return winner?.[1] ? (winner[0] as AvatarArchetype) : undefined;
}
