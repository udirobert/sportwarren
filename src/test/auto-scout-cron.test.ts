import { beforeEach, describe, expect, it, vi } from 'vitest';

// Hoisted mocks
const mockPrismaMatchFindMany = vi.hoisted(() => vi.fn());
const mockPrismaMatchUpdate = vi.hoisted(() => vi.fn());
const mockCreateScoutReport = vi.hoisted(() => vi.fn());
const mockTinyfishService = vi.hoisted(() => ({
  scout: vi.fn().mockResolvedValue({ sources: [], snippets: [] }),
}));
const mockTinyfishConfigured = vi.hoisted(() => vi.fn().mockReturnValue(false));
const mockWhatsappSendText = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
const mockWhatsappIsConfigured = vi.hoisted(() => vi.fn().mockReturnValue(false));

vi.mock('next/server', () => ({
  NextResponse: {
    json: (data: unknown, init?: ResponseInit) => ({
      status: (init as { status?: number })?.status ?? 200,
      json: async () => data,
    }),
  },
}));

vi.mock('@/lib/db', () => ({
  prisma: {
    match: {
      findMany: mockPrismaMatchFindMany,
      update: mockPrismaMatchUpdate,
    },
  },
}));

vi.mock('@/server/services/ai/scout-report', () => ({
  createScoutReport: mockCreateScoutReport,
}));

vi.mock('@/server/services/ai/tinyfish', () => ({
  tinyfishConfigured: mockTinyfishConfigured,
  tinyfishService: mockTinyfishService,
}));

vi.mock('@/server/services/communication/whatsapp', () => ({
  WhatsAppService: class {
    isConfigured = mockWhatsappIsConfigured;
    sendText = mockWhatsappSendText;
  },
}));

// Hard guard: the auto-scout cron must never import or call the legacy
// external paid-request path. The kiteAIService module mock would be
// the only way those names reach the route, so we mock it and assert
// the spies are never invoked.
const mockKiteExecutePaidRequest = vi.hoisted(() => vi.fn());
const mockKiteCreateSession = vi.hoisted(() => vi.fn());
const mockKiteUpsertSquadManagerAgent = vi.hoisted(() => vi.fn());

vi.mock('@/server/services/ai/kite', () => ({
  kiteAIService: {
    executePaidRequest: mockKiteExecutePaidRequest,
    createSession: mockKiteCreateSession,
    upsertSquadManagerAgent: mockKiteUpsertSquadManagerAgent,
  },
}));

import { GET } from '@/app/api/cron/auto-scout/route';

const NOW = new Date('2026-06-12T10:00:00Z');
const MATCH_DATE = new Date('2026-06-13T08:00:00Z'); // ~22h from NOW
const CRON_SECRET = 'test-cron-secret';

function buildMatch(overrides: Record<string, unknown> = {}) {
  return {
    id: 'match_1',
    homeSquadId: 'squad_home',
    awaySquadId: 'squad_away',
    matchDate: MATCH_DATE,
    status: 'pending',
    agentInsights: null,
    homeSquad: {
      id: 'squad_home',
      name: 'Red Lions',
      groups: [],
      members: [],
    },
    awaySquad: {
      id: 'squad_away',
      name: 'Blue Tigers',
      groups: [],
      members: [],
    },
    ...overrides,
  };
}

