import type { CommandContext, ResolvedIdentity, TelegramCommand } from '../types';

/**
 * Base class for Telegram commands
 * MODULAR: Provides common functionality for all commands
 * CLEAN: Separates command logic from infrastructure
 */
export abstract class BaseCommand implements TelegramCommand {
  abstract pattern: RegExp;
  abstract description: string;
  
  /**
   * Execute the command with resolved identity
   * Subclasses implement this, not the raw execute
   */
  abstract executeWithIdentity(ctx: CommandContext, identity: ResolvedIdentity): Promise<void>;

  /**
   * Execute command - handles identity resolution
   * Override this if you need custom handling
   */
  async execute(ctx: CommandContext, identity?: ResolvedIdentity): Promise<void> {
    if (!identity) {
      await ctx.bot.sendMessage(
        ctx.chatId,
        '⚠️ This chat is not linked to your SportWarren account.\n\nUse /link for instructions.',
        { parse_mode: 'Markdown' }
      );
      return;
    }
    await this.executeWithIdentity(ctx, identity);
  }

  /**
   * Get rate limit config for this command
   * Override to enable rate limiting
   * Returns undefined if no rate limiting needed
   */
  getRateLimit?(): { max: number; windowMs: number } | undefined {
    return undefined; // No rate limit by default
  }

  /**
   * Helper: Send a message with Markdown
   */
  protected async sendMarkdown(
    chatId: number,
    text: string,
    bot: TelegramBot
  ): Promise<TelegramBot.Message> {
    return bot.sendMessage(chatId, text, { parse_mode: 'Markdown' });
  }

  /**
   * Helper: Send a message with inline keyboard
   */
  protected async sendWithKeyboard(
    chatId: number,
    text: string,
    keyboard: TelegramBot.InlineKeyboardMarkup,
    bot: TelegramBot
  ): Promise<TelegramBot.Message> {
    return bot.sendMessage(chatId, text, { 
      parse_mode: 'Markdown',
      reply_markup: keyboard 
    });
  }
}

// Re-export types for convenience
import TelegramBot from "node-telegram-bot-api";
export type { CommandContext, ResolvedIdentity, TelegramCommand, RateLimitResult } from '../types';