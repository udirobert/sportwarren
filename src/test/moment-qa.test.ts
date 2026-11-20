/**
 * Tests for the moment-card QA gate (`moment-qa`).
 *
 * verifyMomentPng is exercised against synthetic PNG headers — the gate only
 * reads the signature, IHDR, and byte count, so fabricated buffers are a
 * faithful stand-in for real resvg output and keep this suite offline-safe.
 */

import { describe, it, expect } from 'vitest';
import {
  MomentQaError,
  verifyMomentPng,
  verifyMomentRow,
} from '../server/services/personalization/moment-qa';

const EXPECTED = { width: 1200, height: 800 };

function fakePng(width: number, height: number, totalBytes = 5000): Buffer {
  const png = Buffer.alloc(Math.max(totalBytes, 33));
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(png, 0);
  png.writeUInt32BE(13, 8); // IHDR length
  png.write('IHDR', 12, 'ascii');
  png.writeUInt32BE(width, 16);
  png.writeUInt32BE(height, 20);
  return png;
}

const goodRow = {
  kind: 'level_up',
  tier: 'standard',
  label: 'Level 5 reached',
  detail: 'Overall 68 → 71',
  createdAt: new Date(),
  subjectType: 'player',
};

describe('verifyMomentRow', () => {
  it('accepts a well-formed moment', () => {
    expect(() => verifyMomentRow(goodRow)).not.toThrow();
  });

  it.each([
    ['empty label', { label: '' }],
    ['missing kind', { kind: '' }],
    ['missing tier', { tier: '' }],
    ['bad subjectType', { subjectType: 'league' }],
    ['oversized label', { label: 'x'.repeat(201) }],
    ['oversized detail', { detail: 'x'.repeat(501) }],
    ['invalid date', { createdAt: new Date('not-a-date') }],
  ])('rejects: %s', (_label, overrides) => {
    expect(() => verifyMomentRow({ ...goodRow, ...overrides })).toThrow(MomentQaError);
  });
});

describe('verifyMomentPng', () => {
  it('accepts a correctly-sized PNG', () => {
    expect(() => verifyMomentPng(fakePng(1200, 800), EXPECTED)).not.toThrow();
  });

  it('rejects a non-PNG buffer', () => {
    expect(() => verifyMomentPng(Buffer.from('not a png at all'), EXPECTED)).toThrow(
      MomentQaError,
    );
  });

  it('rejects wrong dimensions', () => {
    expect(() => verifyMomentPng(fakePng(600, 400), EXPECTED)).toThrow(
      /dimensions 600x400/,
    );
  });

  it('rejects a suspiciously small (blank) render', () => {
    expect(() => verifyMomentPng(fakePng(1200, 800, 1000), EXPECTED)).toThrow(
      /blank render/,
    );
  });

  it('rejects a truncated buffer that still has a signature', () => {
    const truncated = fakePng(1200, 800).subarray(0, 20);
    expect(() => verifyMomentPng(truncated, EXPECTED)).toThrow(MomentQaError);
  });
});
