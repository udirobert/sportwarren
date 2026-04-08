import type { Prisma, PrismaClient } from '@prisma/client';

const DEFAULT_BUDGETS = {
  wages: 0,
  transfers: 0,
  facilities: 0,
};

export class TreasuryBalanceError extends Error {
  constructor(message = 'Insufficient treasury balance') {
    super(message);
    this.name = 'TreasuryBalanceError';
  }
}

export class TreasuryReconciliationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TreasuryReconciliationError';
  }
}

interface PostTreasuryLedgerEntryInput {
  prisma: PrismaClient;
  squadId: string;
  amountDelta: number;
  type: 'income' | 'expense';
  category: string;
  description?: string | null;
  verified?: boolean;
  txHash?: string | null;
  metadata?: unknown;
}

type TreasuryStore = PrismaClient | Prisma.TransactionClient;

interface PostTreasuryLedgerEntryResult {
  treasury: Awaited<ReturnType<typeof ensureSquadTreasury>>;
  transaction: {
    id: string;
    treasuryId: string;
    type: string;
    category: string;
    amount: number;
    description: string | null;
    txHash: string | null;
    verified: boolean;
    createdAt: Date;
  };
  duplicate?: boolean;
}

function toMetadataRecord(metadata: unknown): Record<string, unknown> {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return {};
  }

  return metadata as Record<string, unknown>;
}

export async function ensureSquadTreasury(prisma: TreasuryStore, squadId: string) {
  const existing = await prisma.squadTreasury.findUnique({
    where: { squadId },
  });

  if (existing) {
    return existing;
  }

  const squad = await prisma.squad.findUnique({
    where: { id: squadId },
    select: { treasuryBalance: true },
  });

  return prisma.squadTreasury.create({
    data: {
      squadId,
      balance: squad?.treasuryBalance ?? 0,
      budgets: DEFAULT_BUDGETS,
    },
  });
}

export async function postTreasuryLedgerEntry({
  prisma,
  squadId,
  amountDelta,
  type,
  category,
  description,
  verified = true,
  txHash,
  metadata,
}: PostTreasuryLedgerEntryInput) {
  const treasury = await ensureSquadTreasury(prisma, squadId);

  if (treasury.balance + amountDelta < 0) {
    throw new TreasuryBalanceError();
  }

  const [updatedTreasury, , transaction] = await prisma.$transaction([
    prisma.squadTreasury.update({
      where: { id: treasury.id },
      data: { balance: { increment: amountDelta } },
    }),
    prisma.squad.update({
      where: { id: squadId },
      data: { treasuryBalance: { increment: amountDelta } },
    }),
    prisma.treasuryTransaction.create({
      data: {
        treasuryId: treasury.id,
        type,
        category,
        amount: Math.abs(amountDelta),
        description: description ?? undefined,
        verified,
        txHash: txHash ?? undefined,
        metadata: metadata ?? undefined,
      },
    }),
  ]);

  return {
    treasury: updatedTreasury,
    transaction,
  };
}

export async function postTreasuryLedgerEntryOnce(
  input: PostTreasuryLedgerEntryInput,
): Promise<PostTreasuryLedgerEntryResult> {
  if (!input.txHash) {
    return postTreasuryLedgerEntry(input);
  }

  const existing = await input.prisma.treasuryTransaction.findFirst({
    where: {
      txHash: input.txHash,
      type: input.type,
      category: input.category,
      amount: Math.abs(input.amountDelta),
      treasury: {
        squadId: input.squadId,
      },
    },
  });

  if (existing) {
    return {
      treasury: await ensureSquadTreasury(input.prisma, input.squadId),
      transaction: existing,
      duplicate: true,
    };
  }

  return postTreasuryLedgerEntry(input);
}

interface RecordPendingTreasuryActivityInput {
  prisma: TreasuryStore;
  squadId: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description?: string | null;
  txHash?: string | null;
  metadata?: unknown;
}

