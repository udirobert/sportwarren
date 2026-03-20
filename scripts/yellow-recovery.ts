import 'dotenv/config';
import { prisma } from '../src/lib/db';
import { yellowService } from '../server/services/blockchain/yellow';
import { runYellowRecovery } from '../server/services/blockchain/yellow-recovery';

function readStaleMinutesArg() {
  const arg = process.argv.find((entry) => entry.startsWith('--stale-minutes='));
  if (!arg) {
    return 15;
  }

  const value = Number(arg.split('=')[1]);
  return Number.isFinite(value) && value > 0 ? value : 15;
}

async function main() {
  const staleMinutes = readStaleMinutesArg();
  const staleAfterMs = staleMinutes * 60 * 1000;

  console.log('Yellow rail status:', yellowService.getRailStatus());
  console.log(`Running Yellow recovery with stale threshold ${staleMinutes} minute(s)...`);

  const report = await runYellowRecovery(prisma, { staleAfterMs });
  console.log(JSON.stringify(report, null, 2));

  if (report.errors.length > 0) {
    process.exitCode = 1;
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
