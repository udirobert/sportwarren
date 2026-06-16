/**
 * Backfill team_side for existing PlayerMatchStats rows.
 *
 * For each match with player stats that have null team_side, derives the value
 * from the player's squad membership at match time:
 * - Player belongs to match.homeSquadId → 'home'
 * - Player belongs to match.awaySquadId → 'away'
 * - Neither → left null (ambiguous)
 *
 * Usage: npx tsx scripts/maintenance/backfill-player-match-team-side.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Finding PlayerMatchStats rows with null team_side...');

  const nullRows = await prisma.playerMatchStats.findMany({
    where: { teamSide: null },
    include: {
      match: {
        select: { homeSquadId: true, awaySquadId: true },
      },
    },
    take: 5000, // Safety limit per run
  });

  console.log(`Found ${nullRows.length} rows to process.`);

  let homeCount = 0;
  let awayCount = 0;
  let skippedCount = 0;

  for (const row of nullRows) {
    // Determine which squad the player's profile belongs to
    // We need to find the SquadPlayerContext or SquadMember that links
    // this profile's user to one of the match squads
    const profile = await prisma.playerProfile.findUnique({
      where: { id: row.profileId },
      select: { userId: true },
    });

    if (!profile) {
      skippedCount++;
      continue;
    }

    const membership = await prisma.squadMember.findFirst({
      where: {
        userId: profile.userId,
        squadId: { in: [row.match.homeSquadId, row.match.awaySquadId] },
        status: 'active',
      },
      select: { squadId: true },
    });

    if (!membership) {
      skippedCount++;
      continue;
    }

    const teamSide = membership.squadId === row.match.homeSquadId ? 'home' : 'away';

    await prisma.playerMatchStats.update({
      where: { id: row.id },
      data: { teamSide },
    });

    if (teamSide === 'home') homeCount++;
    else awayCount++;
  }

  console.log(`✅ Done. ${homeCount} home + ${awayCount} away = ${homeCount + awayCount} updated, ${skippedCount} skipped (ambiguous).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
