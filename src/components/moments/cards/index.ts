/**
 * Moment card registry — kind → renderer.
 *
 * The v2 satori renderer (`moment-render-v2.ts`) consumes this map.
 * Add an entry per moment kind as its archetype gets built. Unmapped
 * kinds fall back to `DefaultCard`, which carries the SportWarren
 * design system but no archetype-specific composition.
 */

import React from 'react';
import { RecordBrokenCard } from './RecordBrokenCard';
import { LevelUpCard } from './LevelUpCard';
import { DefaultCard } from './DefaultCard';
import { MomentCardProps } from './types';

type MomentCardComponent = (props: MomentCardProps) => React.ReactElement;

export const CARDS: Record<string, MomentCardComponent> = {
  record_broken: RecordBrokenCard,
  level_up: LevelUpCard,
};

export const FALLBACK_CARD: MomentCardComponent = DefaultCard;

export function resolveCard(kind: string): MomentCardComponent {
  return CARDS[kind] ?? FALLBACK_CARD;
}

export { RecordBrokenCard, LevelUpCard, DefaultCard };
export type { MomentCardProps, MomentForRender } from './types';
