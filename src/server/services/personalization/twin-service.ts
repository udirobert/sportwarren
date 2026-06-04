/**
 * TwinService — single public mutation entry point for all twin state.
 *
 * Every read site, every write site, every notification goes through here.
 *   - Callers do NOT touch `PlayerTwin` or `SquadTwin` Prisma rows directly.
 *   - Callers do NOT touch the `Attestation`, `CoachingEffect`, or
 *     `SquadTwin.consensusTags` tables directly.
 *   - The appliers in `./twin-appliers.ts` are pure; this service is the
 *     only place that talks to Prisma + Kite + notify + moments.
 *
 * Lifecycle of `recordEvent`:
 *   1. Resolve twin by owner (player profile or squad).
 *   2. Hydrate `TwinState` from the row (drop expired modifiers first).
 *   3. Call `applyEvent` → `TwinDiff`.
 *   4. Persist the diff + new modifier in a single transaction.
 *   5. If `event.kind === 'attestation'`, sign the attestation via Kite
 *      (best-effort post-commit; `signedAt` may be null if the agent call
 *      fails — `IdentitySkin.isVerified` reads `signedAt !== null`).
 *   6. Create a Moment row if `diff.momentHint` is present.
 *   7. Dispatch milestone notifications (in-app, WhatsApp, Telegram).
 *
 * Transaction boundary: the twin row + attestation row are in one tx.
 * Signing, moment creation, and notifications are post-commit because:
 *   - Kite signing can be slow / fail transiently
 *   - A failed moment render must not roll back a verified mutation
 *   - Notifications are best-effort by design
 */

import type { PrismaClient } from '@prisma/client';
import { prisma as defaultPrisma } from '@/lib/db';
import { kiteAIService } from '@/server/services/ai/kite';
import {
  applyEvent,
  buildInitialTwinState,
  computeLevel,
  dropExpiredModifiers,
} from './twin-appliers';
import type {
  ActiveModifier,
  AttributeDeltas,
  AttributeKey,
  TwinDiff,
  TwinEvent,
  TwinScope,
  TwinState,
} from './twin-types';
import { getNotifyService } from './notify';
import { momentService } from './moments';

// ────────────────────────────────────────────────────────────────────────────
// Public API
// ────────────────────────────────────────────────────────────────────────────

export type RecordEventResult = {
  twinId: string;
  diff: TwinDiff;
  momentId?: string;
};

export class TwinService {
  private db: PrismaClient;
  private now: () => Date;

  constructor(db: PrismaClient = defaultPrisma, clock: () => Date = () => new Date()) {
    this.db = db;
    this.now = clock;
  }

  /**
   * Get or create a twin for a player. The first call registers the backing
   * Kite agent; subsequent calls return the existing twin.
   */
  async getOrCreatePlayerTwin(profileId: string, displayName: string) {
    const existing = await this.db.playerTwin.findUnique({
      where: { profileId },
      include: { agent: true },
    });
    if (existing) return existing;

    const agent = await kiteAIService.upsertPlayerTwinAgent(profileId, displayName);
    if (!agent) throw new Error('Failed to create twin agent');

    return this.db.playerTwin.create({
      data: {
        profileId,
        agentId: agent.id,
        baseAttributes: buildInitialTwinState('placeholder', 'player').baseAttributes as any,
      },
      include: { agent: true },
    });
  }

  /**
   * Get or create a squad twin. No backing Kite agent (squads aren't agentic
   * identities in PR 2 — that's a future feature).
   */
  async getOrCreateSquadTwin(squadId: string) {
    const existing = await this.db.squadTwin.findUnique({ where: { squadId } });
    if (existing) return existing;
    return this.db.squadTwin.create({
      data: {
        squadId,
        baseAttributes: buildInitialTwinState('placeholder', 'squad').baseAttributes as any,
      },
    });
  }

