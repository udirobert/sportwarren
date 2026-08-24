/**
 * Read-only preflight for 20260824000000_atomic_match_xp_and_twin_revisions.
 *
 * It never mutates records. Run it against production before `prisma migrate
 * deploy`; duplicate rows must be deliberately reconciled before the unique
 * match/profile award constraint can be installed.
 */
import * as dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env', override: false });

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  const duplicateAwards = await prisma.$queryRaw<Array<{
    matchId: string;
    profileId: string;
    awardCount: bigint;
    totalXp: bigint;
  }>>`
    SELECT
      "match_id" AS "matchId",
      "profile_id" AS "profileId",
      COUNT(*) AS "awardCount",
      SUM("total_xp") AS "totalXp"
    FROM "xp_gains"
    WHERE "match_id" IS NOT NULL
    GROUP BY "match_id", "profile_id"
    HAVING COUNT(*) > 1
    ORDER BY COUNT(*) DESC, "match_id", "profile_id"
  `;

  const partialAwards = await prisma.$queryRaw<Array<{
    matchId: string;
    profileId: string;
    xpEarned: number;
    totalXp: bigint;
  }>>`
    SELECT
      gain."match_id" AS "matchId",
      gain."profile_id" AS "profileId",
      stats."xp_earned" AS "xpEarned",
      SUM(gain."total_xp") AS "totalXp"
    FROM "xp_gains" gain
    JOIN "player_match_stats" stats
      ON stats."match_id" = gain."match_id"
      AND stats."profile_id" = gain."profile_id"
    WHERE gain."match_id" IS NOT NULL
    GROUP BY gain."match_id", gain."profile_id", stats."xp_earned"
    HAVING SUM(gain."total_xp") <> stats."xp_earned"
    ORDER BY gain."match_id", gain."profile_id"
  `;

  const report = {
    generatedAt: new Date().toISOString(),
    duplicateAwardCount: duplicateAwards.length,
    partialAwardCount: partialAwards.length,
    duplicateAwards: duplicateAwards.map((row) => ({ ...row, awardCount: Number(row.awardCount), totalXp: Number(row.totalXp) })),
    partialAwards: partialAwards.map((row) => ({ ...row, totalXp: Number(row.totalXp) })),
  };

  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  if (duplicateAwards.length > 0) process.exitCode = 2;
}

main()
  .catch((error) => {
    console.error('[match-xp-reconciliation] report failed', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
