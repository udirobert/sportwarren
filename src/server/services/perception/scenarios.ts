/**
 * Player perception scenarios — the hot-take engine.
 *
 * Each scenario asks lads to predict (a) what a teammate ACTUALLY
 * does in a situation (descriptive) and optionally (b) what they
 * SHOULD do (prescriptive). The aggregate becomes the group's
 * collective opinion of each player.
 *
 * Design principles (anti-mean-spirited):
 *   - Every option is a football choice, never a character judgment.
 *   - "Miscontrol" is the most negative option but it's universal —
 *     even pros miscontrol.
 *   - Aggregate display only (never "Pete said you'd miscontrol").
 *   - Both descriptive and prescriptive variants of the same scenario
 *     so the group can argue about "is" vs "should be."
 */

export interface ScenarioOption {
  id: 'a' | 'b' | 'c' | 'd';
  label: string;
  /**
   * Tendency tag for downstream tactical doctrine — what this choice
   * says about the player. Lets us aggregate group-wide patterns
   * ("this squad's CMs are perceived as passers").
   */
  tag: 'safe' | 'aggressive' | 'creative' | 'careless' | 'selfless' | 'selfish' | 'composed' | 'rash';
}

export interface Scenario {
  id: string;
  /** Headline shown above the options. Use `{name}` as the placeholder for the player's first name. */
  prompt: string;
  /** Optional sub-text giving more context. */
  context?: string;
  /** Whether the prescriptive ("should") variant is enabled. */
  hasPrescriptive: boolean;
  options: ScenarioOption[];
  /**
   * What twin attribute this scenario primarily speaks to.
   * Not used for stat mutations yet — kept as metadata so the data
   * can later feed attribute deltas via verified peer signal.
   */
  attributeTag: 'passing' | 'dribbling' | 'shooting' | 'defending' | 'physical' | 'pace' | 'composure';
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'ball_own_half',
    prompt: 'When {name} gets the ball in their own half, they most often…',
    context: 'No press yet, time to think.',
    hasPrescriptive: true,
    attributeTag: 'passing',
    options: [
      { id: 'a', label: 'Plays it short and safe to a CB', tag: 'safe' },
      { id: 'b', label: 'Tries to dribble out themselves', tag: 'aggressive' },
      { id: 'c', label: 'Looks long for a teammate', tag: 'creative' },
      { id: 'd', label: 'Miscontrols under pressure', tag: 'careless' },
    ],
  },
  {
    id: 'one_v_one_keeper',
    prompt: '{name} is 1-on-1 with the keeper on the edge of the box…',
    hasPrescriptive: true,
    attributeTag: 'shooting',
    options: [
      { id: 'a', label: 'Shoots first time, low and hard', tag: 'aggressive' },
      { id: 'b', label: 'Dinks it cheekily over the keeper', tag: 'creative' },
      { id: 'c', label: 'Rolls it square for a tap-in', tag: 'selfless' },
      { id: 'd', label: 'Takes too many touches, gets closed down', tag: 'careless' },
    ],
  },
  {
    id: 'press_under_pressure',
    prompt: 'Two opposition lads close {name} down hard…',
    context: '1.5 seconds, no time on the ball.',
    hasPrescriptive: true,
    attributeTag: 'composure',
    options: [
      { id: 'a', label: 'Half-turns into space behind their back', tag: 'composed' },
      { id: 'b', label: 'Plays it square first time', tag: 'safe' },
      { id: 'c', label: 'Tries the trick — Cruyff turn or Maradona spin', tag: 'creative' },
      { id: 'd', label: 'Gets caught in possession', tag: 'careless' },
    ],
  },
  {
    id: 'late_in_game',
    prompt: 'Last 5 minutes, scores level. {name} picks up the ball in the final third…',
    hasPrescriptive: true,
    attributeTag: 'shooting',
    options: [
      { id: 'a', label: 'Goes for it themselves — shot from anywhere', tag: 'selfish' },
      { id: 'b', label: 'Plays the obvious pass to the better-placed teammate', tag: 'selfless' },
      { id: 'c', label: 'Holds it up, looks for the killer ball', tag: 'composed' },
      { id: 'd', label: 'Loses possession trying too much', tag: 'rash' },
    ],
  },
  {
    id: 'winning_lead',
    prompt: 'Two-goal lead, ten minutes to play. {name}…',
    context: 'Manage the game or push for the third?',
    hasPrescriptive: true,
    attributeTag: 'defending',
    options: [
      { id: 'a', label: 'Drops deeper, plays the safe ball every time', tag: 'safe' },
      { id: 'b', label: 'Keeps pushing — wants the third', tag: 'aggressive' },
      { id: 'c', label: 'Slows it down — milks the corners', tag: 'composed' },
      { id: 'd', label: 'Switches off, gets caught napping', tag: 'careless' },
    ],
  },
  {
    id: 'losing_deficit',
    prompt: 'Down 0-2 at the half. {name} in the second half…',
    hasPrescriptive: true,
    attributeTag: 'physical',
    options: [
      { id: 'a', label: 'Demands the ball, takes over', tag: 'aggressive' },
      { id: 'b', label: 'Sticks to their job, no fuss', tag: 'composed' },
      { id: 'c', label: 'Tries the spectacular — shoots from 30', tag: 'rash' },
      { id: 'd', label: 'Quietly hides — wants the game to end', tag: 'safe' },
    ],
  },
  {
    id: 'final_third_pass',
    prompt: '{name} has the ball in the final third with one chance to pass…',
    hasPrescriptive: true,
    attributeTag: 'passing',
    options: [
      { id: 'a', label: 'Threads the killer through-ball', tag: 'creative' },
      { id: 'b', label: 'Squares it across the box', tag: 'selfless' },
      { id: 'c', label: 'Cuts back to a midfielder arriving late', tag: 'composed' },
      { id: 'd', label: 'Shoots instead — never trusted the pass', tag: 'selfish' },
    ],
  },
  {
    id: 'fifty_fifty',
    prompt: '50/50 ball coming in. {name}…',
    hasPrescriptive: false, // pure descriptive — character question
    attributeTag: 'physical',
    options: [
      { id: 'a', label: 'Goes in studs-up, fully committed', tag: 'aggressive' },
      { id: 'b', label: 'Slides in clean, gets the ball', tag: 'composed' },
      { id: 'c', label: 'Pulls out at the last second', tag: 'safe' },
      { id: 'd', label: 'Mistimes it, gives away a free kick', tag: 'rash' },
    ],
  },
];

export function getScenarioById(id: string): Scenario | undefined {
  return SCENARIOS.find((s) => s.id === id);
}

export function buildPrompt(scenario: Scenario, firstName: string): string {
  return scenario.prompt.replace(/\{name\}/g, firstName);
}
