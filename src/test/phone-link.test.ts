import { describe, it, expect } from 'vitest';
import {
  normalizePhone,
  isPlausiblePhone,
  pickConfirmWord,
  phoneLinkRedisKey,
  requestMessage,
  confirmedMessage,
} from '../server/services/personalization/phone-link';

describe('normalizePhone', () => {
  it('strips everything but digits, including a leading +', () => {
    expect(normalizePhone('+44 7911 123456')).toBe('447911123456');
    expect(normalizePhone('07911-123-456')).toBe('07911123456');
    expect(normalizePhone('(079) 11 123 456')).toBe('07911123456');
  });

  it('matches an inbound webhook-style digits-only number identically', () => {
    // A form-typed +44 number and Kapso's own inbound `message.from` format
    // must collide on the same key or the confirm lookup silently never matches.
    expect(normalizePhone('+44 7911 123456')).toBe(normalizePhone('447911123456'));
  });
});

describe('isPlausiblePhone', () => {
  it('accepts real-shaped numbers in various formats', () => {
    expect(isPlausiblePhone('+44 7911 123456')).toBe(true);
    expect(isPlausiblePhone('07911123456')).toBe(true);
  });

  it('rejects obvious junk', () => {
    expect(isPlausiblePhone('123')).toBe(false);
    expect(isPlausiblePhone('')).toBe(false);
    expect(isPlausiblePhone('abc')).toBe(false);
  });
});

describe('pickConfirmWord', () => {
  it('is deterministic for a given index', () => {
    expect(pickConfirmWord(0)).toBe(pickConfirmWord(0));
  });

  it('wraps out-of-range indices instead of returning undefined', () => {
    expect(pickConfirmWord(999)).toBeTruthy();
    expect(pickConfirmWord(-1)).toBeTruthy();
  });
});

describe('phoneLinkRedisKey', () => {
  it('namespaces by the normalized phone', () => {
    expect(phoneLinkRedisKey('447911123456')).toBe('phonelink:447911123456');
  });
});

describe('message copy', () => {
  it('differs by context so the ask matches what was actually offered', () => {
    const pregame = requestMessage('Sam', 'BANGER', 'pregame');
    const nextWeek = requestMessage('Sam', 'BANGER', 'next_week');
    expect(pregame).not.toBe(nextWeek);
    expect(pregame).toContain('BANGER');
    expect(nextWeek).toContain('BANGER');
  });

  it('confirmation copy also differs by context', () => {
    expect(confirmedMessage('Sam', 'pregame')).not.toBe(confirmedMessage('Sam', 'next_week'));
  });
});
