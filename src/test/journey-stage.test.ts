import { describe, expect, it } from 'vitest';
import { getJourneyStage } from '@/lib/journey/stage';

describe('getJourneyStage', () => {
  it('returns public visitor for signed-out users', () => {
    expect(getJourneyStage({
      isGuest: false,
      hasAccount: false,
      hasWallet: false,
    })).toBe('public_visitor');
  });

  it('returns guest preview for guests', () => {
    expect(getJourneyStage({
      isGuest: true,
      hasAccount: false,
      hasWallet: false,
    })).toBe('guest_preview');
  });

  it('returns account ready for signed-in users without a wallet', () => {
    expect(getJourneyStage({
      isGuest: false,
      hasAccount: true,
      hasWallet: false,
    })).toBe('account_ready');
  });

  it('returns wallet unverified when wallet auth is missing', () => {
    expect(getJourneyStage({
      isGuest: false,
      hasAccount: true,
      hasWallet: true,
      authState: 'missing',
      squadCount: 1,
    })).toBe('wallet_unverified');
  });

  it('returns verified no squad when wallet is valid but no squad exists', () => {
    expect(getJourneyStage({
      isGuest: false,
      hasAccount: true,
      hasWallet: true,
      authState: 'valid',
      squadCount: 0,
    })).toBe('verified_no_squad');
  });

  it('returns season kickoff when squad exists but season has not started', () => {
    expect(getJourneyStage({
      isGuest: false,
      hasAccount: true,
      hasWallet: true,
      authState: 'valid',
      squadCount: 1,
      totalMatches: 0,
      completedChecklistCount: 2,
      totalChecklistCount: 6,
    })).toBe('season_kickoff');
  });

  it('returns returning manager when squad is live and kickoff is complete', () => {
    expect(getJourneyStage({
      isGuest: false,
      hasAccount: true,
      hasWallet: true,
      authState: 'valid',
      squadCount: 1,
      totalMatches: 4,
      pendingMatchesCount: 2,
      completedChecklistCount: 4,
      totalChecklistCount: 6,
    })).toBe('returning_manager');
  });
});
