import type { PrismaClient } from "@prisma/client";
import {
  ensureSquadTreasury,
  recordPendingTreasuryActivity,
  reconcilePendingTreasuryTransaction,
} from "../economy/treasury-ledger";
import {
  computeTonMessageHashFromBoc,
  verifyTonTopUpTransfer,
} from "../blockchain/ton";
import {
  findPlatformIdentityByMiniAppToken,
  updateActiveSquadContext,
} from "./platform-connections";
import { getSquadMembership, isSquadLeader } from "../permissions";
import {
  getRequiredMatchVerifications,
  submitMatchResult,
  verifyMatchResult,
} from "../match-workflow";
import {
  applyMatchXP,
  getMatchXPSummariesForProfile,
} from "../match-xp";

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
  chatId?: string | null;
  userId: string;

  // Player profile for current user
  player: {
    id: string;
    name: string | null;
    position: string | null;
    level: number;
    totalXP: number;
    seasonXP: number;
    sharpness: number;
    reputationScore: number;
    stats: {
      matches: number;
      goals: number;
      assists: number;
    };
    attributes: Array<{
      attribute: string;
      rating: number;
      xp: number;
      xpToNext: number;
    }>;
  } | null;

  // Squad members with roles
  squad: {
    id: string;
    name: string;
    shortName: string | null;
    homeGround: string | null;
    memberCount: number;
    members: Array<{
      userId: string;
      name: string | null;
      role: string;
      position: string | null;
    }>;
    form: string[]; // Last 5 results: 'W', 'D', 'L'
  };

  // Matches
  matches: {
    pending: Array<{
      id: string;
      opponent: string;
      homeScore: number | null;
      awayScore: number | null;
      isHome: boolean;
      matchDate: string;
      verificationCount: number;
      requiredVerifications: number;
      canVerify: boolean;
      submittedByCurrentUser: boolean;
      alreadyVerifiedByCurrentUser: boolean;
      trustScore: number;
    }>;
    recent: Array<{
      id: string;
      opponent: string;
      homeScore: number | null;
      awayScore: number | null;
      isHome: boolean;
      matchDate: string;
      status: string;
      xpGained: number | null;
      trustScore: number;
      verificationDetails: any;
    }>;
  };

  // Treasury (existing)
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

  // TON config (existing)
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

export interface SubmitTelegramMiniAppMatchInput {
  token: string;
  opponentName: string;
  homeScore: number;
  awayScore: number;
  isHome: boolean;
  matchDate?: Date;
  yellowSettlement?: {
    sessionId: string;
    version: number;
    settlementId?: string;
  };
}

export interface VerifyTelegramMiniAppMatchInput {
  token: string;
  matchId: string;
  verified: boolean;
  yellowSettlement?: {
    sessionId: string;
    version: number;
    settlementId?: string;
  };
}

export interface CreateTelegramMiniAppSquadInput {
  token: string;
  name: string;
  shortName: string;
  homeGround?: string;
}

export interface JoinTelegramMiniAppSquadInput {
  token: string;
  squadId: string;
}

type TelegramMiniAppIdentity = NonNullable<
  Awaited<ReturnType<typeof findPlatformIdentityByMiniAppToken>>
>;

async function requireTelegramMiniAppIdentity(prisma: PrismaClient, token: string) {
  const identity = await findPlatformIdentityByMiniAppToken(prisma, token);
  if (!identity) {
    throw new Error(
      "That Telegram Mini App session expired. Re-open it from Telegram and try again.",
    );
  }

  return identity;
}

function resolveActiveSquadFromIdentity(identity: TelegramMiniAppIdentity) {
  const memberships = identity.user.squads;
  if (memberships.length === 0) {
    return null;
  }

  const selectedMembership = identity.activeSquadId
    ? memberships.find((membership) => membership.squad.id === identity.activeSquadId)
    : undefined;

  const activeMembership = selectedMembership ?? memberships[0];
  return {
    squad: activeMembership.squad,
    membership: activeMembership,
  };
}

