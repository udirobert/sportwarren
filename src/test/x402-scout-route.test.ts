import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Hoisted mock function declarations — accessible inside vi.mock factories
// because vi.hoisted() runs at the hoisted position.
// ---------------------------------------------------------------------------

const mockDecodeXPayment = vi.hoisted(() => vi.fn());
const mockBuildPaymentRequirements = vi.hoisted(() => vi.fn());
const mockSettleWithFacilitator = vi.hoisted(() => vi.fn());
const mockReadX402Config = vi.hoisted(() => vi.fn());
const mockCheckUserSpending = vi.hoisted(() => vi.fn());
const mockGenerateInference = vi.hoisted(() => vi.fn());
const mockPrismaUserFindUnique = vi.hoisted(() => vi.fn());
const mockPrismaSquadFindFirst = vi.hoisted(() => vi.fn());
const mockPrismaMatchFindMany = vi.hoisted(() => vi.fn());
const mockPrismaAttestationCreate = vi.hoisted(() => vi.fn());
const mockNextResponseJson = vi.hoisted(() => vi.fn());

// ---------------------------------------------------------------------------
// Module-level mocks (hoisted before imports by vitest)
// ---------------------------------------------------------------------------

vi.mock('next/server', () => ({
  NextRequest: vi.fn(),
  NextResponse: {
    json: mockNextResponseJson.mockImplementation(
      (data: unknown, init?: ResponseInit) => ({
        status: (init as { status?: number })?.status ?? 200,
        json: async () => data,
        headers: new Map(),
      }),
    ),
  },
}));

vi.mock('@/server/services/blockchain/x402-client', () => ({
  buildPaymentRequirements: mockBuildPaymentRequirements,
  settleWithFacilitator: mockSettleWithFacilitator,
  decodeXPayment: mockDecodeXPayment,
  readX402Config: mockReadX402Config,
}));

