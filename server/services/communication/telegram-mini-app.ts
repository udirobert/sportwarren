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
import { findTelegramMiniAppConnectionByToken } from "./platform-connections";

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

export async function getTelegramMiniAppContext(
  prisma: PrismaClient,
  token: string,
): Promise<TelegramMiniAppContext | null> {
  const connection = await findTelegramMiniAppConnectionByToken(prisma, token);
  if (!connection?.squadId || !connection.squad) {
    return null;
  }

  const squadId = connection.squadId;
  const userId = connection.userId;

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
      verifications: { select: { id: true } },
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
    chatId: connection.chatId,
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
          requiredVerifications: 3,
        };
      }),
      recent: recentMatches.map((match) => {
        const isHome = match.homeSquadId === squadId;
        return {
          id: match.id,
          opponent: isHome ? match.awaySquad.name : match.homeSquad.name,
          homeScore: match.homeScore,
          awayScore: match.awayScore,
          isHome,
          matchDate: match.matchDate.toISOString(),
          status: match.status,
          xpGained: null, // TODO: Calculate from match XP distribution
        };
      }),
    },

    // Treasury
    treasury: {
      balance: treasury.balance,
      currency: treasury.tonWalletAddress || tonWalletAddress ? "TON" : "ALGO",
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

export async function recordTelegramTonTopUp(
  prisma: PrismaClient,
  input: RecordTelegramTonTopUpInput,
) {
  const connection = await findTelegramMiniAppConnectionByToken(
    prisma,
    input.token,
  );
  if (!connection?.squadId) {
    throw new Error(
      "That Telegram Mini App session expired. Re-open it from Telegram and try again.",
    );
  }

  const treasury = await ensureSquadTreasury(prisma, connection.squadId);
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
    squadId: connection.squadId,
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
