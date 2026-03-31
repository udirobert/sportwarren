/**
 * CONSOLIDATION: Single source of truth is src/server/services/communication/platform-connections.ts
 * This file re-exports everything from the canonical source.
 */
export * from '../../../src/server/services/communication/platform-connections.js';

import type { PrismaClient, Prisma } from '@prisma/client';
import { findPlatformIdentityByMiniAppToken as _findPlatformIdentityByMiniAppToken } from '../../../src/server/services/communication/platform-connections.js';

type PlatformStore = PrismaClient | Prisma.TransactionClient;

/**
 * Backward-compat alias: server/telegram-mini-app.ts uses this name.
 * Maps to the canonical findPlatformIdentityByMiniAppToken.
 */
export async function findTelegramMiniAppConnectionByToken(
  prisma: PlatformStore,
  token: string,
) {
  return _findPlatformIdentityByMiniAppToken(prisma, token);
}
