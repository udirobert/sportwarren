import type { Prisma, PrismaClient } from '@prisma/client';
import { getTrustTier } from '@/lib/match/verification';
import { buildNextLevelXP, buildPlayerFormSnapshot } from '@/lib/player/season-summary';
import { calculatePlayerValue } from '@/lib/player/valuation-engine';
import {
  calculateOverallRating,
  detectPositionFromSkills,
} from '@/lib/utils/calculations';
import type {
  PlayerAttributes,
  PlayerPosition,
  SkillRating,
  TransferMarketPlayer,
} from '@/types';

const marketPlayerInclude = {
  playerProfile: {
    include: {
      attributes: true,
      formHistory: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  },
  squads: {
    include: {
      squad: {
        select: {
          id: true,
          name: true,
          shortName: true,
        },
      },
    },
    orderBy: { joinedAt: 'desc' },
  },
} satisfies Prisma.UserInclude;

type MarketPlayerRecord = Prisma.UserGetPayload<{
  include: typeof marketPlayerInclude;
}>;

type FeedOptions = {
  viewerSquadId?: string;
  viewerUserId?: string;
};

export type LiveMarketFeed = {
  listings: TransferMarketPlayer[];
  prospects: TransferMarketPlayer[];
};

const DEFAULT_POSITION: PlayerPosition = 'MF';
const VALID_POSITIONS: PlayerPosition[] = ['GK', 'DF', 'MF', 'ST', 'WG'];

function isPlayerPosition(value?: string | null): value is PlayerPosition {
  return Boolean(value && VALID_POSITIONS.includes(value as PlayerPosition));
}

function normalizePosition(record: MarketPlayerRecord, skills: SkillRating[]): PlayerPosition {
  const explicit = record.position?.toUpperCase();
  if (isPlayerPosition(explicit)) {
    return explicit;
  }

  const detected = detectPositionFromSkills(skills);
  return isPlayerPosition(detected) ? detected : DEFAULT_POSITION;
}

function buildSkillRatings(record: MarketPlayerRecord): SkillRating[] {
  const attributes = record.playerProfile?.attributes ?? [];

  return attributes.map((attribute) => ({
    skill: attribute.attribute as SkillRating['skill'],
    rating: attribute.rating,
    xp: attribute.xp,
    xpToNextLevel: attribute.xpToNext,
    maxRating: attribute.maxRating,
    verified: true,
    lastUpdated: attribute.updatedAt,
    history: attribute.history,
  }));
}

function roundToTransferIncrement(value: number) {
  return Math.max(250, Math.round(value / 50) * 50);
}

function getSuggestedOpeningOffer(
  marketValuation: number,
  isDraftEligible: boolean,
  activeInterestCount: number,
) {
  const multiplier = isDraftEligible
    ? 0.85
    : 1 + Math.min(activeInterestCount, 3) * 0.05;

  return roundToTransferIncrement(marketValuation * multiplier);
}

function getLatestMembership(record: MarketPlayerRecord) {
  return record.squads[0] ?? null;
}

export function buildPlayerAttributesSnapshot(record: MarketPlayerRecord): PlayerAttributes {
  if (!record.playerProfile) {
    throw new Error(`Player ${record.id} is missing a profile`);
  }

  const skills = buildSkillRatings(record);
  const position = normalizePosition(record, skills);
  const formEntries = record.playerProfile.formHistory.map((entry) => ({
    rating: entry.rating,
    createdAt: entry.createdAt,
  }));

  return {
    address: record.walletAddress,
    playerName: record.name || 'Unnamed Player',
    position,
    totalMatches: record.playerProfile.totalMatches,
    totalGoals: record.playerProfile.totalGoals,
    totalAssists: record.playerProfile.totalAssists,
    reputationScore: record.playerProfile.reputationScore,
    verifiedStats: true,
    skills,
    form: buildPlayerFormSnapshot(formEntries),
    xp: {
      level: record.playerProfile.level,
      totalXP: record.playerProfile.totalXP,
      seasonXP: record.playerProfile.seasonXP,
      nextLevelXP: buildNextLevelXP(record.playerProfile.level),
    },
    achievements: [],
    careerHighlights: [],
  };
}

export function buildTransferMarketPlayer(
  record: MarketPlayerRecord,
  activeInterestCount: number,
): TransferMarketPlayer {
  if (!record.playerProfile) {
    throw new Error(`Player ${record.id} is missing a profile`);
  }

  const snapshot = buildPlayerAttributesSnapshot(record);
  const marketValuation = calculatePlayerValue(snapshot, activeInterestCount).value;
  const latestMembership = getLatestMembership(record);
  const isDraftEligible = !latestMembership;

  return {
    id: record.id,
    name: record.name || 'Unnamed Player',
    position: snapshot.position,
    overall: calculateOverallRating(snapshot.skills),
    askingPrice: getSuggestedOpeningOffer(marketValuation, isDraftEligible, activeInterestCount),
    currentClub: latestMembership?.squad.name ?? 'Free Agent Pool',
    ownerSquadId: latestMembership?.squad.id,
    ownerSquadName: latestMembership?.squad.name,
    reputationScore: record.playerProfile.reputationScore,
    reputationTier: getTrustTier(record.playerProfile.reputationScore),
    isDraftEligible,
    marketValuation,
  };
}

async function getPendingOfferInterest(prisma: PrismaClient) {
  const grouped = await prisma.transferOffer.groupBy({
    by: ['playerId'],
    where: { status: 'pending' },
    _count: { _all: true },
  });

  return new Map(grouped.map((entry) => [entry.playerId, entry._count._all]));
}

function sortFeed(players: TransferMarketPlayer[]) {
  return [...players].sort((left, right) => {
    if (right.askingPrice !== left.askingPrice) {
      return right.askingPrice - left.askingPrice;
    }

    if (right.reputationScore !== left.reputationScore) {
      return right.reputationScore - left.reputationScore;
    }

    return right.overall - left.overall;
  });
}

export async function getMarketPlayerRecord(prisma: PrismaClient, userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: marketPlayerInclude,
  });
}

