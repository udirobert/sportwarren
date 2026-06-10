import { trackEvent } from '@/lib/analytics';

/**
 * Track player card attribute adjustment during pre-auth card building (IKEA effect / sunk cost).
 */
export function trackCardAttributeAdjusted(attribute: string, delta: number, position: string): void {
  trackEvent('card_attribute_adjusted', { attribute, delta, position });
}

/**
 * Track completion of a card builder step (e.g. identity, attributes, formation).
 */
export function trackCardBuilderStepCompleted(step: string, position: string): void {
  trackEvent('card_builder_step_completed', { step, position });
}

/**
 * Track auth gate presentation (loss-aversion modal shown).
 */
export function trackAuthGateShown(context: string): void {
  trackEvent('auth_gate_shown', { context });
}

/**
 * Track auth gate abandonment (user closed without converting).
 */
export function trackAuthGateAbandoned(context: string): void {
  trackEvent('auth_gate_abandoned', { context });
}

/**
 * Track auth gate conversion (user successfully signed in/up).
 */
export function trackAuthGateConverted(context: string, method: string): void {
  trackEvent('auth_gate_converted', { context, method });
}

/**
 * Track onboarding progress milestone (goal gradient / Zeigarnik effect).
 */
export function trackOnboardingProgressMilestone(percentage: number, stage: string): void {
  trackEvent('onboarding_progress_milestone', { percentage, stage });
}

/**
 * Track dashboard social proof surface viewed by a new user.
 */
export function trackDashboardSocialProofSeen(counters: string[]): void {
  trackEvent('dashboard_social_proof_seen', { counters: counters.join(',') });
}

/**
 * Track guest migration prompt presentation.
 */
export function trackGuestMigrationPromptShown(xp: number, draftCount: number): void {
  trackEvent('guest_migration_prompt_shown', { xp, draft_count: draftCount });
}

/**
 * Track guest migration acceptance.
 */
export function trackGuestMigrationAccepted(xp: number, draftCount: number): void {
  trackEvent('guest_migration_accepted', { xp, draft_count: draftCount });
}
