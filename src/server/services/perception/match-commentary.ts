/**
 * Match commentary generator — turns sim outcomes into narrative beats
 * coloured by perception aggregates.
 *
 * Closes the loop on the perception data: each rating the lads cast
 * shows up in the sim narrative the next time the engine runs.
 * "The lads said Sam plays it safe — he tries to dribble out instead,
 *  gets caught in possession" is the kind of beat this generates.
 *
 * Deterministic per (sim outcome + seed) — no LLM calls. The whole
 * point is that the players see their own ratings reflected, not a
 * model's hallucinated take.
 */

import { SCENARIOS, getScenarioById } from './scenarios';
import {
  topChoice,
  type PerceptionAggregate,
  type ChoiceCounts,
  type ChoiceLetter,
} from './aggregate';

export interface CommentaryPlayer {
  /** PlayerProfile.id — keyed against the perception map. */
  profileId: string;
  firstName: string;
  position: string | null;
  /** True if this player is on the user's team. */
  onMyTeam: boolean;
  /** Goals scored in this match. */
  goals: number;
}

export interface CommentaryBeat {
  /** Suggested minute marker — keeps the beats feeling like real match minutes. */
  minute: number;
  /** Player whose action this beat describes. */
  playerName: string;
  /** Their position (e.g. "CB") — used as a side label in the UI. */
  position: string | null;
  /** The "what the lads said" framing — pulled from their perception. */
  setup: string;
  /** The outcome — true-to-form OR against-the-grain, picked by RNG + score. */
  payoff: string;
  /** Which side this favoured ('me' | 'opp' | 'neutral'). Lets the UI tint. */
  side: 'me' | 'opp' | 'neutral';
}

export interface MatchCommentaryInput {
  players: CommentaryPlayer[];
  perceptions: Map<string, PerceptionAggregate>;
  myGoals: number;
  oppGoals: number;
  /** Same seed used for the sim — keeps the commentary stable for share links. */
  seed: number;
}

function seededRng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

interface PerceptionTake {
  scenarioId: string;
  choice: ChoiceLetter;
  /** Label for the modal option ("Plays it short and safe to a CB"). */
  label: string;
  /** Tendency tag from the scenario option ('safe' | 'aggressive' | ...). */
  tag: string;
  /** How dominant the top choice was (0..1). Higher = stronger signal. */
  dominance: number;
  /** Total ratings backing this take. */
  total: number;
}

function strongestTake(aggregate: PerceptionAggregate | undefined): PerceptionTake | null {
  if (!aggregate) return null;
  let best: PerceptionTake | null = null;
  for (const [scenarioId, buckets] of Object.entries(aggregate)) {
    // Descriptive takes are the most narrative-ready ("they do X").
    const counts: ChoiceCounts = buckets.descriptive;
    if (counts.total < 1) continue;
    const top = topChoice(counts);
    if (!top) continue;
    const scenario = getScenarioById(scenarioId);
    if (!scenario) continue;
    const opt = scenario.options.find((o) => o.id === top);
    if (!opt) continue;
    const dominance = counts[top] / counts.total;
    const score = counts.total * dominance;
    if (!best || score > best.total * best.dominance) {
      best = {
        scenarioId,
        choice: top,
        label: opt.label,
        tag: opt.tag,
        dominance,
        total: counts.total,
      };
    }
  }
  return best;
}

const TRUE_TO_FORM: Record<string, string[]> = {
  safe: ['Plays the safe ball, keeps possession.', 'Square pass, nothing fancy — they keep it ticking.'],
  aggressive: ['Goes for it. Pure venom.', 'Drives at the defender and gets there.'],
  creative: ['Threads it through — Hollywood ball.', 'Picks out a runner nobody saw.'],
  careless: ['Loses it. Same story.', 'Gets caught in possession — classic.'],
  composed: ['Cool as you like, finds the right angle.', 'Half-turn, beats the press, plays it forward.'],
  rash: ['Lashes at it. Misses the target.', 'Tries too much — gives the ball away.'],
  selfish: ['Pulls the trigger themselves — never trusted the pass.', 'Has a go from distance.'],
  selfless: ['Lays it off for the better-placed teammate.', 'Squares it across the box.'],
};

