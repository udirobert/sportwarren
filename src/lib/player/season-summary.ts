import { calculateForm } from '@/lib/match/xp-calculator';
import {
  describeMatchForSquad,
  isSettledMatchStatus,
  type SquadScopedMatchRecord,
} from '@/lib/match/summary';
import type {
  Achievement,
  CareerHighlight,
  FormRating,
  PlayerAttributes,
} from '@/types';

export interface SeasonMatchRecord extends SquadScopedMatchRecord {
  id: string;
  matchDate?: Date | string | null;
}

export interface SeasonRecord {
  wins: number;
  draws: number;
  losses: number;
  settled: number;
}

type FormEntrySource = number | { rating?: number | null; createdAt?: Date | string | null };

function toDate(value?: Date | string | null) {
  if (value instanceof Date) {
    return value;
  }

  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  return new Date(0);
}

function dedupeById<T extends { id: string }>(items: T[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) {
      return false;
    }

    seen.add(item.id);
    return true;
  });
}

function getSettledMatches(matches: SeasonMatchRecord[]) {
  return matches
    .filter((match) => isSettledMatchStatus(match.status))
    .sort((left, right) => toDate(right.matchDate).getTime() - toDate(left.matchDate).getTime());
}

function getResultNarrative(result: 'W' | 'D' | 'L', opponent: string, goalsFor: number, goalsAgainst: number) {
  if (result === 'W') {
    return {
      title: `Beat ${opponent} ${goalsFor}-${goalsAgainst}`,
      description: `Closed out a verified win against ${opponent}.`,
    };
  }

  if (result === 'D') {
    return {
      title: `Drew ${goalsFor}-${goalsAgainst} with ${opponent}`,
      description: `Held a verified draw against ${opponent}.`,
    };
  }

  return {
    title: `Lost ${goalsFor}-${goalsAgainst} to ${opponent}`,
    description: `Banked the result against ${opponent} even without the win.`,
  };
}

export function buildNextLevelXP(level: number) {
  return Math.max(level, 1) * 1000;
}

export function buildPlayerFormSnapshot(entries: FormEntrySource[] = []): FormRating {
  const normalizedHistory = entries
    .map((entry) => {
      if (typeof entry === 'number') {
        return { rating: entry, createdAt: null };
      }

      return {
        rating: entry.rating ?? null,
        createdAt: entry.createdAt ?? null,
      };
    })
    .filter((entry): entry is { rating: number; createdAt: Date | string | null } => Number.isFinite(entry.rating))
    .sort((left, right) => {
      if (!left.createdAt || !right.createdAt) {
        return 0;
      }

      return toDate(left.createdAt).getTime() - toDate(right.createdAt).getTime();
    })
    .map((entry) => entry.rating);

  const { current, trend } = calculateForm(normalizedHistory);

  return {
    current,
    history: normalizedHistory,
    trend,
  };
}

export function buildSeasonRecord(matches: SeasonMatchRecord[], squadId?: string): SeasonRecord {
  return getSettledMatches(matches).reduce<SeasonRecord>((record, match) => {
    const { result } = describeMatchForSquad(match, squadId);

    if (result === 'W') {
      record.wins += 1;
    } else if (result === 'D') {
      record.draws += 1;
    } else {
      record.losses += 1;
    }

    record.settled += 1;
    return record;
  }, {
    wins: 0,
    draws: 0,
    losses: 0,
    settled: 0,
  });
}

