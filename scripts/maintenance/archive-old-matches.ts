import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function archiveOldMatches() {
  const cutoffDate = new Date();
  cutoffDate.setFullYear(cutoffDate.getFullYear() - 1);

  console.log(`Archiving matches older than ${cutoffDate.toISOString()}...`);

  const oldMatches = await prisma.match.findMany({
    where: {
      createdAt: { lt: cutoffDate },
      status: 'verified',
    },
    select: { id: true, createdAt: true },
    take: 100,
  });

  console.log(`Found ${oldMatches.length} matches to archive`);

  for (const match of oldMatches) {
    await prisma.match.update({
      where: { id: match.id },
      data: { status: 'archived' },
    });
    console.log(`Archived match ${match.id} from ${match.createdAt.toISOString()}`);
  }

  console.log('Archive complete');
}

archiveOldMatches()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
