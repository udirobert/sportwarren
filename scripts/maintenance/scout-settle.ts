import { PrismaClient } from '@prisma/client';
import { redisService } from '../../src/server/services/redis.js';
import { createPlatformSettlement } from '../../src/server/services/blockchain/x402-client.js';

const prisma = new PrismaClient();

const LOCK_KEY = 'maintenance:scout-settle:lock';
const LOCK_TTL = 60;
const BATCH_SIZE = 20;
const MAX_ATTEMPTS = 3;
const PER_JOB_TIMEOUT_MS = 10_000;
const CUTOFF_HOURS = 24;

function timeoutAfter<T>(ms: number): Promise<T> {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`settlement timed out after ${ms}ms`)), ms),
  );
}

async function main() {
  console.log('[Maintenance] Starting scout settlement runner...');
  
  const acquired = await redisService.trySet(LOCK_KEY, '1', LOCK_TTL);
  if (!acquired) {
    console.log('[Maintenance] Skipping: lock already held.');
    return;
  }

  try {
    const results = await drainQueue();
    console.log('[Maintenance] Scout settlement complete:', results);
  } catch (error) {
    console.error('[Maintenance] Scout settlement runner failed:', error);
    process.exit(1);
  } finally {
    await redisService.del(LOCK_KEY);
  }
}

async function drainQueue() {
  const cutoff = new Date(Date.now() - CUTOFF_HOURS * 3600 * 1000);
  const pending = await prisma.attestation.findMany({
    where: {
      kind: 'scout_report',
      settlementStatus: 'pending',
      settlementAttempts: { lt: MAX_ATTEMPTS },
      createdAt: { gt: cutoff },
    },
    take: BATCH_SIZE,
    orderBy: { createdAt: 'asc' },
  });

  const results = { attempted: 0, settled: 0, failed: 0, retried: 0, expired: 0 };

  for (const attestation of pending) {
    results.attempted++;
    try {
      const settlement = await Promise.race([
        createPlatformSettlement(attestation.amountUsdc ?? 0),
        timeoutAfter<any>(PER_JOB_TIMEOUT_MS),
      ]);

      if (settlement.success && !settlement.simulated && settlement.txHash) {
        await prisma.attestation.update({
          where: { id: attestation.id },
          data: {
            txHash: settlement.txHash,
            facilitator: settlement.facilitator,
            settlementStatus: 'settled',
            settledAt: new Date(),
            settlementAttempts: { increment: 1 },
            settlementError: null,
          },
        });
        results.settled++;
        await sendSettlementNotification(attestation.id, settlement.txHash).catch(
          (e) => console.warn('[Maintenance] notification failed', e),
        );
      } else {
        const attempts = attestation.settlementAttempts + 1;
        const status = attempts >= MAX_ATTEMPTS ? 'failed' : 'pending';
        await prisma.attestation.update({
          where: { id: attestation.id },
          data: {
            settlementAttempts: { increment: 1 },
            settlementStatus: status,
            settlementError: settlement.error ?? 'settlement returned without txHash',
          },
        });
        results[status === 'failed' ? 'failed' : 'retried']++;
      }
    } catch (err) {
      const attempts = attestation.settlementAttempts + 1;
      const status = attempts >= MAX_ATTEMPTS ? 'failed' : 'pending';
      await prisma.attestation.update({
        where: { id: attestation.id },
        data: {
          settlementAttempts: { increment: 1 },
          settlementStatus: status,
          settlementError: (err as Error).message,
        },
      });
      results[status === 'failed' ? 'failed' : 'retried']++;
    }
  }

  return { ...results, batchSize: pending.length };
}

async function sendSettlementNotification(attestationId: string, txHash: string): Promise<void> {
  const attestation = await prisma.attestation.findUnique({
    where: { id: attestationId },
    select: {
      payload: true,
      amountUsdc: true,
    },
  });
  if (!attestation) return;

  const payload = attestation.payload as Record<string, unknown>;
  const requestedBy = payload?.requestedBy as string | null;
  if (!requestedBy || requestedBy.startsWith('cron:')) return;

  const opponent = (payload?.opponent as string) || 'opponent';
  const explorerBase = process.env.KITE_EXPLORER_URL || 'https://testnet.kitescan.ai';

  try {
    const identities = await prisma.platformIdentity.findMany({
      where: { userId: requestedBy, platform: 'whatsapp' },
      select: { platformUserId: true },
    });

    if (identities.length === 0) return;

    const { WhatsAppService } = await import('../../src/server/services/communication/whatsapp.js');
    const whatsapp = new WhatsAppService();
    if (!whatsapp.isConfigured()) return;

    const message = [
      `\u2705 Receipt confirmed: scout vs ${opponent}`,
      `View: ${explorerBase}/tx/${txHash}`,
    ].join('\n');

    for (const identity of identities) {
      if (identity.platformUserId) {
        await whatsapp.sendText(identity.platformUserId, message).catch(
          (e) => console.warn(`[Maintenance] WhatsApp send to ${identity.platformUserId} failed`, e),
        );
      }
    }
  } catch (err) {
    console.warn('[Maintenance] notification lookup failed', err);
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    // Force exit because Redis might keep the process alive
    process.exit(0);
  });
