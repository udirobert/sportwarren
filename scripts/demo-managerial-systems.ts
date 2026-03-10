/**
 * Demo Script: Managerial Systems
 * Showcases Valuation, Fitness, and Simulation logic
 */

import { calculatePlayerValue } from '../src/lib/player/valuation-engine';
import { getFitnessStatus, applyFitnessToAttributes } from '../src/lib/player/fitness-engine';
import { simulateMatch, calculateWinProbabilities } from '../src/lib/match/simulation-engine';
import { PlayerAttributes, Tactics } from '../src/types';

// 1. Setup Mock Players
const striker: PlayerAttributes = {
  address: '0xSTRIKER',
  playerName: 'Zlatan Jr',
  position: 'ST',
  skills: [
    { skill: 'shooting', rating: 88, history: [8, 9, 7, 9, 10] },
    { skill: 'pace', rating: 82, history: [] },
    { skill: 'physical', rating: 90, history: [] },
    { skill: 'dribbling', rating: 85, history: [] },
  ],
  xp: { level: 25, totalXP: 50000, seasonXP: 1000, nextLevelXP: 0 },
} as any;

const defender: PlayerAttributes = {
  address: '0xDEFENDER',
  playerName: 'Vince Tank',
  position: 'DF',
  skills: [
    { skill: 'defending', rating: 92, history: [7, 7, 8, 7, 7] },
    { skill: 'physical', rating: 95, history: [] },
    { skill: 'pace', rating: 60, history: [] },
    { skill: 'passing', rating: 70, history: [] },
  ],
  xp: { level: 45, totalXP: 150000, seasonXP: 2000, nextLevelXP: 0 },
} as any;

const homeTactics: Tactics = {
  formation: '4-3-3',
  style: 'high_press',
} as any;

const awayTactics: Tactics = {
  formation: '5-4-1',
  style: 'low_block',
} as any;

async function runDemo() {
  console.log("=== SPORTWARREN MANAGERIAL SYSTEMS DEMO ===\n");

  // --- VALUATION DEMO ---
  console.log("--- 1. MARKET VALUATION ---");
  const strikerValue = calculatePlayerValue(striker, 2); // 2 squads interested
  const defenderValue = calculatePlayerValue(defender, 0); // 0 squads interested

  console.log(`${striker.playerName} (${strikerValue.tier}): $${strikerValue.value.toLocaleString()} USDC`);
  console.log(` > Multipliers: Form: ${strikerValue.breakdown.formMultiplier}x, Potential: ${strikerValue.breakdown.potentialMultiplier}x, Demand: ${strikerValue.breakdown.demandMultiplier}x`);
  
  console.log(`${defender.playerName} (${defenderValue.tier}): $${defenderValue.value.toLocaleString()} USDC`);
  console.log(` > Note: Established veteran, lower demand.\n`);


  // --- FITNESS DEMO ---
  console.log("--- 2. FITNESS & PERFORMANCE ---");
  const tiredStrikerStatus = getFitnessStatus(35); // Very tired
  const fitDefenderStatus = getFitnessStatus(95); // Elite fitness

  console.log(`${striker.playerName} Status: ${tiredStrikerStatus.label} (${tiredStrikerStatus.modifier}x modifier)`);
  console.log(`${defender.playerName} Status: ${fitDefenderStatus.label} (${fitDefenderStatus.modifier}x modifier)\n`);


  // --- SIMULATION DEMO ---
  console.log("--- 3. SHADOW ENGINE SIMULATION ---");
  console.log(`Scenario: ${homeTactics.formation} (${homeTactics.style}) vs ${awayTactics.formation} (${awayTactics.style})`);
  
  // Inject fitness into player objects for simulation
  (striker as any).sharpness = 35;
  (defender as any).sharpness = 95;

  const probabilities = calculateWinProbabilities(
    { players: [striker], tactics: homeTactics },
    { players: [defender], tactics: awayTactics },
    1000
  );

  console.log(`Win Probabilities (1,000 Iterations):`);
  console.log(` > Home Win: ${(probabilities.homeWin * 100).toFixed(1)}%`);
  console.log(` > Draw:     ${(probabilities.draw * 100).toFixed(1)}%`);
  console.log(` > Away Win: ${(probabilities.awayWin * 100).toFixed(1)}%`);
  
  if (probabilities.awayWin > probabilities.homeWin) {
    console.log(`\nANALYSIS: Despite the home team's attacking tactics, ${striker.playerName}'s low sharpness (${(striker as any).sharpness}%) is significantly hampering their goal-scoring ability against ${defender.playerName}'s elite defense.`);
  }

  console.log("\n=== DEMO COMPLETE ===");
}

runDemo().catch(console.error);
