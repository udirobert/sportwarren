import { describe, expect, it, vi } from 'vitest';
import {
  reconcilePendingTreasuryTransaction,
  TreasuryReconciliationError,
} from '../../server/services/economy/treasury-ledger';

function createPrismaStub(overrides?: {
  pendingTransaction?: any;
}) {
  const pendingTransaction = overrides?.pendingTransaction ?? {
    id: 'tx_1',
    treasuryId: 'treasury_1',
    type: 'income',
    category: 'deposit_pending',
    amount: 12,
    description: 'TON top-up',
    txHash: 'signed-boc-hash',
    verified: false,
    metadata: {
      source: 'telegram-mini-app',
      senderAddress: 'EQCsender',
    },
    treasury: {
      id: 'treasury_1',
      squadId: 'squad_1',
      balance: 30,
    },
  };

  const squadTreasuryUpdate = vi.fn().mockImplementation(async ({ data }: any) => ({
    ...pendingTransaction.treasury,
    balance: pendingTransaction.treasury.balance + data.balance.increment,
  }));
  const squadUpdate = vi.fn().mockResolvedValue({ id: 'squad_1' });
  const transactionUpdate = vi.fn().mockImplementation(async ({ data }: any) => ({
    ...pendingTransaction,
    ...data,
    txHash: data.txHash ?? pendingTransaction.txHash,
    metadata: data.metadata,
  }));

  return {
    prisma: {
      treasuryTransaction: {
        findFirst: vi.fn().mockResolvedValue(pendingTransaction),
        update: transactionUpdate,
      },
      squadTreasury: {
        update: squadTreasuryUpdate,
      },
      squad: {
        update: squadUpdate,
      },
      $transaction: vi.fn(async (operations: Array<Promise<unknown>>) => Promise.all(operations)),
    } as any,
    squadTreasuryUpdate,
    squadUpdate,
    transactionUpdate,
  };
}

describe('reconcilePendingTreasuryTransaction', () => {
  it('marks a pending TON top-up verified and increments treasury balance', async () => {
    const { prisma, squadTreasuryUpdate, squadUpdate, transactionUpdate } = createPrismaStub();

    const result = await reconcilePendingTreasuryTransaction({
      prisma,
      squadId: 'squad_1',
      transactionId: 'tx_1',
      reconciledByUserId: 'user_1',
      settledTxHash: 'ton-chain-hash',
    });

    expect(squadTreasuryUpdate).toHaveBeenCalledWith({
      where: { id: 'treasury_1' },
      data: {
        balance: { increment: 12 },
      },
    });
    expect(squadUpdate).toHaveBeenCalledWith({
      where: { id: 'squad_1' },
      data: {
        treasuryBalance: { increment: 12 },
      },
    });
    expect(transactionUpdate).toHaveBeenCalled();
    expect(result.duplicate).toBe(false);
    expect(result.treasury.balance).toBe(42);
    expect(result.transaction.verified).toBe(true);
    expect(result.transaction.txHash).toBe('ton-chain-hash');
    expect((result.transaction.metadata as Record<string, unknown>).reconciledByUserId).toBe('user_1');
  });

  it('returns duplicate when the pending top-up was already reconciled', async () => {
    const { prisma, squadTreasuryUpdate, squadUpdate, transactionUpdate } = createPrismaStub({
      pendingTransaction: {
        id: 'tx_2',
        treasuryId: 'treasury_1',
        type: 'income',
        category: 'deposit_pending',
        amount: 8,
        description: 'Already reconciled',
        txHash: 'existing-hash',
        verified: true,
        metadata: {},
        treasury: {
          id: 'treasury_1',
          squadId: 'squad_1',
          balance: 50,
        },
      },
    });

    const result = await reconcilePendingTreasuryTransaction({
      prisma,
      squadId: 'squad_1',
      transactionId: 'tx_2',
      reconciledByUserId: 'user_1',
    });

    expect(result.duplicate).toBe(true);
    expect(squadTreasuryUpdate).not.toHaveBeenCalled();
    expect(squadUpdate).not.toHaveBeenCalled();
    expect(transactionUpdate).not.toHaveBeenCalled();
  });

  it('rejects non-pending treasury transactions', async () => {
    const { prisma } = createPrismaStub({
      pendingTransaction: {
        id: 'tx_3',
        treasuryId: 'treasury_1',
        type: 'income',
        category: 'deposit',
        amount: 8,
        description: 'Standard deposit',
        txHash: 'hash',
        verified: false,
        metadata: {},
        treasury: {
          id: 'treasury_1',
          squadId: 'squad_1',
          balance: 50,
        },
      },
    });

    await expect(reconcilePendingTreasuryTransaction({
      prisma,
      squadId: 'squad_1',
      transactionId: 'tx_3',
      reconciledByUserId: 'user_1',
    })).rejects.toBeInstanceOf(TreasuryReconciliationError);
  });
});
