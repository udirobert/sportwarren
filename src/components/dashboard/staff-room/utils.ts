/** Derive reputation tier from reputation score. */
export function reputationTierLabel(score: number): string {
  if (score >= 800) return 'Platinum';
  if (score >= 500) return 'Gold';
  if (score >= 250) return 'Silver';
  return 'Bronze';
}

/** Derive market valuation from level and reputation score. */
export function calcMarketValuation(level: number, score: number): number {
  return Math.round((level * 200 + score * 3) / 50) * 50;
}

/** Get quick actions for a given staff member. */
export function getQuickActions(
  staffId: string,
  options: { contractCandidates: string[] },
): string[] {
  const contractActions = options.contractCandidates.map(
    (name) => `Renegotiate ${name}'s Contract`,
  );
  switch (staffId) {
    case 'agent-1':
      return [...contractActions, 'Balance Sheet Review', 'Transfer Budget Inquiry'];
    case 'scout-1':
      return ['Squad Coverage Review', 'Scouting Priority Report', 'Opponent Prep Checklist'];
    case 'coach-1':
      return ['Tactical Briefing', 'Squad Morale Check', 'Training Optimization'];
    case 'physio-1':
      return ['Fitness Status Report', 'Recovery Logistics', 'Injury Prevention'];
    case 'comms-1':
      return ['Commercial Readiness', 'Growth Priorities', 'Community Update Plan'];
    default:
      return ['Status Report', 'Next Match Preparation'];
  }
}
