export type JourneyStage =
  | 'public_visitor'
  | 'guest_preview'
  | 'account_ready'
  | 'wallet_unverified'
  | 'verified_no_squad'
  | 'season_kickoff'
  | 'returning_manager';

export interface JourneyStageInput {
  isGuest: boolean;
  hasAccount: boolean;
  hasWallet: boolean;
  authState?: 'none' | 'missing' | 'expired' | 'valid' | 'guest' | null;
  squadCount?: number;
  totalMatches?: number;
  pendingMatchesCount?: number;
  completedChecklistCount?: number;
  totalChecklistCount?: number;
}

export function getJourneyStage(input: JourneyStageInput): JourneyStage {
  const {
    isGuest,
    hasAccount,
    hasWallet,
    authState = null,
    squadCount = 0,
    totalMatches = 0,
    pendingMatchesCount = 0,
    completedChecklistCount = 0,
    totalChecklistCount = 0,
  } = input;

  if (!hasAccount && !isGuest) {
    return 'public_visitor';
  }

  if (isGuest) {
    return 'guest_preview';
  }

  if (!hasWallet) {
    return 'account_ready';
  }

  if (authState === 'missing' || authState === 'expired') {
    return 'wallet_unverified';
  }

  if (squadCount === 0) {
    return 'verified_no_squad';
  }

  const kickoffThreshold = Math.min(totalChecklistCount, 3);
  if (
    totalMatches === 0 ||
    (kickoffThreshold > 0 && completedChecklistCount < kickoffThreshold)
  ) {
    return 'season_kickoff';
  }

  if (pendingMatchesCount >= 0) {
    return 'returning_manager';
  }

  return 'returning_manager';
}
