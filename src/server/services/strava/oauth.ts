/**
 * Strava OAuth helpers — client-id / client-secret / redirect-uri
 * resolution + token-exchange + token-refresh.
 *
 * v1 scope: read + activity:read (enough to pull a player's runs).
 * Webhook subscription + activity→attribute delta mapping is deferred
 * to post-Tuesday — this scaffold just stores the tokens so the link
 * survives across sessions.
 */

const STRAVA_AUTHORIZE_URL = 'https://www.strava.com/oauth/authorize';
const STRAVA_TOKEN_URL = 'https://www.strava.com/oauth/token';

export const STRAVA_SCOPES = 'read,activity:read';

interface StravaConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export function readStravaConfig(): StravaConfig | null {
  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://sportwarren.com';
  if (!clientId || !clientSecret) return null;
  return {
    clientId,
    clientSecret,
    redirectUri: `${baseUrl}/api/strava/callback`,
  };
}

/**
 * Build the URL we redirect the player to so Strava prompts for
 * permission. `state` carries the preview token so the callback can
 * resolve the user without a separate session.
 */
export function buildAuthorizeUrl(config: StravaConfig, state: string): string {
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    approval_prompt: 'auto',
    scope: STRAVA_SCOPES,
    state,
  });
  return `${STRAVA_AUTHORIZE_URL}?${params.toString()}`;
}

export interface StravaTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_at: number; // unix seconds
  athlete?: { id: number };
  scope?: string;
}

/** Exchange an authorization code for tokens. */
export async function exchangeCode(
  config: StravaConfig,
  code: string,
): Promise<StravaTokenResponse> {
  const res = await fetch(STRAVA_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code,
      grant_type: 'authorization_code',
    }),
  });
  if (!res.ok) throw new Error(`Strava token exchange failed: ${res.status}`);
  return (await res.json()) as StravaTokenResponse;
}
