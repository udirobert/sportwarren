import { timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';

/** Fail-closed authorization for externally reachable maintenance routes. */
export function requireCronAuthorization(request: Request): NextResponse | null {
  const secret = process.env.CRON_SECRET?.trim();

  if (!secret) {
    console.error('[Cron] CRON_SECRET is not configured; refusing to execute job.');
    return NextResponse.json({ error: 'Cron is not configured' }, { status: 503 });
  }

  const expected = `Bearer ${secret}`;
  const actual = request.headers.get('Authorization') ?? '';
  const authorized =
    actual.length === expected.length &&
    timingSafeEqual(Buffer.from(actual), Buffer.from(expected));

  return authorized ? null : NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
