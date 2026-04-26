import { randomBytes } from 'crypto';
import type { Prisma, PrismaClient } from '@prisma/client';

const TELEGRAM_PLATFORM = 'telegram' as const;
const TELEGRAM_CONNECT_PREFIX = 'connect_';
const TELEGRAM_MINI_APP_TTL_MS = 30 * 60 * 1000;
const DEFAULT_TELEGRAM_CHAIN = 'telegram';
const CONNECT_TOKEN_SEPARATOR = '.';

type PlatformStore = PrismaClient | Prisma.TransactionClient;

interface TelegramLinkContext {
  chatId: string;
  platformUserId: string;
  username?: string;
}

const DEFAULT_PLAYER_ATTRIBUTES = [
  { attribute: 'pace', rating: 50, xp: 0, xpToNext: 100 },
  { attribute: 'shooting', rating: 50, xp: 0, xpToNext: 100 },
  { attribute: 'passing', rating: 50, xp: 0, xpToNext: 100 },
  { attribute: 'dribbling', rating: 50, xp: 0, xpToNext: 100 },
  { attribute: 'defending', rating: 50, xp: 0, xpToNext: 100 },
  { attribute: 'physical', rating: 50, xp: 0, xpToNext: 100 },
] as const;

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

function buildTelegramConnectSessionToken(userId: string): string {
  const nonce = randomBytes(12).toString('hex');
  return `${nonce}${CONNECT_TOKEN_SEPARATOR}${userId}`;
}

function extractUserIdFromLinkToken(token: string): string | null {
  const separatorIndex = token.lastIndexOf(CONNECT_TOKEN_SEPARATOR);
  if (separatorIndex <= 0 || separatorIndex >= token.length - 1) {
    return null;
  }

  const userId = token.slice(separatorIndex + 1).trim();
  if (!/^[a-zA-Z0-9_-]+$/.test(userId)) {
    return null;
  }

  return userId;
}

function shouldHydrateName(value: string | null | undefined): boolean {
  if (!value) {
    return true;
  }

  return /^player_[a-z0-9]+$/i.test(value) || /^telegram_[0-9]+$/i.test(value);
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
  const token = buildTelegramConnectSessionToken(userId);
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

  const linkedUserId = extractUserIdFromLinkToken(token);
  const existingIdentity = await prisma.platformIdentity.findUnique({
    where: {
      platform_platformUserId: {
        platform: TELEGRAM_PLATFORM,
        platformUserId: context.platformUserId,
      },
    },
  });

  if (linkedUserId && existingIdentity && existingIdentity.userId !== linkedUserId) {
    throw new Error(
      'This Telegram account is already linked to a different SportWarren profile. Unlink it first before reconnecting.',
    );
  }

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

  let resolvedUserId = '';
  if (linkedUserId) {
    await prisma.platformIdentity.upsert({
      where: {
        platform_platformUserId: {
          platform: TELEGRAM_PLATFORM,
          platformUserId: context.platformUserId,
        },
      },
      create: {
        platform: TELEGRAM_PLATFORM,
        platformUserId: context.platformUserId,
        userId: linkedUserId,
        chatId: context.chatId,
        username: context.username ?? null,
        activeSquadId: updated.squadId,
      },
      update: {
        userId: linkedUserId,
        chatId: context.chatId,
        username: context.username ?? null,
        activeSquadId: updated.squadId,
      },
    });
    resolvedUserId = linkedUserId;
  } else if (existingIdentity) {
    await prisma.platformIdentity.update({
      where: { id: existingIdentity.id },
      data: {
        chatId: context.chatId,
        username: context.username ?? null,
        activeSquadId: existingIdentity.activeSquadId ?? updated.squadId,
      },
    });
    resolvedUserId = existingIdentity.userId;
  }

  return {
    group: updated,
    squadId: updated.squadId,
    userId: resolvedUserId,
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

export async function ensureTelegramIdentityForMiniApp(
  prisma: PrismaClient,
  context: {
    platformUserId: string;
    chatId?: string | null;
    username?: string | null;
    displayName?: string | null;
    photoUrl?: string | null;
  }
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
    const identityUpdates: Prisma.PlatformIdentityUpdateInput = {};

    if (
      context.chatId !== undefined
      && context.chatId !== null
      && context.chatId !== existing.chatId
    ) {
      identityUpdates.chatId = context.chatId;
    }

    if (context.username !== undefined && context.username !== existing.username) {
      identityUpdates.username = context.username;
    }

    if (context.photoUrl !== undefined && context.photoUrl !== existing.photoUrl) {
      identityUpdates.photoUrl = context.photoUrl;
    }

    if (Object.keys(identityUpdates).length > 0) {
      await prisma.platformIdentity.update({
        where: { id: existing.id },
        data: identityUpdates,
      });
    }

    if (context.displayName?.trim() && shouldHydrateName(existing.user.name)) {
      await prisma.user.update({
        where: { id: existing.userId },
        data: { name: context.displayName.trim() },
      });
    }

    return findPlatformIdentityByUserId(prisma, context.platformUserId);
  }

  const walletAddress = `telegram:${context.platformUserId}`;
  const preferredName = context.displayName?.trim() || `Telegram_${context.platformUserId}`;

  await prisma.$transaction(async (tx) => {
    const user = await tx.user.upsert({
      where: { walletAddress },
      update: {
        name: preferredName,
      },
      create: {
        walletAddress,
        chain: DEFAULT_TELEGRAM_CHAIN,
        name: preferredName,
      },
    });

    const existingProfile = await tx.playerProfile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });

    if (!existingProfile) {
      await tx.playerProfile.create({
        data: {
          userId: user.id,
          attributes: {
            create: DEFAULT_PLAYER_ATTRIBUTES.map((attribute) => ({ ...attribute })),
          },
        },
      });
    }

    await tx.platformIdentity.upsert({
      where: {
        platform_platformUserId: {
          platform: TELEGRAM_PLATFORM,
          platformUserId: context.platformUserId,
        },
      },
      create: {
        platform: TELEGRAM_PLATFORM,
        platformUserId: context.platformUserId,
        userId: user.id,
        chatId: context.chatId ?? null,
        username: context.username ?? null,
        photoUrl: context.photoUrl ?? null,
      },
      update: {
        userId: user.id,
        chatId: context.chatId ?? null,
        username: context.username ?? null,
        photoUrl: context.photoUrl ?? null,
      },
    });
  });

  const hydrated = await findPlatformIdentityByUserId(prisma, context.platformUserId);
  if (!hydrated) {
    throw new Error('Could not provision Telegram identity.');
  }

  return hydrated;
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
