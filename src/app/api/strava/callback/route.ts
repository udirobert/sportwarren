/**
 * Strava OAuth callback — `GET /api/strava/callback`.
 *
 * Strava redirects here with `?code=<auth_code>&state=<preview_token>`
 * after the player approves. We exchange the code for tokens and
 * persist them on the User row, then redirect back to the customize
 * page with a success flag.
 *
 * Errors (denial, missing code, exchange failure) redirect back with
 * `?strava=error` so the customize page can show a friendly message.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { exchangeCode, readStravaConfig } from '@/server/services/strava/oauth';

function backToCustomize(token: string, flag: 'ok' | 'error' | 'denied' | 'misconfigured') {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://sportwarren.com';
  return NextResponse.redirect(`${base}/preview/${encodeURIComponent(token)}/customize?strava=${flag}`);
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');

  // `state` is the preview token — we always need it to know where to send the player.
  if (!state) {
    return NextResponse.json({ error: 'missing state' }, { status: 400 });
  }

  if (error) {
    return backToCustomize(state, 'denied');
  }

  const config = readStravaConfig();
  if (!config) {
    return backToCustomize(state, 'misconfigured');
  }
  if (!code) {
    return backToCustomize(state, 'error');
  }

  const user = await prisma.user.findUnique({
    where: { walletAddress: state },
    select: { id: true, chain: true },
  });
  if (!user || user.chain !== 'preview') {
    return backToCustomize(state, 'error');
  }

  try {
    const tokens = await exchangeCode(config, code);
    if (!tokens.athlete?.id) {
      return backToCustomize(state, 'error');
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        stravaAthleteId: String(tokens.athlete.id),
        stravaAccessToken: tokens.access_token,
        stravaRefreshToken: tokens.refresh_token,
        stravaTokenExpiresAt: new Date(tokens.expires_at * 1000),
        stravaScopes: tokens.scope ?? null,
        stravaConnectedAt: new Date(),
      },
    });

    return backToCustomize(state, 'ok');
  } catch (err) {
    console.warn('[strava/callback] exchange failed:', err);
    return backToCustomize(state, 'error');
  }
}