export async function recordPendingTreasuryActivity({
  prisma,
  squadId,
  type,
  category,
  amount,
  description,
  txHash,
  metadata,
}: RecordPendingTreasuryActivityInput) {
  const treasury = await ensureSquadTreasury(prisma, squadId);

  const existing = txHash
    ? await prisma.treasuryTransaction.findFirst({
        where: {
          treasuryId: treasury.id,
          txHash,
          category,
          type,
          amount,
        },
      })
    : null;

  if (existing) {
    return {
      treasury,
      transaction: existing,
      duplicate: true,
    };
  }

  const transaction = await prisma.treasuryTransaction.create({
    data: {
      treasuryId: treasury.id,
      type,
      category,
      amount,
      description: description ?? undefined,
      txHash: txHash ?? undefined,
      verified: false,
      metadata: metadata ?? undefined,
    },
  });

  return {
    treasury,
    transaction,
    duplicate: false,
  };
}

interface ReconcilePendingTreasuryTransactionInput {
  prisma: PrismaClient;
  squadId: string;
  transactionId: string;
  reconciledByUserId: string;
  settledTxHash?: string | null;
}

interface SettlePendingTreasuryActivityInput {
  prisma: PrismaClient;
  squadId: string;
  transactionId: string;
  settledByUserId: string;
  settledTxHash?: string | null;
  expectedType?: 'income' | 'expense';
  expectedCategory?: string;
  nextCategory?: string;
  metadataPatch?: Record<string, unknown>;
}

interface CancelPendingTreasuryActivityInput {
  prisma: TreasuryStore;
  squadId: string;
  transactionId: string;
  expectedType?: 'income' | 'expense';
  expectedCategory?: string;
}

function buildPendingTreasuryErrorMessage(
  expectedType?: 'income' | 'expense',
  expectedCategory?: string,
) {
  if (!expectedType && !expectedCategory) {
    return 'This treasury transaction cannot be settled through this flow.';
  }

  const expectedLabel = [
    expectedType,
    expectedCategory,
  ].filter(Boolean).join(' ');

  return `Only pending ${expectedLabel} treasury activity can be settled through this flow.`;
}

export async function settlePendingTreasuryActivity({
  prisma,
  squadId,
  transactionId,
  settledByUserId,
  settledTxHash,
  expectedType,
  expectedCategory,
  nextCategory,
  metadataPatch,
}: SettlePendingTreasuryActivityInput) {
  const pendingTransaction = await prisma.treasuryTransaction.findFirst({
    where: {
      id: transactionId,
      treasury: {
        squadId,
      },
    },
    include: {
      treasury: true,
    },
  });

  if (!pendingTransaction) {
    throw new TreasuryReconciliationError('Pending treasury transaction not found for this squad.');
  }

  if (
    (expectedType && pendingTransaction.type !== expectedType)
    || (expectedCategory && pendingTransaction.category !== expectedCategory)
  ) {
    throw new TreasuryReconciliationError(
      buildPendingTreasuryErrorMessage(expectedType, expectedCategory)
    );
  }

  if (pendingTransaction.verified) {
    return {
      treasury: pendingTransaction.treasury,
      transaction: pendingTransaction,
      duplicate: true,
    };
  }

  const amountDelta = pendingTransaction.type === 'income'
    ? pendingTransaction.amount
    : -pendingTransaction.amount;

  if (pendingTransaction.treasury.balance + amountDelta < 0) {
    throw new TreasuryBalanceError();
  }

  const nextTxHash = settledTxHash?.trim() || pendingTransaction.txHash || undefined;
  const nextMetadata = {
    ...toMetadataRecord(pendingTransaction.metadata),
    reconciledAt: new Date().toISOString(),
    reconciledByUserId: settledByUserId,
    settledTxHash: nextTxHash ?? null,
    ...(metadataPatch ?? {}),
  };

  const [updatedTreasury, , updatedTransaction] = await prisma.$transaction([
    prisma.squadTreasury.update({
      where: { id: pendingTransaction.treasuryId },
      data: {
        balance: { increment: amountDelta },
      },
    }),
    prisma.squad.update({
      where: { id: squadId },
      data: {
        treasuryBalance: { increment: amountDelta },
      },
    }),
    prisma.treasuryTransaction.update({
      where: { id: pendingTransaction.id },
      data: {
        category: nextCategory ?? pendingTransaction.category,
        verified: true,
        txHash: nextTxHash,
        metadata: nextMetadata,
      },
    }),
  ]);

  return {
    treasury: updatedTreasury,
    transaction: updatedTransaction,
    duplicate: false,
  };
}