vi.mock('@/server/services/ai/kite', () => ({
  kiteAIService: {
    checkUserSpending: mockCheckUserSpending,
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

vi.mock('ethers', () => ({
  ethers: {
    Wallet: class {
      address = '0xMockWalletAddress';
      constructor(_pk: string) {
        // mock — never touches ethers internals
      }
    },
  },
}));

// ---------------------------------------------------------------------------
// Import the route AFTER mocks are established
// ---------------------------------------------------------------------------

import { GET, POST } from '@/app/api/x402/scout/route';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a minimal object that quacks like NextRequest for this route. */
function fakeRequest(headers: Record<string, string>, body?: unknown) {
  return {
    headers: {
      get: (key: string) => headers[key] ?? headers[key.toLowerCase()] ?? null,
    },
    json: vi.fn().mockResolvedValue(body ?? {}),
  } as any;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('x402 scout route', () => {
  beforeAll(() => {
    process.env.WEB3_PRIVATE_KEY = '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef';
  });

  beforeEach(() => {
    vi.clearAllMocks();

    // Stock defaults so focused tests don't need to re-stub everything
    mockBuildPaymentRequirements.mockReturnValue({
      scheme: 'gokite-aa',
      network: 'kite-testnet',
      maxAmountRequired: '500000',
      asset: '0xUSDC',
      payTo: '0xPayTo',
      maxTimeoutSeconds: 300,
      description: 'SportWarren Scout',
      merchantName: 'SportWarren',
      resource: '/api/x402/scout',
    });

    mockReadX402Config.mockReturnValue({
      facilitatorUrl: 'https://facilitator.pieverse.io',
      facilitatorAddress: '0xFacilitator',
      scheme: 'gokite-aa',
      network: 'kite-testnet',
      assetAddress: '0xUSDC',
      rpcUrl: 'https://rpc-testnet.gokite.ai',
      chainId: 2368,
    });

    mockDecodeXPayment.mockReturnValue({
      scheme: 'gokite-aa',
      network: 'kite-testnet',
      authorization: {
        from: '0xPayer',
        to: '0xPayTo',
        value: '500000',
        validAfter: '0',
        validBefore: '9999999999',
        nonce: '0xNonce',
      },
      signature: '0xSig',
      asset: '0xUSDC',
      facilitator: '0xFacilitator',
    });

    mockSettleWithFacilitator.mockResolvedValue({
      success: true,
      simulated: false,
      txHash: '0xTxHash',
      network: 'kite-testnet',
      facilitator: '0xFacilitator',
      payer: '0xPayer',
      payee: '0xPayee',
      amount: '500000',
    });

    mockGenerateInference.mockResolvedValue({
      content: 'Mock scouting report. They play 4-3-3. Exploit the left flank.',
    });

    mockPrismaAttestationCreate.mockResolvedValue({ id: 'att_789' });
  });

  // ── 402 payment gate ──────────────────────────────────────────────────

  describe('402 payment gate', () => {
    it('GET returns 402 with payment requirements', async () => {
      const res = await GET();

      expect(res.status).toBe(402);
      const body = await res.json();
      expect(body.requirements).toBeDefined();
      expect(body.requirements.scheme).toBe('gokite-aa');
      expect(mockBuildPaymentRequirements).toHaveBeenCalled();
    });

    it('POST returns 402 when X-Payment header is absent', async () => {
      const res = await POST(fakeRequest({}));

      expect(res.status).toBe(402);
      const body = await res.json();
      expect(body.requirements).toBeDefined();
    });

    it('POST returns 400 for an unparseable X-Payment header', async () => {
      mockDecodeXPayment.mockImplementation(() => {
        throw new Error('bad header');
      });

      const res = await POST(fakeRequest({ 'x-payment': 'garbage' }));

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toMatch(/invalid/i);
    });

    it('POST accepts the v2 PAYMENT-SIGNATURE header', async () => {
      mockCheckUserSpending.mockResolvedValue({ ok: true });
      mockPrismaUserFindUnique.mockResolvedValue(null);
      mockPrismaSquadFindFirst.mockResolvedValue(null);

      const res = await POST(
        fakeRequest(
          { 'payment-signature': 'valid-v2-base64' },
          { opponent: 'Liverpool', requestedBy: 'user_v2' },
        ),
      );

      expect(res.status).toBe(200);
      expect(mockDecodeXPayment).toHaveBeenCalledWith('valid-v2-base64');
      expect(mockSettleWithFacilitator).toHaveBeenCalled();
    });

    it('POST returns 402 when settlement with facilitator fails', async () => {
      mockSettleWithFacilitator.mockResolvedValue({
        success: false,
        error: 'Insufficient balance',
        network: 'kite-testnet',
        facilitator: '0xFacilitator',
        payer: '0xPayer',
        payee: '0xPayee',
        amount: '500000',
      });

      const res = await POST(
        fakeRequest({ 'x-payment': 'valid-base64' }, { opponent: 'FC Barcelona' }),
      );

      expect(res.status).toBe(402);
      const body = await res.json();
      expect(body.error).toMatch(/payment settlement failed/i);
    });
  });

  // ── Input validation ──────────────────────────────────────────────────

  describe('input validation', () => {
    it('POST returns 400 when opponent is missing', async () => {
      const res = await POST(fakeRequest({ 'x-payment': 'valid-base64' }, {}));

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toMatch(/missing opponent/i);
    });

    it('POST returns 400 when opponent is whitespace only', async () => {
      const res = await POST(
        fakeRequest({ 'x-payment': 'valid-base64' }, { opponent: '   ' }),
      );

      expect(res.status).toBe(400);
    });
  });

  // ── Per-user spending guard ───────────────────────────────────────────

  describe('per-user spending guard', () => {
    it('returns 429 when daily scout limit is exceeded', async () => {
      mockCheckUserSpending.mockResolvedValue({ ok: false, remaining: 0 });

      const res = await POST(
        fakeRequest(
          { 'x-payment': 'valid-base64' },
          { opponent: 'Real Madrid', requestedBy: 'user_over' },
        ),
      );

      expect(res.status).toBe(429);
      const body = await res.json();
      expect(body.error).toMatch(/daily scout limit/i);
      expect(body.limitUsdc).toBe(0.5);
      expect(body.remaining).toBe(0);
      expect(mockPrismaAttestationCreate).not.toHaveBeenCalled();
    });

    it('allows request when spending guard passes', async () => {
      mockCheckUserSpending.mockResolvedValue({ ok: true });
      mockPrismaUserFindUnique.mockResolvedValue(null);
      mockPrismaSquadFindFirst.mockResolvedValue(null);

      const res = await POST(
        fakeRequest(
          { 'x-payment': 'valid-base64' },
          { opponent: 'Real Madrid', requestedBy: 'user_ok' },
        ),
      );

      expect(res.status).toBe(200);
      expect(mockCheckUserSpending).toHaveBeenCalledWith(
        'user_ok',
        expect.any(Number),
        expect.any(Number),
      );
    });

    it('skips spending guard when requestedBy is not provided', async () => {
      const res = await POST(
        fakeRequest({ 'x-payment': 'valid-base64' }, { opponent: 'Atletico' }),
      );

      expect(res.status).toBe(200);
      expect(mockCheckUserSpending).not.toHaveBeenCalled();
    });
  });

  // ── Subject resolution ────────────────────────────────────────────────

  describe('subject resolution (subjectType / subjectId)', () => {
    it('sets subjectType="squad" when user has an active squad', async () => {
      mockCheckUserSpending.mockResolvedValue({ ok: true });
      mockPrismaUserFindUnique.mockResolvedValue({
        id: 'user_1',
        squads: [
          {
            status: 'active',
            squad: { id: 'squad_42', name: 'Warriors FC' },
          },
        ],
      });
      mockPrismaMatchFindMany.mockResolvedValue([]);
      mockPrismaSquadFindFirst.mockResolvedValue(null);

      await POST(
        fakeRequest(
          { 'x-payment': 'valid-base64' },
          { opponent: 'Real Madrid', requestedBy: 'user_1' },
        ),
      );

      expect(mockPrismaAttestationCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            subjectType: 'squad',
            subjectId: 'squad_42',
          }),
        }),
      );
    });

    it('sets subjectType="player" when user exists but has no active squad', async () => {
      mockCheckUserSpending.mockResolvedValue({ ok: true });
      mockPrismaUserFindUnique.mockResolvedValue({
        id: 'user_2',
        squads: [], // user exists but no squad memberships
      });

      await POST(
        fakeRequest(
          { 'x-payment': 'valid-base64' },
          { opponent: 'Bayern', requestedBy: 'user_2' },
        ),
      );

      expect(mockPrismaAttestationCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            subjectType: 'player',
            subjectId: 'user_2',
          }),
        }),
      );
    });

    it('uses default subjectType="player" subjectId="anonymous" when no requestedBy', async () => {
      mockPrismaSquadFindFirst.mockResolvedValue(null);

      await POST(
        fakeRequest({ 'x-payment': 'valid-base64' }, { opponent: 'Liverpool' }),
      );

      expect(mockPrismaAttestationCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            subjectType: 'player',
            subjectId: 'anonymous',
          }),
        }),
      );
    });

    it('attestation uses a valid schema type (player|squad|match|agent)', async () => {
      mockCheckUserSpending.mockResolvedValue({ ok: true });
      mockPrismaUserFindUnique.mockResolvedValue(null);

      await POST(
        fakeRequest(
          { 'x-payment': 'valid-base64' },
          { opponent: 'Juventus', requestedBy: 'user_anon' },
        ),
      );

      const call = mockPrismaAttestationCreate.mock.calls[0][0];
      const subjectType: string = call.data.subjectType;
      const validTypes = ['player', 'squad', 'match', 'agent'];
      expect(validTypes).toContain(subjectType);
    });

    it('includes opponent, summary, and requestedBy in attestation payload', async () => {
      mockCheckUserSpending.mockResolvedValue({ ok: true });
      mockPrismaUserFindUnique.mockResolvedValue({ id: 'user_3', squads: [] });

      await POST(
        fakeRequest(
          { 'x-payment': 'valid-base64' },
          { opponent: 'Chelsea', requestedBy: 'user_3' },
        ),
      );

      expect(mockPrismaAttestationCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            kind: 'scout_report',
            payload: expect.objectContaining({
              opponent: 'Chelsea',
              requestedBy: 'user_3',
              summary: expect.any(String),
            }),
          }),
        }),
      );
    });
  });
});
