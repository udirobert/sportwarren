import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockAxiosPost = vi.hoisted(() => vi.fn());

vi.mock('axios', () => ({
  default: {
    post: mockAxiosPost,
    request: vi.fn(),
  },
}));

import {
  settleWithFacilitator,
  type PaymentEnvelope,
  type PaymentRequirements,
} from '@/server/services/blockchain/x402-client';

const envelope: PaymentEnvelope = {
  x402Version: 2,
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
};

const requirements: PaymentRequirements = {
  x402Version: 2,
  scheme: 'gokite-aa',
  network: 'kite-testnet',
  maxAmountRequired: '500000',
  amount: '500000',
  asset: '0xUSDC',
  payTo: '0xPayTo',
  maxTimeoutSeconds: 300,
  resource: '/api/x402/scout',
  description: 'SportWarren Scout',
};

describe('x402 client settlement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.KITE_X402_SIMULATE;
    delete process.env.KITE_X402_VERSION;
  });

  it('defaults Kite/Pieverse settlement to the v1 gokite-aa body', async () => {
    mockAxiosPost.mockResolvedValue({
      status: 200,
      data: { success: true, txHash: '0xTxHash' },
    });

    const result = await settleWithFacilitator(
      { ...envelope, x402Version: undefined },
      { ...requirements, x402Version: undefined },
    );

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
          payload: {
            authorization: envelope.authorization,
            signature: '0xSig',
            asset: '0xUSDC',
          },
        }),
        paymentRequirements: expect.objectContaining({
          scheme: 'gokite-aa',
          network: 'kite-testnet',
          maxAmountRequired: '500000',
          asset: '0xUSDC',
        }),
      }),
      expect.objectContaining({ timeout: 10_000 }),
    );
  });

  it('posts the v2 canonical settlement body to the facilitator when requested', async () => {
    process.env.KITE_X402_VERSION = '2';
    mockAxiosPost.mockResolvedValue({
      status: 200,
      data: { success: true, txHash: '0xTxHash' },
    });

    const result = await settleWithFacilitator(envelope, requirements);

    expect(result.success).toBe(true);
    expect(result.txHash).toBe('0xTxHash');
    expect(mockAxiosPost).toHaveBeenCalledWith(
      expect.stringMatching(/\/v2\/settle$/),
      expect.objectContaining({
        x402Version: 2,
        paymentPayload: expect.objectContaining({
          x402Version: 2,
          accepted: expect.objectContaining({
            scheme: 'gokite-aa',
            amount: '500000',
            payTo: '0xPayTo',
          }),
          payload: {
            authorization: envelope.authorization,
            signature: '0xSig',
          },
        }),
        paymentRequirements: expect.objectContaining({
          amount: '500000',
          asset: '0xUSDC',
        }),
      }),
      expect.objectContaining({ timeout: 10_000 }),
    );
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