export async function cancelPendingTreasuryActivity({
  prisma,
  squadId,
  transactionId,
  expectedType,
  expectedCategory,
}: CancelPendingTreasuryActivityInput) {
  const pendingTransaction = await prisma.treasuryTransaction.findFirst({
    where: {
      id: transactionId,
      treasury: {
        squadId,
      },
    },
    include: {
      treasury: true,
    },
  });

  if (!pendingTransaction) {
    throw new TreasuryReconciliationError('Pending treasury transaction not found for this squad.');
  }

  if (
    (expectedType && pendingTransaction.type !== expectedType)
    || (expectedCategory && pendingTransaction.category !== expectedCategory)
  ) {
    throw new TreasuryReconciliationError(
      buildPendingTreasuryErrorMessage(expectedType, expectedCategory)
    );
  }

  if (pendingTransaction.verified) {
    return {
      treasury: pendingTransaction.treasury,
      transaction: pendingTransaction,
      duplicate: true,
    };
  }

  await prisma.treasuryTransaction.delete({
    where: { id: pendingTransaction.id },
  });

  return {
    treasury: pendingTransaction.treasury,
    transaction: pendingTransaction,
    duplicate: false,
  };
}

export async function reconcilePendingTreasuryTransaction({
  prisma,
  squadId,
  transactionId,
  reconciledByUserId,
  settledTxHash,
}: ReconcilePendingTreasuryTransactionInput) {
  return settlePendingTreasuryActivity({
    prisma,
    squadId,
    transactionId,
    settledByUserId: reconciledByUserId,
    settledTxHash,
    expectedType: 'income',
    expectedCategory: 'deposit_pending',
  });
}

/**
 * Automates match rewards distribution from a squad treasury
 */
export async function distributeMatchRewards({
  prisma,
  squadId,
  matchId,
  isWinner,
  isDraw,
  playerStats, // Array of { userId, goals, assists, etc }
  hasKeeper = true,
}: {
  prisma: PrismaClient;
  squadId: string;
  matchId: string;
  isWinner: boolean;
  isDraw: boolean;
  playerStats: any[];
  hasKeeper?: boolean;
}) {
  const prizePool = isWinner ? 500 : isDraw ? 200 : 50;
  let finalPrizePool = prizePool;

  // Squad Clean Sheet Bonus: 100 extra if rotating keeper (hasKeeper = false)
  // We'll calculate if it's a clean sheet by checking opponentScore later in the workflow,
  // but for now we'll allow it to be passed in or calculated.
  const description = `Match Reward for Match #${matchId.slice(-6)} (${isWinner ? 'WIN' : isDraw ? 'DRAW' : 'LOSS'})`;

  // 1. Record the Income to the Treasury (e.g., from the league prize pool)
  await postTreasuryLedgerEntry({
    prisma,
    squadId,
    amountDelta: finalPrizePool,
    type: 'income',
    category: 'prize_money',
    description,
  });

  // 2. Automate "Match Appearance Fees" and "Goal Bonuses" to Players
  // This simulates a DAO-approved policy for rewarding performance
  for (const stats of playerStats) {
    const appearanceFee = 20;
    const goalBonus = (stats.goals || 0) * 50;
    const totalBonus = appearanceFee + goalBonus;

    if (totalBonus > 0) {
      await postTreasuryLedgerEntry({
        prisma,
        squadId,
        amountDelta: -totalBonus,
        type: 'expense',
        category: 'wages',
        description: `Performance Bonus: ${stats.goals || 0} goals + Appearance Fee for #${matchId.slice(-6)}`,
      });

      // In a real implementation, this would trigger an actual on-chain payout
      // via the Yellow Network or a Smart Contract disbursement.
    }
  }

  return { success: true, prizePool };
}
