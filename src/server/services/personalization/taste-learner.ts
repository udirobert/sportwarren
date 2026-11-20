/**
 * Taste Learner — adapts what a player gets told about from implicit signals,
 * and explains what it learned. Ported from Footballytics' personal director
 * pattern (multiplicative per-kind weights + self-explaining "why am I seeing
 * this"), mapped onto SportWarren's milestone/moment vocabulary.
 *
 * Signals: 'skip'/'dismiss' (swiped past a card, ignored the notification),
 * 'open'/'dwell' (opened the recap, read to the end), 'share'/'save' (shared
 * the card to the group), 'like'. Each nudges the weight of that kind
 * multiplicatively — a few consistent signals move the needle and nothing
 * collapses to zero (floor) or dominates forever (ceiling).
 *
 * Pure + deterministic: weights in, weights out. Persistence lives in
 * taste-service.ts (TwinTasteWeight rows + ActivityEvent log); this module
 * owns only the arithmetic and the explain copy.
 */

export type TasteSignal =
  | 'skip'
  | 'dismiss'
  | 'open'
  | 'dwell'
  | 'share'
  | 'save'
  | 'like';

/** Per-signal multiplicative factors. Negative signals pull toward the floor;
 *  positive ones push toward the ceiling. 'dismiss' is the strongest negative —
 *  the player went out of their way to kill it. */
export const TASTE_FACTORS: Record<TasteSignal, number> = {
  skip: 0.8,
  dismiss: 0.65,
  open: 1.05,
  dwell: 1.08,
  share: 1.2,
  save: 1.15,
  like: 1.12,
};

export const TASTE_FLOOR = 0.1;
export const TASTE_CEILING = 2.0;
export const TASTE_NEUTRAL = 0.5;

/** Below this the kind is effectively muted — don't burn a scarce channel
 *  slot (the WhatsApp 3/day cap) on it. 0.5 * 0.8^2 ≈ 0.32, so two skips
 *  already quiet a kind. */
export const TASTE_QUIET_THRESHOLD = 0.35;

/** Human labels for the kinds the learner can see. Milestone kinds (what
 *  WhatsApp/Telegram notify on) + moment kinds (what the gallery shows). */
export const TASTE_KIND_LABELS: Record<string, string> = {
  twin_created: 'twin awakenings',
  level_up: 'level ups',
  sim_win: 'sim wins',
  attestation_milestone: 'on-chain milestones',
  record_broken: 'broken records',
  season_end: 'season wrap-ups',
  coaching_hired: 'coach signings',
  coaching_expired: 'coach departures',
  match_imported: 'logged matches',
  // moment kinds
  goal_scored: 'goal moments',
  top_scorer: 'top-scorer moments',
  rating_high: 'top-rated moments',
  debut: 'debuts',
};

function label(kind: string): string {
  return TASTE_KIND_LABELS[kind] ?? kind.replace(/_/g, ' ');
}

export type TasteWeights = Record<string, number>;

export interface TasteChange {
  changed: boolean;
  kind: string;
  before: number;
  after: number;
  /** Feedback copy a UI can show — "Noted: more goal moments." */
  message: string;
}

/** Apply one implicit signal to a kind's weight. Unknown signals/kinds are
 *  no-ops — callers can pass raw event types without filtering. */
export function recordSignal(
  weights: TasteWeights,
  signal: TasteSignal,
  kind: string,
): TasteChange {
  const factor = TASTE_FACTORS[signal];
  if (factor === undefined || !kind) {
    return { changed: false, kind, before: weights[kind] ?? TASTE_NEUTRAL, after: weights[kind] ?? TASTE_NEUTRAL, message: '' };
  }
  const before = weights[kind] ?? TASTE_NEUTRAL;
  const after = Math.round(Math.min(TASTE_CEILING, Math.max(TASTE_FLOOR, before * factor)) * 1000) / 1000;
  return { changed: after !== before, kind, before, after, message: changeMessage(kind, before, after) };
}

function changeMessage(kind: string, before: number, after: number): string {
  const l = label(kind);
  if (after < before) return `Got it: fewer ${l}.`;
  if (after > before) return `Noted: more ${l}.`;
  return '';
}

/** The weight a dispatch/sort decision should use for this kind. */
export function weightFor(weights: TasteWeights, kind: string): number {
  return weights[kind] ?? TASTE_NEUTRAL;
}

/** True when the player has signalled this kind down often enough that a
 *  scarce slot (WhatsApp's 3/day cap) shouldn't be spent on it. */
export function isQuiet(weights: TasteWeights, kind: string): boolean {
  return weightFor(weights, kind) < TASTE_QUIET_THRESHOLD;
}

/** Order candidate kinds by taste, strongest first. Stable — equal weights
 *  keep input order. The caller still applies its own whitelist/caps. */
export function prioritize<T extends { kind: string }>(
  weights: TasteWeights,
  candidates: T[],
): T[] {
  return [...candidates].sort((a, b) => weightFor(weights, b.kind) - weightFor(weights, a.kind));
}

/**
 * What the learner has learned, phrased for a "why am I seeing this?"
 * surface. Kinds not signalled on count as neutral — the learner only
 * speaks about behaviour it actually observed.
 */
export function explainTaste(weights: TasteWeights): {
  summary: string;
  more: string[];
  fewer: string[];
} {
  const more: string[] = [];
  const fewer: string[] = [];
  for (const [kind, w] of Object.entries(weights)) {
    if (w > TASTE_NEUTRAL * 1.15) more.push(label(kind));
    else if (w < TASTE_NEUTRAL * 0.85) fewer.push(label(kind));
  }
  const parts: string[] = [];
  if (more.length) parts.push(`showing you more ${more.join(', ')}`);
  if (fewer.length) parts.push(`fewer ${fewer.join(', ')}`);
  const summary = parts.length
    ? `Based on what you open and share, we're ${parts.join(' and ')}.`
    : "Still learning your taste — open, share, or skip moments and we'll adapt.";
  return { summary, more, fewer };
}
