import { NextResponse } from 'next/server';
import { renderPendingBatch as renderV1 } from '@/server/services/personalization/moment-render';
import {
  renderPendingBatch as renderV2,
  v2HandledKinds,
} from '@/server/services/personalization/moment-render-v2';

/**
 * Cron endpoint — renders pending moment PNGs.
 *
 * Picks up Moment rows with renderedKey: null and generates shareable
 * card images via satori/resvg.
 *
 * Schedule: every 6 hours
 *
 * Renderer selection
 * ------------------
 * Two pipelines coexist during the moment-card library rollout:
 *  - v1 — the original hardcoded satori template (Inter + 135° gradient)
 *  - v2 — the per-archetype, design-system-bound pipeline driven by the
 *         CARDS registry in `src/components/moments/cards/`
 *
 * **v2 is now the default.** v1 remains accessible as a fallback in case
 * the rollout uncovers a regression. Selection order:
 *  1. `?v=1` or `?v=2` query param wins (single-run override).
 *  2. `MOMENT_RENDER_V1_FALLBACK` env var — set to `true`/`1` to flip the
 *     default back to v1 globally without a redeploy.
 *  3. Default — v2.
 *
 * v2 internally falls back to its `DefaultCard` for kinds that don't yet
 * have a dedicated archetype, so flipping the default forward is safe
 * even with the library at 2 of 10 archetypes — unmapped kinds still
 * render through Space Grotesk + the design tokens, just without the
 * archetype-specific composition. The response payload exposes the
 * fallback count so the cron's progression toward a fully-mapped
 * library is observable.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get('Authorization');
  const expectedSecret = process.env.CRON_SECRET;
  if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const versionParam = url.searchParams.get('v');
  const fallbackFlag = process.env.MOMENT_RENDER_V1_FALLBACK;
  const v1Forced = fallbackFlag === 'true' || fallbackFlag === '1';
  const useV1 = versionParam === '1' || (versionParam !== '2' && v1Forced);
  const renderer = useV1 ? 'v1' : 'v2';

  console.log(
    `[Cron] Starting moment render batch via ${renderer} (v2HandledKinds=${JSON.stringify(
      v2HandledKinds(),
    )})`,
  );

  try {
    if (useV1) {
      const processed = await renderV1(20);
      console.log(
        `[Cron] Moment render complete: ${processed} moments rendered via v1.`,
      );
      return NextResponse.json({ processed, renderer, v2HandledKinds: v2HandledKinds() });
    }

    const result = await renderV2(20);
    console.log(
      `[Cron] Moment render complete via v2: processed=${result.processed} failed=${result.failed} fallbackCount=${result.fallbackCount} byKind=${JSON.stringify(result.byKind)}`,
    );
    return NextResponse.json({
      processed: result.processed,
      renderer,
      v2HandledKinds: v2HandledKinds(),
      byKind: result.byKind,
      fallbackCount: result.fallbackCount,
      failed: result.failed,
    });
  } catch (error) {
    console.error(`[Cron] Moment render failed (${renderer}):`, error);
    return NextResponse.json({ error: 'Internal server error', renderer }, { status: 500 });
  }
}
