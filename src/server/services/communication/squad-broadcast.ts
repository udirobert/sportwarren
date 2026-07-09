/**
 * Squad-group broadcast — the single way to push a message to every linked
 * Telegram group chat.
 *
 * The "find linked SquadGroups → getBot() → loop sendMessage" pattern was
 * copy-pasted across crons (formation-of-week, group verification, …). Every
 * new group-chat drop (predicted teams, co-play stat, prediction payoff)
 * wants the same loop, so it lives here once. CONSOLIDATION + DRY.
 *
 * Server-only (uses the Telegram bot). Fails soft per-group: one bad chat
 * never aborts the rest.
 */

import { prisma } from '@/lib/db';
import { getTelegramService } from './telegram';

export interface InlineKeyboard {
  inline_keyboard: Array<Array<{ text: string; url?: string; callback_data?: string }>>;
}

export interface SquadBroadcastResult {
  total: number;
  sent: number;
  failed: number;
}

/**
 * Send a Markdown message to linked Telegram group chats.
 *
 * @param message   Markdown-formatted text.
 * @param keyboard  Optional inline keyboard (buttons / deep links).
 * @param squadIds  Restrict to specific squads; omit to hit every linked group.
 */
export async function broadcastToSquadGroups({
  message,
  keyboard,
  squadIds,
}: {
  message: string;
  keyboard?: InlineKeyboard;
  squadIds?: string[];
}): Promise<SquadBroadcastResult> {
  const linkedGroups = await prisma.squadGroup.findMany({
    where: {
      platform: 'telegram',
      chatId: { not: null },
      squad: {
        isPlaceholder: false,
        ...(squadIds ? { id: { in: squadIds } } : {}),
      },
    },
    select: { chatId: true },
  });

  if (linkedGroups.length === 0) {
    return { total: 0, sent: 0, failed: 0 };
  }

  const telegramService = getTelegramService();
  if (!telegramService) {
    // No bot configured — treat every intended send as failed, don't throw.
    return { total: linkedGroups.length, sent: 0, failed: linkedGroups.length };
  }

  const bot = telegramService.getBot();
  let sent = 0;
  let failed = 0;

  for (const group of linkedGroups) {
    if (!group.chatId) continue;
    try {
      await bot.sendMessage(Number(group.chatId), message, {
        parse_mode: 'Markdown',
        ...(keyboard ? { reply_markup: keyboard } : {}),
      });
      sent++;
    } catch (err) {
      console.error(`[squad-broadcast] failed to send to ${group.chatId}:`, err);
      failed++;
    }
  }

  return { total: linkedGroups.length, sent, failed };
}
