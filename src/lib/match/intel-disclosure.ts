
/**
 * Intel levels for progressive disclosure:
 * Level 0 (7+ days): Basic info (opponent, date).
 * Level 1 (5-6 days): Squad list + Formation.
 * Level 2 (3-4 days): Weakness Report (Scouting Report).
 * Level 3 (1-2 days): AI Coach Briefing (Tactical Insight).
 * Level 4 (<1 day): Full Win Probability + Final Briefing.
 */
export const INTEL_LEVELS = {
  BASIC: 0,
  SQUAD: 1,
  SCOUTING: 2,
  TACTICAL: 3,
  FULL: 4,
} as const;

export type IntelLevel = typeof INTEL_LEVELS[keyof typeof INTEL_LEVELS];

export function getIntelLevel(matchDate: Date, now: Date = new Date()): IntelLevel {
  // Convert to UTC to avoid timezone shifts in calculation
  const diffMs = matchDate.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays >= 7) return INTEL_LEVELS.BASIC;
  if (diffDays >= 5) return INTEL_LEVELS.SQUAD;
  if (diffDays >= 3) return INTEL_LEVELS.SCOUTING;
  if (diffDays >= 1) return INTEL_LEVELS.TACTICAL;
  return INTEL_LEVELS.FULL;
}

export function maskMatchIntel<T extends { 
  matchDate: Date;
  homeFormation?: any;
  awayFormation?: any;
  homeLineup?: any;
  awayLineup?: any;
  scoutingReport?: any;
  keyThreats?: any;
  keyOpportunities?: any;
  tacticalInsight?: any;
  homeWinPct?: any;
  awayWinPct?: any;
  drawPct?: any;
  simulationSummary?: any;
}>(match: T, now: Date = new Date()): T & { intelLevel: IntelLevel } {
  const intelLevel = getIntelLevel(match.matchDate, now);
  const result = { ...match, intelLevel };

  if (intelLevel < INTEL_LEVELS.SQUAD) {
    delete result.homeFormation;
    delete result.awayFormation;
    delete result.homeLineup;
    delete result.awayLineup;
  }

  if (intelLevel < INTEL_LEVELS.SCOUTING) {
    delete result.scoutingReport;
    delete result.keyThreats;
    delete result.keyOpportunities;
  }

  if (intelLevel < INTEL_LEVELS.TACTICAL) {
    delete result.tacticalInsight;
  }

  if (intelLevel < INTEL_LEVELS.FULL) {
    delete result.homeWinPct;
    delete result.awayWinPct;
    delete result.drawPct;
    delete result.simulationSummary;
  }

  return result;
}
