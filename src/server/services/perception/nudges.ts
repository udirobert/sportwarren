/**
 * Perception tier-unlock nudges.
 *
 * Fires a Telegram celebration when a rater's `given` count crosses
 * one of the tier thresholds (5 → card live, 10 → attribute bars,
 * 20 → hot takes). Inline trigger from `submitPerception` —
 * monotonic counts mean each threshold fires exactly once per user
 * without needing dedupe state.
 *
 * For genuine "you went quiet — 2 more to unlock" proximity nudges
 * we'd need a cron + last-nudged tracking. Out of scope for v1.
 *
 * Silent fallback — no telegram bot, no platform identity, or send
 * errors are swallowed so the perception submit never fails because
 * of a notification problem.
 */

import { prisma } from '@/lib/db';

interface TierUnlockMessage {
  emoji: string;
  title: string;
  body: string;
}

const TIER_MESSAGES: Record<number, TierUnlockMessage> = {
  5: {
    emoji: '🎉',
    title: 'Your card is live',
    body: 'You rated 5 lads — your SportWarren card is now visible. The numbers will start moving as more ratings come in.',
  },
  10: {
    emoji: '🎯',
    title: 'Attribute bars unlocked',
    body: 'Tier 2 reached — your full attribute bars are visible now, and the lads can see what they make of you.',
  },
  20: {
    emoji: '🔥',
    title: 'Hot takes unlocked',
    body: 'Tier 3 — you can now see exactly what the lads said about you, scenario by scenario. The doctrine is yours.',
  },
};

const TIER_THRESHOLDS = [5, 10, 20] as const;

/**
 * Notify the user (via Telegram if connected) that they crossed a
 * tier threshold. Caller passes the rater's userId + the new given
 * count + the base URL for the dashboard deep-link. No-op if the
 * count doesn't match a threshold exactly.
 */
export async function maybeSendTierUnlockNudge(
  userId: string,
  newGivenCount: number,
  dashboardUrl: string,
): Promise<void> {
  if (!TIER_THRESHOLDS.includes(newGivenCount as 5 | 10 | 20)) return;
  const message = TIER_MESSAGES[newGivenCount];
  if (!message) return;

  try {
    const identity = await prisma.platformIdentity.findFirst({
      where: { platform: 'telegram', userId },
      select: { chatId: true },
    });
    if (!identity?.chatId) return;

    const chatId = parseInt(identity.chatId, 10);
    if (!Number.isFinite(chatId)) return;

    const { getTelegramService } = await import('@/server/services/communication/telegram');
    const telegramService = getTelegramService();
    const bot = telegramService?.getBot();
    if (!bot) return;

    const text = `${message.emoji} *${message.title}*\n${message.body}\n\n[Open your card](${dashboardUrl})`;
    await bot.sendMessage(chatId, text, {
      parse_mode: 'Markdown',
      disable_web_page_preview: false,
    });
  } catch (err) {
    console.warn('[perception/nudges] tier unlock send failed:', err);
  }
}
