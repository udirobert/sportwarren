import { generateInference, AIMessage } from '@/lib/ai/inference';

/**
 * SINGLE SOURCE OF TRUTH for turning a natural-language message into a match
 * result. Both the Telegram and WhatsApp surfaces route through `parseMatchResult`
 * — never re-implement score parsing at a call site.
 *
 * Two-tier by design (PERFORMANT): a fast, free, deterministic PATTERN pass for
 * the canonical grassroots phrasings, then an LLM fallback for the messy tail
 * ("we smashed the Rangers, I bagged a hattrick"). Callers that must control
 * inference spend pass `{ allowLLM: false }` (or a rate-limit boolean) to stay
 * on the pattern pass only.
 */

export interface MatchScorer {
  name: string;
  goals: number;
}

export interface MatchAssister {
  name: string;
  assists: number;
}

export interface ParsedMatch {
  outcome: 'win' | 'loss' | 'draw';
  /** Opponent name as written by the user (resolved to a squad downstream). */
  opponent: string;
  /** The logging squad's score. */
  teamScore: number;
  /** The opponent's score. */
  opponentScore: number;
  /** Whether the logging squad played at home. Defaults true. */
  isHome: boolean;
  /** Goalscorers captured from the message (empty on the pattern path). */
  scorers: MatchScorer[];
  /** Assist providers captured from the message (empty on the pattern path). */
  assists: MatchAssister[];
  /** 1 for a deterministic pattern match; the model's self-reported score for LLM. */
  confidence: number;
  source: 'pattern' | 'llm';
}

// Minimum LLM self-confidence to accept a parse. Single gate — previously three
// different thresholds (0.5 / 0.7 / 0.75) were scattered across call sites.
const MIN_LLM_CONFIDENCE = 0.7;

/**
 * THE GATE — deterministic verification of a parse before it can reach the
 * write path. The model picks and phrases; code checks. Nothing leaves
 * `parseMatchResult` without passing these checks, on the LLM path AND the
 * pattern path, so every caller inherits the gate for free.
 *
 * The core rule is groundedness: a scorer/assist name the model returns must
 * literally appear in the user's message (or be a self-reference). The LLM has
 * no roster access, so a name not in the text can only be a hallucination —
 * crediting it would write a goal to a player who was never mentioned.
 */
export type ParseVerifyResult = { ok: true } | { ok: false; reason: string };

const SELF_REFS = new Set(['i', 'me', 'my', 'myself', 'self', 'you', 'us', 'we']);
const MAX_PLAUSIBLE_SCORE = 20;

