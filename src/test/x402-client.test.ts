import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockAxiosPost = vi.hoisted(() => vi.fn());
const mockAxiosRequest = vi.hoisted(() => vi.fn());
const mockExecuteKitePassportRequest = vi.hoisted(() => vi.fn());

vi.mock('axios', () => ({
  default: {
    post: mockAxiosPost,
    request: mockAxiosRequest,
  },
}));

vi.mock('@/server/services/blockchain/kite-passport', () => ({
  executeKitePassportRequest: mockExecuteKitePassportRequest,
}));

import {
  buildPaymentRequirements,
  paidFetch,
  settleWithFacilitator,
  type PaymentEnvelope,
  type PaymentRequirements,
} from '@/server/services/blockchain/x402-client';

const envelope: PaymentEnvelope = {
  x402Version: 1,
  scheme: 'gokite-aa',
  network: 'kite-testnet',
  payload: {
    authorization: {
      from: '0xPayer',
      to: '0xPayTo',
      value: '5000000000000000',
      validAfter: '0',
      validBefore: '9999999999',
      nonce: '0xNonce',
    },
    signature: '0xSig',
  },
};

const requirements: PaymentRequirements = {
  x402Version: 1,
  scheme: 'gokite-aa',
  network: 'kite-testnet',
  maxAmountRequired: '5000000000000000',
  amount: '5000000000000000',
  asset: '0xUSDC',
  payTo: '0xPayTo',
  maxTimeoutSeconds: 300,
  resource: '/api/x402/scout',
  description: 'SportWarren Scout',
  extra: null,
};

describe('x402 client settlement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.KITE_X402_SIMULATE;
    delete process.env.KITE_X402_VERSION;
    delete process.env.KITE_X402_SCHEME;
    delete process.env.KITE_X402_NETWORK;
  });

  it('builds the official Kite Passport payment requirements by default', () => {
    const reqs = buildPaymentRequirements({
      payTo: '0xPayTo',
      amountUsdc: 0.005,
      description: 'SportWarren Scout',
    });

    expect(reqs).toMatchObject({
      x402Version: 1,
      scheme: 'gokite-aa',
      network: 'kite-testnet',
      asset: '0x0fF5393387ad2f9f691FD6Fd28e07E3969e27e63',
      payTo: '0xPayTo',
      extra: null,
    });
  });

  it('posts a Kite Passport v1 settlement body to the facilitator', async () => {
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
        x402Version: 1,
        paymentPayload: expect.objectContaining({
          x402Version: 1,
          scheme: 'gokite-aa',
          network: 'kite-testnet',
          payload: envelope.payload,
        }),
        paymentRequirements: expect.objectContaining({
          scheme: 'gokite-aa',
          network: 'kite-testnet',
          maxAmountRequired: '5000000000000000',
          asset: '0xUSDC',
          extra: null,
        }),
      }),
      expect.objectContaining({ timeout: 10_000 }),
    );
  });

  it('uses Kite Passport CLI for outbound paid fetches', async () => {
    mockAxiosRequest
      .mockResolvedValueOnce({
        status: 402,
        headers: {},
        data: { accepts: [requirements], x402Version: 1 },
      })
      .mockResolvedValueOnce({
        status: 200,
        headers: { 'x-payment-receipt': '0xReceipt' },
        data: { ok: true },
      });
    mockExecuteKitePassportRequest.mockResolvedValue({
      status: 200,
      data: { ok: true },
      walletAddress: '0xPayer',
      raw: {},
    });

    const result = await paidFetch({
      url: 'https://example.com/scout',
      method: 'POST',
      body: { opponent: 'Liverpool' },
      maxAmountUsdc: 0.005,
    });

    expect(result.status).toBe(200);
    expect(mockExecuteKitePassportRequest).toHaveBeenCalledWith({
      url: 'https://example.com/scout',
      method: 'POST',
      headers: expect.objectContaining({ Accept: 'application/json' }),
      body: { opponent: 'Liverpool' },
    });
    expect(result.payment).toMatchObject({
      payer: '0xPayer',
      payee: '0xPayTo',
      amount: '5000000000000000',
    });
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
