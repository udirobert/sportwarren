/**
 * Player Head-to-Head Engine
 *
 * Computes player-vs-player rivalry stats and player-vs-player teammate synergy
 * from match participation data. Works across all squad contexts — stable
 * player-to-player relationships regardless of which squad they were on.
 *
 * Two primary functions:
 * - computePlayerRivalries: players who were opponents (different teamSide)
 * - computePlayerDuos: players who were teammates (same teamSide)
 *
 * All functions are DB-backed (no I/O params) — they fetch + compute in one call.
 */

import type { PrismaClient } from '@prisma/client';

// ── Public types ────────────────────────────────────────────────────────────

export interface PlayerMatchupIdentity {
  profileId: string;
  name: string;
  avatar: string | null;
  position: string | null;
}

export interface RivalryStat {
  opponent: PlayerMatchupIdentity;
  matchesPlayed: number;
  playerWins: number;
  opponentWins: number;
  draws: number;
  playerWinRate: number; // 0–100
  opponentWinRate: number; // 0–100
  currentStreak: number; // positive = player winning streak, negative = opponent streak
  playerGoals: number; // goals scored by the target player in these matchups
  opponentGoals: number; // goals scored by the opponent in these matchups
  lastMeeting: Date | null;
  lastResult: 'win' | 'loss' | 'draw' | null;
}

export interface DuoStat {
  partner: PlayerMatchupIdentity;
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  winRate: number; // 0–100
  totalGoals: number; // total goals scored when playing together
  averageRating: number | null; // average of both players' ratings together
}

// ── Internal types ──────────────────────────────────────────────────────────

interface OpponentAgg {
  opponentProfileId: string;
  matchesPlayed: number;
  playerWins: number;
  opponentWins: number;
  draws: number;
  playerGoals: number;
  opponentGoals: number;
  /** Ordered list of results for streak calculation (most recent last) */
  resultHistory: Array<{ result: 'win' | 'loss' | 'draw'; matchDate: Date }>;
  lastMeeting: Date | null;
}

interface PartnerAgg {
  partnerProfileId: string;
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  totalGoals: number;
  totalRating: number;
  ratingCount: number;
}

// ── Main fetch + compute ───────────────────────────────────────────────────-

/**
 * Fetches all match participation data for a player where teamSide is set,
 * then computes rivalry stats against every other player they've faced.
 *
 * Results sorted by "intensity" — a combination of matchesPlayed × competitiveness.
 */
