/**
 * Quick dump of all preview-tier users + their three URLs.
 * Single-use utility — captain reaches for this when DM'ing fresh links.
 *
 * Usage: pnpm tsx scripts/list-preview-tokens.ts
 */
import * as dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env', override: false });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter, log: ['error'] });

async function main() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://sportwarren.com';

  const users = await prisma.user.findMany({
    where: { chain: 'preview' },
    select: {
      name: true,
      walletAddress: true,
      handle: true,
      discoverable: true,
      position: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  console.log(`\n${users.length} preview users:\n`);
  for (const u of users) {
    const token = u.walletAddress;
    const dashboard = `${baseUrl}/preview/${token}`;
    const clubhouse = `${baseUrl}/preview/${token}/squad`;
    const publicProfile = u.handle && u.discoverable ? `${baseUrl}/player/${u.handle}` : '(not discoverable)';
    console.log(`${u.name ?? '(unnamed)'} (${u.position ?? '—'}) · handle=${u.handle ?? '(none)'} · discoverable=${u.discoverable ? '✓' : '✗'}`);
    console.log(`  Dashboard:      ${dashboard}`);
    console.log(`  Clubhouse:      ${clubhouse}`);
    console.log(`  Public profile: ${publicProfile}`);
    console.log('');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
