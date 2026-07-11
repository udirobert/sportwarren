/**
 * Session-reveal: the ONE shared "who's who" link the organizer posts
 * publicly (game-day comments, a group chat) so players who were never
 * pre-seeded a phone number can still self-identify their own name and
 * land on their own preview card.
 *
 * Redis-backed rather than a new Postgres column — `Squad.shortName` isn't
 * unique, so it can't safely be the lookup key for a public, unauthenticated
 * page, and a "who's who for this one game" link is inherently short-lived
 * (nobody needs it a month later). A random token avoids the collision risk
 * and the TTL matches the artifact's real lifespan.
 */

import { redisService } from '../redis';

export const SESSION_REVEAL_TTL_SECONDS = 60 * 60 * 48; // 48h — covers game day + a buffer

export interface SessionRevealPointer {
  squadId: string;
  sessionId: string;
}

export function sessionRevealRedisKey(token: string): string {
  return `sessionreveal:${token}`;
}

export async function saveSessionReveal(token: string, pointer: SessionRevealPointer): Promise<void> {
  await redisService.set(sessionRevealRedisKey(token), JSON.stringify(pointer), SESSION_REVEAL_TTL_SECONDS);
}

export async function getSessionReveal(token: string): Promise<SessionRevealPointer | null> {
  const raw = await redisService.get(sessionRevealRedisKey(token));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionRevealPointer;
  } catch {
    return null;
  }
}
