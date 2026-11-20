/**
 * Centralized feature flag system.
 *
 * Flags are resolved in order:
 * 1. Environment variable override (FF_<FLAG_NAME>=true/false)
 * 2. Default value from FLAGS definition
 *
 * Usage:
 *   import { isEnabled, FLAGS } from '@/lib/feature-flags';
 *   if (isEnabled('DIGITAL_TWIN_3D')) { ... }
 */

export const FLAGS = {
  // ── Core MVP (enabled) ──────────────────────────────────────────────
  MATCH_SUBMISSION:    { default: true,  description: 'Match result capture and history' },
  PEER_RATING:         { default: true,  description: 'Post-match peer attribute ratings' },
  SQUAD_MANAGEMENT:    { default: true,  description: 'Squad creation, join, members' },
  SQUAD_TACTICS:       { default: true,  description: 'Formation and tactics board' },
  PLAYER_PROFILES:     { default: true,  description: 'Player attributes, XP, level' },
  LEADERBOARDS:        { default: true,  description: 'Squad and global leaderboards' },
  ACHIEVEMENTS:        { default: true,  description: 'Achievement unlocking and display' },
  STATS:               { default: true,  description: 'Player and squad statistics' },
  SETTINGS:            { default: true,  description: 'Profile and connection settings' },

  // ── Enhanced experiences (disabled by default) ─────────────────────
  DIGITAL_TWIN_3D:     { default: false, description: 'Optional 3D broadcast view for digital twin match simulations' },

  // ── Post-MVP (disabled) ─────────────────────────────────────────────
  COACHING:            { default: false, description: 'Coaching marketplace — deferred to phase 2' },
  DAO_GOVERNANCE:      { default: false, description: 'On-chain DAO voting (GOAT Network)' },
  TRANSFER_MARKET:     { default: false, description: 'Player transfer offers between squads' },
  AI_STAFF_CHAT:       { default: false, description: 'AI persona staff advisors' },
  LENS_SOCIAL:         { default: false, description: 'Lens Protocol social publishing' },
  VOICE_AI:            { default: false, description: 'Voice command processing' },
  VISION_AI:           { default: false, description: 'Match photo analysis' },
  ENCRYPTED_MEDIA:     { default: false, description: 'Squad media upload and sharing' },
  TERRITORY_CONTROL:   { default: false, description: 'Pitch territory control' },
  TREASURY:            { default: false, description: 'Squad treasury and budget management' },
  YELLOW_PAYMENTS:     { default: false, description: 'Yellow Network instant settlement' },
  KITE_AI:             { default: false, description: 'Kite AI agent marketplace' },
  COMMUNITY:           { default: false, description: 'Community hub and Lens social feed' },
  ANALYTICS:           { default: false, description: 'Growth funnel and attribute analytics' },
  // ── Preservation-first containment (disabled by default) ────────────
  TOURNAMENTS:         { default: false, description: 'Tournament brackets and competition flow' },
  SIMULATION:          { default: false, description: 'Simulated matches and outcomes' },
  TACTICS_ADVANCED:    { default: false, description: 'Tactics puzzles and advanced match planning' },
  PROGRESSION_LOOPS:   { default: false, description: 'Drills, rankings, XP-led challenges, and reputation loops' },
} as const;

export type FeatureFlag = keyof typeof FLAGS;

/**
 * Check if a feature flag is enabled.
 * Environment variable FF_<FLAG_NAME> overrides the default.
 */
export function isEnabled(flag: FeatureFlag): boolean {
  const envKey = `FF_${flag}`;
  const envVal = typeof process !== 'undefined' ? process.env?.[envKey] : undefined;
  if (envVal !== undefined) {
    return ['1', 'true', 'yes', 'on'].includes(envVal.trim().toLowerCase());
  }
  return FLAGS[flag].default;
}

/**
 * Get all flag states (useful for debugging / admin UI).
 */
export function getAllFlags(): Record<FeatureFlag, boolean> {
  const result = {} as Record<FeatureFlag, boolean>;
  for (const flag of Object.keys(FLAGS) as FeatureFlag[]) {
    result[flag] = isEnabled(flag);
  }
  return result;
}

/**
 * Map a route path to its required feature flag.
 * Returns null if the route has no flag requirement (always available).
 */
export function getFlagForRoute(pathname: string): FeatureFlag | null {
  if (pathname.startsWith('/preview/') && pathname.endsWith('/sim')) return 'SIMULATION';
  if (pathname.startsWith('/preview/') && pathname.endsWith('/tactics')) return 'TACTICS_ADVANCED';
  if (pathname.startsWith('/preview/') && pathname.endsWith('/drill')) return 'PROGRESSION_LOOPS';
  if (pathname === '/match/preview' || pathname.startsWith('/match/preview/')) return 'TACTICS_ADVANCED';

  const segment = pathname.split('/').filter(Boolean)[0];
  if (!segment) return null;

  const routeFlagMap: Record<string, FeatureFlag> = {
    broadcast:     'DIGITAL_TWIN_3D',
    coaching:      'COACHING',
    community:     'COMMUNITY',
    analytics:     'ANALYTICS',
    rivalries:     'TERRITORY_CONTROL',
    challenges:    'PROGRESSION_LOOPS',
    leaderboard:   'PROGRESSION_LOOPS',
    reputation:    'PROGRESSION_LOOPS',
    tournament:    'TOURNAMENTS',
  };

  return routeFlagMap[segment] ?? null;
}
