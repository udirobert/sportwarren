import { describe, it, expect } from 'vitest';
import {
  getWeeklyChallenges,
  getWeekProgress,
  getWeekStartDate,
  getDaysUntilReset,
} from '@/lib/engagement/challenges';

describe('Weekly Challenges', () => {
  describe('getWeeklyChallenges', () => {
    it('returns the requested number of challenges', () => {
      const challenges = getWeeklyChallenges(3);
      expect(challenges).toHaveLength(3);
    });

    it('returns unique challenges', () => {
      const challenges = getWeeklyChallenges(5);
      const ids = challenges.map((c) => c.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('returns the same challenges for the same week', () => {
      const first = getWeeklyChallenges(3);
      const second = getWeeklyChallenges(3);
      expect(first.map((c) => c.id)).toEqual(second.map((c) => c.id));
    });

    it('defaults to 3 challenges', () => {
      const challenges = getWeeklyChallenges();
      expect(challenges).toHaveLength(3);
    });

    it('returns valid challenge objects', () => {
      const challenges = getWeeklyChallenges(3);
      for (const c of challenges) {
        expect(c.id).toBeTruthy();
        expect(c.title).toBeTruthy();
        expect(c.description).toBeTruthy();
        expect(c.target).toBeGreaterThan(0);
        expect(c.xpReward).toBeGreaterThan(0);
        expect(c.icon).toBeTruthy();
        expect(['scoring', 'playmaking', 'activity', 'social']).toContain(c.category);
      }
    });
  });

  describe('getWeekProgress', () => {
    const stats = {
      goals: 2,
      assists: 1,
      matches: 3,
      ratings: 4,
      wins: 1,
      cleanSheets: 0,
      verifications: 2,
      hatTricks: 0,
    };

    it('returns goals for score-3 challenge', () => {
      const challenge = { id: 'score-3' } as any;
      expect(getWeekProgress(challenge, stats)).toBe(2);
    });

    it('returns assists for assist-2 challenge', () => {
      const challenge = { id: 'assist-2' } as any;
      expect(getWeekProgress(challenge, stats)).toBe(1);
    });

    it('returns matches for play-3 challenge', () => {
      const challenge = { id: 'play-3' } as any;
      expect(getWeekProgress(challenge, stats)).toBe(3);
    });

    it('returns ratings for rate-5 challenge', () => {
      const challenge = { id: 'rate-5' } as any;
      expect(getWeekProgress(challenge, stats)).toBe(4);
    });

    it('returns wins for win-2 challenge', () => {
      const challenge = { id: 'win-2' } as any;
      expect(getWeekProgress(challenge, stats)).toBe(1);
    });

    it('returns cleanSheets for clean-sheet challenge', () => {
      const challenge = { id: 'clean-sheet' } as any;
      expect(getWeekProgress(challenge, stats)).toBe(0);
    });

    it('returns hatTricks for score-hat-trick challenge', () => {
      const challenge = { id: 'score-hat-trick' } as any;
      expect(getWeekProgress(challenge, stats)).toBe(0);
    });

    it('returns verifications for verify-3 challenge', () => {
      const challenge = { id: 'verify-3' } as any;
      expect(getWeekProgress(challenge, stats)).toBe(2);
    });

    it('returns 0 for unknown challenge id', () => {
      const challenge = { id: 'unknown' } as any;
      expect(getWeekProgress(challenge, stats)).toBe(0);
    });
  });

  describe('getWeekStartDate', () => {
    it('returns a Monday', () => {
      const monday = getWeekStartDate();
      // getUTCDay: 0=Sun, 1=Mon, ..., 6=Sat
      expect(monday.getUTCDay()).toBe(1);
    });

    it('returns midnight UTC', () => {
      const monday = getWeekStartDate();
      expect(monday.getUTCHours()).toBe(0);
      expect(monday.getUTCMinutes()).toBe(0);
      expect(monday.getUTCSeconds()).toBe(0);
      expect(monday.getUTCMilliseconds()).toBe(0);
    });
  });

  describe('getDaysUntilReset', () => {
    it('returns a positive number', () => {
      const days = getDaysUntilReset();
      expect(days).toBeGreaterThan(0);
      expect(days).toBeLessThanOrEqual(7);
    });
  });
});
