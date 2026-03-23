/**
 * Match Simulation Engine
 * Predicts IRL match outcomes based on player attributes and squad tactics
 */

import { 
  Tactics, 
  PlayerAttributes, 
  AttributeType, 
  MatchEvent 
} from '@/types';
import { 
  FORMATION_MODIFIERS, 
  STYLE_MODIFIERS 
} from './constants';
import { getFitnessStatus } from '../player/fitness-engine';

interface SimulationResult {
  homeScore: number;
  awayScore: number;
  events: Partial<MatchEvent>[];
  probability: {
    homeWin: number;
    draw: number;
    awayWin: number;
  };
  insights: string[];
}

interface TeamPower {
  defense: number;
  midfield: number;
  attack: number;
  gk: number;
}

/**
 * Calculates a team's power ratings for different pitch zones
 */
function calculateTeamPower(
  players: PlayerAttributes[],
  tactics: Tactics
): TeamPower {
  let defense = 0;
  let midfield = 0;
  let attack = 0;
  let gk = 0;

  players.forEach(player => {
    // Get average of relevant attributes for the zone
    const getAttr = (type: AttributeType) => {
      const skill = player.skills.find(s => s.skill === type);
      const styleMod = STYLE_MODIFIERS[tactics.style][type] || 1.0;
      const fitnessMod = getFitnessStatus((player as any).sharpness || 50).modifier;
      return (skill?.rating || 50) * styleMod * fitnessMod;
    };

    switch (player.position) {
      case 'GK':
        gk += (getAttr('gk_diving') + getAttr('gk_reflexes') + getAttr('gk_positioning')) / 3;
        break;
      case 'DF':
        defense += (getAttr('defending') * 0.7 + getAttr('physical') * 0.2 + getAttr('pace') * 0.1);
        midfield += (getAttr('passing') * 0.3);
        break;
      case 'MF':
        midfield += (getAttr('passing') * 0.5 + getAttr('dribbling') * 0.3 + getAttr('defending') * 0.2);
        defense += (getAttr('defending') * 0.2);
        attack += (getAttr('shooting') * 0.2);
        break;
      case 'ST':
      case 'WG':
        attack += (getAttr('shooting') * 0.6 + getAttr('pace') * 0.3 + getAttr('dribbling') * 0.1);
        midfield += (getAttr('pace') * 0.2);
        break;
    }
  });

  // Apply formation modifiers [Defense, Midfield, Attack]
  const [defMod, midMod, attMod] = FORMATION_MODIFIERS[tactics.formation];

  return {
    defense: (defense / Math.max(1, players.length)) * defMod,
    midfield: (midfield / Math.max(1, players.length)) * midMod,
    attack: (attack / Math.max(1, players.length)) * attMod,
    gk: gk || 50, // Default if no keeper
  };
}

/**
 * Run a single match simulation
 */
export function simulateMatch(
  homeSquad: { players: PlayerAttributes[]; tactics: Tactics },
  awaySquad: { players: PlayerAttributes[]; tactics: Tactics },
  _iterations: number = 1 // Reserved for future Monte Carlo runs
): SimulationResult {
  const homePower = calculateTeamPower(homeSquad.players, homeSquad.tactics);
  const awayPower = calculateTeamPower(awaySquad.players, awaySquad.tactics);

  let homeScore = 0;
  let awayScore = 0;
  const events: Partial<MatchEvent>[] = [];
  const insights: string[] = [];

  // Simulate 90 minutes
  for (let min = 1; min <= 90; min++) {
    // 1. Determine possession based on midfield power
    const homePossessionChance = homePower.midfield / (homePower.midfield + awayPower.midfield);
    const inPossession = Math.random() < homePossessionChance ? 'home' : 'away';

    // 2. Check for attacking opportunity (low chance per minute)
    if (Math.random() < 0.15) {
      const attackingPower = inPossession === 'home' ? homePower.attack : awayPower.attack;
      const defendingPower = inPossession === 'home' ? awayPower.defense : homePower.defense;
      const keeperPower = inPossession === 'home' ? awayPower.gk : homePower.gk;

      // Probability of shot on target
      if (Math.random() * attackingPower > Math.random() * defendingPower) {
        // Probability of goal vs keeper
        if (Math.random() * attackingPower > Math.random() * keeperPower * 1.5) {
          if (inPossession === 'home') homeScore++; else awayScore++;
          
          events.push({
            type: 'goal',
            minute: min,
            details: `${inPossession === 'home' ? 'Home' : 'Away'} Team Scores!`,
            timestamp: new Date(),
          });
        }
      }
    }
  }

  // Generate AI Insights
  if (homePower.midfield > awayPower.midfield * 1.2) {
    insights.push("Home team likely to dominate possession due to superior midfield.");
  }
  if (homePower.attack > awayPower.defense * 1.3) {
    insights.push("Away defense may struggle against high-powered home attack.");
  }
  if (awaySquad.tactics.style === 'counter' && homePower.defense < 60) {
    insights.push("Home team vulnerable to Away's counter-attacking style.");
  }

  return {
    homeScore,
    awayScore,
    events,
    probability: {
      homeWin: 0, // Would be calculated with iterations > 1
      draw: 0,
      awayWin: 0,
    },
    insights,
  };
}

/**
 * Run Monte Carlo simulation for probability win chances
 */
export function calculateWinProbabilities(
  homeSquad: { players: PlayerAttributes[]; tactics: Tactics },
  awaySquad: { players: PlayerAttributes[]; tactics: Tactics },
  iterations: number = 1000
): SimulationResult['probability'] {
  let homeWins = 0;
  let draws = 0;
  let awayWins = 0;

  for (let i = 0; i < iterations; i++) {
    const result = simulateMatch(homeSquad, awaySquad, 1);
    if (result.homeScore > result.awayScore) homeWins++;
    else if (result.homeScore < result.awayScore) awayWins++;
    else draws++;
  }

  return {
    homeWin: homeWins / iterations,
    draw: draws / iterations,
    awayWin: awayWins / iterations,
  };
}
