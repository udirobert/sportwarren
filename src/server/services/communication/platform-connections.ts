import { randomBytes } from 'crypto';
import type { Prisma, PrismaClient } from '@prisma/client';

const TELEGRAM_PLATFORM = 'telegram' as const;
const TELEGRAM_CONNECT_PREFIX = 'connect_';
const TELEGRAM_MINI_APP_TTL_MS = 30 * 60 * 1000;

type PlatformStore = PrismaClient | Prisma.TransactionClient;

interface TelegramLinkContext {
  chatId: string;
  platformUserId: string;
  username?: string;
}

// ============================================================================
// URL Helpers
// ============================================================================

function getTelegramBotUsername(): string | null {
  const username = process.env.TELEGRAM_BOT_USERNAME?.trim();
  if (!username) return null;
  return username.startsWith('@') ? username.slice(1) : username;
}

function getAppBaseUrl(): string | null {
  for (const candidate of [process.env.NEXT_PUBLIC_CLIENT_URL, process.env.CLIENT_URL]) {
    const trimmed = candidate?.trim();
    if (trimmed) return trimmed.replace(/\/$/, '');
  }
  return null;
}

export function buildTelegramDeepLink(token: string): string | null {
  const botUsername = getTelegramBotUsername();
  if (!botUsername) return null;
  return `https://t.me/${botUsername}?start=${TELEGRAM_CONNECT_PREFIX}${token}`;
}

export function buildTelegramMiniAppUrl(options?: { token?: string; tab?: string; mode?: string }): string | null {
  const baseUrl = getAppBaseUrl();
  if (!baseUrl) return null;

  const url = new URL('/telegram/mini-app', baseUrl);
  if (options?.token) url.searchParams.set('token', options.token);
  if (options?.tab) url.searchParams.set('tab', options.tab);
  if (options?.mode) url.searchParams.set('mode', options.mode);
  return url.toString();
}

export function isTelegramConnectToken(value: string | undefined): value is string {
  return Boolean(value?.startsWith(TELEGRAM_CONNECT_PREFIX) && value.length > TELEGRAM_CONNECT_PREFIX.length);
}

export function extractTelegramConnectToken(value: string): string {
  return value.slice(TELEGRAM_CONNECT_PREFIX.length);
}

// ============================================================================
// SquadGroup (Group → Squad Link)
// ============================================================================

interface SquadGroupConnection {
  platform: string;
  chatId: string | null;
  platformUserId: string | null;
  username: string | null;
  linkedAt: Date | null;
  linkUrl?: string;
}

type SquadGroupConnections = Record<string, SquadGroupConnection>;

export async function getSquadGroupsForSquad(
  prisma: PlatformStore,
  squadId: string,
  options?: { includePendingLinkUrl?: boolean }
): Promise<SquadGroupConnections> {
  const groups = await prisma.squadGroup.findMany({
    where: { squadId },
    orderBy: { linkedAt: { sort: 'asc', nulls: 'last' } },
  });

  const includeLinkUrl = options?.includePendingLinkUrl ?? false;

  return groups.reduce<SquadGroupConnections>((acc, group) => {
    const platform = group.platform;
    const entry: SquadGroupConnection = {
      platform,
      chatId: group.chatId,
      platformUserId: group.platformUserId,
      username: group.username,
      linkedAt: group.linkedAt,
    };
    if (includeLinkUrl && !group.chatId && group.linkToken) {
      entry.linkUrl = buildTelegramDeepLink(group.linkToken) ?? undefined;
    }
    acc[platform] = entry;
    return acc;
  }, {});
}

export async function createTelegramLinkSession(
  prisma: PlatformStore,
  userId: string,
  squadId: string
): Promise<{ botUrl: string; group: SquadGroupConnection }> {
  const token = randomBytes(12).toString('hex');
  const botUrl = buildTelegramDeepLink(token);

  if (!botUrl) {
    throw new Error('TELEGRAM_BOT_USERNAME environment variable is required to link Telegram');
  }

  const group = await prisma.squadGroup.upsert({
    where: {
      platform_chatId: { platform: TELEGRAM_PLATFORM, chatId: `__pending_${squadId}` },
    },
    update: {
      chatId: null,
      platformUserId: null,
      username: null,
      linkedAt: null,
      linkToken: token,
    },
    create: {
      platform: TELEGRAM_PLATFORM,
      squadId,
      linkToken: token,
    },
  });

  return {
    botUrl,
    group: { ...group, platform: group.platform, linkUrl: botUrl },
  };
}

