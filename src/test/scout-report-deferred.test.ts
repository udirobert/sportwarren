import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockCheckUserSpending = vi.hoisted(() => vi.fn());
const mockGetScoutUserDailyLimit = vi.hoisted(() => vi.fn());
const mockGenerateInference = vi.hoisted(() => vi.fn());
const mockPrismaUserFindUnique = vi.hoisted(() => vi.fn());
const mockPrismaMatchFindMany = vi.hoisted(() => vi.fn());
const mockPrismaSquadFindFirst = vi.hoisted(() => vi.fn());
const mockPrismaAttestationCreate = vi.hoisted(() => vi.fn());
const mockReadX402Config = vi.hoisted(() => vi.fn());

vi.mock('@/server/services/ai/kite', () => ({
  kiteAIService: {
    checkUserSpending: mockCheckUserSpending,
    checkSquadSpending: vi.fn().mockResolvedValue({ ok: true }),
    getScoutUserDailyLimit: mockGetScoutUserDailyLimit,
    getScoutSquadDailyLimit: vi.fn().mockReturnValue(2.5),
  },
}));

vi.mock('@/lib/ai/inference', () => ({
  generateInference: mockGenerateInference,
}));

vi.mock('@/server/services/ai/prompts', () => ({
  AGENT_PERSONAS: {
    VISION_SCOUT: { systemPrompt: 'You are a scout.' },
  },
}));

vi.mock('@/lib/db', () => ({
  prisma: {
    user: { findUnique: mockPrismaUserFindUnique },
    squad: { findFirst: mockPrismaSquadFindFirst },
    match: { findMany: mockPrismaMatchFindMany },
    attestation: { create: mockPrismaAttestationCreate },
  },
}));

vi.mock('@/server/services/blockchain/x402-client', () => ({
  readX402Config: mockReadX402Config,
}));

import {
  createScoutReport,
  isDeferredSettlementEnabled,
  type ScoutReportResult,
} from '@/server/services/ai/scout-report';

describe('scout-report deferred settlement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGenerateInference.mockResolvedValue({ content: 'They play 4-3-3.' });
    mockPrismaUserFindUnique.mockResolvedValue(null);
    mockPrismaSquadFindFirst.mockResolvedValue(null);
    mockPrismaMatchFindMany.mockResolvedValue([]);
    mockPrismaAttestationCreate.mockResolvedValue({ id: 'att_deferred' });
    mockReadX402Config.mockReturnValue({
      facilitatorUrl: 'https://facilitator.pieverse.io',
      facilitatorAddress: '0xFac',
      scheme: 'exact',
      network: 'eip155:2368',
      assetAddress: '0xUSDC',
      rpcUrl: 'https://rpc-testnet.gokite.ai',
      chainId: 2368,
    });
    mockGetScoutUserDailyLimit.mockReturnValue(0.5);
  });

  afterEach(() => {
    delete process.env.SCOUT_DEFERRED_SETTLEMENT;
  });

  describe('isDeferredSettlementEnabled', () => {
    it('returns false when env var is unset', () => {
      expect(isDeferredSettlementEnabled()).toBe(false);
    });

    it('returns true when env var is "true"', () => {
      process.env.SCOUT_DEFERRED_SETTLEMENT = 'true';
      expect(isDeferredSettlementEnabled()).toBe(true);
    });

    it('returns true when env var is "1"', () => {
      process.env.SCOUT_DEFERRED_SETTLEMENT = '1';
      expect(isDeferredSettlementEnabled()).toBe(true);
    });

    it('returns false when env var is "false"', () => {
      process.env.SCOUT_DEFERRED_SETTLEMENT = 'false';
      expect(isDeferredSettlementEnabled()).toBe(false);
    });
  });

  describe('deferred mode (flag on, no settlement provided)', () => {
    beforeEach(() => {
      process.env.SCOUT_DEFERRED_SETTLEMENT = 'true';
    });

    it('writes attestation with settlementStatus=pending and txHash=null', async () => {
      const result = await createScoutReport({
        opponent: 'Arsenal',
        priceUsdc: 0.005,
      });

      expect(mockPrismaAttestationCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            settlementStatus: 'pending',
            txHash: null,
          }),
        }),
      );
      expect(result.settlementStatus).toBe('pending');
      expect(result.txHash).toBeNull();
    });

    it('returns instantly without calling any settlement function', async () => {
      const start = Date.now();
      const result = await createScoutReport({
        opponent: 'Arsenal',
        priceUsdc: 0.005,
      });
      const elapsed = Date.now() - start;

      expect(result.settlementStatus).toBe('pending');
      expect(elapsed).toBeLessThan(5000);
    });

    it('still enforces spending cap', async () => {
      mockCheckUserSpending.mockResolvedValue({ ok: false, remaining: 0 });
      mockGetScoutUserDailyLimit.mockReturnValue(0.5);

      await expect(
        createScoutReport({
          opponent: 'Arsenal',
          requestedBy: 'user_capped',
          priceUsdc: 0.005,
          enforceUserLimit: true,
        }),
      ).rejects.toThrow('Daily scout limit reached');

      expect(mockCheckUserSpending).toHaveBeenCalled();
    });
  });

  describe('deferred mode with real settlement provided', () => {
    beforeEach(() => {
      process.env.SCOUT_DEFERRED_SETTLEMENT = 'true';
    });

    it('writes attestation as settled when given a real txHash', async () => {
      const result = await createScoutReport({
        opponent: 'Chelsea',
        priceUsdc: 0.005,
        settlement: {
          txHash: '0xRealTxHash',
          facilitator: '0xFacilitator',
          simulated: false,
        },
      });

      expect(mockPrismaAttestationCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            settlementStatus: 'settled',
            txHash: '0xRealTxHash',
          }),
        }),
      );
      expect(result.settlementStatus).toBe('settled');
      expect(result.txHash).toBe('0xRealTxHash');
    });

    it('writes attestation as pending when settlement is simulated', async () => {
      const result = await createScoutReport({
        opponent: 'Chelsea',
        priceUsdc: 0.005,
        settlement: {
          txHash: 'sim-tx-123',
          facilitator: 'sportwarren-internal',
          simulated: true,
        },
      });

      expect(mockPrismaAttestationCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            settlementStatus: 'pending',
            txHash: null,
          }),
        }),
      );
      expect(result.settlementStatus).toBe('pending');
    });
  });

  describe('legacy mode (flag off)', () => {
    it('preserves legacy behavior: settlement is written immediately', async () => {
      const result = await createScoutReport({
        opponent: 'Liverpool',
        priceUsdc: 0.005,
        settlement: {
          txHash: 'internal-scout-123',
          facilitator: 'sportwarren-internal',
          simulated: true,
        },
      });

      expect(result.settlementStatus).toBe('settled');
      expect(mockPrismaAttestationCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            settlementStatus: undefined,
          }),
        }),
      );
    });

    it('works without settlement provided (uses internal fallback)', async () => {
      const result = await createScoutReport({
        opponent: 'Liverpool',
        priceUsdc: 0.005,
      });

      expect(result.settlementStatus).toBe('settled');
      expect(mockPrismaAttestationCreate).toHaveBeenCalled();
    });
  });
});
