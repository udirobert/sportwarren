import type { PrismaClient } from '@prisma/client';
import { verifyTonTopUpTransfer } from '../blockchain/ton.js';
import { reconcilePendingTreasuryTransaction } from './treasury-ledger.js';
import type { TelegramService } from '../communication/telegram.js';

const DEFAULT_POLL_INTERVAL_MS = 60_000;
const MIN_AGE_BEFORE_RETRY_MS = 30_000;
const MAX_AGE_MS = 24 * 60 * 60 * 1000;
const MAX_RETRY_ATTEMPTS = 48;

interface PendingDeposit {
  id: string;
  treasuryId: string;
  amount: number;
  txHash: string | null;
  metadata: unknown;
  createdAt: Date;
  treasury: {
    squadId: string;
    tonWalletAddress: string | null;
  };
}

function getRecordValue(record: unknown, key: string): string | undefined {
  if (!record || typeof record !== 'object' || Array.isArray(record)) {
    return undefined;
  }
  const value = (record as Record<string, unknown>)[key];
  return typeof value === 'string' && value.trim() ? value : undefined;
}

function getRecordNumber(record: unknown, key: string): number | undefined {
  if (!record || typeof record !== 'object' || Array.isArray(record)) {
    return undefined;
  }
  const value = (record as Record<string, unknown>)[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function getRetryCount(metadata: unknown): number {
  const count = getRecordNumber(metadata, 'settlementRetryCount');
  return count ?? 0;
}

export class TonSettlementWorker {
  private prisma: PrismaClient;
  private telegramService: TelegramService | null;
  private intervalHandle: ReturnType<typeof setInterval> | null = null;
  private running = false;
  private pollIntervalMs: number;

  constructor(prisma: PrismaClient, telegramService: TelegramService | null = null) {
    this.prisma = prisma;
    this.telegramService = telegramService;
    const envInterval = Number(process.env.TON_SETTLEMENT_POLL_INTERVAL_MS);
    this.pollIntervalMs = Number.isFinite(envInterval) && envInterval >= 15_000
      ? envInterval
      : DEFAULT_POLL_INTERVAL_MS;
  }

  start(): void {
    if (this.intervalHandle) {
      return;
    }

    console.log(`⏱️ TON settlement worker started (poll every ${this.pollIntervalMs / 1000}s)`);
    this.intervalHandle = setInterval(() => {
      this.tick().catch((error) => {
        console.error('TON settlement worker tick failed:', error);
      });
    }, this.pollIntervalMs);
  }

  stop(): void {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
      console.log('⏱️ TON settlement worker stopped');
    }
  }

  async tick(): Promise<{ checked: number; settled: number }> {
    if (this.running) {
      return { checked: 0, settled: 0 };
    }

    this.running = true;
    let checked = 0;
    let settled = 0;

    try {
      const pendingDeposits = await this.fetchPendingDeposits();

      for (const deposit of pendingDeposits) {
        checked++;
        const result = await this.trySettle(deposit);
        if (result) {
          settled++;
        }
      }
    } catch (error) {
      console.error('TON settlement worker error:', error);
    } finally {
      this.running = false;
    }

    if (checked > 0) {
      console.log(`⏱️ TON settlement tick: checked=${checked} settled=${settled}`);
    }

    return { checked, settled };
  }

  private async fetchPendingDeposits(): Promise<PendingDeposit[]> {
    const cutoff = new Date(Date.now() - MAX_AGE_MS);

    return this.prisma.treasuryTransaction.findMany({
      where: {
        category: 'deposit_pending',
        type: 'income',
        verified: false,
        createdAt: { gte: cutoff },
      },
      include: {
        treasury: {
          select: {
            squadId: true,
            tonWalletAddress: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
      take: 50,
    }) as unknown as PendingDeposit[];
  }

  private async trySettle(deposit: PendingDeposit): Promise<boolean> {
    const metadata = deposit.metadata;
    const retryCount = getRetryCount(metadata);

    if (retryCount >= MAX_RETRY_ATTEMPTS) {
      return false;
    }

    const depositAddress = deposit.treasury.tonWalletAddress
      || getRecordValue(metadata, 'depositAddress')
      || (process.env.TON_TREASURY_WALLET_ADDRESS?.trim() || null);

    if (!depositAddress) {
      return false;
    }

    const ageMs = Date.now() - deposit.createdAt.getTime();
    if (ageMs < MIN_AGE_BEFORE_RETRY_MS) {
      return false;
    }

    try {
      const verification = await verifyTonTopUpTransfer({
        boc: getRecordValue(metadata, 'boc'),
        messageHash: getRecordValue(metadata, 'messageHash') || deposit.txHash || undefined,
        transactionHash: getRecordValue(metadata, 'settledTxHash'),
        expectedDestinationAddress: depositAddress,
        expectedAmountTon: getRecordNumber(metadata, 'amountTon') ?? deposit.amount,
        expectedSenderAddress: getRecordValue(metadata, 'senderAddress'),
      });

      if (!verification.confirmed) {
        await this.incrementRetryCount(deposit, retryCount);
        return false;
      }

      const result = await reconcilePendingTreasuryTransaction({
        prisma: this.prisma,
        squadId: deposit.treasury.squadId,
        transactionId: deposit.id,
        reconciledByUserId: 'system:ton-settlement-worker',
        settledTxHash: verification.transactionHash ?? deposit.txHash ?? undefined,
      });

      if (!result.duplicate) {
        await this.notifySettlement(deposit, verification.transactionHash);
      }

      return true;
    } catch (error) {
      console.warn(`TON settlement retry failed for ${deposit.id}:`, error instanceof Error ? error.message : error);
      await this.incrementRetryCount(deposit, retryCount);
      return false;
    }
  }

  private async incrementRetryCount(deposit: PendingDeposit, currentCount: number): Promise<void> {
    const metadata = (deposit.metadata && typeof deposit.metadata === 'object' && !Array.isArray(deposit.metadata))
      ? deposit.metadata as Record<string, unknown>
      : {};

    await this.prisma.treasuryTransaction.update({
      where: { id: deposit.id },
      data: {
        metadata: {
          ...metadata,
          settlementRetryCount: currentCount + 1,
          lastRetryAt: new Date().toISOString(),
        },
      },
    });
  }

  private async notifySettlement(deposit: PendingDeposit, txHash: string | null | undefined): Promise<void> {
    if (!this.telegramService) {
      return;
    }

    try {
      const connections = await this.prisma.platformConnection.findMany({
        where: {
          platform: 'telegram',
          status: 'connected',
          squadId: deposit.treasury.squadId,
        },
        select: { chatId: true, squad: { select: { name: true } } },
      });

      const txLabel = txHash ? `${txHash.slice(0, 8)}...${txHash.slice(-4)}` : 'pending';

      for (const connection of connections) {
        if (!connection.chatId) continue;

        const squadName = connection.squad?.name || 'Your squad';
        const message = [
          `✅ TON Top-Up Settled`,
          '',
          `${squadName} treasury +${deposit.amount} TON`,
          `TX: ${txLabel}`,
          '',
          'The deposit has been verified on-chain and your squad balance is updated.',
        ].join('\n');

        await this.telegramService!.sendMatchNotification(connection.chatId, message);
      }
    } catch (error) {
      console.warn('Failed to send TON settlement notification:', error instanceof Error ? error.message : error);
    }
  }
}
