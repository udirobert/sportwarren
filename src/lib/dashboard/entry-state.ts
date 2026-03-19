export type DashboardEntryStateId =
  | 'guest_preview'
  | 'account_ready'
  | 'wallet_unverified'
  | 'verified_no_squad'
  | 'season_kickoff'
  | 'returning_manager';

export type DashboardEntryActionIntent =
  | 'open_wallet'
  | 'verify_wallet'
  | 'create_squad'
  | 'log_match'
  | 'open_match_center'
  | 'open_staff_room';

export interface DashboardEntryAction {
  intent: DashboardEntryActionIntent;
  label: string;
  href?: string;
}

export interface DashboardEntryStateInput {
  isGuest: boolean;
  hasAccount: boolean;
  hasWallet: boolean;
  isVerified: boolean;
  squadCount: number;
  pendingMatchesCount: number;
  completedChecklistCount: number;
  totalChecklistCount: number;
  totalMatches: number;
}

export interface DashboardEntryState {
  id: DashboardEntryStateId;
  eyebrow: string;
  headline: string;
  description: string;
  primaryAction: DashboardEntryAction;
  secondaryAction?: DashboardEntryAction;
  surfaceLabel: string;
  queueLabel: string;
  identityLabel: string;
  squadLabel: string;
}

const getPendingLabel = (count: number) =>
  count > 0
    ? `${count} match report${count === 1 ? '' : 's'} pending`
    : 'No pending match reports';

export function getDashboardEntryState(input: DashboardEntryStateInput): DashboardEntryState {
  const {
    isGuest,
    hasAccount,
    hasWallet,
    isVerified,
    squadCount,
    pendingMatchesCount,
    completedChecklistCount,
    totalChecklistCount,
    totalMatches,
  } = input;

  if (isGuest) {
    return {
      id: 'guest_preview',
      eyebrow: 'Guest Preview',
      headline: 'Explore the platform before you commit',
      description: 'You are in a live preview. Log a result, inspect the flow, then start your own season when you are ready to save real progress.',
      primaryAction: { intent: 'open_wallet', label: 'Start your own season', href: '/?connect=1' },
      secondaryAction: { intent: 'log_match', label: 'Try the match flow', href: '/match?mode=capture' },
      surfaceLabel: 'Preview',
      queueLabel: 'Demo queue ready',
      identityLabel: 'Guest mode',
      squadLabel: 'Preview roster',
    };
  }

  if (!hasAccount || !hasWallet) {
    return {
      id: 'account_ready',
      eyebrow: 'Season Kickoff',
      headline: 'Start your season',
      description: 'Your account is ready. Log your first match in under a minute, then add a wallet when you want protected actions and on-chain progression.',
      primaryAction: { intent: 'log_match', label: 'Log your first match', href: '/match?mode=capture' },
      secondaryAction: { intent: 'open_wallet', label: 'Connect wallet', href: '/?connect=1' },
      surfaceLabel: 'Account Ready',
      queueLabel: 'First result not logged yet',
      identityLabel: 'Wallet not connected',
      squadLabel: squadCount > 0 ? 'Squad linked' : 'No squad yet',
    };
  }

  if (!isVerified) {
    return {
      id: 'wallet_unverified',
      eyebrow: 'Verification Required',
      headline: 'Verify your wallet to unlock protected actions',
      description: 'Your wallet is connected, but protected data, squad actions, and secure progression stay locked until you approve a verification signature.',
      primaryAction: { intent: 'verify_wallet', label: 'Verify wallet' },
      secondaryAction: { intent: 'log_match', label: 'Log a match', href: '/match?mode=capture' },
      surfaceLabel: 'Wallet Connected',
      queueLabel: getPendingLabel(pendingMatchesCount),
      identityLabel: 'Verification pending',
      squadLabel: squadCount > 0 ? 'Squad linked' : 'No squad yet',
    };
  }

  if (squadCount === 0) {
    return {
      id: 'verified_no_squad',
      eyebrow: 'Squad Setup',
      headline: 'Create your squad',
      description: 'Your identity is secured. The next step is creating a squad so results, invites, and reputation can compound around a real team.',
      primaryAction: { intent: 'create_squad', label: 'Create squad' },
      secondaryAction: { intent: 'open_staff_room', label: 'Open Staff Room' },
      surfaceLabel: 'Identity Secured',
      queueLabel: getPendingLabel(pendingMatchesCount),
      identityLabel: 'Verified',
      squadLabel: 'No squad yet',
    };
  }

  const kickoffThreshold = Math.min(totalChecklistCount, 3);
  const needsKickoff = totalMatches === 0 || completedChecklistCount < kickoffThreshold;
  if (needsKickoff) {
    return {
      id: 'season_kickoff',
      eyebrow: 'Season Kickoff',
      headline: 'Log the first result that makes this season real',
      description: 'You have the essentials in place. One verified match creates the first real proof, reputation, and momentum that make the product sticky for the whole squad.',
      primaryAction: { intent: 'log_match', label: 'Log your first result', href: '/match?mode=capture' },
      secondaryAction: { intent: 'open_match_center', label: 'Open Match Center', href: '/match?mode=verify' },
      surfaceLabel: 'Season Live',
      queueLabel: getPendingLabel(pendingMatchesCount),
      identityLabel: 'Verified',
      squadLabel: 'Squad active',
    };
  }

  return {
    id: 'returning_manager',
    eyebrow: 'Manager Console',
    headline: pendingMatchesCount > 0
      ? `${pendingMatchesCount} match report${pendingMatchesCount === 1 ? '' : 's'} need review`
      : 'Welcome back to your squad console',
    description: pendingMatchesCount > 0
      ? 'Clear the queue, confirm the latest results, and keep the season moving.'
      : 'Your squad is live. Review operations, log the next result, or use the Staff Room to coordinate what happens next.',
    primaryAction: pendingMatchesCount > 0
      ? { intent: 'open_match_center', label: 'Review pending reports', href: '/match?mode=verify' }
      : { intent: 'log_match', label: 'Log a new match', href: '/match?mode=capture' },
    secondaryAction: { intent: 'open_staff_room', label: 'Open Staff Room' },
    surfaceLabel: 'Live',
    queueLabel: getPendingLabel(pendingMatchesCount),
    identityLabel: 'Verified',
    squadLabel: 'Squad active',
  };
}