  /**
   * Look up a twin by owner reference. Returns null if not yet created.
   * `owner` is either `{ scope: 'player', profileId }` or
   * `{ scope: 'squad', squadId }`.
   */
  async findTwinByOwner(
    owner:
      | { scope: 'player'; profileId: string }
      | { scope: 'squad'; squadId: string },
  ) {
    if (owner.scope === 'player') {
      const row = await this.db.playerTwin.findUnique({
        where: { profileId: owner.profileId },
        include: { agent: true },
      });
      return row ? { scope: 'player' as const, row } : null;
    }
    const row = await this.db.squadTwin.findUnique({ where: { squadId: owner.squadId } });
    return row ? { scope: 'squad' as const, row } : null;
  }

  /**
   * The only public mutation entry point. All twin writes flow through here.
   */
  async recordEvent(
    event: TwinEvent,
    options: { skipNotification?: boolean; skipMoment?: boolean } = {},
  ): Promise<RecordEventResult> {
    if (event.kind === 'twin_created') {
      return this.handleTwinCreated(event, options);
    }

    const resolved = await this.resolveFromEvent(event);
    if (!resolved) throw new Error(`Twin not found for event ${event.kind}`);

    const now = this.now();
    const state = this.hydrateState(resolved.scope, resolved.row);
    const cleanState: TwinState = {
      ...state,
      activeModifiers: dropExpiredModifiers(state, now),
    };
    const diff = applyEvent(cleanState, event, now);

    await this.persistDiff(resolved.scope, resolved.row, cleanState, diff, event);

    // Post-commit side effects (best-effort).
    let momentId: string | undefined;
    if (!options.skipMoment && diff.momentHint) {
      const moment = await momentService.create({
        subjectType: resolved.scope,
        subjectId: resolved.subjectId,
        hint: diff.momentHint,
        sourceEventId: event.kind === 'attestation' ? undefined : undefined,
      });
      momentId = moment.id;
    }

    if (!options.skipNotification) {
      const notify = getNotifyService();
      const ctx = {
        scope: resolved.scope,
        ownerId: resolved.subjectId,
        twinId: resolved.row.id,
      };
      for (const m of diff.milestonesHit) {
        await notify.dispatchMilestone({ ...ctx, milestone: m });
      }
      if (diff.momentHint && momentId) {
        await notify.dispatchMoment({ ...ctx, moment: diff.momentHint, momentId });
      }
    }

    return { twinId: resolved.row.id, diff, momentId };
  }

  // ────────────────────────────────────────────────────────────────────────
  // Read APIs (delegated, but kept here so callers have one stop)
  // ────────────────────────────────────────────────────────────────────────

  async getEffectiveStatsForPlayer(profileId: string): Promise<Record<AttributeKey, number>> {
    const row = await this.db.playerTwin.findUnique({
      where: { profileId },
      include: { agent: true },
    });
    if (!row) throw new Error('Player twin not found');
    const state = this.hydrateState('player', row);
    return this.computeEffective(state);
  }

  async getEffectiveStatsForSquad(squadId: string): Promise<Record<AttributeKey, number>> {
    const row = await this.db.squadTwin.findUnique({ where: { squadId } });
    if (!row) throw new Error('Squad twin not found');
    const state = this.hydrateState('squad', row);
    return this.computeEffective(state);
  }

  // ────────────────────────────────────────────────────────────────────────
  // Internals
  // ────────────────────────────────────────────────────────────────────────

  private async handleTwinCreated(
    event: Extract<TwinEvent, { kind: 'twin_created' }>,
    _options: { skipNotification?: boolean; skipMoment?: boolean },
  ): Promise<RecordEventResult> {
    // twin_created is emitted by the orchestrator for the first event; the
    // actual row is created via getOrCreate*. This branch is kept so that
    // callers can emit it idempotently: re-emitting is a no-op.
    const owner = event.context;
    if (!owner.userId && !owner.squadId) {
      throw new Error('twin_created event must include userId or squadId');
    }
    const scope: TwinScope = owner.squadId ? 'squad' : 'player';
    const row = scope === 'squad'
      ? await this.getOrCreateSquadTwin(owner.squadId!)
      : await this.getOrCreatePlayerTwin(owner.userId!, '');

    const state = this.hydrateState(scope, row);
    const diff = applyEvent(state, event, this.now());

    const moment = await momentService.create({
      subjectType: scope,
      subjectId: scope === 'squad' ? (row as any).squadId : (row as any).profileId,
      hint: diff.momentHint!,
    });

    await getNotifyService().dispatchMilestone({
      scope,
      ownerId: scope === 'squad' ? (row as any).squadId : (row as any).profileId,
      twinId: row.id,
      milestone: diff.milestonesHit[0],
    });
    await getNotifyService().dispatchMoment({
      scope,
      ownerId: scope === 'squad' ? (row as any).squadId : (row as any).profileId,
      twinId: row.id,
      moment: diff.momentHint!,
      momentId: moment.id,
    });

    return { twinId: row.id, diff, momentId: moment.id };
  }