export function buildSeasonAchievements(
  attributes: Pick<PlayerAttributes, 'totalGoals' | 'totalAssists' | 'reputationScore' | 'xp'>,
  matches: SeasonMatchRecord[],
  squadId?: string,
): Achievement[] {
  const settledMatches = getSettledMatches(matches);
  const chronologicalMatches = [...settledMatches].reverse();
  const record = buildSeasonRecord(matches, squadId);
  const firstSettledMatch = chronologicalMatches[0];
  const firstWin = chronologicalMatches.find((match) => describeMatchForSquad(match, squadId).result === 'W');

  const achievements: Achievement[] = [];

  if (firstSettledMatch) {
    achievements.push({
      id: 'verified-debut',
      title: 'Verified Debut',
      description: 'Locked in the first verified result for the current season.',
      dateEarned: toDate(firstSettledMatch.matchDate),
      rarity: 'common',
      verified: true,
    });
  }

  if (firstWin) {
    achievements.push({
      id: 'first-win',
      title: 'First Win',
      description: 'Turned a verified fixture into the first win of the run.',
      dateEarned: toDate(firstWin.matchDate),
      rarity: 'common',
      verified: true,
    });
  }

  if (attributes.totalGoals > 0) {
    achievements.push({
      id: 'goal-getter',
      title: attributes.totalGoals >= 5 ? 'Reliable Finisher' : 'Goal Getter',
      description: `${attributes.totalGoals} verified goal${attributes.totalGoals === 1 ? '' : 's'} logged so far.`,
      rarity: attributes.totalGoals >= 5 ? 'rare' : 'common',
      verified: true,
    });
  }

  if (attributes.totalAssists > 0) {
    achievements.push({
      id: 'playmaker',
      title: attributes.totalAssists >= 5 ? 'Chance Creator' : 'Team Player',
      description: `${attributes.totalAssists} assist${attributes.totalAssists === 1 ? '' : 's'} feeding the squad.`,
      rarity: attributes.totalAssists >= 5 ? 'rare' : 'common',
      verified: true,
    });
  }

  if (record.settled >= 5) {
    achievements.push({
      id: 'consistent-performer',
      title: 'Consistent Performer',
      description: `${record.settled} verified matches played with the current squad.`,
      dateEarned: toDate(chronologicalMatches[Math.min(record.settled, chronologicalMatches.length) - 1]?.matchDate),
      rarity: 'rare',
      verified: true,
    });
  }

  if (attributes.reputationScore >= 250) {
    achievements.push({
      id: 'trusted-regular',
      title: 'Trusted Regular',
      description: 'Built a reputation score that signals repeat, verified contribution.',
      rarity: 'epic',
      verified: true,
    });
  }

  if (attributes.xp.level >= 3) {
    achievements.push({
      id: 'rising-level',
      title: 'Rising Level',
      description: `Reached level ${attributes.xp.level} through live season progress.`,
      rarity: attributes.xp.level >= 5 ? 'epic' : 'rare',
      verified: true,
    });
  }

  return dedupeById(achievements);
}

export function buildCareerHighlights(matches: SeasonMatchRecord[], squadId?: string): CareerHighlight[] {
  const settledMatches = getSettledMatches(matches);
  if (settledMatches.length === 0) {
    return [];
  }

  const chronologicalMatches = [...settledMatches].reverse();
  const latestMatch = settledMatches[0];
  const firstSettledMatch = chronologicalMatches[0];
  const biggestWin = settledMatches
    .filter((match) => describeMatchForSquad(match, squadId).result === 'W')
    .sort((left, right) => {
      const leftSummary = describeMatchForSquad(left, squadId);
      const rightSummary = describeMatchForSquad(right, squadId);
      const marginDifference = (rightSummary.goalsFor - rightSummary.goalsAgainst) - (leftSummary.goalsFor - leftSummary.goalsAgainst);
      if (marginDifference !== 0) {
        return marginDifference;
      }

      return toDate(right.matchDate).getTime() - toDate(left.matchDate).getTime();
    })[0];

  const highlights: CareerHighlight[] = [];
  const latestSummary = describeMatchForSquad(latestMatch, squadId);
  const latestNarrative = getResultNarrative(
    latestSummary.result,
    latestSummary.opponent,
    latestSummary.goalsFor,
    latestSummary.goalsAgainst,
  );

  highlights.push({
    id: `latest-result-${latestMatch.id}`,
    title: latestNarrative.title,
    description: latestNarrative.description,
    date: toDate(latestMatch.matchDate),
    matchId: latestMatch.id,
    verified: true,
  });

  if (firstSettledMatch && firstSettledMatch.id !== latestMatch.id) {
    const debutSummary = describeMatchForSquad(firstSettledMatch, squadId);
    highlights.push({
      id: `season-debut-${firstSettledMatch.id}`,
      title: 'Verified Debut',
      description: `Opened the run with ${debutSummary.goalsFor}-${debutSummary.goalsAgainst} against ${debutSummary.opponent}.`,
      date: toDate(firstSettledMatch.matchDate),
      matchId: firstSettledMatch.id,
      verified: true,
    });
  }

  if (biggestWin && biggestWin.id !== latestMatch.id && biggestWin.id !== firstSettledMatch?.id) {
    const bestWinSummary = describeMatchForSquad(biggestWin, squadId);
    highlights.push({
      id: `statement-win-${biggestWin.id}`,
      title: 'Statement Win',
      description: `Best verified margin so far: ${bestWinSummary.goalsFor}-${bestWinSummary.goalsAgainst} vs ${bestWinSummary.opponent}.`,
      date: toDate(biggestWin.matchDate),
      matchId: biggestWin.id,
      verified: true,
    });
  }

  return dedupeById(highlights).slice(0, 3);
}

export function enrichPlayerAttributesWithSeasonContext(
  attributes: PlayerAttributes | null,
  matches: SeasonMatchRecord[],
  squadId?: string,
) {
  if (!attributes) {
    return null;
  }

  return {
    ...attributes,
    achievements: dedupeById([
      ...attributes.achievements,
      ...buildSeasonAchievements(attributes, matches, squadId),
    ]),
    careerHighlights: dedupeById([
      ...attributes.careerHighlights,
      ...buildCareerHighlights(matches, squadId),
    ]),
  };
}
