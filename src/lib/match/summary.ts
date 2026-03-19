export interface SquadScopedMatchRecord {
  status?: string | null;
  homeSquadId?: string | null;
  awaySquadId?: string | null;
  homeScore?: number | null;
  awayScore?: number | null;
  homeSquad?: { name?: string | null } | null;
  awaySquad?: { name?: string | null } | null;
}

export function isPendingMatchStatus(status?: string | null) {
  return status === 'pending';
}

export function isSettledMatchStatus(status?: string | null) {
  return status === 'verified' || status === 'finalized';
}

export function getMatchStatusLabel(status?: string | null) {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'verified':
      return 'Verified';
    case 'finalized':
      return 'Finalized';
    case 'disputed':
      return 'Disputed';
    default:
      return 'Unknown';
  }
}

export function describeMatchForSquad(match: SquadScopedMatchRecord, squadId?: string) {
  const isHome = match.homeSquadId === squadId;
  const opponent = isHome ? match.awaySquad?.name : match.homeSquad?.name;
  const goalsFor = isHome ? match.homeScore ?? 0 : match.awayScore ?? 0;
  const goalsAgainst = isHome ? match.awayScore ?? 0 : match.homeScore ?? 0;
  const result: 'W' | 'L' | 'D' = goalsFor > goalsAgainst ? 'W' : goalsFor < goalsAgainst ? 'L' : 'D';

  return {
    opponent: opponent || 'Unknown opponent',
    goalsFor,
    goalsAgainst,
    result,
  };
}