/**
 * Resolve a Mini App session by token.
 * Uses PlatformIdentity (user-scoped) instead of PlatformConnection (squad-scoped).
 */
async function requireTelegramMiniAppConnection(prisma: PrismaClient, token: string) {
  const identity = await requireTelegramMiniAppIdentity(prisma, token);
  const activeSquad = resolveActiveSquadFromIdentity(identity);

  if (!activeSquad) {
    throw new Error("NO_SQUAD:You don't belong to a squad yet.");
  }

  return {
    ...identity,
    squadId: activeSquad.squad.id,
    squad: activeSquad.squad,
  };
}

async function requireTelegramMiniAppLeader(prisma: PrismaClient, token: string) {
  const connection = await requireTelegramMiniAppConnection(prisma, token);
  const membership = await getSquadMembership(prisma, connection.squadId, connection.user.id);

  if (!membership || !isSquadLeader(membership.role)) {
    throw new Error("Only squad captains or vice-captains can do that in Telegram.");
  }

  return connection;
}

export async function searchTelegramMiniAppOnboardingSquads(
  prisma: PrismaClient,
  token: string,
  query: string,
) {
  const identity = await requireTelegramMiniAppIdentity(prisma, token);
  const userId = identity.user.id;
  const trimmed = query.trim();

  const where = trimmed.length > 0
    ? {
        OR: [
          { name: { contains: trimmed, mode: "insensitive" as const } },
          { shortName: { contains: trimmed, mode: "insensitive" as const } },
        ],
      }
    : undefined;

  const squads = await prisma.squad.findMany({
    where,
    include: {
      _count: { select: { members: true } },
      members: {
        where: { userId },
        select: { userId: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return squads.map((squad) => ({
    id: squad.id,
    name: squad.name,
    shortName: squad.shortName,
    memberCount: squad._count.members,
    alreadyMember: squad.members.length > 0,
  }));
}

export async function createTelegramMiniAppSquad(
  prisma: PrismaClient,
  input: CreateTelegramMiniAppSquadInput,
) {
  const identity = await requireTelegramMiniAppIdentity(prisma, input.token);
  const name = input.name.trim();
  const shortName = input.shortName.trim().toUpperCase();
  const homeGround = input.homeGround?.trim() || null;

  if (name.length < 2) {
    throw new Error("Squad name must be at least 2 characters.");
  }

  if (shortName.length < 2 || shortName.length > 5) {
    throw new Error("Short name must be between 2 and 5 characters.");
  }

  const existingShortName = await prisma.squad.findFirst({
    where: { shortName: { equals: shortName, mode: "insensitive" } },
    select: { id: true },
  });

  if (existingShortName) {
    throw new Error("That short name is already taken.");
  }

  const squad = await prisma.squad.create({
    data: {
      name,
      shortName,
      homeGround,
      members: {
        create: {
          userId: identity.user.id,
          role: "captain",
        },
      },
    },
  });

  await updateActiveSquadContext(prisma, identity.id, squad.id);

  return {
    id: squad.id,
    name: squad.name,
    shortName: squad.shortName,
  };
}

export async function joinTelegramMiniAppSquad(
  prisma: PrismaClient,
  input: JoinTelegramMiniAppSquadInput,
) {
  const identity = await requireTelegramMiniAppIdentity(prisma, input.token);
  const squad = await prisma.squad.findUnique({
    where: { id: input.squadId },
    select: { id: true, name: true, shortName: true },
  });

  if (!squad) {
    throw new Error("Squad not found.");
  }

  const existingMembership = await prisma.squadMember.findUnique({
    where: {
      squadId_userId: {
        squadId: squad.id,
        userId: identity.user.id,
      },
    },
    select: { role: true },
  });

  if (!existingMembership) {
    await prisma.squadMember.create({
      data: {
        squadId: squad.id,
        userId: identity.user.id,
        role: "player",
      },
    });
  }

  await updateActiveSquadContext(prisma, identity.id, squad.id);

  return {
    id: squad.id,
    name: squad.name,
    shortName: squad.shortName,
    alreadyMember: Boolean(existingMembership),
  };
}

async function resolveOpponentSquad(prisma: PrismaClient, squadId: string, opponentName: string) {
  const exactMatch = await prisma.squad.findFirst({
    where: {
      id: { not: squadId },
      OR: [
        { name: { equals: opponentName, mode: "insensitive" } },
        { shortName: { equals: opponentName, mode: "insensitive" } },
      ],
    },
  });

  if (exactMatch) {
    return exactMatch;
  }

  const closeMatches = await prisma.squad.findMany({
    where: {
      id: { not: squadId },
      OR: [
        { name: { contains: opponentName, mode: "insensitive" } },
        { shortName: { contains: opponentName, mode: "insensitive" } },
      ],
    },
    take: 2,
    orderBy: { createdAt: "asc" },
  });

  if (closeMatches.length === 1) {
    return closeMatches[0];
  }

  return null;
}

export async function searchTelegramOpponentSquads(
  prisma: PrismaClient,
  token: string,
  query: string,
) {
  const connection = await requireTelegramMiniAppLeader(prisma, token);
  const squadId = connection.squadId!;
  const trimmedQuery = query.trim();

  if (trimmedQuery.length < 2) {
    return [];
  }

  const matches = await prisma.squad.findMany({
    where: {
      id: { not: squadId },
      OR: [
        { name: { contains: trimmedQuery, mode: 'insensitive' } },
        { shortName: { contains: trimmedQuery, mode: 'insensitive' } },
      ],
    },
    select: {
      id: true,
      name: true,
      shortName: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
    take: 8,
  });

  return matches;
}

export async function getTelegramMiniAppContext(
  prisma: PrismaClient,
  token: string,
): Promise<TelegramMiniAppContext | null> {
  // Use identity-based session (user-scoped, supports multi-squad)
  const connection = await requireTelegramMiniAppConnection(prisma, token);
  if (!connection?.squadId || !connection.squad) {
    return null;
  }

  const userId = connection.user.id;
  const squadId = connection.squadId;

  // Fetch player profile with attributes
  const playerProfile = await prisma.playerProfile.findUnique({
    where: { userId },
    include: {
      user: { select: { name: true, position: true } },
      attributes: {
        orderBy: { attribute: "asc" },
      },
    },
  });

  // Fetch squad members
  const squadMembers = await prisma.squadMember.findMany({
    where: { squadId },
    include: {
      user: { select: { id: true, name: true, position: true } },
    },
    orderBy: [
      { role: "asc" }, // captain first
      { joinedAt: "asc" },
    ],
  });

  // Fetch pending matches (need verification)
  const pendingMatches = await prisma.match.findMany({
    where: {
      OR: [{ homeSquadId: squadId }, { awaySquadId: squadId }],
      status: "pending",
    },
    include: {
      homeSquad: { select: { name: true } },
      awaySquad: { select: { name: true } },
      verifications: { select: { id: true, verifierId: true } },
    },
    orderBy: { matchDate: "desc" },
    take: 10,
  });

  // Fetch recent settled matches
  const recentMatches = await prisma.match.findMany({
    where: {
      OR: [{ homeSquadId: squadId }, { awaySquadId: squadId }],
      status: { in: ["verified", "finalized"] },
    },
    include: {
      homeSquad: { select: { name: true } },
      awaySquad: { select: { name: true } },
    },
    orderBy: { matchDate: "desc" },
    take: 10,
  });

  const recentXPGains =
    playerProfile && recentMatches.length > 0
      ? await getMatchXPSummariesForProfile(
          prisma,
          playerProfile.id,
          recentMatches.map((match) => match.id),
        )
      : new Map();

  // Calculate form from recent matches (W/D/L)
  const form = recentMatches.slice(0, 5).map((match) => {
    const isHome = match.homeSquadId === squadId;
    const ourScore = isHome ? match.homeScore : match.awayScore;
    const theirScore = isHome ? match.awayScore : match.homeScore;
    if (ourScore === null || theirScore === null) return "D";
    if (ourScore > theirScore) return "W";
    if (ourScore < theirScore) return "L";
    return "D";
  });

  // Treasury data
  const treasury =
    connection.squad.treasury ?? (await ensureSquadTreasury(prisma, squadId));
  const tonWalletAddress =
    treasury.tonWalletAddress ?? getDefaultTonTreasuryAddress();
  const recentTransactions = await prisma.treasuryTransaction.findMany({
    where: { treasuryId: treasury.id },
    orderBy: { createdAt: "desc" },
    take: 10,
  });
  const pendingTopUps = recentTransactions.filter(
    (transaction) =>
      transaction.category === "deposit_pending" && !transaction.verified,
  ).length;

  return {
    squadId,
    squadName: connection.squad.name,
    userId,

    // Player profile
    player: playerProfile
      ? {
          id: playerProfile.id,
          name: playerProfile.user.name,
          position: playerProfile.user.position,
          level: playerProfile.level,
          totalXP: playerProfile.totalXP,
          seasonXP: playerProfile.seasonXP,
          sharpness: playerProfile.sharpness,
          reputationScore: playerProfile.reputationScore,
          stats: {
            matches: playerProfile.totalMatches,
            goals: playerProfile.totalGoals,
            assists: playerProfile.totalAssists,
          },
          attributes: playerProfile.attributes.map((attr) => ({
            attribute: attr.attribute,
            rating: attr.rating,
            xp: attr.xp,
            xpToNext: attr.xpToNext,
          })),
        }
      : null,

    // Squad
    squad: {
      id: squadId,
      name: connection.squad.name,
      shortName: connection.squad.shortName,
      homeGround: connection.squad.homeGround,
      memberCount: squadMembers.length,
      members: squadMembers.map((member) => ({
        userId: member.user.id,
        name: member.user.name,
        role: member.role,
        position: member.user.position,
      })),
      form,
    },

    // Matches
    matches: {
      pending: pendingMatches.map((match) => {
        const isHome = match.homeSquadId === squadId;
        return {
          id: match.id,
          opponent: isHome ? match.awaySquad.name : match.homeSquad.name,
          homeScore: match.homeScore,
          awayScore: match.awayScore,
          isHome,
          matchDate: match.matchDate.toISOString(),
          verificationCount: match.verifications.length,
          requiredVerifications: getRequiredMatchVerifications(match),
          submittedByCurrentUser: match.submittedBy === userId,
          alreadyVerifiedByCurrentUser: match.verifications.some(
            (verification) => verification.verifierId === userId,
          ),
          canVerify:
            match.submittedBy !== userId
            && !match.verifications.some(
              (verification) => verification.verifierId === userId,
            ),
          trustScore: (match as any).trustScore ?? 0,
        };
      }),
      recent: recentMatches.map((match) => {
        const isHome = match.homeSquadId === squadId;
        const xpSummary = playerProfile
          ? recentXPGains.get(match.id) ?? null
          : null;
        return {
          id: match.id,
          opponent: isHome ? match.awaySquad.name : match.homeSquad.name,
          homeScore: match.homeScore,
          awayScore: match.awayScore,
          isHome,
          matchDate: match.matchDate.toISOString(),
          status: match.status,
          xpGained: xpSummary?.totalXP ?? null,
          trustScore: (match as any).trustScore ?? 0,
          verificationDetails: (match as any).verificationDetails ?? null,
        };
      }),
    },

    // Treasury
    treasury: {
      balance: treasury.balance,
      currency: "TON",
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

    // TON
    ton: {
      enabled: Boolean(tonWalletAddress),
      walletAddress: tonWalletAddress,
      presets: TON_TOP_UP_PRESETS,
    },
  };
}

export async function submitTelegramMiniAppMatch(
  prisma: PrismaClient,
  input: SubmitTelegramMiniAppMatchInput,
) {
  const connection = await requireTelegramMiniAppLeader(prisma, input.token);
  const squadId = connection.squadId!;

  const opponent = await resolveOpponentSquad(prisma, squadId, input.opponentName.trim());
  if (!opponent) {
    throw new Error(
      `We could not find a squad named "${input.opponentName}". Use the exact SportWarren squad name and try again.`,
    );
  }

  const homeSquadId = input.isHome ? squadId : opponent.id;
  const awaySquadId = input.isHome ? opponent.id : squadId;

  const match = await submitMatchResult({
    prisma,
    homeSquadId,
    awaySquadId,
    homeScore: input.homeScore,
    awayScore: input.awayScore,
    submittedBy: connection.user.id,
    matchDate: input.matchDate ?? new Date(),
    yellowSettlement: input.yellowSettlement,
  });

  return {
    id: match.id,
    shareSlug: match.shareSlug ?? null,
    opponentName: opponent.name,
    requiredVerifications: getRequiredMatchVerifications(match),
  };
}

export async function verifyTelegramMiniAppMatch(
  prisma: PrismaClient,
  input: VerifyTelegramMiniAppMatchInput,
) {
  const connection = await requireTelegramMiniAppLeader(prisma, input.token);
  const squadId = connection.squadId;

  const match = await prisma.match.findUnique({
    where: { id: input.matchId },
    include: { verifications: true },
  });

  if (!match) {
    throw new Error("Match not found.");
  }

  if (match.homeSquadId !== squadId && match.awaySquadId !== squadId) {
    throw new Error("That match does not belong to your linked squad.");
  }

  const verification = await verifyMatchResult({
    prisma,
    matchId: input.matchId,
    verifierId: connection.user.id,
    verified: input.verified,
    homeScore: match.homeScore ?? undefined,
    awayScore: match.awayScore ?? undefined,
    yellowSettlement: input.yellowSettlement,
  });

  let xpSummary: {
    totalXP: number;
    attributeGains: Array<{
      attribute: string;
      xp: number;
      oldRating: number;
      newRating: number;
    }>;
  } | null = null;

  if (verification.newStatus === "verified") {
    const xpResult = await applyMatchXP(prisma, input.matchId);
    const playerProfile = await prisma.playerProfile.findUnique({
      where: { userId: connection.user.id },
      select: { id: true },
    });

    const currentUserResult = playerProfile
      ? xpResult.results.find((result) => result.profileId === playerProfile.id) ?? null
      : null;

    if (currentUserResult) {
      xpSummary = {
        totalXP: currentUserResult.totalXP,
        attributeGains: currentUserResult.attributeGains,
      };
    }
  }

  return {
    ...verification,
    xpSummary,
  };
}

export async function recordTelegramTonTopUp(
  prisma: PrismaClient,
  input: RecordTelegramTonTopUpInput,
) {
  const connection = await requireTelegramMiniAppConnection(prisma, input.token);
  const squadId = connection.squadId;

  const treasury = await ensureSquadTreasury(prisma, squadId);
  const tonWalletAddress =
    treasury.tonWalletAddress ?? getDefaultTonTreasuryAddress();

  if (!tonWalletAddress) {
    throw new Error(
      "TON treasury top-ups are not configured for this squad yet.",
    );
  }

  const messageHash = computeTonMessageHashFromBoc(input.boc);
  const pendingResult = await recordPendingTreasuryActivity({
    prisma,
    squadId,
    type: "income",
    category: "deposit_pending",
    amount: Math.round(input.amountTon),
    description: `TON top-up submitted via Telegram Mini App from ${formatWalletLabel(input.senderAddress)}`,
    txHash: messageHash,
    metadata: {
      source: "telegram-mini-app",
      senderAddress: input.senderAddress,
      depositAddress: tonWalletAddress,
      amountTon: input.amountTon,
      comment: input.comment,
      boc: input.boc,
      messageHash,
      linkedChatId: connection.chatId,
      platformIdentityId: connection.id,
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
      squadId,
      transactionId: pendingResult.transaction.id,
      reconciledByUserId: "system:ton-verifier",
      settledTxHash: verification.transactionHash ?? messageHash,
    });
  } catch (error) {
    console.warn(
      "TON top-up verification deferred:",
      error instanceof Error ? error.message : error,
    );
    return pendingResult;
  }
}