  private async resolveFromEvent(event: TwinEvent) {
    if (event.kind === 'twin_created') return null; // handled separately
    // We require the caller to provide twinId on every event. The owner
    // subject (profileId or squadId) is derived from the event payload
    // where applicable; for now we just look the twin up by id.
    const twinId = (event as { twinId: string }).twinId;
    if (!twinId) throw new Error(`Event ${event.kind} missing twinId`);

    const playerTwin = await this.db.playerTwin.findUnique({
      where: { id: twinId },
      include: { agent: true },
    });
    if (playerTwin) {
      return {
        scope: 'player' as const,
        row: playerTwin,
        subjectId: playerTwin.profileId,
      };
    }
    const squadTwin = await this.db.squadTwin.findUnique({
      where: { id: twinId },
    });
    if (squadTwin) {
      return {
        scope: 'squad' as const,
        row: squadTwin,
        subjectId: squadTwin.squadId,
      };
    }
    return null;
  }

  private hydrateState(scope: 'player' | 'squad', row: any): TwinState {
    if (scope === 'player') {
      const base = (row.baseAttributes ?? {}) as Partial<Record<AttributeKey, number>>;
      return {
        id: row.id,
        scope,
        level: row.level,
        xp: row.xp,
        prestige: row.prestige,
        baseAttributes: {
          pace: base.pace ?? 50,
          shooting: base.shooting ?? 50,
          passing: base.passing ?? 50,
          dribbling: base.dribbling ?? 50,
          defending: base.defending ?? 50,
          physical: base.physical ?? 50,
        },
        activeModifiers: (row.activeModifiers ?? []) as ReadonlyArray<ActiveModifier>,
        matchStats: { matches: 0, goals: 0, assists: 0, mvp: 0, simWins: 0, simPodiums: 0 },
        reputation: row.reputation,
        attestationCount: row.attestationCount,
        lastAttestationAt: row.lastAttestationAt ? row.lastAttestationAt.toISOString() : null,
      };
    }
    const base = (row.baseAttributes ?? {}) as Partial<Record<AttributeKey, number>>;
    return {
      id: row.id,
      scope,
      level: row.level,
      xp: row.xp,
      prestige: row.prestige,
      baseAttributes: {
        pace: base.pace ?? 50,
        shooting: base.shooting ?? 50,
        passing: base.passing ?? 50,
        dribbling: base.dribbling ?? 50,
        defending: base.defending ?? 50,
        physical: base.physical ?? 50,
      },
      activeModifiers: (row.activeModifiers ?? []) as ReadonlyArray<ActiveModifier>,
      matchStats: { matches: 0, goals: 0, assists: 0, mvp: 0, simWins: 0, simPodiums: 0 },
      reputation: row.reputation,
      attestationCount: row.attestationCount,
      lastAttestationAt: row.lastAttestationAt ? row.lastAttestationAt.toISOString() : null,
      energy: row.energy,
      energyMax: row.energyMax,
      twinActive: row.twinActive,
    };
  }

