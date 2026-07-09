import { describe, expect, it } from 'vitest';
import {
  formatBibsForTelegram,
  type BibsResult,
  type BibsPlayer,
} from '@/server/services/personalization/bibs-optimizer';

function player(name: string, overall: number): BibsPlayer {
  return {
    profileId: `p-${name}`,
    userId: `u-${name}`,
    name,
    position: null,
    attrs: { pace: 50, shooting: 50, passing: 50, dribbling: 50, defending: 50, physical: 50 },
    level: 1,
    overall,
    suggestedRole: 'MID',
  };
}

const RESULT: BibsResult = {
  ok: true,
  format: { playersPerSide: 5 },
  teams: [
    { name: 'Reds', players: [player('Dave', 70), player('Sami', 66)], aggregateOverall: 136, byRole: { GK: [], DEF: [], MID: [], FWD: [] } },
    { name: 'Blues', players: [player('Tom', 68), player('Kev', 67)], aggregateOverall: 135, byRole: { GK: [], DEF: [], MID: [], FWD: [] } },
  ],
  bench: [player('Ricky', 60)],
  balance: { diff: 1, diffPct: 0.7, verdict: 'tightest', label: 'tightest split possible' },
  reasoning: ['Snake-drafted by Overall — tightest split in 4 sessions.'],
};

describe('formatBibsForTelegram', () => {
  it('renders both teams with names and aggregate overall', () => {
    const msg = formatBibsForTelegram(RESULT, 'Tuesday Ballers');
    expect(msg).toContain('Teams are in — Tuesday Ballers');
    expect(msg).toContain('🔴 *Reds* · 136');
    expect(msg).toContain('Dave, Sami');
    expect(msg).toContain('🔵 *Blues* · 135');
    expect(msg).toContain('Tom, Kev');
  });

  it('includes the bench and the lead reasoning line', () => {
    const msg = formatBibsForTelegram(RESULT, 'Tuesday Ballers');
    expect(msg).toContain('Bench');
    expect(msg).toContain('Ricky');
    expect(msg).toContain('tightest split in 4 sessions');
  });

  it('omits the bench line when there is no bench', () => {
    const msg = formatBibsForTelegram({ ...RESULT, bench: [] }, 'Squad');
    expect(msg).not.toContain('Bench');
  });

  it('never leaks a phone number (names only)', () => {
    const msg = formatBibsForTelegram(RESULT, 'Squad');
    expect(msg).not.toMatch(/\+?\d{7,}/);
  });
});
