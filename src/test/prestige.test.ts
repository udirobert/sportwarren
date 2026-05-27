import { describe, it, expect } from 'vitest';
import {
  PRESTIGE_TIERS,
  getPrestigeTier,
  getNextPrestigeTier,
  getPrestigeProgress,
} from '@/lib/engagement/prestige';

describe('Prestige System', () => {
  describe('PRESTIGE_TIERS', () => {
    it('has 6 tiers ordered by minTotalXP', () => {
      expect(PRESTIGE_TIERS).toHaveLength(6);
      for (let i = 1; i < PRESTIGE_TIERS.length; i++) {
        expect(PRESTIGE_TIERS[i].minTotalXP).toBeGreaterThan(PRESTIGE_TIERS[i - 1].minTotalXP);
      }
    });

    it('starts at 0 XP for Rookie', () => {
      expect(PRESTIGE_TIERS[0].minTotalXP).toBe(0);
      expect(PRESTIGE_TIERS[0].name).toBe('Rookie');
    });
  });

  describe('getPrestigeTier', () => {
    it('returns Rookie for 0 XP', () => {
      expect(getPrestigeTier(0).name).toBe('Rookie');
    });

    it('returns Rookie for XP below first threshold', () => {
      expect(getPrestigeTier(4999).name).toBe('Rookie');
    });

    it('returns Bronze at exactly 5000 XP', () => {
      expect(getPrestigeTier(5000).name).toBe('Bronze');
    });

    it('returns Silver at 15000 XP', () => {
      expect(getPrestigeTier(15000).name).toBe('Silver');
    });

    it('returns Gold at 35000 XP', () => {
      expect(getPrestigeTier(35000).name).toBe('Gold');
    });

    it('returns Diamond at 75000 XP', () => {
      expect(getPrestigeTier(75000).name).toBe('Diamond');
    });

    it('returns Legend at 150000 XP', () => {
      expect(getPrestigeTier(150000).name).toBe('Legend');
    });

    it('returns Legend for XP above max threshold', () => {
      expect(getPrestigeTier(999999).name).toBe('Legend');
    });

    it('returns the correct tier for intermediate values', () => {
      expect(getPrestigeTier(10000).name).toBe('Bronze');
      expect(getPrestigeTier(25000).name).toBe('Silver');
      expect(getPrestigeTier(50000).name).toBe('Gold');
      expect(getPrestigeTier(100000).name).toBe('Diamond');
    });
  });

  describe('getNextPrestigeTier', () => {
    it('returns Bronze when at Rookie', () => {
      const next = getNextPrestigeTier(0);
      expect(next).not.toBeNull();
      expect(next!.name).toBe('Bronze');
    });

    it('returns Silver when at Bronze', () => {
      const next = getNextPrestigeTier(5000);
      expect(next).not.toBeNull();
      expect(next!.name).toBe('Silver');
    });

    it('returns null when at max tier (Legend)', () => {
      expect(getNextPrestigeTier(150000)).toBeNull();
    });

    it('returns null for XP above Legend threshold', () => {
      expect(getNextPrestigeTier(500000)).toBeNull();
    });
  });

  describe('getPrestigeProgress', () => {
    it('returns 0% progress at tier boundary', () => {
      const result = getPrestigeProgress(5000);
      expect(result.tier.name).toBe('Bronze');
      expect(result.nextTier!.name).toBe('Silver');
      expect(result.progress).toBe(0);
    });

    it('returns 0% progress at the start of a tier', () => {
      const result = getPrestigeProgress(15000);
      expect(result.tier.name).toBe('Silver');
      expect(result.progress).toBe(0);
    });

    it('returns 50% progress at midpoint', () => {
      // Bronze: 5000, Silver: 15000, midpoint: 10000
      const result = getPrestigeProgress(10000);
      expect(result.progress).toBe(50);
    });

    it('calculates correct xpToNext', () => {
      const result = getPrestigeProgress(8000);
      expect(result.tier.name).toBe('Bronze');
      expect(result.xpToNext).toBe(7000); // 15000 - 8000
    });

    it('returns 100% progress and 0 xpToNext at max tier', () => {
      const result = getPrestigeProgress(200000);
      expect(result.tier.name).toBe('Legend');
      expect(result.nextTier).toBeNull();
      expect(result.progress).toBe(100);
      expect(result.xpToNext).toBe(0);
    });

    it('clamps progress at 100%', () => {
      const result = getPrestigeProgress(14999);
      expect(result.progress).toBeLessThanOrEqual(100);
    });
  });
});