export async function getLiveProspectById(prisma: PrismaClient, playerId: string) {
  const [record, activeInterestCount] = await Promise.all([
    getMarketPlayerRecord(prisma, playerId),
    prisma.transferOffer.count({
      where: {
        playerId,
        status: 'pending',
      },
    }),
  ]);

  if (!record?.playerProfile || getLatestMembership(record)) {
    return null;
  }

  return buildTransferMarketPlayer(record, activeInterestCount);
}

export async function listLiveMarketFeed(
  prisma: PrismaClient,
  options: FeedOptions = {},
): Promise<LiveMarketFeed> {
  const [records, activeInterestByPlayer] = await Promise.all([
    prisma.user.findMany({
      where: {
        playerProfile: { isNot: null },
        ...(options.viewerUserId ? { id: { not: options.viewerUserId } } : {}),
      },
      include: marketPlayerInclude,
    }),
    getPendingOfferInterest(prisma),
  ]);

  const listings: TransferMarketPlayer[] = [];
  const prospects: TransferMarketPlayer[] = [];

  for (const record of records) {
    if (!record.playerProfile) {
      continue;
    }

    const latestMembership = getLatestMembership(record);
    const isViewerSquadPlayer = Boolean(
      latestMembership && options.viewerSquadId && latestMembership.squad.id === options.viewerSquadId,
    );

    if (isViewerSquadPlayer) {
      continue;
    }

    const marketPlayer = buildTransferMarketPlayer(
      record,
      activeInterestByPlayer.get(record.id) ?? 0,
    );

    if (latestMembership) {
      listings.push(marketPlayer);
      continue;
    }

    prospects.push(marketPlayer);
  }

  return {
    listings: sortFeed(listings),
    prospects: sortFeed(prospects),
  };
}
