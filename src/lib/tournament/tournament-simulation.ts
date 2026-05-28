/**
 * Tournament Bracket Simulation
 * Runs head-to-head match simulations for tournament brackets.
 * Works with both real squad data and synthetic player attributes.
 */

import type { Formation, PlayStyle } from '@/types';
import { FORMATIONS } from '@/lib/formations';

export interface TournamentPlayer {
  name: string;
  position: string;
  overall: number; // 1-100
}

export interface TournamentEntry {
  id: string;
  formation: Formation;
  playStyle: PlayStyle;
  color: string;
  players: TournamentPlayer[];
}

export interface TournamentMatchResult {
  homeEntryId: string;
  awayEntryId: string;
  homeScore: number;
  awayScore: number;
  events: Array<{ minute: number; text: string; type: 'goal' | 'save' | 'foul' }>;
  possession: { home: number; away: number };
}

/**
 * Generate synthetic players for a formation when real data isn't available.
 */
export function generateSyntheticPlayers(
  formation: Formation,
  names?: string[],
): TournamentPlayer[] {
  const formPositions = FORMATIONS[formation] || [];
  const positions: string[] = formPositions.length > 0
    ? formPositions.map((p) => p.role)
    : ['GK', 'CB', 'CB', 'LB', 'RB', 'CM', 'CM', 'CAM', 'LW', 'RW', 'ST'];
  return positions.map((pos: string, i: number) => ({
    name: names?.[i] || `Player ${i + 1}`,
    position: pos,
    overall: 50 + Math.floor(Math.random() * 30), // 50-80 range
  }));
}

/**
 * Calculate team strength based on players, formation, and play style.
 */
function calculateStrength(
  players: TournamentPlayer[],
  formation: Formation,
  style: PlayStyle,
): { attack: number; midfield: number; defense: number } {
  const formPositions = FORMATIONS[formation] || [];
  const positions: string[] = formPositions.map((p) => p.role);

  let attack = 0, midfield = 0, defense = 0, attackCount = 0, midfieldCount = 0, defenseCount = 0;

  players.forEach((player, i) => {
    const pos = positions[i] || 'CM';
    if (['ST', 'CF', 'LW', 'RW', 'CAM'].includes(pos)) {
      attack += player.overall;
      attackCount++;
    } else if (['CM', 'CDM', 'LM', 'RM'].includes(pos)) {
      midfield += player.overall;
      midfieldCount++;
    } else {
      defense += player.overall;
      defenseCount++;
    }
  });

  // Style modifiers
  const styleMods: Record<string, { attack: number; midfield: number; defense: number }> = {
    balanced: { attack: 1.0, midfield: 1.0, defense: 1.0 },
    direct: { attack: 1.2, midfield: 0.9, defense: 0.9 },
    possession: { attack: 0.9, midfield: 1.2, defense: 0.95 },
    counter: { attack: 1.1, midfield: 0.85, defense: 1.1 },
    high_press: { attack: 1.15, midfield: 1.05, defense: 0.85 },
    low_block: { attack: 0.7, midfield: 0.8, defense: 1.35 },
  };

  const mods = styleMods[style] || styleMods.balanced;

  return {
    attack: ((attack / Math.max(attackCount, 1)) || 50) * mods.attack,
    midfield: ((midfield / Math.max(midfieldCount, 1)) || 50) * mods.midfield,
    defense: ((defense / Math.max(defenseCount, 1)) || 50) * mods.defense,
  };
}

/**
 * Simulate a single match between two tournament entries.
 * Deterministic seed for reproducibility when needed.
 */
