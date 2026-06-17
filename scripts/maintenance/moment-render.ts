/**
 * Hetzner cron entry point — moment-render.
 *
 * Triggered every 6 hours by the system crontab on `snel-bot` via
 * `/opt/sportwarren-api/shared/scripts/maintenance/run-cron.sh`. This is
 * the production cron path. The Next.js API route
 * `src/app/api/cron/moment-render/route.ts` is a parallel demo / manual
 * trigger surface — production reads through here.
 *
 * v2 (`moment-render-v2`) is the default renderer. v1 remains importable
 * as the rollback path; flip via `MOMENT_RENDER_V1_FALLBACK=true` in
 * `/opt/sportwarren-api/shared/.env` if a regression surfaces.
 *
 * v2 routes each moment to a dedicated archetype card from the CARDS
 * registry (`src/components/moments/cards`) when one exists, falling back
 * to `DefaultCard` for unmapped kinds. The fallback count is logged so the
 * rollout from "library at 2 of 10 archetypes" to "fully mapped" is
 * observable from the cron log alone.
 */

import { PrismaClient } from '@prisma/client';
import { renderPendingBatch as renderV1 } from '../../src/server/services/personalization/moment-render.js';
import {
  renderPendingBatch as renderV2,
  v2HandledKinds,
} from '../../src/server/services/personalization/moment-render-v2.js';

const prisma = new PrismaClient();
const BATCH_SIZE = 20;

async function main() {
  const fallbackFlag = process.env.MOMENT_RENDER_V1_FALLBACK;
  const useV1 = fallbackFlag === 'true' || fallbackFlag === '1';
  const renderer = useV1 ? 'v1' : 'v2';

  console.log(
    `[Maintenance] Starting moment render batch via ${renderer} (v2HandledKinds=${JSON.stringify(v2HandledKinds())}, batch=${BATCH_SIZE})`,
  );

  try {
    if (useV1) {
      const processed = await renderV1(BATCH_SIZE);
      console.log(`[Maintenance] Moment render complete via v1: ${processed} moments rendered.`);
      return;
    }

    const result = await renderV2(BATCH_SIZE);
    console.log(
      `[Maintenance] Moment render complete via v2: processed=${result.processed} failed=${result.failed} fallbackCount=${result.fallbackCount} byKind=${JSON.stringify(result.byKind)}`,
    );
  } catch (error) {
    console.error(`[Maintenance] Moment render failed (${renderer}):`, error);
    process.exit(1);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
