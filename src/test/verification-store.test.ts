import { describe, it, expect, beforeEach, vi } from 'vitest';

// In-memory fake for the Redis singleton the store depends on.
const store = new Map<string, string>();

vi.mock('../server/services/redis', () => ({
  redisService: {
    get: vi.fn(async (key: string) => store.get(key) ?? null),
    set: vi.fn(async (key: string, value: string) => {
      store.set(key, value);
    }),
    del: vi.fn(async (key: string) => {
      store.delete(key);
    }),
  },
}));

import { makeGroupVerificationStore, type GroupVerificationLike } from '../server/services/communication/verification-store';

interface TestRecord extends GroupVerificationLike {
  homeScore: number;
}

describe('makeGroupVerificationStore', () => {
  beforeEach(() => {
    store.clear();
  });

  it('round-trips a record through save/get', async () => {
    const s = makeGroupVerificationStore<TestRecord>('whatsapp');
    const rec: TestRecord = {
      matchId: 'm1',
      confirms: ['u1', 'u2'],
      disputes: [],
      createdAt: 1000,
      homeScore: 3,
    };
    await s.save(rec);
    const got = await s.get('m1');
    expect(got).toEqual(rec);
    expect(got?.confirms).toEqual(['u1', 'u2']);
  });

  it('returns null for a missing record', async () => {
    const s = makeGroupVerificationStore<TestRecord>('telegram');
    expect(await s.get('nope')).toBeNull();
  });

  it('removes a record', async () => {
    const s = makeGroupVerificationStore<TestRecord>('whatsapp');
    const rec: TestRecord = { matchId: 'm2', confirms: [], disputes: [], createdAt: 0, homeScore: 0 };
    await s.save(rec);
    await s.remove('m2');
    expect(await s.get('m2')).toBeNull();
  });

  it('namespaces by channel so the same matchId does not collide', async () => {
    const tg = makeGroupVerificationStore<TestRecord>('telegram');
    const wa = makeGroupVerificationStore<TestRecord>('whatsapp');
    await tg.save({ matchId: 'shared', confirms: ['tg'], disputes: [], createdAt: 0, homeScore: 1 });
    await wa.save({ matchId: 'shared', confirms: ['wa'], disputes: [], createdAt: 0, homeScore: 2 });
    expect((await tg.get('shared'))?.confirms).toEqual(['tg']);
    expect((await wa.get('shared'))?.confirms).toEqual(['wa']);
  });

  it('survives corrupt JSON by returning null', async () => {
    const s = makeGroupVerificationStore<TestRecord>('whatsapp');
    store.set('groupverif:whatsapp:bad', '{not json');
    expect(await s.get('bad')).toBeNull();
  });
});
