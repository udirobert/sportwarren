import { randomBytes } from 'crypto';
import type { Prisma, PrismaClient } from '@prisma/client';
import type { PlatformConnection, PlatformConnections, PlatformType } from '@/types';

const TELEGRAM_PLATFORM: PlatformType = 'telegram';
const TELEGRAM_CONNECT_PREFIX = 'connect_';
const TELEGRAM_MINI_APP_TTL_MS = 30 * 60 * 1000;

interface PersistedPlatformConnection {
  platform: string;
  status: string;
  linkedAt: Date | null;
  username: string | null;
  chatId: string | null;
  linkToken: string | null;
  miniAppToken: string | null;
  squadId: string | null;
  userId: string;
}

type PlatformStore = PrismaClient | Prisma.TransactionClient;

interface TelegramLinkContext {
  chatId: string;
  platformUserId: string;
  username?: string;
}

function getTelegramBotUsername(): string | null {
  const username = process.env.TELEGRAM_BOT_USERNAME?.trim();
  if (!username) {
    return null;
  }

  return username.startsWith('@') ? username.slice(1) : username;
}

function getAppBaseUrl(): string | null {
  const candidates = [
    process.env.NEXT_PUBLIC_CLIENT_URL,
    process.env.CLIENT_URL,
  ];

  for (const candidate of candidates) {
    const trimmed = candidate?.trim();
    if (trimmed) {
      return trimmed.replace(/\/$/, '');
    }
  }

  return null;
}

function toConnectionStatus(status: string): 'pending' | 'connected' {
  return status === 'connected' ? 'connected' : 'pending';
}

function mapConnection(
  connection: PersistedPlatformConnection,
  options?: { includeLinkUrl?: boolean }
): PlatformConnection {
  const includeLinkUrl = options?.includeLinkUrl ?? false;
  const linkUrl = includeLinkUrl && connection.platform === TELEGRAM_PLATFORM && connection.linkToken
    ? buildTelegramDeepLink(connection.linkToken) ?? undefined
    : undefined;

  return {
    connected: connection.status === 'connected',
    status: toConnectionStatus(connection.status),
    connectedAt: connection.linkedAt?.toISOString(),
    username: connection.username ?? undefined,
    chatId: connection.chatId ?? undefined,
    linkUrl,
  };
}

export function buildTelegramDeepLink(token: string): string | null {
  const botUsername = getTelegramBotUsername();
  if (!botUsername) {
    return null;
  }

  return `https://t.me/${botUsername}?start=${TELEGRAM_CONNECT_PREFIX}${token}`;
}

export function buildTelegramMiniAppUrl(token: string): string | null {
  const baseUrl = getAppBaseUrl();
  if (!baseUrl) {
    return null;
  }

  return `${baseUrl}/telegram/mini-app?token=${encodeURIComponent(token)}`;
}

export function isTelegramConnectToken(value: string | undefined): value is string {
  return Boolean(value?.startsWith(TELEGRAM_CONNECT_PREFIX) && value.length > TELEGRAM_CONNECT_PREFIX.length);
}

export function extractTelegramConnectToken(value: string): string {
  return value.slice(TELEGRAM_CONNECT_PREFIX.length);
}

export async function getPlatformConnectionsForSquad(
  prisma: PlatformStore,
  squadId: string,
  options?: { includePendingLinkUrl?: boolean }
): Promise<PlatformConnections> {
  const connections = await prisma.platformConnection.findMany({
    where: { squadId },
    orderBy: { createdAt: 'asc' },
  });

  const includePendingLinkUrl = options?.includePendingLinkUrl ?? false;

  return connections.reduce<PlatformConnections>((accumulator, connection) => {
    const platform = connection.platform as PlatformType;
    accumulator[platform] = mapConnection(connection, {
      includeLinkUrl: includePendingLinkUrl && connection.status === 'pending',
    });
    return accumulator;
  }, {});
}