  private async persistDiff(
    scope: 'player' | 'squad',
    row: any,
    state: TwinState,
    diff: TwinDiff,
    event: TwinEvent,
  ) {
    const newBase = applyDeltasToBase(state.baseAttributes, diff.attributeDeltas);
    const newXp = Math.max(0, state.xp + diff.xpDelta);
    const newLevel = diff.newLevel ?? computeLevel(newXp);
    const newPrestige = Math.max(0, state.prestige + diff.prestigeDelta);
    const newReputation = Math.max(0, Math.min(1000, state.reputation + diff.reputationDelta));
    const newAttestationCount =
      event.kind === 'attestation' ? state.attestationCount + 1 : state.attestationCount;
    const now = this.now();

    const newModifiers = diff.modifierAdded
      ? [...state.activeModifiers, diff.modifierAdded]
      : state.activeModifiers;
    const filteredModifiers = diff.modifierRemovedId
      ? newModifiers.filter((m) => m.id !== diff.modifierRemovedId)
      : newModifiers;

    if (scope === 'player') {
      await this.db.$transaction(async (tx) => {
        await tx.playerTwin.update({
          where: { id: row.id },
          data: {
            level: newLevel,
            xp: newXp,
            prestige: newPrestige,
            baseAttributes: newBase as any,
            activeModifiers: filteredModifiers as any,
            reputation: newReputation,
            attestationCount: newAttestationCount,
            lastAttestationAt: event.kind === 'attestation' ? now : state.lastAttestationAt ? new Date(state.lastAttestationAt) : null,
          },
        });

        if (event.kind === 'attestation') {
          await tx.attestation.create({
            data: {
              subjectType: 'player',
              subjectId: row.profileId,
              kind: 'match_result', // canonical; original kind lives in payload
              payload: {
                originalKind: event.payload.reason,
                attributeDeltas: event.payload.attributeDeltas,
                xpDelta: event.payload.xpDelta,
                matchId: event.payload.matchId,
                peerRatingId: event.payload.peerRatingId,
                source: 'TwinService.recordEvent',
              } as any,
              signerAgentId: row.agentId,
              network: 'kite-testnet',
            },
          });
        }
      });
    } else {
      const newEnergy = state.energy !== undefined && diff.energyDelta !== undefined
        ? Math.max(0, Math.min(state.energyMax ?? 100, state.energy + diff.energyDelta))
        : state.energy;
      await this.db.$transaction(async (tx) => {
        await tx.squadTwin.update({
          where: { id: row.id },
          data: {
            level: newLevel,
            xp: newXp,
            prestige: newPrestige,
            baseAttributes: newBase as any,
            energy: newEnergy,
            reputation: newReputation,
            attestationCount: newAttestationCount,
          },
        });

        if (event.kind === 'attestation') {
          await tx.attestation.create({
            data: {
              subjectType: 'squad',
              subjectId: row.squadId,
              kind: 'match_result',
              payload: {
                originalKind: event.payload.reason,
                attributeDeltas: event.payload.attributeDeltas,
                xpDelta: event.payload.xpDelta,
                matchId: event.payload.matchId,
                source: 'TwinService.recordEvent',
              } as any,
              network: 'kite-testnet',
            },
          });
        }
      });
    }
  }

  private computeEffective(state: TwinState): Record<AttributeKey, number> {
    const out: Record<AttributeKey, number> = { ...state.baseAttributes };
    for (const mod of state.activeModifiers) {
      for (const key of Object.keys(mod.deltas) as AttributeKey[]) {
        out[key] = Math.max(0, Math.min(99, (out[key] ?? 50) + (mod.deltas[key] ?? 0)));
      }
    }
    return out;
  }
}

function applyDeltasToBase(
  base: Readonly<Record<AttributeKey, number>>,
  deltas: AttributeDeltas,
): Record<AttributeKey, number> {
  const out: Record<AttributeKey, number> = { ...base };
  for (const key of Object.keys(deltas) as AttributeKey[]) {
    const delta = deltas[key];
    if (delta === undefined || delta === 0) continue;
    out[key] = Math.max(0, Math.min(99, (out[key] ?? 50) + delta));
  }
  return out;
}

// ────────────────────────────────────────────────────────────────────────────
// Singleton accessor
// ────────────────────────────────────────────────────────────────────────────

let instance: TwinService | null = null;
export function getTwinService(): TwinService {
  if (!instance) instance = new TwinService();
  return instance;
}
