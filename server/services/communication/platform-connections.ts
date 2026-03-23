import { randomBytes } from 'crypto';
import type { PrismaClient } from '@prisma/client';
import type { PlatformConnection, PlatformConnections, PlatformType } from '@/types';

const TELEGRAM_PLATFORM: PlatformType = 'telegram';
const TELEGRAM_CONNECT_PREFIX = 'connect_';

interface PersistedPlatformConnection {
  platform: string;
  status: string;
  linkedAt: Date | null;
  username: string | null;
  chatId: string | null;
  groupAddress: string | null;
  linkToken: string | null;
  squadId: string | null;
  userId: string;
}

type PlatformStore = Pick<PrismaClient, 'platformConnection'>;

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
    groupAddress: connection.groupAddress ?? undefined,
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

export function isTelegramConnectToken(value: string | undefined): value is string {
  return Boolean(value?.startsWith(TELEGRAM_CONNECT_PREFIX) && value.length > TELEGRAM_CONNECT_PREFIX.length);
}

export function extractTelegramConnectToken(value: string): string {
  return value.slice(TELEGRAM_CONNECT_PREFIX.length);
}

export async function getPlatformConnectionsForSquad(
  prisma: PlatformStore,
  squadId: string
): Promise<PlatformConnections> {
  const connections = await prisma.platformConnection.findMany({
    where: { squadId },
    orderBy: { createdAt: 'asc' },
  });

  return connections.reduce<PlatformConnections>((accumulator, connection) => {
    const platform = connection.platform as PlatformType;
    accumulator[platform] = mapConnection(connection, { includeLinkUrl: connection.status === 'pending' });
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
      groupAddress: null,
      linkedAt: null,
      linkToken: token,
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