export async function computePlayerRivalries(
  prisma: PrismaClient,
  profileId: string,
): Promise<RivalryStat[]> {
  // Fetch all PlayerMatchStats rows for this player where teamSide is known
  const myStats = await prisma.playerMatchStats.findMany({
    where: { profileId, teamSide: { not: null } },
    select: { matchId: true, teamSide: true, goals: true, match: { select: { homeScore: true, awayScore: true, matchDate: true } } },
  });

  if (myStats.length === 0) return [];

  // Collect match IDs for batch fetch of opponent stats
  const matchIds = myStats.map((s) => s.matchId);
  const myStatsByMatch = new Map(myStats.map((s) => [s.matchId, s]));

  // Fetch all PlayerMatchStats rows for these matches where teamSide is known
  // (excluding the target player)
  const opponentStats = await prisma.playerMatchStats.findMany({
    where: {
      matchId: { in: matchIds },
      profileId: { not: profileId },
      teamSide: { not: null },
    },
    select: {
      matchId: true,
      profileId: true,
      teamSide: true,
      goals: true,
      profile: {
        select: {
          userId: true,
          user: { select: { name: true, avatar: true, position: true } },
        },
      },
    },
  });

  if (opponentStats.length === 0) return [];

  // Build player identity map
  const identityMap = new Map<string, PlayerMatchupIdentity>();
  for (const os of opponentStats) {
    if (!identityMap.has(os.profileId)) {
      identityMap.set(os.profileId, {
        profileId: os.profileId,
        name: os.profile.user?.name ?? 'Unknown Player',
        avatar: os.profile.user?.avatar ?? null,
        position: os.profile.user?.position ?? null,
      });
    }
  }

  // Aggregate opponent-by-opponent
  const rivalryMap = new Map<string, OpponentAgg>();

  for (const os of opponentStats) {
    const myStat = myStatsByMatch.get(os.matchId);
    if (!myStat) continue;

    // Skip if we were on the same team — this is for rivalries only
    if (myStat.teamSide === os.teamSide) continue;

    // Determine match result from target player's perspective
    const match = myStat.match;
    const isPlayerHome = myStat.teamSide === 'home';
    const playerGoalsFor = isPlayerHome ? (match.homeScore ?? 0) : (match.awayScore ?? 0);
    const playerGoalsAgainst = isPlayerHome ? (match.awayScore ?? 0) : (match.homeScore ?? 0);

    let result: 'win' | 'loss' | 'draw';
    if (playerGoalsFor > playerGoalsAgainst) result = 'win';
    else if (playerGoalsFor < playerGoalsAgainst) result = 'loss';
    else result = 'draw';

    let agg = rivalryMap.get(os.profileId);
    if (!agg) {
      agg = {
        opponentProfileId: os.profileId,
        matchesPlayed: 0,
        playerWins: 0,
        opponentWins: 0,
        draws: 0,
        playerGoals: 0,
        opponentGoals: 0,
        resultHistory: [],
        lastMeeting: null,
      };
      rivalryMap.set(os.profileId, agg);
    }

    agg.matchesPlayed += 1;
    if (result === 'win') agg.playerWins += 1;
    else if (result === 'loss') agg.opponentWins += 1;
    else agg.draws += 1;

    // Track goals — opponentProfileId scored os.goals against us
    agg.playerGoals += myStat.goals;
    agg.opponentGoals += os.goals;

    agg.resultHistory.push({ result, matchDate: match.matchDate });

    if (!agg.lastMeeting || match.matchDate > agg.lastMeeting) {
      agg.lastMeeting = match.matchDate;
    }
  }

  // Build final rivalry stats
  const rivalries: RivalryStat[] = [];

  for (const agg of rivalryMap.values()) {
    const identity = identityMap.get(agg.opponentProfileId);
    if (!identity) continue;

    // Calculate current streak from the end of resultHistory (most recent matches)
    agg.resultHistory.sort((a, b) => a.matchDate.getTime() - b.matchDate.getTime());
    let currentStreak = 0;
    for (let i = agg.resultHistory.length - 1; i >= 0; i--) {
      const r = agg.resultHistory[i].result;
      if (r === 'draw') break; // draw breaks streak
      if (currentStreak === 0) {
        currentStreak = r === 'win' ? 1 : -1;
      } else {
        if ((currentStreak > 0 && r === 'win') || (currentStreak < 0 && r === 'loss')) {
          currentStreak += currentStreak > 0 ? 1 : -1;
        } else {
          break;
        }
      }
    }

    // Last result
    const lastResult = agg.resultHistory.length > 0
      ? agg.resultHistory[agg.resultHistory.length - 1].result
      : null;

    rivalries.push({
      opponent: identity,
      matchesPlayed: agg.matchesPlayed,
      playerWins: agg.playerWins,
      opponentWins: agg.opponentWins,
      draws: agg.draws,
      playerWinRate: Math.round((agg.playerWins / agg.matchesPlayed) * 100),
      opponentWinRate: Math.round((agg.opponentWins / agg.matchesPlayed) * 100),
      currentStreak,
      playerGoals: agg.playerGoals,
      opponentGoals: agg.opponentGoals,
      lastMeeting: agg.lastMeeting,
      lastResult,
    });
  }

  // Sort by intensity: matchesPlayed × (1 - abs(winRate - 50)/50) — close rivalries rank higher
  rivalries.sort((a, b) => {
    const intensityA = a.matchesPlayed * (1 - Math.abs(a.playerWinRate - 50) / 50);
    const intensityB = b.matchesPlayed * (1 - Math.abs(b.playerWinRate - 50) / 50);
    return intensityB - intensityA;
  });

  return rivalries;
}

/**
 * Computes teammate synergy — players who were on the same teamSide in matches.
 *
 * Sorted by win rate descending, minimum 3 matches together.
 */
