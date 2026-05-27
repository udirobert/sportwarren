import { describe, it, expect, vi } from 'vitest';
import {
  REFERRAL_REWARDS,
  getReferralXP,
  getTotalReferralXP,
  buildReferralLink,
  buildReferralShareText,
} from '@/lib/engagement/referral';

describe('Referral System', () => {
  describe('REFERRAL_REWARDS', () => {
    it('has 4 reward tiers', () => {
      expect(Object.keys(REFERRAL_REWARDS)).toHaveLength(4);
    });

    it('each reward has required fields', () => {
      for (const [key, reward] of Object.entries(REFERRAL_REWARDS)) {
        expect(reward.event).toBe(key);
        expect(reward.xp).toBeGreaterThan(0);
        expect(reward.scoutXP).toBeGreaterThan(0);
        expect(reward.description).toBeTruthy();
      }
    });

    it('has signup, first_match, first_verification, join_squad events', () => {
      expect(REFERRAL_REWARDS.signup).toBeDefined();
      expect(REFERRAL_REWARDS.first_match).toBeDefined();
      expect(REFERRAL_REWARDS.first_verification).toBeDefined();
      expect(REFERRAL_REWARDS.join_squad).toBeDefined();
    });
  });

  describe('getReferralXP', () => {
    it('returns the reward for a valid event', () => {
      const reward = getReferralXP('signup');
      expect(reward).not.toBeNull();
      expect(reward!.xp).toBe(50);
      expect(reward!.scoutXP).toBe(10);
    });

    it('returns null for an invalid event', () => {
      expect(getReferralXP('nonexistent' as any)).toBeNull();
    });

    it('returns correct XP for each event', () => {
      expect(getReferralXP('signup')!.xp).toBe(50);
      expect(getReferralXP('first_match')!.xp).toBe(100);
      expect(getReferralXP('first_verification')!.xp).toBe(75);
      expect(getReferralXP('join_squad')!.xp).toBe(150);
    });
  });

  describe('getTotalReferralXP', () => {
    it('returns 0 for empty events', () => {
      const result = getTotalReferralXP([]);
      expect(result.xp).toBe(0);
      expect(result.scoutXP).toBe(0);
    });

    it('sums XP for all valid events', () => {
      const result = getTotalReferralXP(['signup', 'first_match', 'join_squad']);
      expect(result.xp).toBe(50 + 100 + 150);
      expect(result.scoutXP).toBe(10 + 20 + 25);
    });

    it('ignores unknown events', () => {
      const result = getTotalReferralXP(['signup', 'unknown_event']);
      expect(result.xp).toBe(50);
      expect(result.scoutXP).toBe(10);
    });

    it('handles duplicate events by counting them twice', () => {
      const result = getTotalReferralXP(['signup', 'signup']);
      expect(result.xp).toBe(100);
    });

    it('calculates max possible referral XP correctly', () => {
      const allEvents = Object.keys(REFERRAL_REWARDS);
      const result = getTotalReferralXP(allEvents);
      const expectedXP = Object.values(REFERRAL_REWARDS).reduce((s, r) => s + r.xp, 0);
      expect(result.xp).toBe(expectedXP);
    });
  });

  describe('buildReferralLink', () => {
    it('returns relative path on server', () => {
      // In jsdom, window.location.origin is set
      const link = buildReferralLink('user123');
      expect(link).toContain('/join?ref=user123');
    });

    it('encodes the userId', () => {
      const link = buildReferralLink('user/with?special');
      expect(link).toContain(encodeURIComponent('user/with?special'));
    });
  });

  describe('buildReferralShareText', () => {
    it('includes the player name', () => {
      const text = buildReferralShareText('Marcus');
      expect(text).toContain('Marcus');
    });

    it('mentions SportWarren', () => {
      const text = buildReferralShareText('Player');
      expect(text).toContain('SportWarren');
    });
  });
});
