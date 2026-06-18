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
import { SeasonEndCard } from './SeasonEndCard';
import { MatchImportedCard } from './MatchImportedCard';
import { AchievementCard } from './AchievementCard';
import { TwinCreatedCard } from './TwinCreatedCard';
import { SimCompleteCard } from './SimCompleteCard';
import { AttestationMilestoneCard } from './AttestationMilestoneCard';
import { CoachingHiredCard } from './CoachingHiredCard';
import { CoachingExpiredCard } from './CoachingExpiredCard';
import { DefaultCard } from './DefaultCard';
import { MomentCardProps } from './types';

type MomentCardComponent = (props: MomentCardProps) => React.ReactElement;

export const CARDS: Record<string, MomentCardComponent> = {
  record_broken: RecordBrokenCard,
  level_up: LevelUpCard,
  season_end: SeasonEndCard,
  match_imported: MatchImportedCard,
  achievement: AchievementCard,
  twin_created: TwinCreatedCard,
  sim_complete: SimCompleteCard,
  attestation_milestone: AttestationMilestoneCard,
  coaching_hired: CoachingHiredCard,
  coaching_expired: CoachingExpiredCard,
};

export const FALLBACK_CARD: MomentCardComponent = DefaultCard;

export function resolveCard(kind: string): MomentCardComponent {
  return CARDS[kind] ?? FALLBACK_CARD;
}

export {
  RecordBrokenCard,
  LevelUpCard,
  SeasonEndCard,
  MatchImportedCard,
  AchievementCard,
  TwinCreatedCard,
  SimCompleteCard,
  AttestationMilestoneCard,
  CoachingHiredCard,
  CoachingExpiredCard,
  DefaultCard,
};
export type { MomentCardProps, MomentForRender } from './types';
