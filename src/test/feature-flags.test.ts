import { describe, it, expect, beforeEach } from 'vitest';
import { isEnabled, FLAGS, getAllFlags, getFlagForRoute } from '@/lib/feature-flags';

describe('Feature Flags', () => {
  beforeEach(() => {
    // Clean up any FF_ env vars between tests
    for (const key of Object.keys(process.env)) {
      if (key.startsWith('FF_')) {
        delete process.env[key];
      }
    }
  });

  describe('isEnabled', () => {
    it('returns default value when no env var is set', () => {
      expect(isEnabled('MATCH_SUBMISSION')).toBe(true);
      expect(isEnabled('PREDICTION_MARKETS')).toBe(false);
      expect(isEnabled('DAO_GOVERNANCE')).toBe(false);
    });

    it('env var override takes precedence over default', () => {
      process.env.FF_PREDICTION_MARKETS = 'true';
      expect(isEnabled('PREDICTION_MARKETS')).toBe(true);
    });

    it('env var "1" is treated as enabled', () => {
      process.env.FF_DAO_GOVERNANCE = '1';
      expect(isEnabled('DAO_GOVERNANCE')).toBe(true);
    });

    it('env var "false" is treated as disabled', () => {
      process.env.FF_MATCH_SUBMISSION = 'false';
      expect(isEnabled('MATCH_SUBMISSION')).toBe(false);
    });

    it('env var "0" is treated as disabled', () => {
      process.env.FF_SQUAD_MANAGEMENT = '0';
      expect(isEnabled('SQUAD_MANAGEMENT')).toBe(false);
    });

    it('env var is case-insensitive', () => {
      process.env.FF_LENS_SOCIAL = 'TRUE';
      expect(isEnabled('LENS_SOCIAL')).toBe(true);

      process.env.FF_LENS_SOCIAL = 'Yes';
      expect(isEnabled('LENS_SOCIAL')).toBe(true);
    });
  });

  describe('getAllFlags', () => {
    it('returns all flags with their resolved values', () => {
      const flags = getAllFlags();
      expect(Object.keys(flags).length).toBe(Object.keys(FLAGS).length);
      expect(flags.MATCH_SUBMISSION).toBe(true);
      expect(flags.PREDICTION_MARKETS).toBe(false);
    });
  });

  describe('getFlagForRoute', () => {
    it('returns correct flag for gated routes', () => {
      expect(getFlagForRoute('/predict')).toBe('PREDICTION_MARKETS');
      expect(getFlagForRoute('/community')).toBe('COMMUNITY');
      expect(getFlagForRoute('/analytics')).toBe('ANALYTICS');
    });

    it('returns null for ungated routes', () => {
      expect(getFlagForRoute('/dashboard')).toBeNull();
      expect(getFlagForRoute('/match')).toBeNull();
      expect(getFlagForRoute('/squad')).toBeNull();
      expect(getFlagForRoute('/')).toBeNull();
    });

    it('handles nested paths', () => {
      expect(getFlagForRoute('/predict/123')).toBe('PREDICTION_MARKETS');
    });
  });
});
