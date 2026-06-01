import jwt from 'jsonwebtoken';

/**
 * Signed JWT for WhatsApp → Web rate-link authentication.
 *
 * When a match is verified, the WhatsApp agent generates a rate link with
 * this token embedded so players can rate teammates without needing a
 * wallet / Privy session.
 *
 * Token lifetime: 24 hours (matches the peer-rating window).
 */

const RATE_TOKEN_SECRET =
  process.env.RATE_TOKEN_SECRET ||
  process.env.CRON_SECRET ||
  process.env.MEDIA_SHARE_SECRET ||
  'sportwarren-rate-token-fallback-dev';

const RATE_TOKEN_EXPIRY = '24h';

export interface RateTokenPayload {
  /** The match the user is allowed to rate */
  matchId: string;
  /** Internal SportWarren userId (NOT the WhatsApp number) */
  userId: string;
  /** Purpose discriminator — always 'rate' */
  purpose: 'rate';
}

/**
 * Generate a signed JWT for a specific user + match.
 * Called when the WhatsApp agent sends the post-match card.
 */
export function generateRateToken(matchId: string, userId: string): string {
  const payload: RateTokenPayload = {
    matchId,
    userId,
    purpose: 'rate',
  };
  return jwt.sign(payload, RATE_TOKEN_SECRET, { expiresIn: RATE_TOKEN_EXPIRY });
}

/**
 * Verify a rate-token JWT and return the payload.
 * Returns null if the token is invalid, expired, or has wrong purpose.
 */
export function verifyRateToken(token: string): RateTokenPayload | null {
  try {
    const decoded = jwt.verify(token, RATE_TOKEN_SECRET) as RateTokenPayload;
    if (decoded.purpose !== 'rate') return null;
    return decoded;
  } catch {
    return null;
  }
}
