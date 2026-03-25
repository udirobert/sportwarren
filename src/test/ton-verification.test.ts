import { afterEach, describe, expect, it, vi } from 'vitest';
import { beginCell } from '@ton/core';
import {
  computeTonMessageHashFromBoc,
  verifyTonTopUpTransfer,
} from '../server/services/blockchain/ton';

const senderAddress = `0:${'11'.repeat(32)}`;
const destinationAddress = `0:${'22'.repeat(32)}`;

describe('TON top-up verification', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('computes a deterministic TON message hash from a BOC', () => {
    const cell = beginCell().storeUint(42, 32).endCell();
    const boc = cell.toBoc().toString('base64');

    expect(computeTonMessageHashFromBoc(boc)).toBe(cell.hash().toString('hex'));
  });

  it('confirms a TON transfer from the message hash lookup', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({
        transactions: [
          {
            account: senderAddress,
            description: {
              aborted: false,
              action: { success: true },
              compute_ph: { success: true },
            },
            out_msgs: [
              {
                source: senderAddress,
                destination: destinationAddress,
                value: '5000000000',
                out_msg_tx_hash: 'recipient_tx_hash',
              },
            ],
          },
        ],
      }), { status: 200 }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const result = await verifyTonTopUpTransfer({
      messageHash: 'external_message_hash',
      expectedDestinationAddress: destinationAddress,
      expectedAmountTon: 5,
      expectedSenderAddress: senderAddress,
    });

    expect(result.confirmed).toBe(true);
    expect(result.lookup).toBe('message');
    expect(result.transactionHash).toBe('recipient_tx_hash');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain('/transactionsByMessage');
  });

  it('falls back to transaction hash verification when the message lookup has not indexed yet', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ transactions: [] }), { status: 200 }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({
          transactions: [
            {
              hash: 'recipient_tx_hash',
              account: destinationAddress,
              description: {
                aborted: false,
                action: { success: true },
                compute_ph: { success: true },
              },
              in_msg: {
                source: senderAddress,
                destination: destinationAddress,
                value: '2000000000',
              },
            },
          ],
        }), { status: 200 }),
      );
    vi.stubGlobal('fetch', fetchMock);

    const result = await verifyTonTopUpTransfer({
      messageHash: 'external_message_hash',
      transactionHash: 'recipient_tx_hash',
      expectedDestinationAddress: destinationAddress,
      expectedAmountTon: 2,
      expectedSenderAddress: senderAddress,
    });

    expect(result.confirmed).toBe(true);
    expect(result.lookup).toBe('transaction');
    expect(result.transactionHash).toBe('recipient_tx_hash');
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(String(fetchMock.mock.calls[1]?.[0])).toContain('/transactions?');
  });
});
