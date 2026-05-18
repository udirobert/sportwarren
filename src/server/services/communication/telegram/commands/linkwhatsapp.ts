import { BaseCommand } from './base';
import type { CommandContext, ResolvedIdentity } from '../types';
import { redisService } from '@/server/services/redis';

const WA_BUSINESS_NUMBER = process.env.WHATSAPP_BUSINESS_NUMBER || '12015345384';
const TTL_SECONDS = 600; // 10 minutes

function mintCode(): string {
  // 6 hex chars, prefixed for human recognition: WA-3F9A1C
  return 'WA-' + Math.random().toString(16).slice(2, 8).toUpperCase();
}

/**
 * /linkwhatsapp — mint a one-time code that the user pastes in WhatsApp to
 * bind their WA number to their SportWarren account.
 *
 * Flow:
 *   1. User runs /linkwhatsapp in our Telegram bot.
 *   2. We mint `WA-XXXXXX`, store `kite:link:WA-XXXXXX = <userId>` in Redis.
 *   3. We reply with a click-link `wa.me/<num>?text=link%20WA-XXXXXX`.
 *   4. WhatsApp opens pre-filled; the agent consumes the code in
 *      `dispatchWhatsAppCommand` and creates the PlatformIdentity.
 */
export class LinkWhatsAppCommand extends BaseCommand {
  pattern = /\/linkwhatsapp$/;
  description = 'Link this account to a WhatsApp number for agent control';

  async executeWithIdentity(ctx: CommandContext, identity: ResolvedIdentity): Promise<void> {
    const code = mintCode();
    try {
      await redisService.set(`kite:link:${code}`, identity.userId, TTL_SECONDS);
    } catch (err) {
      console.error('[linkwhatsapp] redis set failed', err);
      await ctx.bot.sendMessage(
        ctx.chatId,
        '⚠️ Couldn\'t mint a link code right now. Try again in a moment.',
        { parse_mode: 'Markdown' },
      );
      return;
    }

    const waLink = `https://wa.me/${WA_BUSINESS_NUMBER}?text=${encodeURIComponent(`link ${code}`)}`;
    const lines = [
      '🔗 *Link WhatsApp → SportWarren*',
      '',
      `Your code: \`${code}\`  _(valid 10 min)_`,
      '',
      `Tap to open WhatsApp pre-filled:`,
      waLink,
      '',
      'Or message our number `+1 201-534-5384` with:',
      `\`link ${code}\``,
    ];
    await ctx.bot.sendMessage(ctx.chatId, lines.join('\n'), {
      parse_mode: 'Markdown',
      disable_web_page_preview: false,
    });
  }
}
