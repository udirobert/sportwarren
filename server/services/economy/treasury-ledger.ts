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
      },
    }),
  ]);

  return {
    treasury: updatedTreasury,
    transaction,
  };
}
