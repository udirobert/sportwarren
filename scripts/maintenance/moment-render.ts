import { PrismaClient } from '@prisma/client';
import { renderPendingBatch } from '../../src/server/services/personalization/moment-render.js';

const prisma = new PrismaClient();

async function main() {
  console.log('[Maintenance] Starting moment render batch...');

  try {
    const processed = await renderPendingBatch(20);
    console.log(`[Maintenance] Moment render complete: ${processed} moments rendered.`);
  } catch (error) {
    console.error('[Maintenance] Moment render failed:', error);
    process.exit(1);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
