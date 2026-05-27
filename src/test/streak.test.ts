import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  getStreakTier,
  getStreakXPBonus,
  getNextMilestone,
  computeStreakState,
} from '@/lib/engagement/streak';

describe('Streak System', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  describe('getStreakTier', () => {
    it('returns cold for 0-1 weeks', () => {
      expect(getStreakTier(0)).toBe('cold');
      expect(getStreakTier(1)).toBe('cold');
    });

    it('returns warming for 2-3 weeks', () => {
      expect(getStreakTier(2)).toBe('warming');
      expect(getStreakTier(3)).toBe('warming');
    });

    it('returns hot for 4-7 weeks', () => {
      expect(getStreakTier(4)).toBe('hot');
      expect(getStreakTier(7)).toBe('hot');
    });

    it('returns on_fire for 8-11 weeks', () => {
      expect(getStreakTier(8)).toBe('on_fire');
      expect(getStreakTier(11)).toBe('on_fire');
    });

    it('returns unstoppable for 12+ weeks', () => {
      expect(getStreakTier(12)).toBe('unstoppable');
      expect(getStreakTier(52)).toBe('unstoppable');
    });
  });

  describe('getStreakXPBonus', () => {
    it('returns 0% for cold tier', () => {
      expect(getStreakXPBonus(0)).toBe(0);
      expect(getStreakXPBonus(1)).toBe(0);
    });

    it('returns 5% for warming tier', () => {
      expect(getStreakXPBonus(2)).toBe(5);
    });

    it('returns 10% for hot tier', () => {
      expect(getStreakXPBonus(4)).toBe(10);
    });

    it('returns 20% for on_fire tier', () => {
      expect(getStreakXPBonus(8)).toBe(20);
    });

    it('returns 30% for unstoppable tier', () => {
      expect(getStreakXPBonus(12)).toBe(30);
    });
  });

  describe('getNextMilestone', () => {
    it('returns 2 when streak is 0', () => {
      expect(getNextMilestone(0)).toBe(2);
    });

    it('returns 4 when streak is 2', () => {
      expect(getNextMilestone(2)).toBe(4);
    });

    it('returns 8 when streak is 4', () => {
      expect(getNextMilestone(4)).toBe(8);
    });

    it('returns 20 when streak is 12', () => {
      expect(getNextMilestone(12)).toBe(20);
    });

    it('returns current + 10 when beyond all milestones', () => {
      expect(getNextMilestone(52)).toBe(62);
    });
  });

  describe('computeStreakState', () => {
    it('returns cold state with no activity', () => {
      const state = computeStreakState(null, 0, 0, 50);
      expect(state.streakTier).toBe('cold');
      expect(state.currentStreak).toBe(0);
      expect(state.xpBonus).toBe(0);
      expect(state.sharpness).toBe(50);
    });

    it('shows decay warning when activity is recent', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-05-27T12:00:00Z'));

      // Last activity 5 days ago -> 2 days until decay
      const lastActivity = new Date('2026-05-22T12:00:00Z');
      const state = computeStreakState(lastActivity, 4, 4, 70);
      expect(state.decayWarning).toBeTruthy();
      expect(state.daysUntilDecay).toBe(2);
    });

    it('shows critical warning when decay is imminent', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-05-27T12:00:00Z'));

      // Last activity 7 days ago -> 0 days until decay
      const lastActivity = new Date('2026-05-20T12:00:00Z');
      const state = computeStreakState(lastActivity, 4, 4, 70);
      expect(state.decayWarning).toContain('at risk');
      expect(state.daysUntilDecay).toBe(0);
    });

    it('returns no decay warning when activity is fresh', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-05-27T12:00:00Z'));

      const lastActivity = new Date('2026-05-26T12:00:00Z');
      const state = computeStreakState(lastActivity, 4, 4, 80);
      expect(state.decayWarning).toBeNull();
      expect(state.daysUntilDecay).toBe(6);
    });

    it('computes correct sharpness labels', () => {
      const elite = computeStreakState(null, 0, 0, 90);
      expect(elite.sharpnessLabel).toBe('Match Fit');

      const fit = computeStreakState(null, 0, 0, 70);
      expect(fit.sharpnessLabel).toBe('Fit');

      const rusty = computeStreakState(null, 0, 0, 40);
      expect(rusty.sharpnessLabel).toBe('Rusty');

      const cold = computeStreakState(null, 0, 0, 10);
      expect(cold.sharpnessLabel).toBe('Cold');
    });

    it('passes through streak values correctly', () => {
      const state = computeStreakState(new Date(), 8, 12, 85);
      expect(state.currentStreak).toBe(8);
      expect(state.longestStreak).toBe(12);
      expect(state.streakTier).toBe('on_fire');
      expect(state.xpBonus).toBe(20);
      expect(state.nextMilestone).toBe(12);
    });
  });
});
