export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero';

export type AvatarFrameTier =
  | 'rookie'
  | 'starter'
  | 'regular'
  | 'standout'
  | 'captain_class'
  | 'legend';

export type AvatarArchetype =
  | 'finisher'
  | 'creator'
  | 'engine'
  | 'anchor'
  | 'guardian'
  | 'leader';

export type AvatarFormState =
  | 'neutral'
  | 'hot'
  | 'clutch'
  | 'trusted'
  | 'locked_in';

export type AvatarBadgeKey =
  | 'first_verified_match'
  | 'verified_warrior'
  | 'sharpshooter'
  | 'playmaker'
  | 'wall'
  | 'ironman'
  | 'captain'
  | 'rivalry_king'
  | 'club_legend';

export interface AvatarBadgePresentation {
  key: AvatarBadgeKey;
  label: string;
  icon: string;
  tone: 'neutral' | 'emerald' | 'blue' | 'amber' | 'violet' | 'red';
}

export interface AvatarSquadAccent {
  squadId: string;
  squadName: string;
  primaryColor: string;
  secondaryColor?: string;
  crestUrl?: string | null;
}

export interface AvatarRecentUnlock {
  type: 'frame' | 'badge' | 'archetype' | 'prestige';
  label: string;
  unlockedAt: string;
}

export interface AvatarPresentation {
  userId: string;
  name: string;
  imageUrl?: string | null;
  initials: string;
  level: number;
  xp: number;
  size?: AvatarSize;
  frameTier: AvatarFrameTier;
  archetype?: AvatarArchetype;
  formState: AvatarFormState;
  badge?: AvatarBadgePresentation;
  squadAccent?: AvatarSquadAccent;
  captaincyActive: boolean;
  verifiedGlow: boolean;
  recentUnlock?: AvatarRecentUnlock | null;
}