export async function computePlayerDuos(
  prisma: PrismaClient,
  profileId: string,
): Promise<DuoStat[]> {
  // Fetch all PlayerMatchStats rows for this player where teamSide is known
  const myStats = await prisma.playerMatchStats.findMany({
    where: { profileId, teamSide: { not: null } },
    select: { matchId: true, teamSide: true, goals: true, rating: true },
  });

  if (myStats.length === 0) return [];

  const matchIds = myStats.map((s) => s.matchId);

  // Create a lookup keyed by matchId → my stats for that match
  const myStatsByMatch = new Map(myStats.map((s) => [s.matchId, s]));

  // Fetch partner stats: other players with same matchId AND same teamSide
  const partnerStats = await prisma.playerMatchStats.findMany({
    where: {
      matchId: { in: matchIds },
      profileId: { not: profileId },
      teamSide: { not: null },
    },
    select: {
      matchId: true,
      profileId: true,
      teamSide: true,
      goals: true,
      rating: true,
      match: { select: { homeScore: true, awayScore: true } },
      profile: {
        select: {
          userId: true,
          user: { select: { name: true, avatar: true, position: true } },
        },
      },
    },
  });

  if (partnerStats.length === 0) return [];

  // Build identity map
  const identityMap = new Map<string, PlayerMatchupIdentity>();
  for (const ps of partnerStats) {
    if (!identityMap.has(ps.profileId)) {
      identityMap.set(ps.profileId, {
        profileId: ps.profileId,
        name: ps.profile.user?.name ?? 'Unknown Player',
        avatar: ps.profile.user?.avatar ?? null,
        position: ps.profile.user?.position ?? null,
      });
    }
  }

  // Aggregate partner-by-partner
  const duoMap = new Map<string, PartnerAgg>();

  for (const ps of partnerStats) {
    const myStat = myStatsByMatch.get(ps.matchId);
    if (!myStat) continue;

    // Only same-team pairings
    if (myStat.teamSide !== ps.teamSide) continue;

    // Determine match result from the team's perspective
    const match = ps.match;
    const isHome = ps.teamSide === 'home';
    const teamScore = isHome ? (match.homeScore ?? 0) : (match.awayScore ?? 0);
    const opponentScore = isHome ? (match.awayScore ?? 0) : (match.homeScore ?? 0);

    const isWin = teamScore > opponentScore;
    const isDraw = teamScore === opponentScore;

    let agg = duoMap.get(ps.profileId);
    if (!agg) {
      agg = {
        partnerProfileId: ps.profileId,
        matchesPlayed: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        totalGoals: 0,
        totalRating: 0,
        ratingCount: 0,
      };
      duoMap.set(ps.profileId, agg);
    }

    agg.matchesPlayed += 1;
    if (isWin) agg.wins += 1;
    else if (isDraw) agg.draws += 1;
    else agg.losses += 1;

    agg.totalGoals += teamScore;

    // Aggregate ratings — take the higher of the two players' ratings as
    // a proxy for combined impact (or average them — this is arbitrary)
    const myRating = myStat.rating ?? 0;
    const partnerRating = ps.rating ?? 0;
    const combinedRating = Math.max(myRating, partnerRating);
    if (combinedRating > 0) {
      agg.totalRating += combinedRating;
      agg.ratingCount += 1;
    }
  }

  // Build final duo stats
  const duos: DuoStat[] = [];

  for (const agg of duoMap.values()) {
    if (agg.matchesPlayed < 3) continue; // minimum sample

    const identity = identityMap.get(agg.partnerProfileId);
    if (!identity) continue;

    duos.push({
      partner: identity,
      matchesPlayed: agg.matchesPlayed,
      wins: agg.wins,
      draws: agg.draws,
      losses: agg.losses,
      winRate: Math.round((agg.wins / agg.matchesPlayed) * 100),
      totalGoals: agg.totalGoals,
      averageRating: agg.ratingCount > 0
        ? Math.round((agg.totalRating / agg.ratingCount) * 10) / 10
        : null,
    });
  }

  duos.sort((a, b) => b.winRate - a.winRate);

  return duos;
}
