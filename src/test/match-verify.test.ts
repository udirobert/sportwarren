/**
 * Red-team tests for the parse gate (`verifyParsedMatch`).
 *
 * Plants known-false LLM outputs — the hallucination shapes that would write
 * goals, assists, or opponents nobody mentioned — and asserts the gate
 * catches every one. Also runs honest parses (pattern + honest LLM JSON)
 * through the same gate to keep the honest-rejection count at zero.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

const generateInference = vi.fn();
vi.mock('@/lib/ai/inference', () => ({
  generateInference: (...args: unknown[]) => generateInference(...args),
}));

import {
  parseMatchResult,
  verifyParsedMatch,
  type ParsedMatch,
} from '../lib/ai/match-parser';

function honestParsed(overrides: Partial<ParsedMatch> = {}): ParsedMatch {
  return {
    outcome: 'win',
    opponent: 'Red Lions',
    teamScore: 4,
    opponentScore: 2,
    isHome: true,
    scorers: [{ name: 'Sammy', goals: 2 }],
    assists: [{ name: 'Jo', assists: 1 }],
    confidence: 0.9,
    source: 'llm',
    ...overrides,
  };
}

const RAW = 'we won 4-2 vs Red Lions, Sammy got 2, Jo set one up';

describe('verifyParsedMatch — honest parses pass', () => {
  it('accepts a well-formed parse', () => {
    expect(verifyParsedMatch(honestParsed(), RAW)).toEqual({ ok: true });
  });

  it('accepts self-references', () => {
    for (const name of ['I', 'me', 'You', 'us']) {
      const p = honestParsed({ scorers: [{ name, goals: 2 }] });
      expect(verifyParsedMatch(p, RAW)).toEqual({ ok: true });
    }
  });

  it('accepts empty scorer/assist lists', () => {
    const p = honestParsed({ scorers: [], assists: [] });
    expect(verifyParsedMatch(p, RAW)).toEqual({ ok: true });
  });
});

describe('verifyParsedMatch — planted attacks are caught', () => {
  const attacks: [string, Partial<ParsedMatch>][] = [
    ['invented scorer', { scorers: [{ name: 'Marcus', goals: 1 }] }],
    ['inflated goals', { scorers: [{ name: 'Sammy', goals: 5 }] }],
    [
      'ghost scorer over team total',
      {
        scorers: [
          { name: 'Sammy', goals: 3 },
          { name: 'Jo', goals: 3 },
        ],
      },
    ],
    ['implausible scoreline', { teamScore: 99 }],
    ['negative score', { opponentScore: -1 }],
    ['non-integer score', { teamScore: 4.5 }],
    ['empty opponent', { opponent: '' }],
    ['numeric-only opponent', { opponent: '42' }],
    ['confidence out of range', { confidence: 1.7 }],
    ['zero-goal scorer', { scorers: [{ name: 'Sammy', goals: 0 }] }],
    ['invented assister', { assists: [{ name: 'Dele', assists: 1 }] }],
    [
      'assists exceed team score',
      { assists: [{ name: 'Jo', assists: 9 }] },
    ],
  ];

  for (const [label, overrides] of attacks) {
    it(`rejects: ${label}`, () => {
      const verdict = verifyParsedMatch(honestParsed(overrides), RAW);
      expect(verdict.ok).toBe(false);
      if (!verdict.ok) expect(verdict.reason.length).toBeGreaterThan(0);
    });
  }
});

describe('parseMatchResult — gate applied end-to-end', () => {
  beforeEach(() => generateInference.mockReset());

  it('returns null when the LLM invents a scorer (fail closed)', async () => {
    generateInference.mockResolvedValue({
      content: JSON.stringify({
        teamScore: 4,
        opponentScore: 2,
        opponent: 'Red Lions',
        scorers: [{ name: 'Marcus', goals: 4 }],
        assists: [],
        confidence: 0.95,
      }),
    });

    // Messy phrasing that won't match the deterministic patterns.
    const result = await parseMatchResult(
      'absolutely battered Red Lions on Sunday, finished four-two to us',
    );
    expect(result).toBeNull();
  });

  it('returns the parse when the LLM output is grounded', async () => {
    generateInference.mockResolvedValue({
      content: JSON.stringify({
        teamScore: 4,
        opponentScore: 2,
        opponent: 'Red Lions',
        scorers: [{ name: 'Sammy', goals: 2 }],
        assists: [],
        confidence: 0.95,
      }),
    });

    const result = await parseMatchResult(
      'absolutely battered Red Lions on Sunday, finished four-two to us, Sammy bagged a brace',
    );
    expect(result).toMatchObject({
      teamScore: 4,
      opponentScore: 2,
      scorers: [{ name: 'Sammy', goals: 2 }],
    });
  });
});
