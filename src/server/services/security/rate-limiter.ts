import { redisService } from '../redis';
import { TRPCError } from '@trpc/server';

export interface RateLimitOptions {
  windowMs: number;
  max: number;
  keyPrefix?: string;
  /** When true, deny requests if Redis is unavailable (for financial/critical operations) */
  strict?: boolean;
}

export async function checkRateLimit(
  identifier: string,
  options: RateLimitOptions
): Promise<{ 
  allowed: boolean; 
  remaining: number; 
  resetAt: number;
}> {
  const { windowMs, max, keyPrefix = 'rl', strict = false } = options;
  const key = `${keyPrefix}:${identifier}`;
  
  // Use window bucket (e.g., 1-minute bucket)
  const now = Date.now();
  const bucket = Math.floor(now / windowMs);
  const bucketKey = `${key}:${bucket}`;
  
  const count = await redisService.incr(bucketKey, Math.ceil(windowMs / 1000) * 2);
  
  if (count === null) {
    if (strict) {
      console.error('[RateLimiter] Redis is down, DENYING request for', identifier);
      return { allowed: false, remaining: 0, resetAt: now + windowMs };
    }
    console.warn('[RateLimiter] Redis is down, bypassing rate limit for', identifier);
    return { allowed: true, remaining: max, resetAt: now + windowMs };
  }

  const remaining = Math.max(0, max - count);
  const resetAt = (bucket + 1) * windowMs;

  return {
    allowed: count <= max,
    remaining,
    resetAt,
  };
}

/**
 * Helper to throw TRPCError if rate limit is exceeded
 */
export async function enforceRateLimit(
  identifier: string,
  options: RateLimitOptions
): Promise<void> {
  const result = await checkRateLimit(identifier, options);
  
  if (!result.allowed) {
    const waitSeconds = Math.ceil((result.resetAt - Date.now()) / 1000);
    throw new TRPCError({
      code: 'TOO_MANY_REQUESTS',
      message: `Too many requests. Please try again in ${waitSeconds} seconds.`,
    });
  }
}
