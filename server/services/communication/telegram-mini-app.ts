import type { PrismaClient } from '@prisma/client';
import {
  ensureSquadTreasury,
  recordPendingTreasuryActivity,
  reconcilePendingTreasuryTransaction,
} from '../economy/treasury-ledger';
import { computeTonMessageHashFromBoc, verifyTonTopUpTransfer } from '../blockchain/ton';
import { findTelegramMiniAppConnectionByToken } from './platform-connections';

const TON_TOP_UP_PRESETS = [1, 2, 5, 10];

function getDefaultTonTreasuryAddress(): string | null {
  const value = process.env.TON_TREASURY_WALLET_ADDRESS?.trim();
  return value || null;
}

function formatWalletLabel(address: string): string {
  if (address.length <= 10) {
    return address;
  }

  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export interface TelegramMiniAppContext {
  squadId: string;
  squadName: string;
  chatId: string | null;
  treasury: {
    balance: number;
    currency: string;
    pendingTopUps: number;
    recentTransactions: Array<{
      id: string;
      type: string;
      category: string;
      amount: number;
      description: string | null;
      createdAt: string;
      verified: boolean;
    }>;
  };
  ton: {
    enabled: boolean;
    walletAddress: string | null;
    presets: number[];
  };
}

export interface RecordTelegramTonTopUpInput {
  token: string;
  senderAddress: string;
  amountTon: number;
  boc: string;
  comment: string;
}

export async function getTelegramMiniAppContext(
  prisma: PrismaClient,
  token: string
): Promise<TelegramMiniAppContext | null> {
  const connection = await findTelegramMiniAppConnectionByToken(prisma, token);
  if (!connection?.squadId || !connection.squad) {
    return null;
  }

  const treasury = connection.squad.treasury ?? await ensureSquadTreasury(prisma, connection.squadId);
  const tonWalletAddress = treasury.tonWalletAddress ?? getDefaultTonTreasuryAddress();
  const recentTransactions = await prisma.treasuryTransaction.findMany({
    where: { treasuryId: treasury.id },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });
  const pendingTopUps = recentTransactions.filter(
    (transaction) => transaction.category === 'deposit_pending' && !transaction.verified
  ).length;

  return {
    squadId: connection.squadId,
    squadName: connection.squad.name,
    chatId: connection.chatId,
    treasury: {
      balance: treasury.balance,
      currency: treasury.tonWalletAddress || tonWalletAddress ? 'TON' : 'ALGO',
      pendingTopUps,
      recentTransactions: recentTransactions.map((transaction) => ({
        id: transaction.id,
        type: transaction.type,
        category: transaction.category,
        amount: transaction.amount,
        description: transaction.description,
        createdAt: transaction.createdAt.toISOString(),
        verified: transaction.verified,
      })),
    },
    ton: {
      enabled: Boolean(tonWalletAddress),
      walletAddress: tonWalletAddress,
      presets: TON_TOP_UP_PRESETS,
    },
  };
}

export async function recordTelegramTonTopUp(
  prisma: PrismaClient,
  input: RecordTelegramTonTopUpInput
) {
  const connection = await findTelegramMiniAppConnectionByToken(prisma, input.token);
  if (!connection?.squadId) {
    throw new Error('That Telegram Mini App session expired. Re-open it from Telegram and try again.');
  }

  const treasury = await ensureSquadTreasury(prisma, connection.squadId);
  const tonWalletAddress = treasury.tonWalletAddress ?? getDefaultTonTreasuryAddress();

  if (!tonWalletAddress) {
    throw new Error('TON treasury top-ups are not configured for this squad yet.');
  }

  const messageHash = computeTonMessageHashFromBoc(input.boc);
  const pendingResult = await recordPendingTreasuryActivity({
    prisma,
    squadId: connection.squadId,
    type: 'income',
    category: 'deposit_pending',
    amount: Math.round(input.amountTon),
    description: `TON top-up submitted via Telegram Mini App from ${formatWalletLabel(input.senderAddress)}`,
    txHash: messageHash,
    metadata: {
      source: 'telegram-mini-app',
      senderAddress: input.senderAddress,
      depositAddress: tonWalletAddress,
      amountTon: input.amountTon,
      comment: input.comment,
      boc: input.boc,
      messageHash,
      linkedChatId: connection.chatId,
      platformConnectionId: connection.id,
    },
  });

  try {
    const verification = await verifyTonTopUpTransfer({
      boc: input.boc,
      expectedDestinationAddress: tonWalletAddress,
      expectedAmountTon: input.amountTon,
      expectedSenderAddress: input.senderAddress,
    });

    if (!verification.confirmed) {
      return pendingResult;
    }

    return reconcilePendingTreasuryTransaction({
      prisma,
      squadId: connection.squadId,
      transactionId: pendingResult.transaction.id,
      reconciledByUserId: 'system:ton-verifier',
      settledTxHash: verification.transactionHash ?? messageHash,
    });
  } catch (error) {
    console.warn('TON top-up verification deferred:', error instanceof Error ? error.message : error);
    return pendingResult;
  }
}
