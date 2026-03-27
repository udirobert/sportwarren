import { getJourneyStage, type JourneyStage } from '@/lib/journey/stage';

export type DashboardEntryStateId = Exclude<JourneyStage, 'public_visitor'>;

export type DashboardEntryActionIntent =
  | 'open_wallet'
  | 'verify_wallet'
  | 'create_squad'
  | 'join_squad'
  | 'log_match'
  | 'preview_match'
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
      secondaryAction: { intent: 'preview_match', label: 'Preview your next match', href: '/match/preview' },
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
      description: 'Your account is ready. Set up your squad tactics and preview your first match — you can log results after you play.',
      primaryAction: { intent: 'preview_match', label: 'Preview your match', href: '/squad?tab=tactics' },
      secondaryAction: { intent: 'open_staff_room', label: 'Explore the Staff Room' },
      surfaceLabel: 'Account Ready',
      queueLabel: 'First result not logged yet',
      identityLabel: 'Account active',
      squadLabel: input.squadCount > 0 ? 'Squad linked' : 'No squad yet',
      isNewUser: true,
      steps: [
        { number: 1, label: 'Set your tactics', completed: false, href: '/squad?tab=tactics' },
        { number: 2, label: 'Play a match', completed: false, href: '/match?mode=capture' },
        { number: 3, label: 'Get verified', completed: false, href: '/settings?tab=wallet' },
      ],
    };
  }

  if (stage === 'wallet_unverified') {
    return {
      id: 'wallet_unverified',
      eyebrow: 'Verification Optional',
      headline: 'Your wallet is connected',
      description: 'You can set up your tactics now. Preview your squad, choose your formation, and get ready for match day.',
      primaryAction: { intent: 'preview_match', label: 'Set up tactics', href: '/squad?tab=tactics' },
      secondaryAction: { intent: 'verify_wallet', label: 'Verify wallet' },
      surfaceLabel: 'Wallet Connected',
      queueLabel: getPendingLabel(input.pendingMatchesCount),
      identityLabel: 'Wallet connected',
      squadLabel: input.squadCount > 0 ? 'Squad linked' : 'No squad yet',
      isNewUser: true,
      steps: [
        { number: 1, label: 'Set tactics', completed: false, href: '/squad?tab=tactics' },
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
      description: 'Your identity is secured. Create a squad, set your tactics, and prepare for your first match.',
      primaryAction: { intent: 'create_squad', label: 'Create your squad' },
      secondaryAction: { intent: 'join_squad', label: 'Join a squad' },
      surfaceLabel: 'Identity Secured',
      queueLabel: getPendingLabel(input.pendingMatchesCount),
      identityLabel: 'Verified',
      squadLabel: 'No squad yet',
      isNewUser: true,
      steps: [
        { number: 1, label: 'Verify identity', completed: true },
        { number: 2, label: 'Create or join squad', completed: false },
        { number: 3, label: 'Set tactics', completed: false, href: '/squad?tab=tactics' },
      ],
    };
  }

  if (stage === 'season_kickoff') {
    return {
      id: 'season_kickoff',
      eyebrow: 'Match Day Ready',
      headline: 'Prepare for your first match',
      description: 'Your squad is ready. Set your tactics, choose your formation, and preview how your team will line up before the whistle blows.',
      primaryAction: { intent: 'preview_match', label: 'Preview your squad', href: '/squad?tab=tactics' },
      secondaryAction: { intent: 'open_match_center', label: 'Match Center', href: '/match' },
      surfaceLabel: 'Season Live',
      queueLabel: getPendingLabel(input.pendingMatchesCount),
      identityLabel: 'Verified',
      squadLabel: 'Squad active',
      isNewUser: true,
      steps: [
        { number: 1, label: 'Set up squad', completed: true },
        { number: 2, label: 'Choose formation', completed: false, href: '/squad?tab=tactics' },
        { number: 3, label: 'Play match', completed: input.totalMatches > 0, href: '/match?mode=capture' },
      ],
    };
  }

  return {
    id: 'returning_manager',
    eyebrow: 'Match Day',
    headline: input.pendingMatchesCount > 0
      ? `${input.pendingMatchesCount} match report${input.pendingMatchesCount === 1 ? '' : 's'} need review`
      : 'Ready for your next match',
    description: input.pendingMatchesCount > 0
      ? 'Review the queue, confirm results, and keep the season moving.'
      : 'Your squad is set. Preview your tactics, check your lineup, or head to the pitch.',
    primaryAction: input.pendingMatchesCount > 0
      ? { intent: 'open_match_center', label: 'Review reports', href: '/match?mode=verify' }
      : { intent: 'preview_match', label: 'Preview next match', href: '/squad?tab=tactics' },
    secondaryAction: { intent: 'open_staff_room', label: 'Staff Room' },
    surfaceLabel: 'Live',
    queueLabel: getPendingLabel(input.pendingMatchesCount),
    identityLabel: 'Verified',
    squadLabel: 'Squad active',
    isNewUser: false,
    steps: [],
  };
}
