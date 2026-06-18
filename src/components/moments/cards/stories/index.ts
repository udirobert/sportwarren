/**
 * Story-format card registry — 1080×1920 adaptations.
 *
 * Each entry corresponds to a moment kind in the main CARDS registry
 * (src/components/moments/cards/index.ts). The compositions are
 * reflowed for portrait aspect ratio with top-to-bottom flow tuned for
 * Instagram Stories / TikTok / YouTube Shorts.
 *
 * Consumed by:
 *   - scripts/render-stories.tsx (asset regeneration)
 *   - any future API route that serves story-format renders
 */

import React from 'react';
import { RecordBrokenStory } from './RecordBrokenStory';
import { LevelUpStory } from './LevelUpStory';
import { SeasonEndStory } from './SeasonEndStory';
import { MatchImportedStory } from './MatchImportedStory';
import { AchievementStory } from './AchievementStory';
import { TwinCreatedStory } from './TwinCreatedStory';
import { SimCompleteStory } from './SimCompleteStory';
import { AttestationMilestoneStory } from './AttestationMilestoneStory';
import { CoachingHiredStory } from './CoachingHiredStory';
import { CoachingExpiredStory } from './CoachingExpiredStory';
import { StoryCardProps } from './types';

type StoryCardComponent = (props: StoryCardProps) => React.ReactElement;

export const CARDS_STORIES: Record<string, StoryCardComponent> = {
  record_broken: RecordBrokenStory,
  level_up: LevelUpStory,
  season_end: SeasonEndStory,
  match_imported: MatchImportedStory,
  achievement: AchievementStory,
  twin_created: TwinCreatedStory,
  sim_complete: SimCompleteStory,
  attestation_milestone: AttestationMilestoneStory,
  coaching_hired: CoachingHiredStory,
  coaching_expired: CoachingExpiredStory,
};

export function resolveStoryCard(kind: string): StoryCardComponent | undefined {
  return CARDS_STORIES[kind];
}

export {
  RecordBrokenStory,
  LevelUpStory,
  SeasonEndStory,
  MatchImportedStory,
  AchievementStory,
  TwinCreatedStory,
  SimCompleteStory,
  AttestationMilestoneStory,
  CoachingHiredStory,
  CoachingExpiredStory,
};
export { STORY_WIDTH, STORY_HEIGHT } from './types';
export type { StoryCardProps } from './types';
