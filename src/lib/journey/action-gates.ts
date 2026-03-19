import type { JourneyStage } from '@/lib/journey/stage';

export type JourneyActionSurface =
  | 'match_center'
  | 'squad_workspace'
  | 'squad_governance';

export type JourneyActionGateReason =
  | 'available'
  | 'public_visitor'
  | 'guest_preview'
  | 'missing_wallet'
  | 'unverified_wallet'
  | 'missing_squad'
  | 'unsupported_governance_wallet';

export interface JourneyGateAction {
  label: string;
  href?: string;
}

export interface JourneyActionGate {
  status: 'available' | 'blocked';
  reason: JourneyActionGateReason;
  eyebrow: string;
  title: string;
  description: string;
  primaryAction?: JourneyGateAction;
  secondaryAction?: JourneyGateAction;
}

export interface JourneyActionGateInput {
  stage: JourneyStage;
  hasAccount: boolean;
  hasWallet: boolean;
  isVerified: boolean;
  hasSquad: boolean;
  chain?: string | null;
}

const SETTINGS_WALLET_HREF = '/settings?tab=wallet';
const SQUAD_HREF = '/squad';
const DASHBOARD_HREF = '/dashboard';
const START_SEASON_HREF = '/?connect=1';

const SURFACE_LABELS: Record<JourneyActionSurface, string> = {
  match_center: 'match operations',
  squad_workspace: 'squad operations',
  squad_governance: 'squad governance',
};

function createBlockedGate(
  reason: Exclude<JourneyActionGateReason, 'available'>,
  eyebrow: string,
  title: string,
  description: string,
  primaryAction?: JourneyGateAction,
  secondaryAction?: JourneyGateAction,
): JourneyActionGate {
  return {
    status: 'blocked',
    reason,
    eyebrow,
    title,
    description,
    primaryAction,
    secondaryAction,
  };
}

export function getJourneyActionGate(
  surface: JourneyActionSurface,
  input: JourneyActionGateInput,
): JourneyActionGate {
  const surfaceLabel = SURFACE_LABELS[surface];

  if (!input.hasAccount || input.stage === 'public_visitor') {
    return createBlockedGate(
      'public_visitor',
      'Start Here',
      `Start your season to unlock ${surfaceLabel}`,
      `This surface only becomes useful once you create an account and move from browsing into a real season.`,
      { label: 'Start your season', href: START_SEASON_HREF },
      { label: 'Back to landing', href: '/' },
    );
  }

  if (input.stage === 'guest_preview') {
    return createBlockedGate(
      'guest_preview',
      'Preview Only',
      `Preview mode does not unlock ${surfaceLabel}`,
      `The preview is for understanding the flow. Claim your own season when you want real squads, protected actions, and persistent progression.`,
      { label: 'Start your own season', href: START_SEASON_HREF },
      { label: 'Back to dashboard', href: DASHBOARD_HREF },
    );
  }

  if (!input.hasWallet) {
    return createBlockedGate(
      'missing_wallet',
      'Wallet Required',
      `Connect a wallet to unlock ${surfaceLabel}`,
      `Your account is ready, but ${surfaceLabel} rely on a verified wallet identity so the squad can trust who is acting.`,
      { label: 'Connect wallet', href: SETTINGS_WALLET_HREF },
      { label: 'Back to dashboard', href: DASHBOARD_HREF },
    );
  }

  if (!input.isVerified) {
    return createBlockedGate(
      'unverified_wallet',
      'Verification Required',
      `Verify your wallet to unlock ${surfaceLabel}`,
      `Your wallet is connected, but protected squad and match actions stay locked until you approve the verification signature.`,
      { label: 'Verify wallet', href: SETTINGS_WALLET_HREF },
      { label: 'Back to dashboard', href: DASHBOARD_HREF },
    );
  }

  if (!input.hasSquad) {
    const title = surface === 'match_center'
      ? 'Create a squad before logging or verifying matches'
      : 'Create a squad before running team operations';
    const description = surface === 'match_center'
      ? 'Match results, verification, and squad reputation all attach to a real squad. Create one first, then come back to the match center.'
      : 'Squad tactics, transfers, treasury, and governance all compound around a real squad. Create one first, then return here.';

    return createBlockedGate(
      'missing_squad',
      'Squad Required',
      title,
      description,
      { label: 'Create squad', href: SQUAD_HREF },
      { label: 'Back to dashboard', href: DASHBOARD_HREF },
    );
  }

  if (
    surface === 'squad_governance' &&
    input.chain !== 'algorand' &&
    input.chain !== 'avalanche'
  ) {
    return createBlockedGate(
      'unsupported_governance_wallet',
      'Governance Rail',
      'Use an Algorand or Avalanche wallet for governance',
      'Treasury and transfers can still run through the squad workspace, but on-chain proposal voting currently depends on an Algorand or Avalanche wallet.',
      { label: 'Review wallet setup', href: SETTINGS_WALLET_HREF },
      { label: 'Open treasury', href: `${SQUAD_HREF}?tab=treasury` },
    );
  }

  return {
    status: 'available',
    reason: 'available',
    eyebrow: 'Ready',
    title: `${surfaceLabel} unlocked`,
    description: `This surface is ready to use.`,
  };
}
