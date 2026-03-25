import { describe, expect, it } from 'vitest';
import { getDashboardEntryState } from '@/lib/dashboard/entry-state';

describe('getDashboardEntryState', () => {
  it('returns guest preview state for guests', () => {
    const state = getDashboardEntryState({
      isGuest: true,
      hasAccount: false,
      hasWallet: false,
      isVerified: false,
      squadCount: 0,
      pendingMatchesCount: 0,
      completedChecklistCount: 0,
      totalChecklistCount: 6,
      totalMatches: 0,
    });

    expect(state.id).toBe('guest_preview');
    expect(state.primaryAction.label).toBe('Start your own season');
  });

  it('returns account-ready state for signed-in users without a wallet', () => {
    const state = getDashboardEntryState({
      isGuest: false,
      hasAccount: true,
      hasWallet: false,
      isVerified: false,
      squadCount: 0,
      pendingMatchesCount: 0,
      completedChecklistCount: 1,
      totalChecklistCount: 6,
      totalMatches: 0,
    });

    expect(state.id).toBe('account_ready');
    expect(state.primaryAction.label).toBe('Log your first match');
    expect(state.secondaryAction?.label).toBe('Explore the Staff Room');
  });

  it('returns wallet verification state when a wallet is connected but not verified', () => {
    const state = getDashboardEntryState({
      isGuest: false,
      hasAccount: true,
      hasWallet: true,
      isVerified: false,
      squadCount: 1,
      pendingMatchesCount: 2,
      completedChecklistCount: 2,
      totalChecklistCount: 6,
      totalMatches: 0,
    });

    expect(state.id).toBe('wallet_unverified');
    expect(state.primaryAction.intent).toBe('log_match');
    expect(state.secondaryAction?.intent).toBe('verify_wallet');
  });

  it('returns verified-no-squad state for verified users without a squad', () => {
    const state = getDashboardEntryState({
      isGuest: false,
      hasAccount: true,
      hasWallet: true,
      isVerified: true,
      squadCount: 0,
      pendingMatchesCount: 0,
      completedChecklistCount: 3,
      totalChecklistCount: 6,
      totalMatches: 1,
    });

    expect(state.id).toBe('verified_no_squad');
    expect(state.primaryAction.intent).toBe('create_squad');
  });

  it('returns season kickoff state when the squad exists but the season has not started', () => {
    const state = getDashboardEntryState({
      isGuest: false,
      hasAccount: true,
      hasWallet: true,
      isVerified: true,
      squadCount: 1,
      pendingMatchesCount: 0,
      completedChecklistCount: 2,
      totalChecklistCount: 6,
      totalMatches: 0,
    });

    expect(state.id).toBe('season_kickoff');
    expect(state.primaryAction.label).toBe('Log your first result');
  });

  it('returns returning-manager state for active squads with season momentum', () => {
    const state = getDashboardEntryState({
      isGuest: false,
      hasAccount: true,
      hasWallet: true,
      isVerified: true,
      squadCount: 1,
      pendingMatchesCount: 3,
      completedChecklistCount: 4,
      totalChecklistCount: 6,
      totalMatches: 5,
    });

    expect(state.id).toBe('returning_manager');
    expect(state.headline).toContain('3 match reports');
  });
});