export function simulateTournamentMatch(
  home: TournamentEntry,
  away: TournamentEntry,
  seed?: number,
): TournamentMatchResult {
  // Simple seeded random for reproducibility
  let rng = seed ?? Math.floor(Math.random() * 1000000);
  const rand = () => {
    rng = (rng * 16807 + 0) % 2147483647;
    return rng / 2147483647;
  };

  const homeStr = calculateStrength(home.players, home.formation, home.playStyle);
  const awayStr = calculateStrength(away.players, away.formation, away.playStyle);

  // Midfield controls possession
  const totalMidfield = homeStr.midfield + awayStr.midfield;
  const homePossession = Math.round((homeStr.midfield / totalMidfield) * 100);
  const awayPossession = 100 - homePossession;

  // Goal scoring probability per "phase" (6 phases = ~15 min each)
  const phases = 6;
  let homeScore = 0;
  let awayScore = 0;
  const events: TournamentMatchResult['events'] = [];

  for (let phase = 0; phase < phases; phase++) {
    const minute = Math.round((phase / phases) * 90) + Math.floor(rand() * 15) + 1;

    // Home attack vs away defense
    const homeAttackPower = homeStr.attack / (homeStr.attack + awayStr.defense);
    const homeGoalChance = homeAttackPower * 0.4 * (rand() * 0.6 + 0.7);

    if (rand() < homeGoalChance) {
      homeScore++;
      events.push({
        minute: Math.min(minute, 90),
        text: `Goal! ${home.players[getScorerIndex(home.players, rand)]?.name || 'Player'}`,
        type: 'goal',
      });
    }

    // Away attack vs home defense
    const awayAttackPower = awayStr.attack / (awayStr.attack + homeStr.defense);
    const awayGoalChance = awayAttackPower * 0.4 * (rand() * 0.6 + 0.7);

    if (rand() < awayGoalChance) {
      awayScore++;
      events.push({
        minute: Math.min(minute + Math.floor(rand() * 5), 90),
        text: `Goal! ${away.players[getScorerIndex(away.players, rand)]?.name || 'Player'}`,
        type: 'goal',
      });
    }
  }

  return {
    homeEntryId: home.id,
    awayEntryId: away.id,
    homeScore,
    awayScore,
    events,
    possession: { home: homePossession, away: awayPossession },
  };
}

/**
 * Pick a likely scorer index (attackers weighted higher).
 */
function getScorerIndex(players: TournamentPlayer[], rand: () => number): number {
  // Weight attackers 3x more likely to score
  const weights = players.map((p) =>
    ['ST', 'CF', 'LW', 'RW', 'CAM'].includes(p.position) ? 3 :
    ['CM', 'LM', 'RM'].includes(p.position) ? 1 : 0.3,
  );
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rand() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r <= 0) return i;
  }
  return 0;
}

/**
 * Run a full bracket (8 entries → 4 QF → 2 SF → 1 F).
 * Returns all matches grouped by round.
 */
export function runBracketSimulation(
  entries: TournamentEntry[],
): { round: string; matches: TournamentMatchResult[] }[] {
  if (entries.length < 8) {
    throw new Error('Tournament requires exactly 8 entries');
  }

  // Standard bracket seeding: 1v8, 4v5, 3v6, 2v7
  const bracket = [
    [entries[0], entries[7]],
    [entries[3], entries[4]],
    [entries[2], entries[5]],
    [entries[1], entries[6]],
  ];

  // Quarter-finals
  const qfResults: TournamentMatchResult[] = bracket.map(([home, away], i) =>
    simulateTournamentMatch(home, away, i * 1000 + 42),
  );

  // Semi-finals: QF1 winner vs QF2 winner, QF3 winner vs QF4 winner
  const sf1Winner = qfResults[0].homeScore >= qfResults[0].awayScore ? bracket[0][0] : bracket[0][1];
  const sf2Winner = qfResults[1].homeScore >= qfResults[1].awayScore ? bracket[1][0] : bracket[1][1];
  const sf3Winner = qfResults[2].homeScore >= qfResults[2].awayScore ? bracket[2][0] : bracket[2][1];
  const sf4Winner = qfResults[3].homeScore >= qfResults[3].awayScore ? bracket[3][0] : bracket[3][1];

  const sfResults: TournamentMatchResult[] = [
    simulateTournamentMatch(sf1Winner, sf2Winner, 9942),
    simulateTournamentMatch(sf3Winner, sf4Winner, 9943),
  ];

  // Final
  const finalist1 = sfResults[0].homeScore >= sfResults[0].awayScore
    ? sf1Winner : sf2Winner;
  const finalist2 = sfResults[2] ? sf2Winner : (sfResults[1].homeScore >= sfResults[1].awayScore
    ? sf3Winner : sf4Winner);

  const finalResult = simulateTournamentMatch(finalist1, finalist2, 99999);

  return [
    { round: 'quarter', matches: qfResults },
    { round: 'semi', matches: sfResults },
    { round: 'final', matches: [finalResult] },
  ];
}
