import TelegramBot from "node-telegram-bot-api";
import { prisma } from "@/lib/db";
import { findPlatformIdentityByChatId } from "../../platform-connections";
import type { CommandContext, ResolvedIdentity, RateLimitResult } from "../types";

/**
 * Identity Resolution Middleware
 * CLEAN: Single place for auth logic
 */

// In-memory rate limiting (userId -> timestamps)
const rateLimitStore = new Map<string, number[]>();

/**
 * Resolve identity from chatId
 * Returns null if not linked
 */
export async function resolveIdentity(chatId: number): Promise<ResolvedIdentity | null> {
  const identity = await findPlatformIdentityByChatId(prisma, String(chatId));
  
  if (!identity) {
    return null;
  }
  
  return {
    identityId: identity.id,
    userId: identity.userId,
    username: identity.username ?? undefined,
    firstName: identity.firstName ?? undefined,
    squads: identity.user.squads.map(s => ({
      squadId: s.squadId,
      squadName: s.squad.name,
      role: s.role,
    })),
  };
}

/**
 * Check rate limit for a user
 * PERFORMANT: In-memory with sliding window
 */
export async function checkRateLimit(
  userId: string,
  maxRequests: number,
  windowMs: number
): Promise<RateLimitResult> {
  const now = Date.now();
  const windowStart = now - windowMs;
  
  // Get existing timestamps
  let timestamps = rateLimitStore.get(userId) ?? [];
  
  // Filter to within window
  timestamps = timestamps.filter(ts => ts > windowStart);
  
  // Check if allowed
  const allowed = timestamps.length < maxRequests;
  
  if (allowed) {
    timestamps.push(now);
    rateLimitStore.set(userId, timestamps);
  }
  
  const resetAt = timestamps.length > 0 
    ? Math.min(...timestamps) + windowMs 
    : now + windowMs;
  
  return {
    allowed,
    remaining: Math.max(0, maxRequests - timestamps.length),
    resetAt,
  };
}

/**
 * Create command context
 * MODULAR: Standardized context for all commands
 */
export function createCommandContext(
  bot: TelegramBot,
  chatId: number,
  userId?: string,
  message?: TelegramBot.Message,
  args?: string
): CommandContext {
  return {
    bot,
    chatId,
    userId,
    message,
    args,
  };
}

/**
 * Get user's active squads
 * Helper for commands that need squad context
 */
export async function getUserSquads(chatId: number) {
  const identity = await resolveIdentity(chatId);
  return identity?.squads ?? [];
}

/**
 * Require user to have exactly one squad
 * Returns error message if not met
 */
export async function requireSingleSquad(chatId: number): Promise<{
  ok: true;
  squadId: string;
  squadName: string;
} | { ok: false; error: string }> {
  const squads = await getUserSquads(chatId);
  
  if (squads.length === 0) {
    return { ok: false, error: 'NO_SQUAD' };
  }
  
  if (squads.length > 1) {
    return { ok: false, error: 'MULTIPLE_SQUADS' };
  }
  
  return {
    ok: true,
    squadId: squads[0].squadId,
    squadName: squads[0].squadName,
  };
}