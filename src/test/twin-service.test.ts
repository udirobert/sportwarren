import { describe, expect, it, vi, beforeEach } from 'vitest';

// Mock the side-effect services BEFORE importing the orchestrator so the
// import-time side effects (Kite, WhatsApp) never run in tests.
vi.mock('@/lib/db', () => ({ prisma: {} as any }));
vi.mock('../server/services/ai/kite', () => ({
  kiteAIService: { upsertPlayerTwinAgent: vi.fn() },
}));
vi.mock('../server/services/personalization/notify', () => ({
  getNotifyService: () => ({
    dispatchMilestone: vi.fn().mockResolvedValue(undefined),
    dispatchMoment: vi.fn().mockResolvedValue(undefined),
  }),
}));

const { momentCreateMock } = vi.hoisted(() => ({
  momentCreateMock: vi.fn().mockResolvedValue({ id: 'moment-1' }),
}));
vi.mock('../server/services/personalization/moments', () => ({
  momentService: { create: momentCreateMock, render: vi.fn(), listForSubject: vi.fn() },
}));

import { TwinService } from '@/server/services/personalization/twin-service';
import { momentService } from '../server/services/personalization/moments';
import type { AttestationEvent, GhostMatchEvent } from '../server/services/personalization/twin-types';

const NOW = new Date('2026-06-04T12:00:00.000Z');

function makePlayerTwin(overrides: Partial<any> = {}) {
  return {
    id: 'ptwin-1',
    profileId: 'profile-1',
    agentId: 'agent-1',
    level: 1,
    xp: 0,
    prestige: 0,
    baseAttributes: {
      pace: 50, shooting: 50, passing: 50, dribbling: 50, defending: 50, physical: 50,
    },
    activeModifiers: [],
    reputation: 0,
    attestationCount: 0,
    lastAttestationAt: null,
    agent: { id: 'agent-1' },
    ...overrides,
  };
}

function makeSquadTwin(overrides: Partial<any> = {}) {
  return {
    id: 'stwin-1',
    squadId: 'squad-1',
    level: 1,
    xp: 0,
    prestige: 0,
    baseAttributes: {
      pace: 50, shooting: 50, passing: 50, dribbling: 50, defending: 50, physical: 50,
    },
    energy: 100,
    energyMax: 100,
    twinActive: true,
    consensusTags: null,
    reputation: 0,
    attestationCount: 0,
    ...overrides,
  };
}

function createDbStub(opts: { playerTwin?: any; squadTwin?: any } = {}) {
  const playerTwin = opts.playerTwin ?? makePlayerTwin();
  const squadTwin = opts.squadTwin ?? makeSquadTwin();

  const $transaction = vi.fn().mockImplementation(async (fn: any) => {
    // Provide a minimal tx stub that forwards to the same models
    const tx = {
      playerTwin: { update: playerTwinUpdate, create: playerAttestationCreate },
      squadTwin: { update: squadTwinUpdate, create: squadAttestationCreate },
      attestation: { create: vi.fn().mockResolvedValue({ id: 'att-1' }) },
    };
    return fn(tx);
  });

  const playerTwinUpdate = vi.fn().mockResolvedValue({});
  const squadTwinUpdate = vi.fn().mockResolvedValue({});
  const playerAttestationCreate = vi.fn().mockResolvedValue({ id: 'att-player-1' });
  const squadAttestationCreate = vi.fn().mockResolvedValue({ id: 'att-squad-1' });

  return {
    db: {
      playerTwin: {
        findUnique: vi.fn().mockImplementation(async ({ where }: any) => {
          if (where.id === playerTwin.id) return playerTwin;
          if (where.profileId === playerTwin.profileId) return playerTwin;
          return null;
        }),
        create: vi.fn().mockResolvedValue(playerTwin),
        update: playerTwinUpdate,
      },
      squadTwin: {
        findUnique: vi.fn().mockImplementation(async ({ where }: any) => {
          if (where.id === squadTwin.id) return squadTwin;
          if (where.squadId === squadTwin.squadId) return squadTwin;
          return null;
        }),
        create: vi.fn().mockResolvedValue(squadTwin),
        update: squadTwinUpdate,
      },
      attestation: {
        create: vi.fn().mockResolvedValue({ id: 'att-1' }),
      },
      $transaction,
    } as any,
    playerTwinUpdate,
    squadTwinUpdate,
    $transaction,
  };
}