export async function connectTelegramChatByToken(
  prisma: PlatformStore,
  token: string,
  context: TelegramLinkContext
): Promise<{ group: SquadGroupConnection; squadId: string; userId: string } | null> {
  const group = await prisma.squadGroup.findUnique({
    where: { linkToken: token },
  });

  if (!group || group.platform !== TELEGRAM_PLATFORM) return null;

  const updated = await prisma.squadGroup.update({
    where: { id: group.id },
    data: {
      chatId: context.chatId,
      platformUserId: context.platformUserId,
      username: context.username ?? null,
      linkedAt: new Date(),
      linkToken: null,
    },
  });

  return {
    group: updated,
    squadId: updated.squadId,
    userId: '', // resolved by caller from PlatformIdentity
  };
}

export async function disconnectSquadGroup(
  prisma: PlatformStore,
  platform: string,
  squadId: string
): Promise<void> {
  await prisma.squadGroup.deleteMany({
    where: { platform, squadId, chatId: { not: null } },
  });
}

export async function findSquadGroupByChatId(
  prisma: PlatformStore,
  chatId: string
) {
  return prisma.squadGroup.findFirst({
    where: { platform: TELEGRAM_PLATFORM, chatId },
    include: { squad: true },
  });
}

// ============================================================================
// PlatformIdentity (User-Scoped Resolution)
// ============================================================================

export async function findOrCreatePlatformIdentity(
  prisma: PlatformStore,
  context: { platformUserId: string; chatId?: string; username?: string }
) {
  const existing = await prisma.platformIdentity.findUnique({
    where: {
      platform_platformUserId: {
        platform: TELEGRAM_PLATFORM,
        platformUserId: context.platformUserId,
      },
    },
    include: {
      user: {
        include: {
          squads: { include: { squad: true } },
        },
      },
    },
  });

  if (existing) {
    if (context.chatId && existing.chatId !== context.chatId) {
      await prisma.platformIdentity.update({
        where: { id: existing.id },
        data: { chatId: context.chatId },
      });
    }
    return existing;
  }

  return null;
}

export async function findPlatformIdentityByUserId(
  prisma: PlatformStore,
  platformUserId: string
) {
  return prisma.platformIdentity.findUnique({
    where: {
      platform_platformUserId: {
        platform: TELEGRAM_PLATFORM,
        platformUserId,
      },
    },
    include: {
      user: {
        include: {
          squads: { include: { squad: true } },
        },
      },
    },
  });
}

export async function findPlatformIdentityByChatId(
  prisma: PlatformStore,
  chatId: string
) {
  return prisma.platformIdentity.findFirst({
    where: { platform: TELEGRAM_PLATFORM, chatId },
    include: {
      user: {
        include: {
          squads: { include: { squad: true } },
        },
      },
    },
  });
}

export async function findPlatformIdentityByMiniAppToken(
  prisma: PlatformStore,
  token: string
) {
  return prisma.platformIdentity.findFirst({
    where: {
      platform: TELEGRAM_PLATFORM,
      miniAppToken: token,
      miniAppTokenExpiresAt: { gt: new Date() },
    },
    include: {
      user: {
        include: {
          squads: {
            include: {
              squad: {
                include: {
                  treasury: {
                    include: {
                      transactions: { orderBy: { createdAt: 'desc' }, take: 10 },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });
}

export async function createIdentityMiniAppSession(
  prisma: PlatformStore,
  identityId: string,
  activeSquadId?: string
): Promise<{ token: string; url: string }> {
  const token = randomBytes(12).toString('hex');
  const url = buildTelegramMiniAppUrl({ token });

  if (!url) {
    throw new Error('NEXT_PUBLIC_CLIENT_URL or CLIENT_URL must be configured to launch the Telegram Mini App');
  }

  await prisma.platformIdentity.update({
    where: { id: identityId },
    data: {
      miniAppToken: token,
      miniAppTokenExpiresAt: new Date(Date.now() + TELEGRAM_MINI_APP_TTL_MS),
      activeSquadId: activeSquadId ?? undefined,
    },
  });

  return { token, url };
}

export async function updateActiveSquadContext(
  prisma: PlatformStore,
  identityId: string,
  squadId: string
) {
  return prisma.platformIdentity.update({
    where: { id: identityId },
    data: { activeSquadId: squadId },
  });
}