function normalizeName(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function nameGroundedInText(name: string, normalizedText: string): boolean {
  const n = normalizeName(name);
  if (!n) return false;
  if (SELF_REFS.has(n)) return true;
  return normalizedText.includes(n);
}

function checkCounted(
  entries: { name: string; count: number }[],
  label: string,
  normalizedText: string,
  teamScore: number,
): ParseVerifyResult {
  let total = 0;
  for (const e of entries) {
    if (!e.name || !Number.isInteger(e.count) || e.count < 1) {
      return { ok: false, reason: `bad ${label} entry: ${JSON.stringify(e)}` };
    }
    if (!nameGroundedInText(e.name, normalizedText)) {
      return { ok: false, reason: `${label} "${e.name}" not mentioned in the message` };
    }
    total += e.count;
  }
  if (total > teamScore) {
    return {
      ok: false,
      reason: `${label} total ${total} exceeds team score ${teamScore}`,
    };
  }
  return { ok: true };
}

/**
 * Verify a `ParsedMatch` against the message it claims to describe.
 * Pure, deterministic, and deliberately the LAST thing a parse passes through
 * — this is the recount, not the author.
 */
export function verifyParsedMatch(
  parsed: ParsedMatch,
  rawText: string,
): ParseVerifyResult {
  const normalizedText = normalizeName(rawText);

  if (
    !Number.isInteger(parsed.teamScore) ||
    !Number.isInteger(parsed.opponentScore) ||
    parsed.teamScore < 0 ||
    parsed.opponentScore < 0 ||
    parsed.teamScore > MAX_PLAUSIBLE_SCORE ||
    parsed.opponentScore > MAX_PLAUSIBLE_SCORE
  ) {
    return { ok: false, reason: `implausible scoreline ${parsed.teamScore}-${parsed.opponentScore}` };
  }

  const opponent = String(parsed.opponent ?? '').trim();
  if (opponent.length < 2 || opponent.length > 60 || !/[a-z]/i.test(opponent)) {
    return { ok: false, reason: `implausible opponent "${opponent}"` };
  }

  if (typeof parsed.confidence !== 'number' || parsed.confidence < 0 || parsed.confidence > 1) {
    return { ok: false, reason: `implausible confidence ${parsed.confidence}` };
  }

  const scorers = checkCounted(
    (parsed.scorers ?? []).map((s) => ({ name: s?.name, count: s?.goals })),
    'scorer',
    normalizedText,
    parsed.teamScore,
  );
  if (!scorers.ok) return scorers;

  const assists = checkCounted(
    (parsed.assists ?? []).map((a) => ({ name: a?.name, count: a?.assists })),
    'assist',
    normalizedText,
    parsed.teamScore,
  );
  if (!assists.ok) return assists;

  return { ok: true };
}

const SCORE = String.raw`(\d{1,2})\s*[-–xX]\s*(\d{1,2})`;
const OPP = String.raw`(?:vs|v|against|to|with)\s+(.+)`;
// NB: "beat" = we won; "beaten"/"beaten by" = we lost (opponent is the subject),
// which is ambiguous to parse positionally, so it is deliberately left to the LLM.
const WIN_WORD = /^(win|won|beat|thrash|thrashed|smash|smashed|hammer|hammered|batter|battered)$/i;
const LOSS_WORD = /^(loss|lost|lose|defeat|defeated)$/i;
const DRAW_WORD = /^(draw|drew|tie|tied|level)$/i;

function outcomeFromScores(team: number, opp: number): 'win' | 'loss' | 'draw' {
  if (team > opp) return 'win';
  if (team < opp) return 'loss';
  return 'draw';
}

function patternMatch(
  team: number,
  opp: number,
  opponent: string,
): ParsedMatch {
  return {
    outcome: outcomeFromScores(team, opp),
    opponent: opponent.trim().replace(/[.!]+$/, ''),
    teamScore: team,
    opponentScore: opp,
    isHome: true,
    scorers: [],
    assists: [],
    confidence: 1,
    source: 'pattern',
  };
}

/**
 * Deterministic, dependency-free parse of the canonical phrasings. Returns null
 * for anything ambiguous (e.g. "beaten by X 5-2", where the scoreline subject is
 * the opponent) — those deliberately fall through to the LLM.
 *
 * Convention across every pattern: the FIRST number is the logging squad's score.
 */
export function parseMatchPattern(text: string): ParsedMatch | null {
  const t = text.trim();

  // A) "4-2 win vs Red Lions"  /  "1-3 lost to Sunday Legends"
  const a = t.match(new RegExp(`^${SCORE}\\s+(\\w+)\\b.*?\\b${OPP}$`, 'i'));
  if (a && (WIN_WORD.test(a[3]) || LOSS_WORD.test(a[3]) || DRAW_WORD.test(a[3]))) {
    return patternMatch(Number(a[1]), Number(a[2]), a[4]);
  }

  // B) "we won 4-2 vs Red Lions"  /  "lost 1-3 to Sunday Legends"
  const b = t.match(new RegExp(`^(?:we\\s+|us\\s+)?(\\w+)\\s+${SCORE}\\s+${OPP}$`, 'i'));
  if (b && (WIN_WORD.test(b[1]) || LOSS_WORD.test(b[1]) || DRAW_WORD.test(b[1]))) {
    return patternMatch(Number(b[2]), Number(b[3]), b[4]);
  }

  // C) "beat Red Lions 4-2" (we are the subject, so we won — first score is ours).
  // No vs/against delimiter here, so the opponent is bounded to a short, comma/
  // digit-free name — a long messy sentence must fall through to the LLM instead
  // of being mis-captured as the opponent.
  const c = t.match(new RegExp(`^(?:we\\s+)?(\\w+)\\s+([A-Za-z][A-Za-z .&'-]{0,24}?)\\s+${SCORE}$`, 'i'));
  if (c && WIN_WORD.test(c[1])) {
    return patternMatch(Number(c[3]), Number(c[4]), c[2]);
  }

  // D) "3-1 vs Red Lions" (no outcome word — derive from the scoreline)
  const d = t.match(new RegExp(`^${SCORE}\\s+${OPP}$`, 'i'));
  if (d) {
    return patternMatch(Number(d[1]), Number(d[2]), d[3]);
  }

  return null;
}

const PARSER_SYSTEM_PROMPT = `You are a match result parser for SportWarren, an amateur football app.
Extract the match details from the user's natural language message.
If the message is about a football/soccer match result, return ONLY a JSON object with:
- teamScore (number) — the score of the user's OWN team
- opponentScore (number) — the opponent's score
- opponent (string) — the opposing team's name
- isHome (boolean) — true if the user's team played at home; default true if unclear
- scorers (array of {name: string, goals: number}) — goalscorers named in the message; [] if none
- assists (array of {name: string, assists: number}) — assist providers named; [] if none
- confidence (number 0..1) — your certainty this is a match result

Rules:
- "we won 4-2", "we" is the user's team (teamScore 4).
- "I scored two" / "I got a hattrick" → add {name: "You", goals: N}.
- "beaten by Rangers 5-2" → the opponent scored 5, so teamScore 2, opponentScore 5.
- If it is NOT a match result, return {"confidence": 0}.
Return only the JSON object, no prose.`;

interface LlmMatchShape {
  teamScore?: number;
  opponentScore?: number;
  opponent?: string;
  isHome?: boolean;
  scorers?: MatchScorer[];
  assists?: MatchAssister[];
  confidence?: number;
}

async function parseViaLLM(text: string): Promise<ParsedMatch | null> {
  const messages: AIMessage[] = [
    { role: 'system', content: PARSER_SYSTEM_PROMPT },
    { role: 'user', content: text },
  ];

  try {
    const result = await generateInference(messages, { temperature: 0.1 });
    if (!result?.content) return null;

    const clean = result.content.replace(/```json|```/g, '').trim();
    const raw = JSON.parse(clean) as LlmMatchShape;

    const confidence = typeof raw.confidence === 'number' ? raw.confidence : 0;
    if (
      confidence < MIN_LLM_CONFIDENCE ||
      typeof raw.teamScore !== 'number' ||
      typeof raw.opponentScore !== 'number' ||
      !raw.opponent
    ) {
      return null;
    }

    const parsed: ParsedMatch = {
      outcome: outcomeFromScores(raw.teamScore, raw.opponentScore),
      opponent: String(raw.opponent).trim(),
      teamScore: raw.teamScore,
      opponentScore: raw.opponentScore,
      isHome: raw.isHome ?? true,
      scorers: Array.isArray(raw.scorers) ? raw.scorers : [],
      assists: Array.isArray(raw.assists) ? raw.assists : [],
      confidence,
      source: 'llm',
    };

    // The gate: recount the model's claims against the message itself.
    // Fail closed — an unverifiable parse behaves as "not a match result"
    // and the caller falls through to its normal reprompt path.
    const verdict = verifyParsedMatch(parsed, text);
    if (!verdict.ok) {
      console.warn(`[match-parser] LLM parse rejected by gate: ${verdict.reason}`);
      return null;
    }
    return parsed;
  } catch (error) {
    console.error('[match-parser] LLM parse failed:', error);
    return null;
  }
}

/**
 * Parse a message into a match result. Pattern pass first (free), LLM fallback
 * second (unless `allowLLM` is false). Returns null when the text is not a
 * recognisable match result.
 */
export async function parseMatchResult(
  text: string,
  opts: { allowLLM?: boolean } = {},
): Promise<ParsedMatch | null> {
  const { allowLLM = true } = opts;

  const pattern = parseMatchPattern(text);
  // Uniform gate: pattern output is produced by code and always passes, but
  // running it through the same verifier keeps one invariant — nothing that
  // leaves this function is unverified.
  if (pattern && verifyParsedMatch(pattern, text).ok) return pattern;

  if (!allowLLM) return null;
  return parseViaLLM(text);
}
