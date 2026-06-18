/**
 * Story-format (1080×1920) moment-card types.
 *
 * Sibling to cards/ (600×400, landscape) and cards/social/ (1080×1080,
 * square). Stories are 9:16 portrait — the format for Instagram Stories,
 * TikTok, YouTube Shorts.
 *
 * Composition principle: read top-to-bottom on a phone. Big bold header,
 * hero element in the upper-middle, stat/detail block lower-middle,
 * SPORTWARREN footer + CTA pinned at the bottom (where the swipe-up
 * action sits).
 */

import { MomentCardProps } from '../types';

export const STORY_WIDTH = 1080;
export const STORY_HEIGHT = 1920;

export type StoryCardProps = MomentCardProps;
