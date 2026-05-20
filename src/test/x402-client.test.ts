import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockAxiosPost = vi.hoisted(() => vi.fn());
const mockAxiosRequest = vi.hoisted(() => vi.fn());
const mockExecuteKitePassportRequest = vi.hoisted(() => vi.fn());
const mockIsKitePassportConfigured = vi.hoisted(() => vi.fn());
vi.mock('axios', () => ({
  default: {
    post: mockAxiosPost,
    request: mockAxiosRequest,
  },
}));

vi.mock('@/server/services/blockchain/kite-passport', () => ({
  executeKitePassportRequest: mockExecuteKitePassportRequest,
  isKitePassportConfigured: mockIsKitePassportConfigured,
}));

import {
  buildPaymentRequirements,
  paidFetch,
  settleWithFacilitator,
  type PaymentEnvelope,
  type PaymentRequirements,
} from '@/server/services/blockchain/x402-client';

const envelope: PaymentEnvelope = {
  x402Version: 2,
  scheme: 'exact',
  network: 'eip155:2368',
  authorization: {
    from: '0xPayer',
    to: '0xPayTo',
    value: '5000000000000000',
    validAfter: '0',
    validBefore: '9999999999',
    nonce: '0xNonce',
  },
  signature: '0xSig',
  asset: '0xUSDC',
  facilitator: '0xFacilitator',
};

const requirements: PaymentRequirements = {
  x402Version: 2,
  scheme: 'exact',
  network: 'eip155:2368',
  maxAmountRequired: '5000000000000000',
  amount: '5000000000000000',
  asset: '0xUSDC',
  payTo: '0xPayTo',
  maxTimeoutSeconds: 300,
  resource: '/api/x402/scout',
  description: 'SportWarren Scout',
  extra: { name: 'Test USD', version: '2' },
};

describe('x402 client settlement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsKitePassportConfigured.mockResolvedValue(false);
    delete process.env.KITE_X402_SIMULATE;
    delete process.env.KITE_X402_VERSION;
    delete process.env.KITE_X402_SCHEME;
    delete process.env.KITE_X402_NETWORK;
  });

  it('builds Pieverse-aligned payment requirements by default', () => {
    const reqs = buildPaymentRequirements({
      payTo: '0xPayTo',
      amountUsdc: 0.005,
      description: 'SportWarren Scout',
    });

    expect(reqs).toMatchObject({
      x402Version: 2,
      scheme: 'exact',
      network: 'eip155:2368',
      asset: '0x0fF5393387ad2f9f691FD6Fd28e07E3969e27e63',
      payTo: '0xPayTo',
    });
    expect(reqs.extra).toMatchObject({ name: 'Test USD', version: '2' });
  });

  it('posts a v2 settlement body to the Pieverse facilitator', async () => {
    mockAxiosPost.mockResolvedValue({
      status: 200,
      data: { success: true, transaction: '0xTxHash' },
    });

    const result = await settleWithFacilitator(envelope, requirements);

    expect(result.success).toBe(true);
    expect(result.txHash).toBe('0xTxHash');
    expect(mockAxiosPost).toHaveBeenCalledWith(
      expect.stringMatching(/\/v2\/settle$/),
      expect.objectContaining({
        x402Version: 2,
        paymentPayload: expect.objectContaining({ x402Version: 2 }),
        paymentRequirements: expect.objectContaining({
          scheme: 'exact',
          network: 'eip155:2368',
        }),
      }),
      expect.objectContaining({ timeout: 10_000 }),
    );
  });

  it('treats facilitator error payloads as failures', async () => {
    mockAxiosPost.mockResolvedValue({
      status: 200,
      data: { error: 'No facilitator registered for scheme: gokite-aa' },
    });

    const legacyReqs: PaymentRequirements = {
      ...requirements,
      scheme: 'gokite-aa',
      network: 'kite-testnet',
    };

    const result = await settleWithFacilitator(envelope, legacyReqs);
    expect(result.success).toBe(false);
    expect(result.error).toContain('gokite-aa');
  });

  it('uses Kite Passport for outbound paid fetches to external merchants', async () => {
    mockIsKitePassportConfigured.mockResolvedValue(true);
    mockAxiosRequest.mockResolvedValueOnce({
      status: 402,
      headers: {},
      data: { accepts: [requirements], x402Version: 2 },
    });
    mockExecuteKitePassportRequest.mockResolvedValue({
      status: 200,
      data: { temperature: 12 },
      walletAddress: '0xPayer',
      raw: {},
    });

    const result = await paidFetch({
      url: 'https://x402.dev.gokite.ai/api/weather?location=London',
      method: 'GET',
      maxAmountUsdc: 0.01,
    });

    expect(result.status).toBe(200);
    expect(mockExecuteKitePassportRequest).toHaveBeenCalled();
    expect(mockAxiosRequest).toHaveBeenCalledTimes(1);
  });

  it('does not simulate facilitator outages unless explicitly enabled', async () => {
    mockAxiosPost.mockRejectedValue(new Error('network down'));

    const result = await settleWithFacilitator(envelope, requirements);

    expect(result.success).toBe(false);
    expect(result.simulated).toBeUndefined();
    expect(result.error).toContain('facilitator unreachable');
  });

  it('allows explicit local simulation for facilitator outages', async () => {
    process.env.KITE_X402_SIMULATE = 'true';
    mockAxiosPost.mockRejectedValue(new Error('network down'));

    const result = await settleWithFacilitator(envelope, requirements);

    expect(result.success).toBe(true);
    expect(result.simulated).toBe(true);
  });
});
