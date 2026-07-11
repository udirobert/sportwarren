import { describe, it, expect, beforeEach, vi } from 'vitest';

const store = new Map<string, string>();

vi.mock('../server/services/redis', () => ({
  redisService: {
    get: vi.fn(async (key: string) => store.get(key) ?? null),
    set: vi.fn(async (key: string, value: string) => {
      store.set(key, value);
    }),
  },
}));

import { saveSessionReveal, getSessionReveal, sessionRevealRedisKey } from '../server/services/personalization/session-reveal';

describe('session-reveal', () => {
  beforeEach(() => store.clear());

  it('round-trips a pointer through save/get', async () => {
    await saveSessionReveal('tok123', { squadId: 's1', sessionId: 'sess1' });
    expect(await getSessionReveal('tok123')).toEqual({ squadId: 's1', sessionId: 'sess1' });
  });

  it('returns null for an unknown token', async () => {
    expect(await getSessionReveal('nope')).toBeNull();
  });

  it('returns null for corrupt JSON rather than throwing', async () => {
    store.set(sessionRevealRedisKey('bad'), '{not json');
    expect(await getSessionReveal('bad')).toBeNull();
  });
});
