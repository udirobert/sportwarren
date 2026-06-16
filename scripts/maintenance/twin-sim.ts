import { PrismaClient } from '@prisma/client';
import { runSimulation, settleResults } from '../../src/server/services/personalization/twin-sim.js';

const prisma = new PrismaClient();

async function main() {
  console.log('[Maintenance] Starting twin simulation runner...');

  try {
    const pending = await prisma.twinSimulation.findMany({
      where: { status: 'pending' },
      include: { _count: { select: { participants: true } } },
    });

    const eligible = pending.filter((s) => s._count.participants >= 4);
    let processed = 0;

    for (const sim of eligible) {
      try {
        await runSimulation(sim.id);
        await settleResults(sim.id);
        processed++;
      } catch (e) {
        console.error(`[Maintenance] Sim ${sim.id} failed:`, e);
      }
    }

    console.log(`[Maintenance] Twin sim complete: ${processed}/${eligible.length} simulations settled.`);
  } catch (error) {
    console.error('[Maintenance] Twin simulation runner failed:', error);
    process.exit(1);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
