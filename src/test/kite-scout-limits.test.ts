import { afterEach, describe, expect, it } from 'vitest';
import { kiteAIService } from '@/server/services/ai/kite';

const ENV_KEYS = [
  'KITE_SCOUT_MAX_USDC',
  'KITE_SCOUT_MAX_USDC_SQUAD',
  'KITE_SCOUT_DEV_USER_IDS',
  'KITE_SCOUT_DEV_MAX_USDC',
  'KITE_SCOUT_USER_LIMIT_OVERRIDES_USDC',
  'KITE_SCOUT_SQUAD_LIMIT_OVERRIDES_USDC',
  'KITE_SCOUT_UNLIMITED_USER_IDS',
  'KITE_SCOUT_UNLIMITED_SQUAD_IDS',
] as const;

afterEach(() => {
  for (const key of ENV_KEYS) {
    delete process.env[key];
  }
});

describe('Kite scout daily limits', () => {
  it('uses the default per-user and per-squad scout limits', () => {
    expect(kiteAIService.getScoutUserDailyLimit('user_1')).toBe(0.5);
    expect(kiteAIService.getScoutSquadDailyLimit('squad_1')).toBe(2.5);
  });

  it('supports explicit dev user and squad overrides', () => {
    process.env.KITE_SCOUT_DEV_USER_IDS = 'user_dev';
    process.env.KITE_SCOUT_DEV_MAX_USDC = '12';
    process.env.KITE_SCOUT_SQUAD_LIMIT_OVERRIDES_USDC = 'squad_dev:20';

    expect(kiteAIService.getScoutUserDailyLimit('user_dev')).toBe(12);
    expect(kiteAIService.getScoutSquadDailyLimit('squad_dev')).toBe(20);
  });

  it('supports unlimited internal actors', () => {
    process.env.KITE_SCOUT_UNLIMITED_USER_IDS = 'user_owner';
    process.env.KITE_SCOUT_UNLIMITED_SQUAD_IDS = 'squad_owner';

    expect(kiteAIService.getScoutUserDailyLimit('user_owner')).toBe(0);
    expect(kiteAIService.getScoutUserDailyLimit('cron:auto-scout')).toBe(0);
    expect(kiteAIService.getScoutSquadDailyLimit('squad_owner')).toBe(0);
  });
});
