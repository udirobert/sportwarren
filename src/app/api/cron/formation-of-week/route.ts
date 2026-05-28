import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getTelegramService } from '@/server/services/communication/telegram';
import type { Formation } from '@/types';

/**
 * Cron endpoint: Formation of the Week
 * Sends a tactical challenge to all linked Telegram group chats every Monday.
 * Frequency: Weekly (Monday 9:00 UTC)
 *
 * @example
 * ```json
 * { crons: [{ path: '/api/cron/formation-of-week', schedule: '0 9 * * 1' }] }
 * ```
 */

const FORMATIONS: Formation[] = [
  '4-3-3', '4-4-2', '4-2-3-1', '3-5-2', '5-3-2',
  '4-5-1', '4-1-4-1', '3-4-3', '4-3-1-2', '5-4-1',
];

const COUNTER_SUGGESTIONS: Record<string, Formation> = {
  '4-3-3': '4-5-1',
  '4-4-2': '4-3-3',
  '4-2-3-1': '3-5-2',
  '3-5-2': '4-4-2',
  '5-3-2': '4-3-3',
  '4-5-1': '4-3-1-2',
  '4-1-4-1': '3-4-3',
  '3-4-3': '5-3-2',
  '4-3-1-2': '3-4-3',
  '5-4-1': '4-3-3',
};

function getWeekOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / (7 * 24 * 60 * 60 * 1000));
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('Authorization');
  const expectedSecret = process.env.CRON_SECRET;

  if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Pick formation based on week number (deterministic rotation)
    const weekNum = getWeekOfYear();
    const formation = FORMATIONS[weekNum % FORMATIONS.length];
    const counter = COUNTER_SUGGESTIONS[formation] || '4-3-3';

    // Build the challenge URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://sportwarren.com';
    const challengeUrl = `${baseUrl}?formation=${counter}&style=balanced&color=%2310b981&size=11&vs_f=${formation}&vs_s=balanced&vs_c=%23ef4444&flow=counter`;

    // Find all linked Telegram group chats
    const linkedGroups = await prisma.squadGroup.findMany({
      where: {
        platform: 'telegram',
        chatId: { not: null },
        squad: { isPlaceholder: false },
      },
      select: {
        chatId: true,
        squad: { select: { name: true } },
      },
    });

    if (linkedGroups.length === 0) {
      return NextResponse.json({ sent: 0, formation });
    }

    const telegramService = getTelegramService();
    if (!telegramService) {
      return NextResponse.json({ error: 'Telegram service not available' }, { status: 503 });
    }

    const bot = telegramService.getBot();
    let sent = 0;

    const message = [
      `⚽ *Formation of the Week: ${formation}*`,
      '',
      `This week's tactical challenge: *${formation}*.`,
      `Can your squad make it work?`,
      '',
      `💡 *Suggested counter: ${counter}*`,
      '',
      `Tap below to set up your ${formation} and challenge another squad to beat it.`,
    ].join('\n');

    const keyboard = {
      inline_keyboard: [
        [{ text: `🎯 Counter with ${counter}`, url: challengeUrl }],
        [{ text: '📐 Set up my formation', url: `${baseUrl}?formation=${formation}&size=11` }],
      ],
    };

    for (const group of linkedGroups) {
      if (!group.chatId) continue;
      try {
        await bot.sendMessage(Number(group.chatId), message, {
          parse_mode: 'Markdown',
          reply_markup: keyboard,
        });
        sent++;
      } catch (err) {
        console.error(`Failed to send formation of week to ${group.chatId}:`, err);
      }
    }

    return NextResponse.json({ sent, formation, counter });
  } catch (error) {
    console.error('[Cron] Formation of the Week error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
