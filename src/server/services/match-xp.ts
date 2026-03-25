import type { PrismaClient } from '@prisma/client';

export interface MatchXPAttributeGain {
  attribute: string;
  xp: number;
  oldRating: number;
  newRating: number;
}

export interface MatchXPProfileResult {
  profileId: string;
  totalXP: number;
  attributeBreakdown: Record<string, number>;
  attributeGains: MatchXPAttributeGain[];
  goals: number;
  assists: number;
  cleanSheet: boolean;
}

export interface MatchXPProfileSummary {
  totalXP: number;
  attributeBreakdown: Record<string, number>;
}

function normalizeAttributeBreakdown(
  input: unknown,
): Record<string, number> {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return {};
  }

  const entries = Object.entries(input as Record<string, unknown>).filter(
    ([, value]) => typeof value === 'number' && Number.isFinite(value),
  );

  return Object.fromEntries(entries) as Record<string, number>;
}

function buildMatchAttributeBreakdown(stat: {
  goals: number;
  assists: number;
  cleanSheet: boolean;
}) {
  const baseXP = 10;
  const goalXP = stat.goals * 25;
  const assistXP = stat.assists * 15;
  const cleanSheetXP = stat.cleanSheet ? 30 : 0;

  return {
    baseXP,
    bonusXP: goalXP + assistXP + cleanSheetXP,
    totalXP: baseXP + goalXP + assistXP + cleanSheetXP,
    attributeBreakdown: {
      physical: baseXP,
      ...(goalXP > 0 ? { shooting: goalXP } : {}),
      ...(assistXP > 0 ? { passing: assistXP } : {}),
      ...(cleanSheetXP > 0 ? { defending: cleanSheetXP } : {}),
    },
  };
}

async function hydrateExistingMatchXPResults(
  prisma: PrismaClient,
  gains: Array<{
    profileId: string;
    totalXP: number;
    attributeBreakdown: unknown;
  }>,
): Promise<MatchXPProfileResult[]> {
  if (gains.length === 0) {
    return [];
  }

  const profileIds = Array.from(new Set(gains.map((gain) => gain.profileId)));
  const attributes = await prisma.playerAttribute.findMany({
    where: { profileId: { in: profileIds } },
    select: {
      profileId: true,
      attribute: true,
      rating: true,
    },
  });

  const ratingsByProfile = new Map<string, Map<string, number>>();
  for (const attribute of attributes) {
    const profileMap =
      ratingsByProfile.get(attribute.profileId) ?? new Map<string, number>();
    profileMap.set(attribute.attribute, attribute.rating);
    ratingsByProfile.set(attribute.profileId, profileMap);
  }

  return gains.map((gain) => {
    const attributeBreakdown = normalizeAttributeBreakdown(gain.attributeBreakdown);
    const ratings = ratingsByProfile.get(gain.profileId) ?? new Map<string, number>();

    return {
      profileId: gain.profileId,
      totalXP: gain.totalXP,
      attributeBreakdown,
      attributeGains: Object.entries(attributeBreakdown).map(([attribute, xp]) => {
        const rating = ratings.get(attribute) ?? 0;
        return {
          attribute,
          xp,
          oldRating: rating,
          newRating: rating,
        };
      }),
      goals: 0,
      assists: 0,
      cleanSheet: false,
    };
  });
}

