/**
 * Moment card prop contract. Each card component consumes a Moment row
 * (matching the Prisma `Moment` shape relevant for rendering) and produces
 * a 600×400 inline-styled JSX tree consumable by satori.
 *
 * The card components are deliberately not Tailwind-className-based — satori
 * processes inline styles only.
 *
 * Avatar and squad data are optional — when provided, the card renders
 * with real player/squad data; when absent, the card falls back to
 * palette defaults.
 */

export type MomentTier =
  | 'standard'
  | 'premium'
  | 'streak_reward'
  | 'partner'
  | 'internal';

export interface MomentForRender {
  kind: string;
  tier: string;
  label: string;
  detail: string | null;
  createdAt: Date;
  subjectType: 'player' | 'squad';
}

export type HairStyle = 'short' | 'tall' | 'shaved' | 'cap';

/** Resolved avatar data for a player — all fields are always populated
 *  (the resolver fills in defaults for any nulls). */
export interface ResolvedAvatar {
  kitColor: string;
  accentColor: string;
  skinTone: string;
  hairColor: string;
  hairStyle: HairStyle;
  number: string;
}

/** Resolved squad crest data — all fields always populated. */
export interface ResolvedCrest {
  kitColor: string;
  accentColor: string;
  initials: string;
  founded: string;
}

export interface MomentCardProps {
  moment: MomentForRender;
  avatar?: ResolvedAvatar;
  squad?: ResolvedCrest;
  playerName?: string;
}

export const CARD_WIDTH = 600;
export const CARD_HEIGHT = 400;