describe('auto-scout cron', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    process.env.CRON_SECRET = CRON_SECRET;
    delete process.env.KITE_SCOUT_SERVICE_URL; // safety: env var must be unread
  });

  afterEach(() => {
    vi.useRealTimers();
    delete process.env.CRON_SECRET;
  });

  it('returns 401 without a valid cron secret', async () => {
    const res = await GET({ headers: { get: () => null } } as unknown as Request);
    expect(res.status).toBe(401);
    expect(mockPrismaMatchFindMany).not.toHaveBeenCalled();
  });

  it('routes every (match, squad) pair through createScoutReport with the right opponent', async () => {
    mockPrismaMatchFindMany.mockResolvedValue([buildMatch()]);
    mockCreateScoutReport.mockResolvedValue({
      opponent: 'Blue Tigers',
      summary: 'Blue Tigers press high.',
      attestationId: 'att_home',
      txHash: 'internal-scout-1',
      simulated: true,
      network: 'kite-testnet',
      priceUsdc: 0.005,
      dataSources: ['no stored match data'],
      subjectType: 'squad',
      subjectId: 'squad_home',
    });

    const res = await GET({ headers: { get: () => `Bearer ${CRON_SECRET}` } } as unknown as Request);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(mockCreateScoutReport).toHaveBeenCalledTimes(2);
    // Home squad scouts the away opponent
    expect(mockCreateScoutReport).toHaveBeenCalledWith(expect.objectContaining({
      opponent: 'Blue Tigers',
      requestedBy: 'cron:auto-scout:squad_home',
      enforceUserLimit: false,
      enforceSquadLimit: false,
    }));
    // Away squad scouts the home opponent
    expect(mockCreateScoutReport).toHaveBeenCalledWith(expect.objectContaining({
      opponent: 'Red Lions',
      requestedBy: 'cron:auto-scout:squad_away',
    }));
    expect(body.scoutsSucceeded).toBe(2);
  });

  it('does not call the legacy executePaidRequest path (the KITE_SCOUT_SERVICE_URL bug)', async () => {
    mockPrismaMatchFindMany.mockResolvedValue([buildMatch()]);
    mockCreateScoutReport.mockResolvedValue({
      opponent: 'Blue Tigers',
      summary: 'x',
      attestationId: 'att_1',
      txHash: 'internal-scout-1',
      simulated: true,
      network: 'kite-testnet',
      priceUsdc: 0.005,
      dataSources: [],
      subjectType: 'squad',
      subjectId: 'squad_home',
    });

    await GET({ headers: { get: () => `Bearer ${CRON_SECRET}` } } as unknown as Request);

    expect(mockKiteExecutePaidRequest).not.toHaveBeenCalled();
    expect(mockKiteCreateSession).not.toHaveBeenCalled();
    expect(mockKiteUpsertSquadManagerAgent).not.toHaveBeenCalled();
  });

  it('marks the match as auto_scout_complete even when the scout fails (so we do not infinite-retry)', async () => {
    mockPrismaMatchFindMany.mockResolvedValue([buildMatch()]);
    mockCreateScoutReport.mockRejectedValue(new Error('squad daily limit reached'));

    const res = await GET({ headers: { get: () => `Bearer ${CRON_SECRET}` } } as unknown as Request);
    const body = await res.json();

    expect(body.scoutsFailed).toBe(2);
    expect(mockPrismaMatchUpdate).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'match_1' },
      data: expect.objectContaining({
        agentInsights: expect.objectContaining({ auto_scout_complete: true }),
      }),
    }));
  });

  it('shows verifying-receipt copy in the WhatsApp push when txHash is null or internal-*', async () => {
    mockPrismaMatchFindMany.mockResolvedValue([
      buildMatch({
        homeSquad: {
          id: 'squad_home', name: 'Red Lions', groups: [], members: [
            { user: { platformIdentities: [{ platformUserId: '447852705196' }] } },
          ],
        },
      }),
    ]);
    mockCreateScoutReport.mockResolvedValue({
      opponent: 'Blue Tigers',
      summary: 'Brief.',
      attestationId: 'att_1',
      txHash: null, // pending settlement
      simulated: true,
      network: 'kite-testnet',
      priceUsdc: 0.005,
      dataSources: [],
      subjectType: 'squad',
      subjectId: 'squad_home',
    });
    mockWhatsappIsConfigured.mockReturnValue(true);

    await GET({ headers: { get: () => `Bearer ${CRON_SECRET}` } } as unknown as Request);

    expect(mockWhatsappSendText).toHaveBeenCalled();
    const message = mockWhatsappSendText.mock.calls[0][1] as string;
    expect(message).toContain('Verifying on Kite');
    expect(message).not.toContain('Settled on Kite');
  });

  it('returns processed: 0 when no matches are in the 22-26h window', async () => {
    mockPrismaMatchFindMany.mockResolvedValue([]);
    const res = await GET({ headers: { get: () => `Bearer ${CRON_SECRET}` } } as unknown as Request);
    const body = await res.json();
    expect(body).toEqual({ success: true, processed: 0 });
    expect(mockCreateScoutReport).not.toHaveBeenCalled();
  });
});
