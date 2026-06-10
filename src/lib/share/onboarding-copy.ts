/**
 * Pure share-text builders for the onboarding flow. Lives next to the
 * other share helpers in src/lib/share/ so the formatting rules have a
 * single source of truth. No DOM, no fetch — table-testable.
 */

import type { PlayerPosition } from '@/types';

export interface SquadShareInput {
  playerName: string;
  formation: string | null;
  teammates: { name: string; position: string }[];
}

export interface MatchResultShareInput {
  playerName: string;
  position: PlayerPosition | null;
  result: 'won' | 'drew' | 'lost' | null;
  formation: string | null;
}

const RESULT_EMOJI: Record<NonNullable<MatchResultShareInput['result']>, string> = {
  won: '🏆',
  drew: '🤝',
  lost: '💪',
};

const RESULT_VERB: Record<NonNullable<MatchResultShareInput['result']>, string> = {
  won: 'Win',
  drew: 'Draw',
  lost: 'Loss',
};

/**
 * Build the squad share text. Kept word-for-word compatible with the
 * previous inline builder in OnboardingFlow.handleShareSquad.
 */
export function buildSquadShareText({ playerName, formation, teammates }: SquadShareInput): string {
  const playerCount = teammates.length + 1;
  return [
    '🪪 I built my squad on SportWarren',
    '',
    `👤 ${playerName || 'Me'}`,
    `📋 ${formation || '4-4-2'}`,
    `👥 ${playerCount} players`,
    '',
    'Come join and make the stats real.',
  ].join('\n');
}

/**
 * Build the per-player match-result share text. Compatible with the
 * previous inline builder in OnboardingFlow.handleSharePlayerCard.
 */
export function buildMatchResultShareText({
  playerName,
  position,
  result,
  formation,
}: MatchResultShareInput): string {
  const resultEmoji = result ? (RESULT_EMOJI[result] ?? '🪪') : '🪪';
  const resultLine = result
    ? `${resultEmoji} Last result: ${RESULT_VERB[result]}`
    : '';
  return [
    `🪪 My player card — ${playerName || 'New Player'} (${position ?? 'MF'})`,
    resultLine,
    `📋 ${formation || '4-4-2'}`,
    'Build yours on SportWarren and make the stats real.',
  ]
    .filter(Boolean)
    .join('\n\n');
}

/**
 * Canonical web URL for an onboarding share. SSR-safe.
 */
export function buildOnboardingShareUrl(): string {
  if (typeof window === 'undefined') return 'https://sportwarren.com';
  return `${window.location.origin}/?connect=1`;
}
