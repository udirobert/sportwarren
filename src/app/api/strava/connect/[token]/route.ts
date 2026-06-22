/**
 * Strava OAuth init — `GET /api/strava/connect/[token]`.
 *
 * Token-gated (auth-by-URL pattern). Resolves the user, builds the
 * Strava authorize URL with `state=<token>` so the callback can find
 * the user again, then 302s the player to Strava.
 *
 * Returns 503 when Strava env vars aren't configured — keeps the
 * scaffold inert in environments that haven't set up the integration.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { buildAuthorizeUrl, readStravaConfig } from '@/server/services/strava/oauth';

interface PageProps {
  params: Promise<{ token: string }>;
}

export async function GET(_req: NextRequest, { params }: PageProps) {
  const { token } = await params;

  const config = readStravaConfig();
  if (!config) {
    return NextResponse.json(
      { error: 'Strava integration not configured' },
      { status: 503 },
    );
  }

  const user = await prisma.user.findUnique({
    where: { walletAddress: token },
    select: { id: true, chain: true },
  });
  if (!user || user.chain !== 'preview') {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }

  const authorizeUrl = buildAuthorizeUrl(config, token);
  return NextResponse.redirect(authorizeUrl);
}
