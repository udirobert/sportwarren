/**
 * Moment card prop contract. Each card component consumes a Moment row
 * (matching the Prisma `Moment` shape relevant for rendering) and produces
 * a 600×400 inline-styled JSX tree consumable by satori.
 *
 * The card components are deliberately not Tailwind-className-based — satori
 * processes inline styles only.
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

export interface MomentCardProps {
  moment: MomentForRender;
}

export const CARD_WIDTH = 600;
export const CARD_HEIGHT = 400;