export async function applyMatchXP(prisma: PrismaClient, matchId: string) {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      playerStats: {
        include: {
          profile: {
            include: { attributes: true },
          },
        },
      },
    },
  });

  if (!match) {
    throw new Error('Match not found');
  }

  const existingGains = await prisma.xPGain.findMany({
    where: { matchId },
    select: {
      profileId: true,
      totalXP: true,
      attributeBreakdown: true,
    },
  });

  if (existingGains.length > 0) {
    return {
      success: true,
      alreadyApplied: true,
      results: await hydrateExistingMatchXPResults(prisma, existingGains),
    };
  }

  const results: MatchXPProfileResult[] = [];

  for (const stat of match.playerStats) {
    const { profile } = stat;
    const { baseXP, bonusXP, totalXP, attributeBreakdown } =
      buildMatchAttributeBreakdown(stat);
    const attributeGains: MatchXPAttributeGain[] = [];

    for (const [attribute, xp] of Object.entries(attributeBreakdown)) {
      const currentAttribute = profile.attributes.find(
        (item) => item.attribute === attribute,
      );
      if (!currentAttribute) {
        continue;
      }

      const oldRating = currentAttribute.rating;
      let newXp = currentAttribute.xp + xp;
      let newRating = currentAttribute.rating;
      let newXpToNext = currentAttribute.xpToNext;

      while (newXp >= newXpToNext && newRating < currentAttribute.maxRating) {
        newXp -= newXpToNext;
        newRating += 1;
        newXpToNext = Math.floor(newXpToNext * 1.2);
      }

      const cappedRating = Math.min(newRating, currentAttribute.maxRating);

      await prisma.playerAttribute.update({
        where: { id: currentAttribute.id },
        data: {
          xp: newXp,
          rating: cappedRating,
          xpToNext: newXpToNext,
          history: { push: cappedRating },
        },
      });

      attributeGains.push({
        attribute,
        xp,
        oldRating,
        newRating: cappedRating,
      });
    }

    await prisma.xPGain.create({
      data: {
        matchId,
        profileId: profile.id,
        baseXP,
        bonusXP,
        totalXP,
        source: 'match_stats',
        description: [
          'Participation +10',
          stat.goals > 0 ? `${stat.goals} goal(s) +${stat.goals * 25}` : '',
          stat.assists > 0 ? `${stat.assists} assist(s) +${stat.assists * 15}` : '',
          stat.cleanSheet ? 'Clean sheet +30' : '',
        ]
          .filter(Boolean)
          .join(', '),
        attributeBreakdown,
      },
    });

    await prisma.playerProfile.update({
      where: { id: profile.id },
      data: {
        totalXP: { increment: totalXP },
        seasonXP: { increment: totalXP },
        totalMatches: { increment: 1 },
        totalGoals: { increment: stat.goals },
        totalAssists: { increment: stat.assists },
      },
    });

    await prisma.playerMatchStats.update({
      where: { id: stat.id },
      data: { xpEarned: totalXP },
    });

    results.push({
      profileId: profile.id,
      totalXP,
      attributeBreakdown,
      attributeGains,
      goals: stat.goals,
      assists: stat.assists,
      cleanSheet: stat.cleanSheet,
    });
  }

  return {
    success: true,
    alreadyApplied: false,
    results,
  };
}

export async function getMatchXPSummariesForProfile(
  prisma: PrismaClient,
  profileId: string,
  matchIds: string[],
) {
  if (matchIds.length === 0) {
    return new Map<string, MatchXPProfileSummary>();
  }

  const gains = await prisma.xPGain.findMany({
    where: {
      profileId,
      matchId: { in: matchIds },
    },
    select: {
      matchId: true,
      totalXP: true,
      attributeBreakdown: true,
    },
  });

  const summaries = new Map<string, MatchXPProfileSummary>();
  for (const gain of gains) {
    if (!gain.matchId) {
      continue;
    }

    const existing = summaries.get(gain.matchId) ?? {
      totalXP: 0,
      attributeBreakdown: {},
    };
    const attributeBreakdown = normalizeAttributeBreakdown(gain.attributeBreakdown);

    for (const [attribute, xp] of Object.entries(attributeBreakdown)) {
      existing.attributeBreakdown[attribute] =
        (existing.attributeBreakdown[attribute] ?? 0) + xp;
    }

    existing.totalXP += gain.totalXP;
    summaries.set(gain.matchId, existing);
  }

  return summaries;
}

export async function getMatchXPSummaryForProfile(
  prisma: PrismaClient,
  profileId: string,
  matchId: string,
) {
  const summaries = await getMatchXPSummariesForProfile(prisma, profileId, [matchId]);
  return summaries.get(matchId) ?? null;
}