export async function createTelegramLinkSession(
  prisma: PlatformStore,
  userId: string,
  squadId: string
): Promise<{ botUrl: string; connection: PlatformConnection }> {
  const token = randomBytes(12).toString('hex');
  const botUrl = buildTelegramDeepLink(token);

  if (!botUrl) {
    throw new Error('TELEGRAM_BOT_USERNAME environment variable is required to link Telegram');
  }

  const connection = await prisma.platformConnection.upsert({
    where: {
      platform_squadId: {
        platform: TELEGRAM_PLATFORM,
        squadId,
      },
    },
    update: {
      userId,
      status: 'pending',
      username: null,
      chatId: null,
      platformUserId: null,
      linkedAt: null,
      linkToken: token,
      miniAppToken: null,
      miniAppTokenExpiresAt: null,
    },
    create: {
      platform: TELEGRAM_PLATFORM,
      userId,
      squadId,
      status: 'pending',
      linkToken: token,
    },
  });

  return {
    botUrl,
    connection: mapConnection(connection, { includeLinkUrl: true }),
  };
}

export async function connectTelegramChatByToken(
  prisma: PlatformStore,
  token: string,
  context: TelegramLinkContext
): Promise<{ connection: PlatformConnection; squadId?: string; userId: string } | null> {
  const existing = await prisma.platformConnection.findUnique({
    where: { linkToken: token },
  });

  if (!existing || existing.platform !== TELEGRAM_PLATFORM) {
    return null;
  }

  const connected = await prisma.platformConnection.update({
    where: { id: existing.id },
    data: {
      status: 'connected',
      chatId: context.chatId,
      platformUserId: context.platformUserId,
      username: context.username ?? null,
      linkedAt: new Date(),
      linkToken: null,
      miniAppToken: null,
      miniAppTokenExpiresAt: null,
    },
  });

  return {
    connection: mapConnection(connected),
    squadId: connected.squadId ?? undefined,
    userId: connected.userId,
  };
}

export async function disconnectPlatformConnection(
  prisma: PlatformStore,
  platform: PlatformType,
  squadId: string
): Promise<void> {
  await prisma.platformConnection.delete({
    where: {
      platform_squadId: {
        platform,
        squadId,
      },
    },
  }).catch((error: unknown) => {
    const prismaError = error as { code?: string };
    if (prismaError.code !== 'P2025') {
      throw error;
    }
  });
}

export async function createTelegramMiniAppSession(
  prisma: PlatformStore,
  connectionId: string
): Promise<{ token: string; url: string }> {
  const token = randomBytes(12).toString('hex');
  const url = buildTelegramMiniAppUrl(token);

  if (!url) {
    throw new Error('NEXT_PUBLIC_CLIENT_URL or CLIENT_URL must be configured to launch the Telegram Mini App');
  }

  await prisma.platformConnection.update({
    where: { id: connectionId },
    data: {
      miniAppToken: token,
      miniAppTokenExpiresAt: new Date(Date.now() + TELEGRAM_MINI_APP_TTL_MS),
    },
  });

  return { token, url };
}

export async function findTelegramMiniAppConnectionByToken(
  prisma: PlatformStore,
  token: string
) {
  return prisma.platformConnection.findFirst({
    where: {
      platform: TELEGRAM_PLATFORM,
      status: 'connected',
      miniAppToken: token,
      miniAppTokenExpiresAt: {
        gt: new Date(),
      },
    },
    include: {
      squad: {
        include: {
          treasury: {
            include: {
              transactions: {
                orderBy: { createdAt: 'desc' },
                take: 10,
              },
            },
          },
        },
      },
      user: true,
    },
  });
}

export async function findTelegramConnectionByChatId(
  prisma: PlatformStore,
  chatId: string
) {
  return prisma.platformConnection.findFirst({
    where: {
      platform: TELEGRAM_PLATFORM,
      status: 'connected',
      chatId,
    },
    include: {
      squad: true,
      user: true,
    },
  });
}
