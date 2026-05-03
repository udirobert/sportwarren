import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupExpiredSessions() {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 30);

  console.log(`Cleaning up sessions older than ${cutoffDate.toISOString()}...`);

  const result = await prisma.platformIdentity.deleteMany({
    where: {
      miniAppSessionExpiry: { lt: cutoffDate },
    },
  });

  console.log(`Cleaned up ${result.count} expired sessions`);

  // Also clean up expired Telegram link codes
  const linkResult = await prisma.telegramLinkCode.deleteMany({
    where: {
      expiresAt: { lt: new Date() },
    },
  });

  console.log(`Cleaned up ${linkResult.count} expired Telegram link codes`);
  console.log('Cleanup complete');
}

cleanupExpiredSessions()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
