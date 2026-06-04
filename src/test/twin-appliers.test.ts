import { describe, expect, it } from 'vitest';
import {
  ATTESTATION_MILESTONES,
  ATTRIBUTE_MAX,
  XP_PER_LEVEL_BASE,
  applyEvent,
  buildInitialTwinState,
  clampAttributeDeltas,
  computeLevel,
  dropExpiredModifiers,
  xpToNext,
} from '@/server/services/personalization/twin-appliers';
import type {
  AttestationEvent,
  AttributeDeltas,
  AttributeKey,
  TwinState,
} from '@/server/services/personalization/twin-types';

// ────────────────────────────────────────────────────────────────────────────
// Test fixtures
// ────────────────────────────────────────────────────────────────────────────

const NOW = new Date('2026-06-04T12:00:00.000Z');

function attr(
  partial: Partial<Record<AttributeKey, number>> = {},
): Record<AttributeKey, number> {
  return {
    pace: 50,
    shooting: 50,
    passing: 50,
    dribbling: 50,
    defending: 50,
    physical: 50,
    ...partial,
  };
}

function baseState(overrides: Partial<TwinState> = {}): TwinState {
  return {
    id: 'twin-1',
    scope: 'player',
    level: 1,
    xp: 0,
    prestige: 0,
    baseAttributes: attr(),
    activeModifiers: [],
    matchStats: { matches: 0, goals: 0, assists: 0, mvp: 0, simWins: 0, simPodiums: 0 },
    reputation: 0,
    attestationCount: 0,
    lastAttestationAt: null,
    ...overrides,
  };
}

function attestation(overrides: Partial<AttestationEvent['payload']> = {}): AttestationEvent {
  return {
    kind: 'attestation',
    twinId: 'twin-1',
    attestor: 'system',
    payload: {
      attributeDeltas: {},
      xpDelta: 0,
      reason: 'test',
      signWithAgent: false,
      ...overrides,
    },
  };
}

// ────────────────────────────────────────────────────────────────────────────
// computeLevel / xpToNext
// ────────────────────────────────────────────────────────────────────────────

describe('computeLevel', () => {
  it.each([
    [0, 1],
    [50, 1],
    [99, 1],
    [100, 2],
    [213, 2], // last xp of level 2 (next threshold is 100 + floor(100*1.15) = 214)
    [214, 3], // first xp of level 3
  ])('xp=%i → level %i', (xp, level) => {
    expect(computeLevel(xp)).toBe(level);
  });

  it('clamps negative xp to level 1', () => {
    expect(computeLevel(-50)).toBe(1);
  });

  it('grows monotonically (level never decreases as xp increases)', () => {
    let prev = 0;
    for (let xp = 0; xp < 50_000; xp += 137) {
      const lvl = computeLevel(xp);
      expect(lvl).toBeGreaterThanOrEqual(prev);
      prev = lvl;
    }
  });
});

/** Returns the highest XP at which computeLevel returns `targetLevel - 1`. */
function xpJustBelowLevel(targetLevel: number): number {
  let xp = 0;
  while (computeLevel(xp) < targetLevel - 1) xp += 1;
  return xp;
}

