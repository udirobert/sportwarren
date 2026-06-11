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
      headline: 'Preview your player card',
      description: 'You are in an interactive preview. Build your card, see the match flow, then claim it to save real progress.',
      primaryAction: { intent: 'open_wallet', label: 'Start your own season', href: '/?connect=1' },
      secondaryAction: { intent: 'preview_match', label: 'Preview your next match', href: '/match/preview' },
      surfaceLabel: 'Preview',
      queueLabel: 'Preview queue ready',
      identityLabel: 'Guest mode',
      squadLabel: 'Preview roster',
      isNewUser: true,
      steps: [
        { number: 1, label: 'Build your card', completed: false, href: '/match?mode=capture' },
        { number: 2, label: 'Claim your card', completed: false, href: '/?connect=1' },
      ],
    };
  }

  if (stage === 'account_ready' || stage === 'public_visitor') {
    return {
      id: 'account_ready',
      eyebrow: 'Player Card',
      headline: 'Complete your player card',
      description: 'Finish your card — name, position, avatar — and pick your formation. Real matches turn provisional stats into a verified record.',
      primaryAction: { intent: 'preview_match', label: 'Set Tactics', href: '/squad?tab=tactics' },
      secondaryAction: { intent: 'open_staff_room', label: 'Explore the Staff Room' },
      surfaceLabel: 'Player Card',
      queueLabel: 'Card not completed yet',
      identityLabel: 'Account active',
      squadLabel: input.squadCount > 0 ? 'Squad linked' : 'No squad yet',
      isNewUser: true,
      steps: [
        { number: 1, label: 'Complete your card', completed: input.completedChecklistCount > 0, href: '/squad?tab=tactics' },
        { number: 2, label: 'Set your avatar', completed: false, href: '/settings?tab=profile' },
        { number: 3, label: 'Secure your progress', completed: false, href: '/settings?tab=wallet' },
      ],
    };
  }

  if (stage === 'pending_member') {
    return {
      id: 'pending_member',
      eyebrow: 'Squad Joined',
      headline: 'You\'re on the roster!',
      description: 'Connect a wallet to unlock tactics, transfers, match verification, and start building your player record.',
      primaryAction: { intent: 'open_wallet', label: 'Connect Wallet', href: '/settings?tab=wallet' },
      secondaryAction: { intent: 'preview_match', label: 'Preview Squad', href: '/squad' },
      surfaceLabel: 'Pending',
      queueLabel: 'Wallet not connected',
      identityLabel: 'Email verified',
      squadLabel: 'Squad joined (pending)',
      isNewUser: true,
      steps: [
        { number: 1, label: 'Join squad', completed: true },
        { number: 2, label: 'Connect wallet', completed: false, href: '/settings?tab=wallet' },
        { number: 3, label: 'Log first match', completed: false, href: '/match?mode=capture' },
      ],
    };
  }

  if (stage === 'wallet_unverified') {
    return {
      id: 'wallet_unverified',
      eyebrow: 'Card Security',
      headline: 'Secure your player card',
      description: 'Your wallet is connected. One signature locks in your card so stats, XP, and squad history persist across devices.',
      primaryAction: { intent: 'preview_match', label: 'Preview Match', href: '/squad?tab=tactics' },
      secondaryAction: { intent: 'verify_wallet', label: 'Secure Your Card' },
      surfaceLabel: 'Wallet Connected',
      queueLabel: getPendingLabel(input.pendingMatchesCount),
      identityLabel: 'Wallet connected',
      squadLabel: input.squadCount > 0 ? 'Squad linked' : 'No squad yet',
      isNewUser: true,
      steps: [
        { number: 1, label: 'Complete your card', completed: input.completedChecklistCount > 0, href: '/squad?tab=tactics' },
        { number: 2, label: 'Secure your card', completed: false },
        { number: 3, label: 'Add teammates', completed: input.squadCount > 0, href: '/squad' },
      ],
    };
  }

  if (stage === 'verified_no_squad') {
    return {
      id: 'verified_no_squad',
      eyebrow: 'Squad Verification',
      headline: 'Add teammates to your card',
      description: 'Your card is secured. Bring your teammates onto the pitch so they can verify your stats and make the card real.',
      primaryAction: { intent: 'create_squad', label: 'Create Squad' },
      secondaryAction: { intent: 'join_squad', label: 'Find a Squad' },
      surfaceLabel: 'Card Secured',
      queueLabel: getPendingLabel(input.pendingMatchesCount),
      identityLabel: 'Verified',
      squadLabel: 'No squad yet',
      isNewUser: true,
      steps: [
        { number: 1, label: 'Complete your card', completed: input.completedChecklistCount > 0, href: '/squad?tab=tactics' },
        { number: 2, label: 'Add teammates', completed: false },
        { number: 3, label: 'Log first match', completed: false, href: '/match?mode=capture' },
      ],
    };
  }

  if (stage === 'season_kickoff') {
    return {
      id: 'season_kickoff',
      eyebrow: 'Season Kickoff',
      headline: 'Make your stats real',
      description: 'Your squad is in place. Log a verified match to turn your provisional stats into a living player record.',
      primaryAction: { intent: 'preview_match', label: 'Preview your squad', href: '/squad?tab=tactics' },
      secondaryAction: { intent: 'open_match_center', label: 'Match Center', href: '/match' },
      surfaceLabel: 'Season Live',
      queueLabel: getPendingLabel(input.pendingMatchesCount),
      identityLabel: 'Verified',
      squadLabel: 'Squad active',
      isNewUser: true,
      steps: [
        { number: 1, label: 'Build your squad', completed: true },
        { number: 2, label: 'Pick your formation', completed: false, href: '/squad?tab=tactics' },
        { number: 3, label: 'Log first match', completed: input.totalMatches > 0, href: '/match?mode=capture' },
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
      ? 'Review the queue, confirm results, and keep your stats growing.'
      : 'Your squad is active. Log a result, preview your lineup, or head to the pitch to keep the momentum going.',
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
