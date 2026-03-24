import { describe, expect, it } from 'vitest';
import { Wallet } from 'ethers';
import { generateAuthMessage, verifyWalletSignature } from '@/lib/auth/wallet';

describe('wallet auth verification', () => {
  it('verifies social embedded wallet signatures as EVM auth', async () => {
    const wallet = new Wallet('0x59c6995e998f97a5a0044966f0945382db7f4a9d94f93f3c2878d8c4d8d8f0f1');
    const { message, timestamp } = generateAuthMessage();
    const signature = await wallet.signMessage(message);

    const result = await verifyWalletSignature({
      address: wallet.address,
      chain: 'social',
      signature,
      message,
      timestamp,
    });

    expect(result.verified).toBe(true);
  });
});
