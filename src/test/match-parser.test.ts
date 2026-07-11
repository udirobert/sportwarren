import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the inference layer so the LLM-fallback path is deterministic.
const generateInference = vi.fn();
vi.mock('@/lib/ai/inference', () => ({
  generateInference: (...args: unknown[]) => generateInference(...args),
}));

import {
  parseMatchPattern,
  parseMatchResult,
} from '../lib/ai/match-parser';

describe('parseMatchPattern (deterministic fast path)', () => {
  it('parses "score word vs opponent"', () => {
    expect(parseMatchPattern('4-2 win vs Red Lions')).toMatchObject({
      teamScore: 4,
      opponentScore: 2,
      outcome: 'win',
      opponent: 'Red Lions',
      source: 'pattern',
      confidence: 1,
    });
  });

  it('parses "lost score to opponent"', () => {
    expect(parseMatchPattern('lost 1-3 to Sunday Legends')).toMatchObject({
      teamScore: 1,
      opponentScore: 3,
      outcome: 'loss',
      opponent: 'Sunday Legends',
    });
  });

  it('parses "drew score with opponent"', () => {
    expect(parseMatchPattern('drew 2-2 with Park Rangers')).toMatchObject({
      teamScore: 2,
      opponentScore: 2,
      outcome: 'draw',
      opponent: 'Park Rangers',
    });
  });

  it('parses "we won score against opponent"', () => {
    expect(parseMatchPattern('we won 5-0 against The Wanderers')).toMatchObject({
      teamScore: 5,
      opponentScore: 0,
      outcome: 'win',
      opponent: 'The Wanderers',
    });
  });

  it('parses "beat opponent score" (we are the subject)', () => {
    expect(parseMatchPattern('beat Red Lions 4-2')).toMatchObject({
      teamScore: 4,
      opponentScore: 2,
      outcome: 'win',
      opponent: 'Red Lions',
    });
  });

  it('parses a bare "score vs opponent" and derives the outcome', () => {
    expect(parseMatchPattern('3-1 vs Red Lions')).toMatchObject({
      teamScore: 3,
      opponentScore: 1,
      outcome: 'win',
    });
  });

  it('strips trailing punctuation from the opponent', () => {
    expect(parseMatchPattern('4-2 win vs Red Lions!')?.opponent).toBe('Red Lions');
  });

  it('returns null for non-match chatter', () => {
    expect(parseMatchPattern('who is bringing the bibs on Sunday?')).toBeNull();
    expect(parseMatchPattern('gg lads')).toBeNull();
  });

  it('leaves the ambiguous "beaten by" phrasing to the LLM (pattern returns null)', () => {
    expect(parseMatchPattern('beaten by Rangers 5-2')).toBeNull();
  });
});

describe('parseMatchResult (pattern + LLM orchestration)', () => {
  beforeEach(() => generateInference.mockReset());

  it('uses the pattern path and never calls the LLM for canonical input', async () => {
    const result = await parseMatchResult('4-2 win vs Red Lions');
    expect(result?.source).toBe('pattern');
    expect(generateInference).not.toHaveBeenCalled();
  });

  it('falls back to the LLM for messy input', async () => {
    generateInference.mockResolvedValue({
      content: JSON.stringify({
        teamScore: 5,
        opponentScore: 2,
        opponent: 'Rangers',
        isHome: true,
        scorers: [{ name: 'You', goals: 3 }],
        assists: [],
        confidence: 0.9,
      }),
    });
    const result = await parseMatchResult('we smashed the Rangers, I bagged a hattrick, 5-2');
    expect(generateInference).toHaveBeenCalledOnce();
    expect(result).toMatchObject({
      teamScore: 5,
      opponentScore: 2,
      opponent: 'Rangers',
      outcome: 'win',
      source: 'llm',
      scorers: [{ name: 'You', goals: 3 }],
    });
  });

  it('rejects low-confidence LLM output', async () => {
    generateInference.mockResolvedValue({
      content: JSON.stringify({ teamScore: 1, opponentScore: 0, opponent: 'X', confidence: 0.4 }),
    });
    expect(await parseMatchResult('maybe we played someone?')).toBeNull();
  });

  it('respects allowLLM:false — pattern only, no inference spend', async () => {
    const result = await parseMatchResult('we smashed them silly', { allowLLM: false });
    expect(result).toBeNull();
    expect(generateInference).not.toHaveBeenCalled();
  });
});
