import { getJourneyStage, type JourneyStage } from '@/lib/journey/stage';

export type DashboardEntryStateId = Exclude<JourneyStage, 'public_visitor'>;

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

export interface OnboardingStep {
  number: number;
  label: string;
  completed: boolean;
  href?: string;
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
  isNewUser: boolean;
  steps: OnboardingStep[];
}

export function isNewUserState(id: DashboardEntryStateId): boolean {
  return id !== 'returning_manager';
}

const getPendingLabel = (count: number) =>
  count > 0
    ? `${count} match report${count === 1 ? '' : 's'} pending`
    : 'No pending match reports';

export function getDashboardEntryState(input: DashboardEntryStateInput): DashboardEntryState {
  const stage = getJourneyStage({
    isGuest: input.isGuest,
    hasAccount: input.hasAccount,
    hasWallet: input.hasWallet,
    authState: input.isVerified ? 'valid' : (input.hasWallet ? 'missing' : 'none'),
    squadCount: input.squadCount,
    pendingMatchesCount: input.pendingMatchesCount,
    completedChecklistCount: input.completedChecklistCount,
    totalChecklistCount: input.totalChecklistCount,
    totalMatches: input.totalMatches,
  });

  if (stage === 'guest_preview') {
    return {
      id: 'guest_preview',
      eyebrow: 'Guest Preview',
      headline: 'Explore the platform before you commit',
      description: 'You are in an interactive preview. Log a result, inspect the flow, then start your own season when you are ready to save real progress.',
      primaryAction: { intent: 'open_wallet', label: 'Start your own season', href: '/?connect=1' },
      secondaryAction: { intent: 'log_match', label: 'Try the match flow', href: '/match?mode=capture' },
      surfaceLabel: 'Preview',
      queueLabel: 'Preview queue ready',
      identityLabel: 'Guest mode',
      squadLabel: 'Preview roster',
      isNewUser: true,
      steps: [
        { number: 1, label: 'Try a match', completed: false, href: '/match?mode=capture' },
        { number: 2, label: 'Claim your season', completed: false, href: '/?connect=1' },
      ],
    };
  }

  if (stage === 'account_ready' || stage === 'public_visitor') {
    return {
      id: 'account_ready',
      eyebrow: 'Season Kickoff',
      headline: 'Start your season',
      description: 'Your account is ready. Log your first match in under a minute — you can add a wallet later when you want protected actions.',
      primaryAction: { intent: 'log_match', label: 'Log your first match', href: '/match?mode=capture' },
      secondaryAction: { intent: 'open_staff_room', label: 'Explore the Staff Room' },
      surfaceLabel: 'Account Ready',
      queueLabel: 'First result not logged yet',
      identityLabel: 'Account active',
      squadLabel: input.squadCount > 0 ? 'Squad linked' : 'No squad yet',
      isNewUser: true,
      steps: [
        { number: 1, label: 'Log a match', completed: input.totalMatches > 0, href: '/match?mode=capture' },
        { number: 2, label: 'Get verified', completed: false, href: '/match?mode=verify' },
        { number: 3, label: 'Join a squad', completed: input.squadCount > 0, href: '/squad' },
      ],
    };
  }

  if (stage === 'wallet_unverified') {
    return {
      id: 'wallet_unverified',
      eyebrow: 'Verification Optional',
      headline: 'Your wallet is connected',
      description: 'You can log matches now. Verify your wallet later when you want protected squad actions and on-chain progression.',
      primaryAction: { intent: 'log_match', label: 'Log a match', href: '/match?mode=capture' },
      secondaryAction: { intent: 'verify_wallet', label: 'Verify wallet' },
      surfaceLabel: 'Wallet Connected',
      queueLabel: getPendingLabel(input.pendingMatchesCount),
      identityLabel: 'Wallet connected',
      squadLabel: input.squadCount > 0 ? 'Squad linked' : 'No squad yet',
      isNewUser: true,
      steps: [
        { number: 1, label: 'Log a match', completed: input.totalMatches > 0, href: '/match?mode=capture' },
        { number: 2, label: 'Verify wallet', completed: false },
        { number: 3, label: 'Join a squad', completed: input.squadCount > 0, href: '/squad' },
      ],
    };
  }

  if (stage === 'verified_no_squad') {
    return {
      id: 'verified_no_squad',
      eyebrow: 'Squad Setup',
      headline: 'Create your squad',
      description: 'Your identity is secured. The next step is creating a squad so results, invites, and reputation can compound around a real team.',
      primaryAction: { intent: 'create_squad', label: 'Create squad' },
      secondaryAction: { intent: 'open_staff_room', label: 'Open Staff Room' },
      surfaceLabel: 'Identity Secured',
      queueLabel: getPendingLabel(input.pendingMatchesCount),
      identityLabel: 'Verified',
      squadLabel: 'No squad yet',
      isNewUser: true,
      steps: [
        { number: 1, label: 'Verify identity', completed: true },
        { number: 2, label: 'Create a squad', completed: false },
        { number: 3, label: 'Log first match', completed: input.totalMatches > 0, href: '/match?mode=capture' },
      ],
    };
  }

  if (stage === 'season_kickoff') {
    return {
      id: 'season_kickoff',
      eyebrow: 'Season Kickoff',
      headline: 'Log the first result that makes this season real',
      description: 'You have the essentials in place. One verified match creates the first real proof, reputation, and momentum that make the product sticky for the whole squad.',
      primaryAction: { intent: 'log_match', label: 'Log your first result', href: '/match?mode=capture' },
      secondaryAction: { intent: 'open_match_center', label: 'Open Match Center', href: '/match?mode=verify' },
      surfaceLabel: 'Season Live',
      queueLabel: getPendingLabel(input.pendingMatchesCount),
      identityLabel: 'Verified',
      squadLabel: 'Squad active',
      isNewUser: true,
      steps: [
        { number: 1, label: 'Set up squad', completed: true },
        { number: 2, label: 'Log first match', completed: input.totalMatches > 0, href: '/match?mode=capture' },
        { number: 3, label: 'Get verified', completed: false, href: '/match?mode=verify' },
      ],
    };
  }

  return {
    id: 'returning_manager',
    eyebrow: 'Manager Console',
    headline: input.pendingMatchesCount > 0
      ? `${input.pendingMatchesCount} match report${input.pendingMatchesCount === 1 ? '' : 's'} need review`
      : 'Welcome back to your squad console',
    description: input.pendingMatchesCount > 0
      ? 'Clear the queue, confirm the latest results, and keep the season moving.'
      : 'Your squad is live. Review operations, log the next result, or use the Staff Room to coordinate what happens next.',
    primaryAction: input.pendingMatchesCount > 0
      ? { intent: 'open_match_center', label: 'Review pending reports', href: '/match?mode=verify' }
      : { intent: 'log_match', label: 'Log a new match', href: '/match?mode=capture' },
    secondaryAction: { intent: 'open_staff_room', label: 'Open Staff Room' },
    surfaceLabel: 'Live',
    queueLabel: getPendingLabel(input.pendingMatchesCount),
    identityLabel: 'Verified',
    squadLabel: 'Squad active',
    isNewUser: false,
    steps: [],
  };
}
