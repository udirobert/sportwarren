import TelegramBot from "node-telegram-bot-api";

/**
 * Context passed to all command handlers
 * CLEAN: Single source of truth for command context
 */
export interface CommandContext {
  bot: TelegramBot;
  chatId: number;
  userId?: string;
  message?: TelegramBot.Message;
  args?: string;
}

/**
 * Result of identity resolution
 */
export interface ResolvedIdentity {
  identityId: string;
  userId: string;
  username?: string;
  firstName?: string;
  squads: Array<{
    squadId: string;
    squadName: string;
    role: string;
  }>;
}

/**
 * Rate limit check result
 */
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Command handler interface
 * MODULAR: Each command implements this interface
 */
export interface TelegramCommand {
  /** Regex pattern to match command */
  pattern: RegExp;
  
  /** Command description for /help */
  description: string;
  
  /** Execute the command */
  execute(ctx: CommandContext, identity?: ResolvedIdentity): Promise<void>;
  
  /** Optional: Check rate limit (defaults to no limit) */
  getRateLimit?(): { max: number; windowMs: number } | undefined;
}

/**
 * Error response types
 */
export type ErrorCode = 
  | 'NOT_LINKED'
  | 'NO_SQUAD'
  | 'MULTIPLE_SQUADS'
  | 'NOT_CAPTAIN'
  | 'RATE_LIMITED'
  | 'INVALID_INPUT'
  | 'NOT_FOUND'
  | 'INTERNAL_ERROR';

export interface CommandResult {
  success: boolean;
  message?: string;
  error?: ErrorCode;
}