describe('TwinService.recordEvent', () => {
  beforeEach(() => {
    momentCreateMock.mockClear();
    momentCreateMock.mockResolvedValue({ id: 'moment-1' });
  });

  it('persists an attestation for a player twin, bumps counters, and creates a moment', async () => {
    const { db, playerTwinUpdate, $transaction } = createDbStub();
    const service = new TwinService(db, () => NOW);

    // xpDelta=100 trips the level-up milestone (L1->L2 boundary is 100).
    // Level up produces a momentHint; the moment is created.
    const event: AttestationEvent = {
      kind: 'attestation',
      twinId: 'ptwin-1',
      attestor: 'referee',
      payload: {
        attributeDeltas: { shooting: 1, pace: 0.5 },
        xpDelta: 100,
        reputationDelta: 10,
        matchStatsDelta: { matches: 1, goals: 2 },
        reason: 'match_result',
        matchId: 'match-1',
        signWithAgent: true,
      },
    };

    const result = await service.recordEvent(event);
    expect(result.twinId).toBe('ptwin-1');
    expect(result.diff.xpDelta).toBe(100);
    expect(result.diff.levelUp).toBe(true);
    expect(result.diff.attributeDeltas.shooting).toBeCloseTo(1);
    expect($transaction).toHaveBeenCalledTimes(1);
    expect(playerTwinUpdate).toHaveBeenCalledTimes(1);
    const updateArgs = playerTwinUpdate.mock.calls[0][0];
    expect(updateArgs.where.id).toBe('ptwin-1');
    expect(updateArgs.data.attestationCount).toBe(1);
    expect(updateArgs.data.reputation).toBe(10);
    expect(momentService.create).toHaveBeenCalled();
    expect(result.momentId).toBe('moment-1');
  });

  it('skips notification + moment when options.skipMoment is set', async () => {
    const { db } = createDbStub();
    const service = new TwinService(db, () => NOW);

    const event: AttestationEvent = {
      kind: 'attestation',
      twinId: 'ptwin-1',
      attestor: 'referee',
      payload: {
        attributeDeltas: { shooting: 1 },
        xpDelta: 60,
        matchStatsDelta: { matches: 1 },
        reason: 'match_result',
        matchId: 'match-1',
        signWithAgent: false,
      },
    };

    const result = await service.recordEvent(event, { skipMoment: true, skipNotification: true });
    expect(result.momentId).toBeUndefined();
    expect(momentService.create).not.toHaveBeenCalled();
  });

  it('emits a ghost_match event for a squad twin and decrements energy', async () => {
    const { db, squadTwinUpdate } = createDbStub();
    const service = new TwinService(db, () => NOW);

    const event: GhostMatchEvent = {
      kind: 'ghost_match',
      twinId: 'stwin-1',
      result: { attributeImproved: 'shooting', energySpent: 40 },
    };

    const result = await service.recordEvent(event);
    expect(result.diff.energyDelta).toBe(-40);
    expect(squadTwinUpdate).toHaveBeenCalled();
    const args = squadTwinUpdate.mock.calls[0][0];
    expect(args.data.energy).toBe(60);
  });

  it('rejects unknown twin ids', async () => {
    const { db } = createDbStub();
    const service = new TwinService(db, () => NOW);

    const event: AttestationEvent = {
      kind: 'attestation',
      twinId: 'missing-twin',
      attestor: 'referee',
      payload: {
        attributeDeltas: {},
        xpDelta: 0,
        matchStatsDelta: {},
        reason: 'match_result',
        matchId: 'match-1',
        signWithAgent: false,
      },
    };
    await expect(service.recordEvent(event)).rejects.toThrow(/Twin not found/);
  });
});

describe('TwinService.getOrCreatePlayerTwin', () => {
  it('returns the existing twin without creating a new one', async () => {
    const { db } = createDbStub();
    const service = new TwinService(db, () => NOW);
    const existing = makePlayerTwin();
    db.playerTwin.findUnique.mockResolvedValueOnce(existing);
    const twin = await service.getOrCreatePlayerTwin('profile-1', 'Alice');
    expect(twin).toBe(existing);
  });
});

describe('TwinService.getOrCreateSquadTwin', () => {
  it('creates a twin with default attributes when none exists', async () => {
    const { db } = createDbStub({ squadTwin: null });
    const service = new TwinService(db, () => NOW);
    db.squadTwin.findUnique.mockResolvedValueOnce(null);
    const created = makeSquadTwin();
    db.squadTwin.create.mockResolvedValueOnce(created);
    const twin = await service.getOrCreateSquadTwin('squad-1');
    expect(twin).toBe(created);
    expect(db.squadTwin.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        squadId: 'squad-1',
        baseAttributes: expect.objectContaining({
          pace: 50, shooting: 50, passing: 50, dribbling: 50, defending: 50, physical: 50,
        }),
      }),
    });
  });
});
