import { NextResponse } from 'next/server';
import { renderPendingBatch } from '@/server/services/personalization/moment-render';

/**
 * Cron endpoint — renders pending moment PNGs.
 *
 * Picks up Moment rows with renderedKey: null and generates shareable
 * card images via satori/resvg.
 *
 * Schedule: every 6 hours
 */
export async function GET(request: Request) {
  console.log('[Cron] Starting moment render batch...');
  const authHeader = request.headers.get('Authorization');
  const expectedSecret = process.env.CRON_SECRET;

  if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const processed = await renderPendingBatch(20);
    console.log(`[Cron] Moment render complete: ${processed} moments rendered.`);
    return NextResponse.json({ processed });
  } catch (error) {
    console.error('[Cron] Moment render failed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
