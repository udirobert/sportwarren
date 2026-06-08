// Unified Onboarding Flow - Single source of truth for user onboarding

import type { DashboardEntryStateId } from '@/lib/dashboard/entry-state';

export type Platform = 'web' | 'mobile' | 'telegram';

export type ChecklistId =
  | 'complete_card'
  | 'join_squad'
  | 'log_match'
  | 'claim_identity';

export interface ChecklistItemConfig {
  id: ChecklistId;
  label: string;
  description: string;
  emoji: string;
  href: string;
  actionLabel: string;
  xp: number;
}

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
  { id: 'welcome', title: 'Your Player Card', description: 'Six attributes — pace, shooting, passing, and more — that grow with every match. Your card is your identity on the platform.', emoji: '🪪' },
  { id: 'match-intro', title: 'The Squad Verifies', description: 'Teammates confirm your stats. What starts as a provisional estimate becomes a verified reputation the whole squad trusts.', emoji: '✅' },
  { id: 'meet-coach', title: 'Meet Coach Kite', description: 'Your AI squad manager — scouts opponents, suggests lineups, and handles operations. The blockchain works for you, not the other way around.', emoji: '🤖' },
  { id: 'claim-identity', title: 'Make It Permanent', description: 'Save your progress so your card, XP, and squad history stick. A wallet locks protected actions when you need them.', emoji: '💾' },
];

// Personalization steps
export const PERSONALIZATION_STEPS: { id: OnboardingStep; title: string }[] = [
  { id: 'identity', title: 'Create Your Player' },
  { id: 'formation', title: 'Choose Your Formation' },
  { id: 'brand', title: 'Brand Your Squad' },
];

// Storage keys
export const ONBOARDING_STORAGE_KEYS = {
  PHASE: 'sw_onboarding_phase',
  STEP: 'sw_onboarding_step',
  TOUR_COMPLETED: 'sw_tour_completed',
  PERSONALIZATION_COMPLETED: 'sw_personalization_completed',
  CHECKLIST_COMPLETED: 'sw_checklist_completed',
} as const;