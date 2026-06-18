/**
 * Social-format card registry — 1080×1080 adaptations.
 *
 * Each entry corresponds to a moment kind in the main CARDS registry
 * (src/components/moments/cards/index.ts). The compositions are
 * reflowed for square aspect ratio + larger type + stronger wordmark.
 *
 * Consumed by:
 *   - scripts/render-social.tsx (asset regeneration)
 *   - any future API route that serves social-format renders
 */

import React from 'react';
import { RecordBrokenSocial } from './RecordBrokenSocial';
import { LevelUpSocial } from './LevelUpSocial';
import { SeasonEndSocial } from './SeasonEndSocial';
import { MatchImportedSocial } from './MatchImportedSocial';
import { AchievementSocial } from './AchievementSocial';
import { TwinCreatedSocial } from './TwinCreatedSocial';
import { SimCompleteSocial } from './SimCompleteSocial';
import { AttestationMilestoneSocial } from './AttestationMilestoneSocial';
import { CoachingHiredSocial } from './CoachingHiredSocial';
import { CoachingExpiredSocial } from './CoachingExpiredSocial';
import { SocialCardProps } from './types';

type SocialCardComponent = (props: SocialCardProps) => React.ReactElement;

export const CARDS_SOCIAL: Record<string, SocialCardComponent> = {
  record_broken: RecordBrokenSocial,
  level_up: LevelUpSocial,
  season_end: SeasonEndSocial,
  match_imported: MatchImportedSocial,
  achievement: AchievementSocial,
  twin_created: TwinCreatedSocial,
  sim_complete: SimCompleteSocial,
  attestation_milestone: AttestationMilestoneSocial,
  coaching_hired: CoachingHiredSocial,
  coaching_expired: CoachingExpiredSocial,
};

export function resolveSocialCard(kind: string): SocialCardComponent | undefined {
  return CARDS_SOCIAL[kind];
}

export {
  RecordBrokenSocial,
  LevelUpSocial,
  SeasonEndSocial,
  MatchImportedSocial,
  AchievementSocial,
  TwinCreatedSocial,
  SimCompleteSocial,
  AttestationMilestoneSocial,
  CoachingHiredSocial,
  CoachingExpiredSocial,
};
export { SOCIAL_WIDTH, SOCIAL_HEIGHT } from './types';
export type { SocialCardProps } from './types';
