import { describe, expect, it } from 'vitest';
import {
  buildCareerHighlights,
  buildPlayerFormSnapshot,
  buildSeasonAchievements,
  buildSeasonRecord,
} from '@/lib/player/season-summary';

const squadId = 'squad-home';

const settledMatches = [
  {
    id: 'match-1',
    status: 'verified',
    matchDate: new Date('2026-03-01T12:00:00.000Z'),
    homeSquadId: squadId,
    awaySquadId: 'squad-away-1',
    homeScore: 2,
    awayScore: 1,
    homeSquad: { name: 'Hackney Marshes' },
    awaySquad: { name: 'Red Lions' },
  },
  {
    id: 'match-2',
    status: 'finalized',
    matchDate: new Date('2026-03-08T12:00:00.000Z'),
    homeSquadId: 'squad-away-2',
    awaySquadId: squadId,
    homeScore: 2,
    awayScore: 2,
    homeSquad: { name: 'Sunday Legends' },
    awaySquad: { name: 'Hackney Marshes' },
  },
  {
    id: 'match-3',
    status: 'verified',
    matchDate: new Date('2026-03-15T12:00:00.000Z'),
    homeSquadId: squadId,
    awaySquadId: 'squad-away-3',
    homeScore: 4,
    awayScore: 1,
    homeSquad: { name: 'Hackney Marshes' },
    awaySquad: { name: 'Park Rangers' },
  },
];

describe('player season summary helpers', () => {
  it('builds a verified season record from settled matches', () => {
    expect(buildSeasonRecord(settledMatches, squadId)).toEqual({
      wins: 2,
      draws: 1,
      losses: 0,
      settled: 3,
    });
  });

  it('derives live achievements from season totals and results', () => {
    const achievements = buildSeasonAchievements({
      totalGoals: 3,
      totalAssists: 2,
      reputationScore: 320,
      xp: {
        level: 4,
        totalXP: 1400,
        seasonXP: 600,
        nextLevelXP: 4000,
      },
    }, settledMatches, squadId);

    expect(achievements.map((achievement) => achievement.id)).toContain('verified-debut');
    expect(achievements.map((achievement) => achievement.id)).toContain('first-win');
    expect(achievements.map((achievement) => achievement.id)).toContain('goal-getter');
    expect(achievements.map((achievement) => achievement.id)).toContain('playmaker');
    expect(achievements.map((achievement) => achievement.id)).toContain('trusted-regular');
  });

  it('builds career highlights from verified results without fabricating events', () => {
    const highlights = buildCareerHighlights(settledMatches, squadId);

    expect(highlights).toHaveLength(2);
    expect(highlights[0]?.id).toBe('latest-result-match-3');
    expect(highlights.some((highlight) => highlight.id === 'season-debut-match-1')).toBe(true);
    expect(highlights.some((highlight) => highlight.id === 'statement-win-match-3')).toBe(false);
  });

  it('calculates form from timestamped form entries in chronological order', () => {
    const form = buildPlayerFormSnapshot([
      { rating: 7.8, createdAt: new Date('2026-03-10T12:00:00.000Z') },
      { rating: 6.2, createdAt: new Date('2026-03-01T12:00:00.000Z') },
      { rating: 8.1, createdAt: new Date('2026-03-17T12:00:00.000Z') },
    ]);

    expect(form.history).toEqual([6.2, 7.8, 8.1]);
    expect(form.trend).toBe('stable');
    expect(form.current).toBeGreaterThanOrEqual(0);
  });
});
