import type { AvatarBadgeKey, AvatarBadgePresentation } from './types';

export const AVATAR_BADGES: Record<AvatarBadgeKey, AvatarBadgePresentation> = {
  first_verified_match: {
    key: 'first_verified_match',
    label: 'First Verified Match',
    icon: 'sparkles',
    tone: 'emerald',
  },
  verified_warrior: {
    key: 'verified_warrior',
    label: 'Verified Warrior',
    icon: 'shield',
    tone: 'blue',
  },
  sharpshooter: {
    key: 'sharpshooter',
    label: 'Sharpshooter',
    icon: 'target',
    tone: 'red',
  },
  playmaker: {
    key: 'playmaker',
    label: 'Playmaker',
    icon: 'wand',
    tone: 'violet',
  },
  wall: {
    key: 'wall',
    label: 'The Wall',
    icon: 'shield-half',
    tone: 'amber',
  },
  ironman: {
    key: 'ironman',
    label: 'Ironman',
    icon: 'activity',
    tone: 'neutral',
  },
  captain: {
    key: 'captain',
    label: 'Captain',
    icon: 'crown',
    tone: 'amber',
  },
  rivalry_king: {
    key: 'rivalry_king',
    label: 'Rivalry King',
    icon: 'flame',
    tone: 'red',
  },
  club_legend: {
    key: 'club_legend',
    label: 'Club Legend',
    icon: 'star',
    tone: 'violet',
  },
};
