import { describe, expect, it } from 'vitest';
import { getJourneyNextAction, getJourneyZeroState } from '@/lib/journey/content';

describe('journey content helpers', () => {
  it('routes account-ready users toward the first match', () => {
    expect(getJourneyNextAction('account_ready')).toEqual({
      label: 'Set up your tactics',
      href: '/match/preview',
    });
  });

  it('keeps verified users without squads focused on squad creation', () => {
    expect(getJourneyZeroState('verified_no_squad', 'community_squads')).toMatchObject({
      title: 'No squads listed yet',
      actionLabel: 'Create squad',
      actionHref: '/squad',
    });
  });

  it('sends preview users to account creation when a protected surface is empty', () => {
    expect(getJourneyZeroState('guest_preview', 'stats_locked')).toMatchObject({
      actionLabel: 'Start your own season',
      actionHref: '/?connect=1',
    });
  });
});