const AGAINST_GRAIN: Record<string, string[]> = {
  safe: ['Surprises everyone — beats the man and drives forward.', 'Off the script — tries the killer ball.'],
  aggressive: ['Pulls out at the last second, plays it back.', 'Plays it safe today — the lads will have words.'],
  creative: ['Plays the simple one for once.', 'Keeps it square, no flair.'],
  careless: ['Keeps it clean. The lads won\'t believe it.', 'Composes themselves, lays it off.'],
  composed: ['Loses the head — gets dispossessed.', 'Rushes it, gives it away.'],
  rash: ['Picks the right pass for once.', 'Holds it up, waits for the runner.'],
  selfish: ['Squares it. The lads will be shocked.', 'Plays the unselfish ball.'],
  selfless: ['Has a go themselves — gets a sniff.', 'Drives it himself, doesn\'t look for the pass.'],
};

function pickFromBag(bag: string[] | undefined, rng: () => number): string | null {
  if (!bag || bag.length === 0) return null;
  return bag[Math.floor(rng() * bag.length)];
}

function setupLine(firstName: string, take: PerceptionTake): string {
  return `${firstName} on the ball — the lads said: ${take.label.toLowerCase()}.`;
}

/**
 * Generate 2–4 narrative beats. Selection rules:
 *   1. A scoring beat for the top scorer on the user's team (if any).
 *   2. An opposition beat (top scorer or perception-dominant player).
 *   3. A "true to form" beat for the strongest-perception player on
 *      either team who didn't score.
 * Returns an empty array if no player has any perception data.
 */
export function generateMatchCommentary(input: MatchCommentaryInput): CommentaryBeat[] {
  const rng = seededRng(input.seed);
  const beats: CommentaryBeat[] = [];
  const usedPlayerIds = new Set<string>();

  // Build candidate list with their take + score (= total · dominance)
  type Candidate = CommentaryPlayer & { take: PerceptionTake | null };
  const candidates: Candidate[] = input.players.map((p) => ({
    ...p,
    take: strongestTake(input.perceptions.get(p.profileId)),
  }));

  const withTake = candidates.filter((c): c is Candidate & { take: PerceptionTake } => c.take !== null);
  if (withTake.length === 0) return [];

  // 1. Scoring beat — top scorer on my team with any perception data
  const myScorers = withTake
    .filter((c) => c.onMyTeam && c.goals > 0)
    .sort((a, b) => b.goals - a.goals);
  if (myScorers.length > 0) {
    const c = myScorers[0];
    usedPlayerIds.add(c.profileId);
    beats.push({
      minute: 22 + Math.floor(rng() * 8),
      playerName: c.firstName,
      position: c.position,
      setup: setupLine(c.firstName, c.take),
      payoff: pickFromBag(TRUE_TO_FORM[c.take.tag], rng) ?? 'Finishes it.',
      side: 'me',
    });
  }

  // 2. Opposition beat — top opp scorer, or strongest opp perception if 0-0
  const oppCandidates = withTake.filter((c) => !c.onMyTeam && !usedPlayerIds.has(c.profileId));
  const oppRanked = oppCandidates.sort((a, b) => {
    if (b.goals !== a.goals) return b.goals - a.goals;
    return b.take.total * b.take.dominance - a.take.total * a.take.dominance;
  });
  if (oppRanked.length > 0) {
    const c = oppRanked[0];
    usedPlayerIds.add(c.profileId);
    const scored = c.goals > 0;
    beats.push({
      minute: 38 + Math.floor(rng() * 10),
      playerName: c.firstName,
      position: c.position,
      setup: setupLine(c.firstName, c.take),
      payoff: scored
        ? (pickFromBag(TRUE_TO_FORM[c.take.tag], rng) ?? 'Tucks it away.') + ' 1–0 them.'
        : (pickFromBag(AGAINST_GRAIN[c.take.tag], rng) ?? 'Caught out for once.'),
      side: scored ? 'opp' : 'neutral',
    });
  }

  // 3. Strongest-perception beat from anyone left over
  const remaining = withTake.filter((c) => !usedPlayerIds.has(c.profileId));
  remaining.sort((a, b) => b.take.total * b.take.dominance - a.take.total * a.take.dominance);
  if (remaining.length > 0) {
    const c = remaining[0];
    usedPlayerIds.add(c.profileId);
    // Mid-game beat — choose true-to-form for high-dominance, against for medium
    const goesTrue = c.take.dominance >= 0.6 || rng() < 0.6;
    const bag = goesTrue ? TRUE_TO_FORM[c.take.tag] : AGAINST_GRAIN[c.take.tag];
    beats.push({
      minute: 55 + Math.floor(rng() * 10),
      playerName: c.firstName,
      position: c.position,
      setup: setupLine(c.firstName, c.take),
      payoff: pickFromBag(bag, rng) ?? 'Does the unexpected.',
      side: c.onMyTeam ? 'me' : 'opp',
    });
  }

  beats.sort((a, b) => a.minute - b.minute);
  return beats;
}
