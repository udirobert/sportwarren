import type { PrismaClient } from '@prisma/client';
import { prisma as defaultPrisma } from '@/lib/db';
import { getTwinService } from './twin-service';

export async function createSeason(
  name: string,
  startDate: Date,
  endDate: Date,
  db: PrismaClient = defaultPrisma,
) {
  return db.season.create({
    data: { name, startDate, endDate, status: 'active' },
  });
}

export async function endSeason(
  seasonId: string,
  db: PrismaClient = defaultPrisma,
): Promise<number> {
  const season = await db.season.findUnique({ where: { id: seasonId } });
  if (!season || season.status !== 'active') return 0;

  const twinService = getTwinService();
  let settled = 0;

  const playerTwins = await db.playerTwin.findMany({
    select: { id: true, level: true },
    where: { level: { gte: 1 } },
  });

  for (const twin of playerTwins) {
    try {
      const stats = await aggregateSeasonStats(db, twin.id, 'player', season.startDate, season.endDate);
      await twinService.recordEvent({
        kind: 'season_end',
        twinId: twin.id,
        seasonId,
        summary: stats,
      });
      settled++;
    } catch (err) {
      console.warn(`season_end failed for player twin ${twin.id}:`, err);
    }
  }

  const squadTwins = await db.squadTwin.findMany({
    select: { id: true, level: true },
    where: { level: { gte: 1 } },
  });

  for (const twin of squadTwins) {
    try {
      const stats = await aggregateSeasonStats(db, twin.id, 'squad', season.startDate, season.endDate);
      await twinService.recordEvent({
        kind: 'season_end',
        twinId: twin.id,
        seasonId,
        summary: stats,
      });
      settled++;
    } catch (err) {
      console.warn(`season_end failed for squad twin ${twin.id}:`, err);
    }
  }

  await db.season.update({
    where: { id: seasonId },
    data: { status: 'completed' },
  });

  return settled;
}

async function aggregateSeasonStats(
  db: PrismaClient,
  _twinId: string,
  _scope: 'player' | 'squad',
  _startDate: Date,
  _endDate: Date,
) {
  return {
    matchesPlayed: 0,
    goalsScored: 0,
    assists: 0,
    mvp: 0,
  };
}
