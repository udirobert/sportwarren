/**
 * Twin types — single source of truth for player and squad personalisation state.
 *
 * `TwinState` is the canonical read model that the appliers operate on. It is
 * Prisma-free so the pure appliers in `./twin-appliers.ts` are unit-testable
 * with no DB. The orchestrator (PR 2) maps Prisma rows to `TwinState`,
 * delegates to `applyEvent`, then maps the resulting `TwinDiff` back to writes.
 *
 * Invariants:
 *  - `baseAttributes` values are clamped to 0-99 by `clampAttributeDeltas`.
 *  - `level` is derived from `xp` via `computeLevel` and never set directly.
 *  - `attestationCount` is the source of truth for milestone detection.
 *  - `activeModifiers` is append-only; expired modifiers are dropped by the
 *    orchestrator before each apply, not by the applier.
 */

export type TwinScope = 'player' | 'squad';

export type AttributeKey =
  | 'pace'
  | 'shooting'
  | 'passing'
  | 'dribbling'
  | 'defending'
  | 'physical';

export const ATTRIBUTE_KEYS: readonly AttributeKey[] = [
  'pace',
  'shooting',
  'passing',
  'dribbling',
  'defending',
  'physical',
] as const;

export type AttributeDeltas = Partial<Record<AttributeKey, number>>;

export interface MatchStats {
  matches: number;
  goals: number;
  assists: number;
  mvp: number;
  simWins: number;
  simPodiums: number;
}

export type ModifierSource = 'coaching' | 'peer' | 'system';

export interface ActiveModifier {
  id: string;
  source: ModifierSource;
  expiresAt: string; // ISO
  deltas: AttributeDeltas;
}

export interface TwinState {
  id: string;
  scope: TwinScope;
  level: number;
  xp: number;
  prestige: number;
  baseAttributes: Readonly<Record<AttributeKey, number>>;
  activeModifiers: ReadonlyArray<ActiveModifier>;
  matchStats: MatchStats;
  reputation: number; // 0-1000
  attestationCount: number;
  lastAttestationAt: string | null;
  // squad-only fields
  energy?: number;
  energyMax?: number;
  consensusTags?: ReadonlyArray<string>;
  twinActive?: boolean;
}

// ────────────────────────────────────────────────────────────────────────────
// Events — discriminated union. Every twin mutation in the system is one of
// these. Adding a new event is a new variant + a new applier, not a new
// service method.
// ────────────────────────────────────────────────────────────────────────────

export type Attestor =
  | 'referee'
  | 'peer'
  | 'self'
  | 'system'
  | 'oracle'
  | 'consensus';

export type TwinEvent =
  | TwinCreatedEvent
  | AttestationEvent
  | CoachingHiredEvent
  | CoachingExpiredEvent
  | SimCompletedEvent
  | GhostMatchEvent
  | PeerRatingConsensusEvent
  | SeasonEndEvent
  | AdminAdjustmentEvent;

export interface TwinCreatedEvent {
  kind: 'twin_created';
  twinId: string;
  initialAttributes: Readonly<Record<AttributeKey, number>>;
  context: { userId?: string; squadId?: string };
}

export interface AttestationEvent {
  kind: 'attestation';
  twinId: string;
  attestor: Attestor;
  payload: {
    attributeDeltas: AttributeDeltas;
    xpDelta: number;
    reputationDelta?: number;
    matchStatsDelta?: Partial<MatchStats>;
    reason: string;
    matchId?: string;
    peerRatingId?: string;
    signWithAgent: boolean;
  };
}

export interface CoachingHiredEvent {
  kind: 'coaching_hired';
  twinId: string;
  coachId: string;
  effect: {
    deltas: AttributeDeltas;
    durationDays: number;
    costUsdc: number;
    sessionId: string;
  };
}

export interface CoachingExpiredEvent {
  kind: 'coaching_expired';
  twinId: string;
  effectId: string;
}

export interface SimCompletedEvent {
  kind: 'sim_completed';
  twinId: string;
  simulationId: string;
  result: {
    position: number;
    participants: number;
    pointsAwarded: number;
    prizeUsdc: number;
    goalsScored: number;
    goalsConceded: number;
  };
}

export interface GhostMatchEvent {
  kind: 'ghost_match';
  twinId: string; // squad twin only
  result: {
    attributeImproved: AttributeKey;
    energySpent: number;
  };
}

export interface PeerRatingConsensusEvent {
  kind: 'peer_rating_consensus';
  twinId: string;
  matchId: string;
  consensus: {
    attributeDeltas: AttributeDeltas;
    hypeTags: ReadonlyArray<string>;
    reputationDelta: number;
  };
}

export interface SeasonEndEvent {
  kind: 'season_end';
  twinId: string;
  seasonId: string;
  summary: {
    matchesPlayed: number;
    goalsScored: number;
    assists: number;
    mvp: number;
    finalPosition?: number;
  };
}

export interface AdminAdjustmentEvent {
  kind: 'admin_adjustment';
  twinId: string;
  reason: string;
  moderatorId: string;
  diff: Omit<TwinDiff, 'milestonesHit' | 'momentHint'>;
}

// ────────────────────────────────────────────────────────────────────────────
// Diff — declarative description of what changed. The orchestrator decides
// what to do (sign, notify, render). The applier is pure and knows nothing
// of side effects.
// ────────────────────────────────────────────────────────────────────────────

export type MilestoneKind =
  | 'twin_created'
  | 'level_up'
  | 'sim_podium'
  | 'sim_win'
  | 'record_broken'
  | 'attestation_100'
  | 'attestation_500'
  | 'attestation_1000'
  | 'attestation_milestone'
  | 'coaching_expired'
  | 'season_end'
  | 'achievement_unlocked';

export interface MilestoneHint {
  kind: MilestoneKind;
  payload: Readonly<Record<string, unknown>>;
}

export type MomentHintKind =
  | 'twin_created'
  | 'level_up'
  | 'sim_complete'
  | 'achievement'
  | 'coaching_hired'
  | 'coaching_expired'
  | 'attestation_milestone'
  | 'season_end'
  | 'record_broken';

export type MomentTier =
  | 'standard'
  | 'premium'
  | 'streak_reward'
  | 'partner'
  | 'internal';

export interface MomentHint {
  kind: MomentHintKind;
  tier: MomentTier;
  label: string;
  detail?: string;
  sourceEventId?: string;
}

export interface TwinDiff {
  attributeDeltas: AttributeDeltas;
  xpDelta: number;
  levelUp: boolean;
  newLevel: number;
  prestigeDelta: number;
  matchStatsDelta: Partial<MatchStats>;
  reputationDelta: number;
  modifierAdded?: ActiveModifier;
  modifierRemovedId?: string;
  energyDelta?: number; // squad-only
  milestonesHit: ReadonlyArray<MilestoneHint>;
  momentHint?: MomentHint;
}
