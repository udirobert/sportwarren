/**
 * Predictions — the app's opening bet on a player.
 *
 * First contact for the kickabout wedge is a *personal verdict + a bet*,
 * not a chore. Given a player's position + baseline attributes, this
 * produces a cheeky, debatable one-liner ("the bold call") plus a
 * predicted storyline for the season/session. The number is the card;
 * the prediction is the hook that makes them want to argue with it in
 * the WhatsApp thread and turn up on the night to settle it.
 *
 * Design rules (see AGENTS.md "Engagement rules" + product-calibration
 * "First-contact pass"):
 * - The controversy comes FROM THE APP and resolves through real play —
 *   never player-vs-player. It's provocation that invites the group to
 *   correct the record.
 * - It's always framed as a PREDICTION ("our call", "prove us wrong"),
 *   never asserted as an earned stat. Stats still move only via verified
 *   proof — the "stats are never self-editable" rule is untouched.
 * - Tone is cheeky, not cruel. This lands in a brand-new group of
 *   near-strangers; "all backlift, no end product" is banter, a genuine
 *   insult is not.
 *
 * Pure + deterministic: seeded by a stable string (profileId) so a
 * player sees the SAME bold call every visit. No Math.random, no clock.
 */

import type { AttributeKey } from './twin-types';

type Attrs = Record<AttributeKey, number>;

export interface PlayerPrediction {
  /** The provocative one-liner — the app's opening bet. */
  boldCall: string;
  /** A predicted storyline, phrased as a forecast, not a stat. */
  predictedLine: string;
  /** What we're backing them for (highest attribute). */
  strength: { key: AttributeKey; value: number; label: string };
  /** The "prove us wrong" hook (lowest attribute). */
  weakness: { key: AttributeKey; value: number; label: string };
  /** Coarse position bucket the copy was drawn from. */
  bucket: PositionBucket;
}

type PositionBucket = 'GK' | 'DEF' | 'FB' | 'MID' | 'CAM' | 'WING' | 'ST';

const ATTR_LABEL: Record<AttributeKey, string> = {
  pace: 'Pace',
  shooting: 'Finishing',
  passing: 'Passing',
  dribbling: 'Dribbling',
  defending: 'Defending',
  physical: 'Physical',
};

/** Cheeky one-liners per bucket. Several per bucket so same-position
 *  players get different calls (seed picks). Keep them banter, not cruel. */
const BOLD_CALLS: Record<PositionBucket, string[]> = {
  GK: [
    'Last line of defence, or first cause of chaos — no in-between.',
    'Will pull off a worldie save, then roll it straight to their striker.',
    'Commands his box. Allegedly.',
  ],
  DEF: [
    'The wall. Nothing gets past — except pace, obviously.',
    'Reads the game like a book he sometimes forgets to open.',
    'Built for the last-ditch tackle he shouldn’t have needed to make.',
  ],
  FB: [
    'Bombs forward, forgets the way back.',
    'More interested in the overlap than the man he’s marking.',
    'Engine for days — end product still under review.',
  ],
  MID: [
    'The engine room. Runs all day, thanked by no one.',
    'Sprays it forty yards. Also gives it away forty yards.',
    'Does the dirty work so the flair lads take the glory.',
  ],
  CAM: [
    'The difference-maker — when he fancies it.',
    'One killer pass a game, four minutes of defending a season.',
    'Silky on the ball, allergic to tracking back.',
  ],
  WING: [
    'All flair, no end product — prove us wrong.',
    'Skins his man, then over-hits the cross every time.',
    'Won’t track back. Don’t even ask.',
  ],
  ST: [
    'Big backlift, bigger ego — but he’ll bag them.',
    'Predicted top scorer. Also predicted to miss a sitter and blame the pitch.',
    'Poacher’s instinct. Defensive contribution: none, and proud of it.',
  ],
};

/** Predicted storylines per bucket — a real, testable forecast the night
 *  resolves. Phrased as a bet, not a claimed stat. */
const PREDICTED_LINES: Record<PositionBucket, string[]> = {
  GK: [
    'predicted more clean sheets than howlers — it’ll be close',
    'backing him to save one that matters and concede one that doesn’t',
  ],
  DEF: [
    'predicted to win more headers than arguments with the ref',
    'backing him for the group’s best defensive night',
  ],
  FB: [
    'predicted more assists than tackles',
    'backing him to finish the night higher up the pitch than he starts',
  ],
  MID: [
    'predicted top of the group for passes completed',
    'backing him to cover the most ground and get the least credit',
  ],
  CAM: [
    'predicted more assists than goals',
    'backing him for at least one moment that ends up in the group chat',
  ],
  WING: [
    'predicted more step-overs than end product',
    'backing him for the goal of the night — or the miss of it',
  ],
  ST: [
    'predicted top scorer for the group',
    'backing him to outscore the rest — and let everyone know',
  ],
};

function bucketForPosition(position: string | null | undefined): PositionBucket {
  const code = (position ?? '').toUpperCase();
  if (code === 'GK') return 'GK';
  if (code === 'CB') return 'DEF';
  if (code === 'LB' || code === 'RB' || code === 'FB') return 'FB';
  if (code === 'CAM') return 'CAM';
  if (code === 'LW' || code === 'RW' || code === 'W') return 'WING';
  if (code === 'ST' || code === 'CF') return 'ST';
  // CDM / CM / anything unrecognised → engine-room default
  return 'MID';
}

/** Stable non-negative hash of a string (djb2). Deterministic seed. */
function seedFrom(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

function extremes(attrs: Attrs): {
  strength: { key: AttributeKey; value: number };
  weakness: { key: AttributeKey; value: number };
} {
  const keys = Object.keys(attrs) as AttributeKey[];
  let hi = keys[0];
  let lo = keys[0];
  for (const k of keys) {
    if (attrs[k] > attrs[hi]) hi = k;
    if (attrs[k] < attrs[lo]) lo = k;
  }
  return {
    strength: { key: hi, value: attrs[hi] },
    weakness: { key: lo, value: attrs[lo] },
  };
}

/**
 * Generate the app's opening bet for a player. Deterministic given the
 * same `seed` (pass the profileId), so the bold call is stable per player.
 */
export function generatePrediction(input: {
  position: string | null | undefined;
  attrs: Attrs;
  seed: string;
}): PlayerPrediction {
  const bucket = bucketForPosition(input.position);
  const s = seedFrom(input.seed);
  const { strength, weakness } = extremes(input.attrs);

  return {
    boldCall: pick(BOLD_CALLS[bucket], s),
    // offset the second draw so bold call + line don't correlate
    predictedLine: pick(PREDICTED_LINES[bucket], s >> 3),
    strength: { ...strength, label: ATTR_LABEL[strength.key] },
    weakness: { ...weakness, label: ATTR_LABEL[weakness.key] },
    bucket,
  };
}
