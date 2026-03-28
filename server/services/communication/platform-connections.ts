import { randomBytes } from 'crypto';
import type { Prisma, PrismaClient } from '@prisma/client';
import type { PlatformConnection, PlatformConnections, PlatformType } from '@/types';

const TELEGRAM_PLATFORM: PlatformType = 'telegram';
const TELEGRAM_CONNECT_PREFIX = 'connect_';
const TELEGRAM_MINI_APP_TTL_MS = 30 * 60 * 1000;
const CONNECT_TOKEN_SEPARATOR = '.';

type PlatformStore = PrismaClient | Prisma.TransactionClient;

interface TelegramLinkContext {
  chatId: string;
  platformUserId: string;
  username?: string;
}

interface IdentityWithMemberships {
  id: string;
  userId: string;
  platform: string;
  platformUserId: string;
  chatId: string | null;
  username: string | null;
  miniAppToken: string | null;
  miniAppTokenExpiresAt: Date | null;
  activeSquadId: string | null;
  user: {
    id: string;
    name: string | null;
    squads: Array<{
      squadId: string;
      squad: {
        id: string;
        name: string;
        shortName: string | null;
        homeGround: string | null;
        treasury?: {
          id: string;
          balance: number;
          tonWalletAddress: string | null;
          transactions: Array<{
            id: string;
            type: string;
            category: string;
            amount: number;
            description: string | null;
            createdAt: Date;
            verified: boolean;
          }>;
          yellowSessionId: string | null;
          budgets: unknown;
          createdAt: Date;
          updatedAt: Date;
          squadId: string;
        } | null;
      };
    }>;
  };
}

function getTelegramBotUsername(): string | null {
  const username = process.env.TELEGRAM_BOT_USERNAME?.trim();
  if (!username) {
    return null;
  }

  return username.startsWith('@') ? username.slice(1) : username;
}

