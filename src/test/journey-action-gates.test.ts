import { describe, expect, it } from 'vitest';
import { getJourneyActionGate } from '@/lib/journey/action-gates';

describe('journey action gates', () => {
  it('blocks match center for account-ready users until a wallet is connected', () => {
    expect(getJourneyActionGate('match_center', {
      stage: 'account_ready',
      hasAccount: true,
      hasWallet: false,
      isVerified: false,
      hasSquad: false,
      chain: 'social',
    })).toMatchObject({
      status: 'blocked',
      reason: 'missing_wallet',
      primaryAction: { label: 'Connect wallet', href: '/settings?tab=wallet' },
    });
  });

  it('blocks squad workspace for verified users until they create a squad', () => {
    expect(getJourneyActionGate('squad_workspace', {
      stage: 'verified_no_squad',
      hasAccount: true,
      hasWallet: true,
      isVerified: true,
      hasSquad: false,
      chain: 'algorand',
    })).toMatchObject({
      status: 'blocked',
      reason: 'missing_squad',
      primaryAction: { label: 'Create squad', href: '/squad' },
    });
  });

  it('blocks governance when the wallet chain does not support it', () => {
    expect(getJourneyActionGate('squad_governance', {
      stage: 'season_kickoff',
      hasAccount: true,
      hasWallet: true,
      isVerified: true,
      hasSquad: true,
      chain: 'lens',
    })).toMatchObject({
      status: 'blocked',
      reason: 'unsupported_governance_wallet',
      primaryAction: { label: 'Review wallet setup', href: '/settings?tab=wallet' },
    });
  });
});
