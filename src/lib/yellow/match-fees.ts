export type MatchFeeSettlementStatus = 'verified' | 'disputed';

export interface MatchFeeDistribution {
  result: 'home' | 'away' | 'draw' | 'disputed';
  feeAmount: number;
  homeAmount: number;
  awayAmount: number;
  platformAmount: number;
}

export function getMatchFeeDistribution(
  match: { homeScore: number | null; awayScore: number | null },
  status: MatchFeeSettlementStatus,
  feeAmount: number,
): MatchFeeDistribution {
  const totalPool = feeAmount * 2;
  const platformAmount = Math.floor(totalPool * 0.2);

  if (status === 'disputed') {
    return {
      result: 'disputed',
      feeAmount,
      homeAmount: feeAmount,
      awayAmount: feeAmount,
      platformAmount: 0,
    };
  }

  if ((match.homeScore ?? 0) === (match.awayScore ?? 0)) {
    const sharedAmount = Math.floor((totalPool - platformAmount) / 2);
    return {
      result: 'draw',
      feeAmount,
      homeAmount: sharedAmount,
      awayAmount: sharedAmount,
      platformAmount,
    };
  }

  const homeWon = (match.homeScore ?? 0) > (match.awayScore ?? 0);

  return {
    result: homeWon ? 'home' : 'away',
    feeAmount,
    homeAmount: homeWon ? totalPool - platformAmount : 0,
    awayAmount: homeWon ? 0 : totalPool - platformAmount,
    platformAmount,
  };
}
