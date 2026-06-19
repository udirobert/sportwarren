/**
 * Moment card registry — kind → renderer.
 *
 * The v2 satori renderer (`moment-render-v2.ts`) consumes this map.
 * V3 components are data-driven: they consume `avatar` and `squad` props
 * resolved by `src/server/services/personalization/avatar.ts`.
 *
 * v1 components are still exported (prefixed v1_) for rollback if needed.
 */

import React from 'react';
import {
  RecordBrokenCardV3,
  LevelUpCardV3,
  SeasonEndCardV3,
  MatchImportedCardV3,
  AchievementCardV3,
  TwinCreatedCardV3,
  SimCompleteCardV3,
  AttestationMilestoneCardV3,
  CoachingHiredCardV3,
  CoachingExpiredCardV3,
} from './V3Cards';
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
  record_broken: RecordBrokenCardV3,
  level_up: LevelUpCardV3,
  season_end: SeasonEndCardV3,
  match_imported: MatchImportedCardV3,
  achievement: AchievementCardV3,
  twin_created: TwinCreatedCardV3,
  sim_complete: SimCompleteCardV3,
  attestation_milestone: AttestationMilestoneCardV3,
  coaching_hired: CoachingHiredCardV3,
  coaching_expired: CoachingExpiredCardV3,
};

export const FALLBACK_CARD: MomentCardComponent = DefaultCard;

export function resolveCard(kind: string): MomentCardComponent {
  return CARDS[kind] ?? FALLBACK_CARD;
}

export {
  // v1 (Space Grotesk) — kept for rollback
  RecordBrokenCard as v1_RecordBrokenCard,
  LevelUpCard as v1_LevelUpCard,
  SeasonEndCard as v1_SeasonEndCard,
  MatchImportedCard as v1_MatchImportedCard,
  AchievementCard as v1_AchievementCard,
  TwinCreatedCard as v1_TwinCreatedCard,
  SimCompleteCard as v1_SimCompleteCard,
  AttestationMilestoneCard as v1_AttestationMilestoneCard,
  CoachingHiredCard as v1_CoachingHiredCard,
  CoachingExpiredCard as v1_CoachingExpiredCard,
  DefaultCard,
  // V3 (Risograph) — active
  RecordBrokenCardV3,
  LevelUpCardV3,
  SeasonEndCardV3,
  MatchImportedCardV3,
  AchievementCardV3,
  TwinCreatedCardV3,
  SimCompleteCardV3,
  AttestationMilestoneCardV3,
  CoachingHiredCardV3,
  CoachingExpiredCardV3,
};
export type { MomentCardProps, MomentForRender, ResolvedAvatar, ResolvedCrest } from './types';
