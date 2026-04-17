import { prisma } from '@/lib/db';
import { buildTelegramMiniAppUrl } from './platform-connections';

export async function notifyMatchVerified(
  matchId: string,
  homeSquadName: string,
  awaySquadName: string
): Promise<void> {
  const { getTelegramService } = await import('./telegram');
  const telegramService = getTelegramService();
  
  if (!telegramService) {
    console.warn('Telegram service not available');
    return;
  }

  const bot = telegramService.getBot();
  if (!bot) {
    console.warn('Telegram bot not available');
    return;
  }

  const squads = await prisma.squad.findMany({
    where: {
      OR: [{ name: homeSquadName }, { name: awaySquadName }],
    },
    include: {
      groups: {
        where: { platform: 'telegram' },
      },
    },
  });

  for (const squad of squads) {
    const tgGroup = squad.groups[0];
    if (!tgGroup?.chatId) continue;

    const url = buildTelegramMiniAppUrl({ mode: `match_${matchId}_rate` });
    if (!url) continue;

    await bot.sendMessage(
      tgGroup.chatId,
      [
        `⭐ *Post-Match Scout Report*`,
        ``,
        `The match for *${squad.name}* is verified!`,
        `It's time to rate your teammates' performance and vote for Man of the Match.`,
        ``,
        `Your feedback earns you Scout XP and helps your teammates level up.`,
      ].join('\n'),
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '⭐ Rate Teammates',
                web_app: { url },
              },
            ],
          ],
        },
      },
    );
  }
}
