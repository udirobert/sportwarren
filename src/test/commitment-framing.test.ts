import { describe, expect, it } from 'vitest';
import { commitmentFraming } from '@/server/services/personalization/commitment-framing';

describe('commitmentFraming', () => {
  it('loss-frames the ritual when short of target', () => {
    const f = commitmentFraming(7, 10, false);
    expect(f.met).toBe(false);
    expect(f.toGo).toBe(3);
    expect(f.line).toContain('3 more');
  });

  it('marks the game on once the target is met', () => {
    const f = commitmentFraming(10, 10, false);
    expect(f.met).toBe(true);
    expect(f.toGo).toBe(0);
    expect(f.line).toContain("game's on");
  });

  it('acknowledges the viewer when they are already in', () => {
    expect(commitmentFraming(5, 10, true).line).toMatch(/You're in/);
    expect(commitmentFraming(10, 10, true).line).toMatch(/You're in/);
  });

  it('invites the first mover when nobody is in', () => {
    const f = commitmentFraming(0, 10, false);
    expect(f.line).toContain('first');
    expect(f.toGo).toBe(10);
  });

  it('never goes negative on toGo when over target', () => {
    expect(commitmentFraming(14, 10, true).toGo).toBe(0);
  });

  it('does not shame — no "everyone is in but you" framing', () => {
    for (let i = 0; i <= 12; i++) {
      const line = commitmentFraming(i, 10, false).line.toLowerCase();
      expect(line).not.toContain('everyone');
      expect(line).not.toContain('only you');
    }
  });
});
