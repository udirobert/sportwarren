/**
 * Twin appliers — pure, side-effect-free state transitions.
 *
 * Every twin mutation in the system flows through `applyEvent(state, event, now)`.
 * The appliers never touch Prisma, Kite, or any side effect. The orchestrator
 * (PR 2) is responsible for:
 *   1. Loading `TwinState` from Prisma
 *   2. Calling `applyEvent`
 *   3. Persisting the diff in a single transaction
 *   4. Signing attestations, rendering moments, dispatching notifications
 *
 * Pure appliers are unit-tested with table-driven tests. No DB, no clock, no
 * network. `now` is injected for events that need it (e.g. coaching expiry).
 */

import type {
  ActiveModifier,
  AdminAdjustmentEvent,
  AttestationEvent,
  AttributeDeltas,
  AttributeKey,
  CoachingExpiredEvent,
  CoachingHiredEvent,
  GhostMatchEvent,
  MilestoneHint,
  MomentHint,
  PeerRatingConsensusEvent,
  SeasonEndEvent,
  SimCompletedEvent,
  TwinCreatedEvent,
  TwinDiff,
  TwinEvent,
  TwinState,
} from './twin-types';
import { ATTRIBUTE_KEYS } from './twin-types';

// ────────────────────────────────────────────────────────────────────────────
// Constants
// ────────────────────────────────────────────────────────────────────────────

export const XP_PER_LEVEL_BASE = 100;
export const XP_PER_LEVEL_GROWTH = 1.15;
export const ATTRIBUTE_MIN = 0;
export const ATTRIBUTE_MAX = 99;
export const PRESTIGE_PER_LEVEL_10 = 1;

export const ATTESTATION_MILESTONES = [100, 500, 1000, 5000] as const;
export const SIM_PODIUM_POSITIONS: ReadonlySet<number> = new Set([1, 2, 3]);

const MS_PER_DAY = 86_400_000;

// ────────────────────────────────────────────────────────────────────────────
// Public API
// ────────────────────────────────────────────────────────────────────────────

