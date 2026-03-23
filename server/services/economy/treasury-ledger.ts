import type { PrismaClient } from '@prisma/client';

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

export async function ensureSquadTreasury(prisma: PrismaClient, squadId: string) {
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
  prisma: PrismaClient;
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
}: {
  prisma: PrismaClient;
  squadId: string;
  matchId: string;
  isWinner: boolean;
  isDraw: boolean;
  playerStats: any[];
}) {
  const prizePool = isWinner ? 500 : isDraw ? 200 : 50;
  const description = `Match Reward for Match #${matchId.slice(-6)} (${isWinner ? 'WIN' : isDraw ? 'DRAW' : 'LOSS'})`;

  // 1. Record the Income to the Treasury (e.g., from the league prize pool)
  await postTreasuryLedgerEntry({
    prisma,
    squadId,
    amountDelta: prizePool,
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
