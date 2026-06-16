/**
 * Backfill Match Formations
 *
 * Scans existing matches where homeFormation or awayFormation is null and
 * attempts to fill them from the SquadTactics table. This is a one-time
 * maintenance script that should be run after deploying the new migration.
 *
 * Usage:
 *   npx tsx scripts/maintenance/backfill-match-formations.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Scanning matches with missing formations...');

  const matches = await prisma.match.findMany({
    where: {
      OR: [
        { homeFormation: null },
        { awayFormation: null },
      ],
    },
    select: {
      id: true,
      homeSquadId: true,
      awaySquadId: true,
      homeFormation: true,
      awayFormation: true,
    },
    take: 1000,
  });

  console.log(`Found ${matches.length} matches with missing formations.`);

  let updated = 0;
  for (const match of matches) {
    const updates: Record<string, string> = {};

    if (!match.homeFormation) {
      const tactics = await prisma.squadTactics.findUnique({
        where: { squadId: match.homeSquadId },
        select: { formation: true },
      });
      if (tactics?.formation) {
        updates.homeFormation = tactics.formation;
      }
    }

    if (!match.awayFormation) {
      const tactics = await prisma.squadTactics.findUnique({
        where: { squadId: match.awaySquadId },
        select: { formation: true },
      });
      if (tactics?.formation) {
        updates.awayFormation = tactics.formation;
      }
    }

    if (Object.keys(updates).length > 0) {
      await prisma.match.update({
        where: { id: match.id },
        data: updates,
      });
      updated++;
    }
  }

  console.log(`✅ Updated ${updated} matches with formation data.`);
  console.log(`ℹ️  ${matches.length - updated} matches still have missing formations (no tactics configured).`);
}

main()
  .catch((e) => {
    console.error('❌ Backfill failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