export function applyEvent(state: TwinState, event: TwinEvent, now: Date): TwinDiff {
  switch (event.kind) {
    case 'twin_created':
      return applyTwinCreated(state, event);
    case 'attestation':
      return applyAttestation(state, event);
    case 'coaching_hired':
      return applyCoachingHired(state, event, now);
    case 'coaching_expired':
      return applyCoachingExpired(state, event);
    case 'sim_completed':
      return applySimCompleted(state, event);
    case 'ghost_match':
      return applyGhostMatch(state, event);
    case 'peer_rating_consensus':
      return applyPeerRatingConsensus(state, event);
    case 'season_end':
      return applySeasonEnd(state, event);
    case 'admin_adjustment':
      return applyAdminAdjustment(state, event);
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Level / XP math
// ────────────────────────────────────────────────────────────────────────────

/** Returns the level reached for a given total XP. Level 1 starts at 0 XP. */
export function computeLevel(xp: number): number {
  if (xp < 0) return 1;
  let level = 1;
  let xpNeeded = XP_PER_LEVEL_BASE;
  let remaining = xp;
  while (remaining >= xpNeeded) {
    remaining -= xpNeeded;
    level += 1;
    xpNeeded = Math.floor(xpNeeded * XP_PER_LEVEL_GROWTH);
  }
  return level;
}

/** Returns the XP needed to reach the next level from the current XP. */
export function xpToNext(xp: number): number {
  if (xp < 0) return XP_PER_LEVEL_BASE;
  let xpNeeded = XP_PER_LEVEL_BASE;
  let remaining = xp;
  while (remaining >= xpNeeded) {
    remaining -= xpNeeded;
    xpNeeded = Math.floor(xpNeeded * XP_PER_LEVEL_GROWTH);
  }
  return xpNeeded - remaining;
}

// ────────────────────────────────────────────────────────────────────────────
// Attribute helpers
// ────────────────────────────────────────────────────────────────────────────

/**
 * Re-clamp attribute deltas so the resulting value is within [0, 99].
 * Returns the *delta* needed to land at the clamped value, not the raw input.
 * Drops zero/undefined entries.
 */
export function clampAttributeDeltas(
  current: Readonly<Record<AttributeKey, number>>,
  deltas: AttributeDeltas,
): AttributeDeltas {
  const out: AttributeDeltas = {};
  for (const key of ATTRIBUTE_KEYS) {
    const raw = deltas[key];
    if (raw === undefined || raw === 0) continue;
    const old = current[key] ?? 50;
    const next = Math.max(ATTRIBUTE_MIN, Math.min(ATTRIBUTE_MAX, old + raw));
    const adjusted = next - old;
    if (adjusted !== 0) out[key] = adjusted;
  }
  return out;
}

function defaultAttributes(): Record<AttributeKey, number> {
  return { pace: 50, shooting: 50, passing: 50, dribbling: 50, defending: 50, physical: 50 };
}

// ────────────────────────────────────────────────────────────────────────────
// Applier: twin_created
// ────────────────────────────────────────────────────────────────────────────

function applyTwinCreated(state: TwinState, _event: TwinCreatedEvent): TwinDiff {
  // No deltas to existing state; the moment is the "first breath".
  // Caller is responsible for initial state in getOrCreateTwin.
  return {
    attributeDeltas: {},
    xpDelta: 0,
    levelUp: false,
    newLevel: state.level,
    prestigeDelta: 0,
    matchStatsDelta: {},
    reputationDelta: 0,
    milestonesHit: [{ kind: 'twin_created', payload: {} }],
    momentHint: { kind: 'twin_created', tier: 'standard', label: 'Meet your twin' },
  };
}

// ────────────────────────────────────────────────────────────────────────────
// Applier: attestation
// ────────────────────────────────────────────────────────────────────────────

function applyAttestation(state: TwinState, event: AttestationEvent): TwinDiff {
  const { attributeDeltas, xpDelta, reputationDelta = 0, matchStatsDelta, reason } = event.payload;

  const clamped = clampAttributeDeltas(state.baseAttributes, attributeDeltas);
  const newXp = Math.max(0, state.xp + xpDelta);
  const newLevel = computeLevel(newXp);
  const levelUp = newLevel > state.level;
  const prestigeDelta = levelUp && newLevel % 10 === 0 ? PRESTIGE_PER_LEVEL_10 : 0;

  const milestones: MilestoneHint[] = [];
  if (levelUp) {
    milestones.push({ kind: 'level_up', payload: { from: state.level, to: newLevel } });
  }

  const newAttestationCount = state.attestationCount + 1;
  for (const m of ATTESTATION_MILESTONES) {
    if (state.attestationCount < m && newAttestationCount >= m) {
      milestones.push({
        kind:
          m === 100
            ? 'attestation_100'
            : m === 500
              ? 'attestation_500'
              : m === 1000
                ? 'attestation_1000'
                : 'attestation_milestone',
        payload: { count: m },
      });
    }
  }

  for (const key of ATTRIBUTE_KEYS) {
    const delta = clamped[key];
    if (delta === undefined || delta <= 0) continue;
    const oldVal = state.baseAttributes[key];
    const newVal = oldVal + delta;
    if (oldVal < ATTRIBUTE_MAX && newVal >= ATTRIBUTE_MAX) {
      milestones.push({ kind: 'record_broken', payload: { attribute: key, value: ATTRIBUTE_MAX } });
    }
  }

  const momentHint: MomentHint | undefined =
    milestones.length > 0
      ? pickMomentFromMilestones(milestones, reason, event.twinId)
      : undefined;

  return {
    attributeDeltas: clamped,
    xpDelta,
    levelUp,
    newLevel,
    prestigeDelta,
    matchStatsDelta: matchStatsDelta ?? {},
    reputationDelta,
    milestonesHit: milestones,
    momentHint,
  };
}

function pickMomentFromMilestones(
  milestones: ReadonlyArray<MilestoneHint>,
  reason: string,
  twinId: string,
): MomentHint {
  // Priority order: twin_created > level_up > sim_win > sim_podium > record_broken > attestation_*
  const order: Record<string, number> = {
    twin_created: 0,
    level_up: 1,
    sim_win: 2,
    sim_podium: 3,
    record_broken: 4,
    attestation_100: 5,
    attestation_500: 6,
    attestation_1000: 7,
    attestation_milestone: 8,
  };
  const top = [...milestones].sort(
    (a, b) => (order[a.kind] ?? 99) - (order[b.kind] ?? 99),
  )[0];

  return {
    kind: milestoneToMomentKind(top.kind),
    tier: 'standard',
    label: milestoneLabel(top),
    detail: reason,
    sourceEventId: twinId,
  };
}

function milestoneToMomentKind(kind: MilestoneHint['kind']): MomentHint['kind'] {
  if (kind === 'sim_podium' || kind === 'sim_win') return 'sim_complete';
  if (kind === 'season_end') return 'season_end';
  if (kind === 'coaching_expired') return 'coaching_expired';
  if (kind === 'achievement_unlocked') return 'achievement';
  if (kind.startsWith('attestation_')) return 'attestation_milestone';
  if (kind === 'record_broken') return 'record_broken';
  if (kind === 'level_up') return 'level_up';
  if (kind === 'twin_created') return 'twin_created';
  return 'achievement';
}

function milestoneLabel(m: MilestoneHint): string {
  switch (m.kind) {
    case 'twin_created':
      return 'Meet your twin';
    case 'level_up':
      return `Level ${m.payload.to}`;
    case 'sim_win':
      return 'Sim champion';
    case 'sim_podium':
      return `Sim #${m.payload.position}`;
    case 'record_broken':
      return `${m.payload.attribute} maxed`;
    case 'attestation_100':
      return '100 attestations';
    case 'attestation_500':
      return '500 attestations';
    case 'attestation_1000':
      return '1000 attestations';
    case 'attestation_milestone':
      return `${m.payload.count} attestations`;
    case 'coaching_expired':
      return 'Coaching ended';
    case 'season_end':
      return 'Season complete';
    case 'achievement_unlocked':
      return 'Achievement unlocked';
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Applier: coaching_hired
// ────────────────────────────────────────────────────────────────────────────

function applyCoachingHired(
  state: TwinState,
  event: CoachingHiredEvent,
  now: Date,
): TwinDiff {
  const expiresAt = new Date(now.getTime() + event.effect.durationDays * MS_PER_DAY);
  const modifier: ActiveModifier = {
    id: `coaching-${event.effect.sessionId}`,
    source: 'coaching',
    expiresAt: expiresAt.toISOString(),
    deltas: event.effect.deltas,
  };
  return {
    attributeDeltas: {},
    xpDelta: 0,
    levelUp: false,
    newLevel: state.level,
    prestigeDelta: 0,
    matchStatsDelta: {},
    reputationDelta: 0,
    modifierAdded: modifier,
    milestonesHit: [],
    momentHint: {
      kind: 'coaching_hired',
      tier: 'standard',
      label: 'Coach hired',
      detail: `${event.effect.durationDays}-day boost`,
    },
  };
}

// ────────────────────────────────────────────────────────────────────────────
// Applier: coaching_expired
// ────────────────────────────────────────────────────────────────────────────

function applyCoachingExpired(
  state: TwinState,
  event: CoachingExpiredEvent,
): TwinDiff {
  return {
    attributeDeltas: {},
    xpDelta: 0,
    levelUp: false,
    newLevel: state.level,
    prestigeDelta: 0,
    matchStatsDelta: {},
    reputationDelta: 0,
    modifierRemovedId: event.effectId,
    milestonesHit: [{ kind: 'coaching_expired', payload: { effectId: event.effectId } }],
    momentHint: { kind: 'coaching_expired', tier: 'standard', label: 'Coaching ended' },
  };
}

// ────────────────────────────────────────────────────────────────────────────
// Applier: sim_completed
// ────────────────────────────────────────────────────────────────────────────

function applySimCompleted(state: TwinState, event: SimCompletedEvent): TwinDiff {
  const { position, pointsAwarded, prizeUsdc, goalsScored, goalsConceded } = event.result;
  const isPodium = SIM_PODIUM_POSITIONS.has(position);
  const isWin = position === 1;

  const milestones: MilestoneHint[] = [];
  if (isWin) {
    milestones.push({ kind: 'sim_win', payload: { simulationId: event.simulationId } });
  } else if (isPodium) {
    milestones.push({ kind: 'sim_podium', payload: { position } });
  }

  const xpDelta = pointsAwarded;
  const newXp = Math.max(0, state.xp + xpDelta);
  const newLevel = computeLevel(newXp);
  const levelUp = newLevel > state.level;
  if (levelUp) {
    milestones.push({ kind: 'level_up', payload: { from: state.level, to: newLevel } });
  }

  const attributeDeltas: AttributeDeltas = {};
  if (goalsScored > 0) {
    attributeDeltas.shooting = Math.min(2, goalsScored);
    attributeDeltas.pace = Math.min(1, goalsScored);
  }
  if (goalsConceded >= 3) {
    attributeDeltas.defending = -1;
  }

  return {
    attributeDeltas: clampAttributeDeltas(state.baseAttributes, attributeDeltas),
    xpDelta,
    levelUp,
    newLevel,
    prestigeDelta: isWin ? 1 : 0,
    matchStatsDelta: {
      simWins: isWin ? 1 : 0,
      simPodiums: isPodium ? 1 : 0,
      goals: goalsScored,
    },
    reputationDelta: isWin ? 50 : isPodium ? 20 : 5,
    milestonesHit: milestones,
    momentHint: isPodium
      ? {
          kind: 'sim_complete',
          tier: isWin ? 'premium' : 'standard',
          label: isWin ? 'Sim champion' : `Sim #${position}`,
          detail: prizeUsdc > 0 ? `+${prizeUsdc} USDC` : undefined,
          sourceEventId: event.simulationId,
        }
      : undefined,
  };
}

// ────────────────────────────────────────────────────────────────────────────
// Applier: ghost_match (squad only)
// ────────────────────────────────────────────────────────────────────────────

function applyGhostMatch(state: TwinState, event: GhostMatchEvent): TwinDiff {
  return {
    attributeDeltas: clampAttributeDeltas(state.baseAttributes, {
      [event.result.attributeImproved]: 0.2,
    }),
    xpDelta: 0,
    levelUp: false,
    newLevel: state.level,
    prestigeDelta: 0,
    matchStatsDelta: { matches: 1 },
    reputationDelta: 0,
    energyDelta: -event.result.energySpent,
    milestonesHit: [],
  };
}

// ────────────────────────────────────────────────────────────────────────────
// Applier: peer_rating_consensus
// ────────────────────────────────────────────────────────────────────────────

function applyPeerRatingConsensus(
  state: TwinState,
  event: PeerRatingConsensusEvent,
): TwinDiff {
  return {
    attributeDeltas: clampAttributeDeltas(state.baseAttributes, event.consensus.attributeDeltas),
    xpDelta: 0,
    levelUp: false,
    newLevel: state.level,
    prestigeDelta: 0,
    matchStatsDelta: {},
    reputationDelta: event.consensus.reputationDelta,
    milestonesHit: [],
  };
}

// ────────────────────────────────────────────────────────────────────────────
// Applier: season_end
// ────────────────────────────────────────────────────────────────────────────

function applySeasonEnd(state: TwinState, event: SeasonEndEvent): TwinDiff {
  return {
    attributeDeltas: {},
    xpDelta: 0,
    levelUp: false,
    newLevel: state.level,
    prestigeDelta: 1,
    matchStatsDelta: {},
    reputationDelta: 0,
    milestonesHit: [{ kind: 'season_end', payload: event.summary }],
    momentHint: { kind: 'season_end', tier: 'partner', label: 'Season complete' },
  };
}

// ────────────────────────────────────────────────────────────────────────────
// Applier: admin_adjustment (moderation pass-through)
// ────────────────────────────────────────────────────────────────────────────

function applyAdminAdjustment(
  _state: TwinState,
  event: AdminAdjustmentEvent,
): TwinDiff {
  return {
    ...event.diff,
    milestonesHit: [],
    momentHint: undefined,
  };
}

// ────────────────────────────────────────────────────────────────────────────
// Helper exported for orchestrator / identity.ts to build initial states
// ────────────────────────────────────────────────────────────────────────────

export function buildInitialTwinState(
  id: string,
  scope: TwinState['scope'],
  initialAttributes?: Readonly<Record<AttributeKey, number>>,
): TwinState {
  return {
    id,
    scope,
    level: 1,
    xp: 0,
    prestige: 0,
    baseAttributes: initialAttributes ?? defaultAttributes(),
    activeModifiers: [],
    matchStats: { matches: 0, goals: 0, assists: 0, mvp: 0, simWins: 0, simPodiums: 0 },
    reputation: 0,
    attestationCount: 0,
    lastAttestationAt: null,
    energy: scope === 'squad' ? 100 : undefined,
    energyMax: scope === 'squad' ? 100 : undefined,
    twinActive: scope === 'squad' ? true : undefined,
  };
}

/** Drops expired modifiers from the state. Pure: returns a new array. */
export function dropExpiredModifiers(
  state: TwinState,
  now: Date,
): ReadonlyArray<ActiveModifier> {
  const cutoff = now.getTime();
  return state.activeModifiers.filter((m) => new Date(m.expiresAt).getTime() > cutoff);
}
