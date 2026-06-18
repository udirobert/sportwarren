/**
 * Social-format moment-card types.
 *
 * Sibling to the main 600×400 cards. Each archetype in src/components/
 * moments/cards/ has a corresponding *Social.tsx here that renders the
 * same moment data at 1080×1080 — Instagram-post / X-image / LinkedIn
 * post format.
 *
 * Sized for direct social distribution: a captain can post one of
 * these without any reformatting. Same archetype palette and
 * composition language as the landscape cards — just reflowed for the
 * square aspect ratio with more breathing room, larger type, and
 * stronger SPORTWARREN branding (the card is the post, not a row
 * inside a gallery).
 */

import { MomentCardProps } from '../types';

export const SOCIAL_WIDTH = 1080;
export const SOCIAL_HEIGHT = 1080;

export type SocialCardProps = MomentCardProps;