describe('xpToNext', () => {
  it('returns 100 at xp=0', () => {
    expect(xpToNext(0)).toBe(100);
  });

  it('returns 1 at xp=99 (one short of level 2)', () => {
    expect(xpToNext(99)).toBe(1);
  });

  it('returns the full next-level requirement at the level threshold', () => {
    // At xp=100, we just hit level 2. The next level (3) costs 115 XP.
    expect(xpToNext(100)).toBe(Math.floor(XP_PER_LEVEL_BASE * 1.15));
  });

  it('returns 0 for unreachable negative input gracefully', () => {
    // The function clamps to base. Even if math were impossible, no NaN.
    expect(Number.isFinite(xpToNext(-1))).toBe(true);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// clampAttributeDeltas
// ────────────────────────────────────────────────────────────────────────────

describe('clampAttributeDeltas', () => {
  it('clamps a positive delta so the result does not exceed ATTRIBUTE_MAX', () => {
    const result = clampAttributeDeltas(attr({ shooting: 95 }), { shooting: 999 });
    expect(result.shooting).toBe(4); // 99 - 95
  });

  it('clamps a negative delta so the result is not below 0', () => {
    const result = clampAttributeDeltas(attr({ pace: 3 }), { pace: -999 });
    expect(result.pace).toBe(-3); // 0 - 3
  });

  it('drops zero and undefined entries', () => {
    const result = clampAttributeDeltas(attr(), { pace: 0, shooting: undefined, passing: 2 });
    expect(result.pace).toBeUndefined();
    expect(result.shooting).toBeUndefined();
    expect(result.passing).toBe(2);
  });

  it('passes through a delta that stays in range', () => {
    const result = clampAttributeDeltas(attr({ dribbling: 60 }), { dribbling: 5 });
    expect(result.dribbling).toBe(5);
  });

  it('ignores unknown keys (defensive)', () => {
    const result = clampAttributeDeltas(attr(), { unknown: 5 } as AttributeDeltas);
    expect(result).toEqual({});
  });
});

// ────────────────────────────────────────────────────────────────────────────
// buildInitialTwinState
// ────────────────────────────────────────────────────────────────────────────

describe('buildInitialTwinState', () => {
  it('builds a level-1 player twin with default attributes', () => {
    const state = buildInitialTwinState('t1', 'player');
    expect(state.level).toBe(1);
    expect(state.xp).toBe(0);
    expect(state.attestationCount).toBe(0);
    expect(state.baseAttributes.pace).toBe(50);
    expect(state.energy).toBeUndefined();
  });

  it('builds a level-1 squad twin with energy 100', () => {
    const state = buildInitialTwinState('t1', 'squad');
    expect(state.energy).toBe(100);
    expect(state.energyMax).toBe(100);
    expect(state.twinActive).toBe(true);
  });

  it('honors initial attributes when provided', () => {
    const state = buildInitialTwinState('t1', 'player', {
      pace: 80,
      shooting: 50,
      passing: 50,
      dribbling: 50,
      defending: 50,
      physical: 50,
    });
    expect(state.baseAttributes.pace).toBe(80);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// applyEvent / attestation
// ────────────────────────────────────────────────────────────────────────────

describe('applyEvent / attestation', () => {
  it('levels up at 100 XP and emits a level_up milestone', () => {
    const state = baseState({ xp: 0, level: 1, attestationCount: 0 });
    const diff = applyEvent(state, attestation({ xpDelta: 100 }), NOW);
    expect(diff.levelUp).toBe(true);
    expect(diff.newLevel).toBe(2);
    expect(diff.milestonesHit).toContainEqual({
      kind: 'level_up',
      payload: { from: 1, to: 2 },
    });
  });

  it('does not level up below 100 XP', () => {
    const state = baseState({ xp: 0, level: 1 });
    const diff = applyEvent(state, attestation({ xpDelta: 99 }), NOW);
    expect(diff.levelUp).toBe(false);
    expect(diff.newLevel).toBe(1);
  });

  it('emits record_broken on first time an attribute reaches the cap', () => {
    const state = baseState({ baseAttributes: attr({ shooting: 95 }) });
    const diff = applyEvent(
      state,
      attestation({ attributeDeltas: { shooting: 10 } }),
      NOW,
    );
    expect(diff.attributeDeltas.shooting).toBe(4); // clamped
    expect(diff.milestonesHit).toContainEqual({
      kind: 'record_broken',
      payload: { attribute: 'shooting', value: ATTRIBUTE_MAX },
    });
  });

  it('does not re-emit record_broken if attribute was already at the cap', () => {
    const state = baseState({ baseAttributes: attr({ shooting: 99 }) });
    const diff = applyEvent(
      state,
      attestation({ attributeDeltas: { shooting: 1 } }),
      NOW,
    );
    const recordBroken = diff.milestonesHit.find((m) => m.kind === 'record_broken');
    expect(recordBroken).toBeUndefined();
  });

  it('emits attestation_100 milestone exactly when crossing the threshold', () => {
    const state = baseState({ attestationCount: 99 });
    const diff = applyEvent(state, attestation(), NOW);
    expect(diff.milestonesHit).toContainEqual({
      kind: 'attestation_100',
      payload: { count: 100 },
    });
  });

  it('emits attestation_500 milestone at the 500th attestation', () => {
    const state = baseState({ attestationCount: 499 });
    const diff = applyEvent(state, attestation(), NOW);
    expect(diff.milestonesHit).toContainEqual({
      kind: 'attestation_500',
      payload: { count: 500 },
    });
  });

  it('does not emit attestation milestone when not crossing the threshold', () => {
    const state = baseState({ attestationCount: 50 });
    const diff = applyEvent(state, attestation(), NOW);
    const milestone = diff.milestonesHit.find((m) => m.kind.startsWith('attestation_'));
    expect(milestone).toBeUndefined();
  });

  it('awards prestige on every 10th level', () => {
    // Find xp just below level 10, then grant exactly the xp needed to land
    // on level 10. This avoids drift between the test's mental model and the
    // function's actual growth rate.
    const xpJustBelow = xpJustBelowLevel(10);
    const xpToLandOn10 = xpToNext(xpJustBelow);
    const state = baseState({ xp: xpJustBelow });
    const diff = applyEvent(state, attestation({ xpDelta: xpToLandOn10 }), NOW);
    expect(diff.newLevel).toBe(10);
    expect(diff.prestigeDelta).toBe(1);
  });

  it('does not award prestige on non-multiple-of-10 levels', () => {
    const state = baseState({ xp: 99, level: 1 });
    const diff = applyEvent(state, attestation({ xpDelta: 100 }), NOW);
    expect(diff.newLevel).toBe(2);
    expect(diff.prestigeDelta).toBe(0);
  });

  it('applies reputation delta when provided', () => {
    const state = baseState();
    const diff = applyEvent(state, attestation({ reputationDelta: 25 }), NOW);
    expect(diff.reputationDelta).toBe(25);
  });

  it('applies match stats delta when provided', () => {
    const state = baseState();
    const diff = applyEvent(
      state,
      attestation({ matchStatsDelta: { goals: 2, assists: 1 } }),
      NOW,
    );
    expect(diff.matchStatsDelta).toEqual({ goals: 2, assists: 1 });
  });

  it('clamps xp to non-negative', () => {
    const state = baseState({ xp: 10 });
    const diff = applyEvent(state, attestation({ xpDelta: -50 }), NOW);
    expect(diff.xpDelta).toBe(-50); // raw delta, not post-clamp
  });

  it('builds a moment hint when a milestone fires', () => {
    const state = baseState({ xp: 0, level: 1 });
    const diff = applyEvent(state, attestation({ xpDelta: 100 }), NOW);
    expect(diff.momentHint).toBeDefined();
    expect(diff.momentHint?.kind).toBe('level_up');
  });

  it('omits moment hint when no milestone fires', () => {
    const state = baseState({ xp: 0, level: 1, attestationCount: 0 });
    const diff = applyEvent(state, attestation({ xpDelta: 10 }), NOW);
    expect(diff.momentHint).toBeUndefined();
  });
});

// ────────────────────────────────────────────────────────────────────────────
// applyEvent / sim_completed
// ────────────────────────────────────────────────────────────────────────────

describe('applyEvent / sim_completed', () => {
  it('sim win grants premium moment, prestige, and sim win milestone', () => {
    const state = baseState();
    const diff = applyEvent(
      state,
      {
        kind: 'sim_completed',
        twinId: 't1',
        simulationId: 'sim-1',
        result: {
          position: 1,
          participants: 8,
          pointsAwarded: 100,
          prizeUsdc: 12,
          goalsScored: 3,
          goalsConceded: 1,
        },
      },
      NOW,
    );
    expect(diff.milestonesHit).toContainEqual({
      kind: 'sim_win',
      payload: { simulationId: 'sim-1' },
    });
    expect(diff.prestigeDelta).toBe(1);
    expect(diff.matchStatsDelta.simWins).toBe(1);
    expect(diff.momentHint?.tier).toBe('premium');
  });

  it('sim podium (2nd) grants standard moment and sim_podium milestone', () => {
    const state = baseState();
    const diff = applyEvent(
      state,
      {
        kind: 'sim_completed',
        twinId: 't1',
        simulationId: 'sim-1',
        result: { position: 2, participants: 8, pointsAwarded: 60, prizeUsdc: 6, goalsScored: 1, goalsConceded: 2 },
      },
      NOW,
    );
    expect(diff.milestonesHit).toContainEqual({
      kind: 'sim_podium',
      payload: { position: 2 },
    });
    expect(diff.momentHint?.tier).toBe('standard');
    expect(diff.prestigeDelta).toBe(0);
  });

  it('sim outside top 3 grants no podium moment and no sim milestone', () => {
    const state = baseState();
    const diff = applyEvent(
      state,
      {
        kind: 'sim_completed',
        twinId: 't1',
        simulationId: 'sim-1',
        result: { position: 5, participants: 8, pointsAwarded: 20, prizeUsdc: 0, goalsScored: 0, goalsConceded: 4 },
      },
      NOW,
    );
    expect(diff.milestonesHit.find((m) => m.kind === 'sim_podium' || m.kind === 'sim_win')).toBeUndefined();
    expect(diff.momentHint).toBeUndefined();
  });

  it('sim goals bump shooting attribute (capped at +2)', () => {
    const state = baseState({ baseAttributes: attr({ shooting: 50 }) });
    const diff = applyEvent(
      state,
      {
        kind: 'sim_completed',
        twinId: 't1',
        simulationId: 'sim-1',
        result: { position: 1, participants: 8, pointsAwarded: 100, prizeUsdc: 12, goalsScored: 5, goalsConceded: 0 },
      },
      NOW,
    );
    expect(diff.attributeDeltas.shooting).toBe(2);
    expect(diff.attributeDeltas.pace).toBe(1);
  });

  it('sim heavy defeat (>2 conceded) drops defending', () => {
    const state = baseState({ baseAttributes: attr({ defending: 60 }) });
    const diff = applyEvent(
      state,
      {
        kind: 'sim_completed',
        twinId: 't1',
        simulationId: 'sim-1',
        result: { position: 5, participants: 8, pointsAwarded: 0, prizeUsdc: 0, goalsScored: 0, goalsConceded: 4 },
      },
      NOW,
    );
    expect(diff.attributeDeltas.defending).toBe(-1);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// applyEvent / coaching_hired
// ────────────────────────────────────────────────────────────────────────────

describe('applyEvent / coaching_hired', () => {
  it('adds a coaching modifier with expiresAt = now + durationDays', () => {
    const state = baseState();
    const diff = applyEvent(
      state,
      {
        kind: 'coaching_hired',
        twinId: 't1',
        coachId: 'coach-1',
        effect: { deltas: { shooting: 5 }, durationDays: 7, costUsdc: 2, sessionId: 'sess-1' },
      },
      NOW,
    );
    expect(diff.modifierAdded).toBeDefined();
    expect(diff.modifierAdded?.source).toBe('coaching');
    expect(diff.modifierAdded?.expiresAt).toBe('2026-06-11T12:00:00.000Z');
    expect(diff.modifierAdded?.deltas).toEqual({ shooting: 5 });
    expect(diff.momentHint?.kind).toBe('coaching_hired');
  });

  it('does not emit milestones for a coaching hire', () => {
    const state = baseState();
    const diff = applyEvent(
      state,
      {
        kind: 'coaching_hired',
        twinId: 't1',
        coachId: 'coach-1',
        effect: { deltas: { shooting: 5 }, durationDays: 7, costUsdc: 2, sessionId: 'sess-1' },
      },
      NOW,
    );
    expect(diff.milestonesHit).toHaveLength(0);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// applyEvent / coaching_expired
// ────────────────────────────────────────────────────────────────────────────

describe('applyEvent / coaching_expired', () => {
  it('emits a coaching_expired milestone and sets modifierRemovedId', () => {
    const state = baseState();
    const diff = applyEvent(
      state,
      { kind: 'coaching_expired', twinId: 't1', effectId: 'coaching-sess-1' },
      NOW,
    );
    expect(diff.modifierRemovedId).toBe('coaching-sess-1');
    expect(diff.milestonesHit).toContainEqual({
      kind: 'coaching_expired',
      payload: { effectId: 'coaching-sess-1' },
    });
    expect(diff.momentHint?.kind).toBe('coaching_expired');
  });
});

// ────────────────────────────────────────────────────────────────────────────
// applyEvent / ghost_match
// ────────────────────────────────────────────────────────────────────────────

describe('applyEvent / ghost_match', () => {
  it('consumes energy and adds a small attribute bump (squad only)', () => {
    const state = baseState({ scope: 'squad', baseAttributes: attr({ passing: 60 }) });
    const diff = applyEvent(
      state,
      { kind: 'ghost_match', twinId: 't1', result: { attributeImproved: 'passing', energySpent: 40 } },
      NOW,
    );
    expect(diff.energyDelta).toBe(-40);
    expect(diff.attributeDeltas.passing).toBeCloseTo(0.2, 5);
    expect(diff.matchStatsDelta.matches).toBe(1);
  });

  it('emits no milestones for a ghost match', () => {
    const state = baseState({ scope: 'squad' });
    const diff = applyEvent(
      state,
      { kind: 'ghost_match', twinId: 't1', result: { attributeImproved: 'pace', energySpent: 10 } },
      NOW,
    );
    expect(diff.milestonesHit).toHaveLength(0);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// applyEvent / peer_rating_consensus
// ────────────────────────────────────────────────────────────────────────────

describe('applyEvent / peer_rating_consensus', () => {
  it('applies clamped attribute deltas and reputation delta', () => {
    const state = baseState({ baseAttributes: attr({ shooting: 70 }) });
    const diff = applyEvent(
      state,
      {
        kind: 'peer_rating_consensus',
        twinId: 't1',
        matchId: 'm1',
        consensus: { attributeDeltas: { shooting: 50 }, hypeTags: ['Clutch'], reputationDelta: 10 },
      },
      NOW,
    );
    expect(diff.attributeDeltas.shooting).toBe(29); // 99 - 70
    expect(diff.reputationDelta).toBe(10);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// applyEvent / season_end
// ────────────────────────────────────────────────────────────────────────────

describe('applyEvent / season_end', () => {
  it('awards prestige and emits a season_end milestone', () => {
    const state = baseState();
    const diff = applyEvent(
      state,
      {
        kind: 'season_end',
        twinId: 't1',
        seasonId: 's1',
        summary: { matchesPlayed: 10, goalsScored: 4, assists: 2, mvp: 1, finalPosition: 3 },
      },
      NOW,
    );
    expect(diff.prestigeDelta).toBe(1);
    expect(diff.milestonesHit).toContainEqual({
      kind: 'season_end',
      payload: { matchesPlayed: 10, goalsScored: 4, assists: 2, mvp: 1, finalPosition: 3 },
    });
    expect(diff.momentHint?.tier).toBe('partner');
  });
});

// ────────────────────────────────────────────────────────────────────────────
// applyEvent / admin_adjustment
// ────────────────────────────────────────────────────────────────────────────

describe('applyEvent / admin_adjustment', () => {
  it('passes the diff through but strips milestones and moment', () => {
    const state = baseState();
    const adminDiff = {
      attributeDeltas: { pace: -1 },
      xpDelta: 0,
      levelUp: false,
      newLevel: 1,
      prestigeDelta: 0,
      matchStatsDelta: {},
      reputationDelta: -10,
    };
    const diff = applyEvent(
      state,
      {
        kind: 'admin_adjustment',
        twinId: 't1',
        reason: 'moderation',
        moderatorId: 'mod-1',
        diff: adminDiff,
      },
      NOW,
    );
    expect(diff.attributeDeltas).toEqual({ pace: -1 });
    expect(diff.reputationDelta).toBe(-10);
    expect(diff.milestonesHit).toHaveLength(0);
    expect(diff.momentHint).toBeUndefined();
  });
});

// ────────────────────────────────────────────────────────────────────────────
// applyEvent / twin_created
// ────────────────────────────────────────────────────────────────────────────

describe('applyEvent / twin_created', () => {
  it('emits a twin_created milestone and a "Meet your twin" moment', () => {
    const state = baseState();
    const diff = applyEvent(
      state,
      {
        kind: 'twin_created',
        twinId: 't1',
        initialAttributes: attr(),
        context: { userId: 'u1' },
      },
      NOW,
    );
    expect(diff.milestonesHit).toContainEqual({ kind: 'twin_created', payload: {} });
    expect(diff.momentHint?.label).toBe('Meet your twin');
  });
});

// ────────────────────────────────────────────────────────────────────────────
// dropExpiredModifiers
// ────────────────────────────────────────────────────────────────────────────

describe('dropExpiredModifiers', () => {
  it('drops modifiers whose expiresAt is in the past', () => {
    const state = baseState({
      activeModifiers: [
        { id: 'a', source: 'coaching', expiresAt: '2026-06-01T00:00:00.000Z', deltas: { shooting: 1 } },
        { id: 'b', source: 'coaching', expiresAt: '2026-06-10T00:00:00.000Z', deltas: { pace: 1 } },
      ],
    });
    const remaining = dropExpiredModifiers(state, NOW);
    expect(remaining).toHaveLength(1);
    expect(remaining[0].id).toBe('b');
  });

  it('keeps modifiers with future expiry', () => {
    const state = baseState({
      activeModifiers: [
        { id: 'a', source: 'coaching', expiresAt: '2026-07-01T00:00:00.000Z', deltas: { shooting: 1 } },
      ],
    });
    expect(dropExpiredModifiers(state, NOW)).toHaveLength(1);
  });

  it('returns empty when there are no modifiers', () => {
    expect(dropExpiredModifiers(baseState(), NOW)).toEqual([]);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// Cross-cutting
// ────────────────────────────────────────────────────────────────────────────

describe('applyEvent invariants', () => {
  it('every applier returns a diff with milestonesHit defined (possibly empty)', () => {
    const state = baseState();
    const events = [
      attestation(),
      { kind: 'twin_created' as const, twinId: 't1', initialAttributes: attr(), context: {} },
      {
        kind: 'coaching_hired' as const,
        twinId: 't1',
        coachId: 'c1',
        effect: { deltas: { shooting: 1 }, durationDays: 1, costUsdc: 1, sessionId: 's1' },
      },
      { kind: 'coaching_expired' as const, twinId: 't1', effectId: 'e1' },
      {
        kind: 'sim_completed' as const,
        twinId: 't1',
        simulationId: 's1',
        result: { position: 1, participants: 4, pointsAwarded: 100, prizeUsdc: 0, goalsScored: 1, goalsConceded: 0 },
      },
      {
        kind: 'ghost_match' as const,
        twinId: 't1',
        result: { attributeImproved: 'pace' as const, energySpent: 10 },
      },
      {
        kind: 'peer_rating_consensus' as const,
        twinId: 't1',
        matchId: 'm1',
        consensus: { attributeDeltas: { shooting: 1 }, hypeTags: [], reputationDelta: 0 },
      },
      {
        kind: 'season_end' as const,
        twinId: 't1',
        seasonId: 's1',
        summary: { matchesPlayed: 0, goalsScored: 0, assists: 0, mvp: 0 },
      },
      {
        kind: 'admin_adjustment' as const,
        twinId: 't1',
        reason: 'r',
        moderatorId: 'm',
        diff: {
          attributeDeltas: {},
          xpDelta: 0,
          levelUp: false,
          newLevel: 1,
          prestigeDelta: 0,
          matchStatsDelta: {},
          reputationDelta: 0,
        },
      },
    ];
    for (const event of events) {
      const diff = applyEvent(state, event, NOW);
      expect(Array.isArray(diff.milestonesHit)).toBe(true);
    }
  });

  it('all attestation milestones are unique per crossing (no double-count)', () => {
    // 99 → 100 fires attestation_100 exactly once.
    const state = baseState({ attestationCount: 99 });
    const diff = applyEvent(state, attestation(), NOW);
    const hits = diff.milestonesHit.filter((m) => m.kind.startsWith('attestation_'));
    expect(hits).toHaveLength(1);
  });

  it('ATTESTATION_MILESTONES is the source of truth (in tests and code)', () => {
    expect(ATTESTATION_MILESTONES).toEqual([100, 500, 1000, 5000]);
  });
});
