// Unified Onboarding Flow - Single source of truth for user onboarding
// Consolidates: GuestTour, OnboardingTour, QuickPersonalization, OnboardingChecklist

import type { DashboardEntryStateId } from '@/lib/dashboard/entry-state';

export type OnboardingPhase = 
  | 'tour'        // Guided walkthrough overlay
  | 'personalize' // Setup card (identity, formation, brand)
  | 'checklist'   // Task completion checklist
  | 'complete';   // All onboarding done

export type OnboardingStep = 
  | 'welcome'
  | 'match-intro'
  | 'meet-coach'
  | 'claim-identity'
  | 'identity'
  | 'formation'
  | 'brand';

export interface OnboardingConfig {
  phase: OnboardingPhase;
  step: OnboardingStep;
  isGuest: boolean;
  journeyStage: DashboardEntryStateId;
  hasCompletedTour: boolean;
  hasCompletedPersonalization: boolean;
  hasCompletedChecklist: boolean;
}

export interface OnboardingCallbacks {
  onTourComplete: () => void;
  onPersonalizationComplete: () => void;
  onChecklistItemComplete: (itemId: string) => void;
  onFullCompletion: () => void;
}

// Platform-aware tour steps
export const TOUR_STEPS: { id: OnboardingStep; title: string; description: string; emoji: string }[] = [
  { id: 'welcome', title: 'Welcome to SportWarren', description: 'Your tactical command center for grassroots football', emoji: '🏟️' },
  { id: 'match-intro', title: 'Log Your First Game', description: 'Track matches, earn XP, and build your reputation', emoji: '🎮' },
  { id: 'meet-coach', title: 'Meet Coach Kite', description: 'Your AI squad manager — scouts opponents, suggests lineups, and handles operations. The blockchain works for you, not the other way around.', emoji: '🤖' },
  { id: 'claim-identity', title: 'Save Your Progress', description: 'Connect a wallet to protect your data and unlock features', emoji: '⚡' },
];

// Personalization steps
export const PERSONALIZATION_STEPS: { id: OnboardingStep; title: string }[] = [
  { id: 'identity', title: 'Create Your Player' },
  { id: 'formation', title: 'Choose Your Formation' },
  { id: 'brand', title: 'Brand Your Squad' },
];

// Checklist items
export const CHECKLIST_ITEMS: { id: string; label: string; description: string; emoji: string; href: string }[] = [
  { id: 'join_squad', label: 'Create or join a squad', description: 'Squads are the core of SportWarren', emoji: '👥', href: '/squad' },
  { id: 'set_formation', label: 'Set your formation', description: 'Define your squad tactics', emoji: '📋', href: '/squad?tab=tactics' },
  { id: 'log_match', label: 'Log your first match', description: 'Start earning XP and reputation', emoji: '⚽', href: '/match?mode=capture' },
  { id: 'claim_identity', label: 'Save your progress', description: 'Connect a wallet to protect your data', emoji: '⚡', href: '/settings?tab=wallet' },
];

// Storage keys
export const ONBOARDING_STORAGE_KEYS = {
  PHASE: 'sw_onboarding_phase',
  STEP: 'sw_onboarding_step',
  TOUR_COMPLETED: 'sw_tour_completed',
  PERSONALIZATION_COMPLETED: 'sw_personalization_completed',
  CHECKLIST_COMPLETED: 'sw_checklist_completed',
} as const;