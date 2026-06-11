import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockTrySet = vi.hoisted(() => vi.fn());
const mockDel = vi.hoisted(() => vi.fn());
const mockPrismaFindMany = vi.hoisted(() => vi.fn());
const mockPrismaUpdate = vi.hoisted(() => vi.fn());
const mockPrismaFindUnique = vi.hoisted(() => vi.fn());
const mockCreatePlatformSettlement = vi.hoisted(() => vi.fn());
const mockNextResponseJson = vi.hoisted(() => vi.fn());

vi.mock('@/server/services/redis', () => ({
  redisService: {
    trySet: mockTrySet,
    del: mockDel,
  },
}));

vi.mock('@/lib/db', () => ({
  prisma: {
    attestation: {
      findMany: mockPrismaFindMany,
      update: mockPrismaUpdate,
      findUnique: mockPrismaFindUnique,
    },
    platformIdentity: {
      findMany: vi.fn().mockResolvedValue([]),
    },
  },
}));

vi.mock('@/server/services/blockchain/x402-client', () => ({
  createPlatformSettlement: mockCreatePlatformSettlement,
}));

vi.mock('next/server', () => ({
  NextResponse: {
    json: mockNextResponseJson.mockImplementation(
      (data: unknown, init?: ResponseInit) => ({
        status: (init as { status?: number })?.status ?? 200,
        json: async () => data,
      }),
    ),
  },
}));

vi.mock('@/server/services/communication/whatsapp', () => ({
  WhatsAppService: vi.fn().mockImplementation(() => ({
    isConfigured: () => false,
    sendText: vi.fn(),
  })),
}));

import { GET } from '@/app/api/cron/scout-settle/route';

function fakeRequest(auth?: string) {
  return {
    headers: {
      get: (key: string) => (key === 'Authorization' ? auth ?? null : null),
    },
  } as any;
}

describe('scout-settle worker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.CRON_SECRET;
  });

  afterEach(() => {
    delete process.env.CRON_SECRET;
  });

  describe('auth and feature flag', () => {
    it('returns 401 when CRON_SECRET is set and auth header is missing', async () => {
      process.env.CRON_SECRET = 'secret123';
      await GET(fakeRequest());
      expect(mockNextResponseJson).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Unauthorized' }),
        expect.objectContaining({ status: 401 }),
      );
    });
  });

  describe('lock', () => {
    it('returns skipped when lock is already held', async () => {
      mockTrySet.mockResolvedValue(false);
      await GET(fakeRequest());
      expect(mockNextResponseJson).toHaveBeenCalledWith(
        expect.objectContaining({ skipped: 'locked' }),
      );
    });

    it('releases lock after processing', async () => {
      mockTrySet.mockResolvedValue(true);
      mockPrismaFindMany.mockResolvedValue([]);
      await GET(fakeRequest());
      expect(mockDel).toHaveBeenCalledWith('cron:scout-settle:lock');
    });
  });

  describe('drain queue', () => {
    it('settles pending attestation with real txHash', async () => {
      mockTrySet.mockResolvedValue(true);
      mockPrismaFindMany.mockResolvedValue([
        {
          id: 'att_1',
          amountUsdc: 0.005,
          settlementAttempts: 0,
          payload: { opponent: 'Arsenal', requestedBy: 'user_1' },
        },
      ]);
      mockCreatePlatformSettlement.mockResolvedValue({
        success: true,
        simulated: false,
        txHash: '0xSettled',
        facilitator: '0xFac',
        network: 'eip155:2368',
      });
      mockPrismaFindUnique.mockResolvedValue({
        payload: { opponent: 'Arsenal', requestedBy: 'user_1' },
        amountUsdc: 0.005,
      });

      await GET(fakeRequest());

      expect(mockPrismaUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'att_1' },
          data: expect.objectContaining({
            settlementStatus: 'settled',
            txHash: '0xSettled',
          }),
        }),
      );
    });

    it('retries on failed settlement (increments attempts, stays pending)', async () => {
      mockTrySet.mockResolvedValue(true);
      mockPrismaFindMany.mockResolvedValue([
        {
          id: 'att_2',
          amountUsdc: 0.005,
          settlementAttempts: 0,
          payload: { opponent: 'Chelsea' },
        },
      ]);
      mockCreatePlatformSettlement.mockResolvedValue({
        success: false,
        simulated: false,
        error: 'facilitator down',
      });

      await GET(fakeRequest());

      expect(mockPrismaUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'att_2' },
          data: expect.objectContaining({
            settlementStatus: 'pending',
            settlementError: 'facilitator down',
          }),
        }),
      );
    });

    it('marks failed after MAX_ATTEMPTS (3) consecutive failures', async () => {
      mockTrySet.mockResolvedValue(true);
      mockPrismaFindMany.mockResolvedValue([
        {
          id: 'att_3',
          amountUsdc: 0.005,
          settlementAttempts: 2,
          payload: { opponent: 'Liverpool' },
        },
      ]);
      mockCreatePlatformSettlement.mockRejectedValue(
        new Error('facilitator unreachable'),
      );

      await GET(fakeRequest());

      expect(mockPrismaUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'att_3' },
          data: expect.objectContaining({
            settlementStatus: 'failed',
          }),
        }),
      );
    });

    it('handles empty queue gracefully', async () => {
      mockTrySet.mockResolvedValue(true);
      mockPrismaFindMany.mockResolvedValue([]);

      await GET(fakeRequest());

      expect(mockPrismaUpdate).not.toHaveBeenCalled();
      expect(mockCreatePlatformSettlement).not.toHaveBeenCalled();
    });

    it('handles settlement timeout gracefully', async () => {
      mockTrySet.mockResolvedValue(true);
      mockPrismaFindMany.mockResolvedValue([
        {
          id: 'att_timeout',
          amountUsdc: 0.005,
          settlementAttempts: 0,
          payload: { opponent: 'Spurs' },
        },
      ]);
      mockCreatePlatformSettlement.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 30_000)),
      );

      await GET(fakeRequest());

      expect(mockPrismaUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'att_timeout' },
          data: expect.objectContaining({
            settlementError: expect.stringContaining('timed out'),
          }),
        }),
      );
    }, 15_000);
  });
});
