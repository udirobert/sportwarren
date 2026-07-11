/**
 * Squad-group broadcast — the single way to push a message to every linked
 * group chat, on EVERY channel the squad has connected.
 *
 * The "find linked SquadGroups → send" pattern was copy-pasted across crons
 * (formation-of-week, group verification, …). Every new group-chat drop
 * (predicted teams, co-play stat, prediction payoff) wants the same loop, so
 * it lives here once. CONSOLIDATION + DRY.
 *
 * Channel-agnostic: a linked squad on Telegram AND WhatsApp gets the drop on
 * both. Telegram renders the inline keyboard natively; WhatsApp has no inline
 * URL buttons, so keyboard links are flattened into the message body.
 *
 * Server-only. Fails soft per-group: one bad chat never aborts the rest.
 */

import { prisma } from '@/lib/db';
import { getTelegramService } from './telegram';
import { getWhatsAppService } from './whatsapp';

export interface InlineKeyboard {
  inline_keyboard: Array<Array<{ text: string; url?: string; callback_data?: string }>>;
}

export interface SquadBroadcastResult {
  total: number;
  sent: number;
  failed: number;
}

/**
 * Flatten an inline keyboard's URL buttons into plain text lines. WhatsApp
 * group messages can't carry inline URL buttons, so the links ride in the body
 * (WhatsApp auto-links raw URLs). Callback-only buttons are dropped — they have
 * no meaning outside the originating platform.
 */
function flattenKeyboardForText(keyboard?: InlineKeyboard): string {
  if (!keyboard) return '';
  const lines: string[] = [];
  for (const row of keyboard.inline_keyboard) {
    for (const btn of row) {
      if (btn.url) lines.push(`👉 ${btn.text}: ${btn.url}`);
    }
  }
  return lines.length ? `\n\n${lines.join('\n')}` : '';
}

/**
 * Send a message to every linked group chat across all channels.
 *
 * @param message   Markdown-formatted text. Telegram renders it as Markdown;
 *                  WhatsApp shares the same `*bold*` / `_italic_` conventions.
 * @param keyboard  Optional inline keyboard (Telegram buttons / deep links).
 *                  Flattened to text on WhatsApp.
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
      platform: { in: ['telegram', 'whatsapp'] },
      chatId: { not: null },
      squad: {
        isPlaceholder: false,
        ...(squadIds ? { id: { in: squadIds } } : {}),
      },
    },
    select: { chatId: true, platform: true },
  });

  if (linkedGroups.length === 0) {
    return { total: 0, sent: 0, failed: 0 };
  }

  // Resolve services lazily — only pay for the channels that have groups.
  const hasTelegram = linkedGroups.some((g) => g.platform === 'telegram');
  const hasWhatsApp = linkedGroups.some((g) => g.platform === 'whatsapp');

  const telegramService = hasTelegram ? getTelegramService() : null;
  const telegramBot = telegramService?.getBot() ?? null;

  const whatsappService = hasWhatsApp ? getWhatsAppService() : null;
  const whatsappBody = `${message}${flattenKeyboardForText(keyboard)}`;

  let sent = 0;
  let failed = 0;

  for (const group of linkedGroups) {
    if (!group.chatId) continue;
    try {
      if (group.platform === 'telegram') {
        if (!telegramBot) {
          failed++;
          continue;
        }
        await telegramBot.sendMessage(Number(group.chatId), message, {
          parse_mode: 'Markdown',
          ...(keyboard ? { reply_markup: keyboard } : {}),
        });
        sent++;
      } else if (group.platform === 'whatsapp') {
        if (!whatsappService?.isConfigured()) {
          failed++;
          continue;
        }
        await whatsappService.sendText(group.chatId, whatsappBody);
        sent++;
      }
    } catch (err) {
      console.error(`[squad-broadcast] failed to send to ${group.platform}:${group.chatId}:`, err);
      failed++;
    }
  }

  return { total: linkedGroups.length, sent, failed };
}