function getAppBaseUrl(): string | null {
  for (const candidate of [process.env.NEXT_PUBLIC_CLIENT_URL, process.env.CLIENT_URL]) {
    const trimmed = candidate?.trim();
    if (trimmed) {
      return trimmed.replace(/\/$/, '');
    }
  }

  return null;
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

function mapConnectionView(params: {
  connected: boolean;
  linkedAt?: Date | null;
  username?: string | null;
  chatId?: string | null;
  linkToken?: string | null;
  includeLinkUrl?: boolean;
}): PlatformConnection {
  const linkUrl = params.includeLinkUrl && params.linkToken
    ? buildTelegramDeepLink(params.linkToken) ?? undefined
    : undefined;

  return {
    connected: params.connected,
    status: params.connected ? 'connected' : 'pending',
    connectedAt: params.linkedAt?.toISOString(),
    username: params.username ?? undefined,
    chatId: params.chatId ?? undefined,
    linkUrl,
  };
}

function resolveActiveMembership(
  identity: IdentityWithMemberships,
  fallbackSquadId?: string | null
) {
  if (!identity.user.squads.length) {
    return null;
  }

  if (fallbackSquadId) {
    const byFallback = identity.user.squads.find((membership) => membership.squadId === fallbackSquadId);
    if (byFallback) {
      return byFallback;
    }
  }

  if (identity.activeSquadId) {
    const byActive = identity.user.squads.find((membership) => membership.squadId === identity.activeSquadId);
    if (byActive) {
      return byActive;
    }
  }

  return identity.user.squads[0] ?? null;
}

async function resolveIdentityForToken(
  prisma: PlatformStore,
  token: string,
  context: TelegramLinkContext,
  squadId: string
) {
  const linkedUserId = extractUserIdFromLinkToken(token);
  const existingIdentity = await prisma.platformIdentity.findUnique({
    where: {
      platform_platformUserId: {
        platform: TELEGRAM_PLATFORM,
        platformUserId: context.platformUserId,
      },
    },
  });

  if (linkedUserId) {
    if (existingIdentity && existingIdentity.userId !== linkedUserId) {
      throw new Error(
        'This Telegram account is already linked to a different SportWarren profile. Unlink it first before reconnecting.',
      );
    }

    if (existingIdentity) {
      return prisma.platformIdentity.update({
        where: { id: existingIdentity.id },
        data: {
          userId: linkedUserId,
          chatId: context.chatId,
          username: context.username ?? existingIdentity.username ?? null,
          activeSquadId: squadId,
        },
      });
    }

    return prisma.platformIdentity.create({
      data: {
        userId: linkedUserId,
        platform: TELEGRAM_PLATFORM,
        platformUserId: context.platformUserId,
        chatId: context.chatId,
        username: context.username ?? null,
        activeSquadId: squadId,
      },
    });
  }

  if (existingIdentity) {
    return prisma.platformIdentity.update({
      where: { id: existingIdentity.id },
      data: {
        chatId: context.chatId,
        username: context.username ?? existingIdentity.username ?? null,
        activeSquadId: squadId,
      },
    });
  }

  // Backward-compatible fallback: bind identity to a squad leader when no identity exists yet.
  const leaderMembership = await prisma.squadMember.findFirst({
    where: {
      squadId,
      role: { in: ['captain', 'vice_captain'] },
    },
    orderBy: { joinedAt: 'asc' },
  });

  const fallbackMembership = leaderMembership ?? await prisma.squadMember.findFirst({
    where: { squadId },
    orderBy: { joinedAt: 'asc' },
  });

  if (!fallbackMembership) {
    return null;
  }

  return prisma.platformIdentity.create({
    data: {
      userId: fallbackMembership.userId,
      platform: TELEGRAM_PLATFORM,
      platformUserId: context.platformUserId,
      chatId: context.chatId,
      username: context.username ?? null,
      activeSquadId: squadId,
    },
  });
}

export function buildTelegramDeepLink(token: string): string | null {
  const botUsername = getTelegramBotUsername();
  if (!botUsername) {
    return null;
  }

  return `https://t.me/${botUsername}?start=${TELEGRAM_CONNECT_PREFIX}${token}`;
}

export function buildTelegramMiniAppUrl(options?: string | {
  token?: string;
  tab?: string;
  mode?: string;
}): string | null {
  const baseUrl = getAppBaseUrl();
  if (!baseUrl) {
    return null;
  }

  const url = new URL(`${baseUrl}/telegram/mini-app`);
  const resolvedOptions = typeof options === 'string' ? { token: options } : options;

  if (resolvedOptions?.token) {
    url.searchParams.set('token', resolvedOptions.token);
  }

  if (resolvedOptions?.tab) {
    url.searchParams.set('tab', resolvedOptions.tab);
  }

  if (resolvedOptions?.mode) {
    url.searchParams.set('mode', resolvedOptions.mode);
  }

  return url.toString();
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
  const groups = await prisma.squadGroup.findMany({
    where: { squadId },
    orderBy: { linkedAt: { sort: 'asc', nulls: 'last' } },
  });

  const includePendingLinkUrl = options?.includePendingLinkUrl ?? false;

  return groups.reduce<PlatformConnections>((accumulator, group) => {
    const platform = group.platform as PlatformType;
    accumulator[platform] = mapConnectionView({
      connected: Boolean(group.chatId),
      linkedAt: group.linkedAt,
      username: group.username,
      chatId: group.chatId,
      linkToken: group.linkToken,
      includeLinkUrl: includePendingLinkUrl && !group.chatId,
    });
    return accumulator;
  }, {});
}

export async function createTelegramLinkSession(
  prisma: PlatformStore,
  userId: string,
  squadId: string
): Promise<{ botUrl: string; connection: PlatformConnection }> {
  const token = buildTelegramConnectSessionToken(userId);
  const botUrl = buildTelegramDeepLink(token);

  if (!botUrl) {
    throw new Error('TELEGRAM_BOT_USERNAME environment variable is required to link Telegram');
  }

  const group = await prisma.squadGroup.upsert({
    where: {
      platform_chatId: {
        platform: TELEGRAM_PLATFORM,
        chatId: `__pending_${squadId}`,
      },
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
    connection: mapConnectionView({
      connected: false,
      linkedAt: group.linkedAt,
      username: group.username,
      chatId: group.chatId,
      linkToken: group.linkToken,
      includeLinkUrl: true,
    }),
  };
}

export async function connectTelegramChatByToken(
  prisma: PlatformStore,
  token: string,
  context: TelegramLinkContext
): Promise<{ connection: PlatformConnection; squadId?: string; userId: string } | null> {
  const group = await prisma.squadGroup.findUnique({
    where: { linkToken: token },
  });

  if (!group || group.platform !== TELEGRAM_PLATFORM) {
    return null;
  }

  const connectedGroup = await prisma.squadGroup.update({
    where: { id: group.id },
    data: {
      chatId: context.chatId,
      platformUserId: context.platformUserId,
      username: context.username ?? null,
      linkedAt: new Date(),
      linkToken: null,
    },
  });

  const identity = await resolveIdentityForToken(prisma, token, context, connectedGroup.squadId);
  if (!identity) {
    return null;
  }

  return {
    connection: mapConnectionView({
      connected: true,
      linkedAt: connectedGroup.linkedAt,
      username: connectedGroup.username,
      chatId: connectedGroup.chatId,
    }),
    squadId: connectedGroup.squadId,
    userId: identity.userId,
  };
}

export async function disconnectPlatformConnection(
  prisma: PlatformStore,
  platform: PlatformType,
  squadId: string
): Promise<void> {
  await prisma.squadGroup.deleteMany({
    where: {
      platform,
      squadId,
    },
  });
}

export async function createTelegramMiniAppSession(
  prisma: PlatformStore,
  connectionId: string
): Promise<{ token: string; url: string }> {
  const identity = await prisma.platformIdentity.findUnique({
    where: { id: connectionId },
    include: {
      user: {
        include: {
          squads: true,
        },
      },
    },
  });

  if (!identity) {
    throw new Error('This Telegram session is no longer linked. Reconnect from Settings > Connections.');
  }

  const squadId = identity.activeSquadId ?? identity.user.squads[0]?.squadId ?? null;
  const token = randomBytes(12).toString('hex');
  const url = buildTelegramMiniAppUrl({ token });

  if (!url) {
    throw new Error('NEXT_PUBLIC_CLIENT_URL or CLIENT_URL must be configured to launch the Telegram Mini App');
  }

  await prisma.platformIdentity.update({
    where: { id: identity.id },
    data: {
      miniAppToken: token,
      miniAppTokenExpiresAt: new Date(Date.now() + TELEGRAM_MINI_APP_TTL_MS),
      activeSquadId: squadId ?? undefined,
    },
  });

  return { token, url };
}

export async function findTelegramMiniAppConnectionByToken(
  prisma: PlatformStore,
  token: string
) {
  const identity = await prisma.platformIdentity.findFirst({
    where: {
      platform: TELEGRAM_PLATFORM,
      miniAppToken: token,
      miniAppTokenExpiresAt: {
        gt: new Date(),
      },
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
                      transactions: {
                        orderBy: { createdAt: 'desc' },
                        take: 10,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  }) as IdentityWithMemberships | null;

  if (!identity) {
    return null;
  }

  const membership = resolveActiveMembership(identity);
  if (!membership) {
    return null;
  }

  return {
    id: identity.id,
    userId: identity.userId,
    chatId: identity.chatId,
    platformUserId: identity.platformUserId,
    username: identity.username,
    squadId: membership.squad.id,
    squad: membership.squad,
    user: identity.user,
  };
}

export async function findTelegramConnectionByChatId(
  prisma: PlatformStore,
  chatId: string
) {
  const [identity, group] = await Promise.all([
    prisma.platformIdentity.findFirst({
      where: {
        platform: TELEGRAM_PLATFORM,
        chatId,
      },
      include: {
        user: {
          include: {
            squads: {
              include: {
                squad: true,
              },
            },
          },
        },
      },
    }) as Promise<IdentityWithMemberships | null>,
    prisma.squadGroup.findFirst({
      where: {
        platform: TELEGRAM_PLATFORM,
        chatId,
      },
      include: {
        squad: true,
      },
    }),
  ]);

  if (!identity) {
    return null;
  }

  const membership = resolveActiveMembership(identity, group?.squadId ?? null);
  if (!membership) {
    return null;
  }

  return {
    id: identity.id,
    platform: TELEGRAM_PLATFORM,
    status: 'connected',
    linkedAt: group?.linkedAt ?? null,
    username: identity.username ?? group?.username ?? null,
    chatId: group?.chatId ?? identity.chatId,
    linkToken: null,
    miniAppToken: identity.miniAppToken,
    squadId: membership.squad.id,
    userId: identity.userId,
    platformUserId: identity.platformUserId,
    squad: membership.squad,
    user: identity.user,
  };
}
