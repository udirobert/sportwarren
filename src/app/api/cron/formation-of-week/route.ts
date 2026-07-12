import { NextResponse } from 'next/server';
import { broadcastToSquadGroups } from '@/server/services/communication/squad-broadcast';
import { createTacticalPlanShare } from '@/server/services/tactical-plan-share';
import { buildChallengeSharePath } from '@/lib/pitch/shareUrl';
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

    // Build the challenge URL. Only the week's formation needs to be
    // resolvable — the recipient's counter suggestion is always computed
    // fresh client-side from it (suggestCounterFormation), never read from
    // the URL, so there's nothing else worth encoding here. Was a raw
    // ?formation=&style=&color=&size=&vs_f=&vs_s=&vs_c=&flow=counter query
    // string sent as a Telegram button link every week; now a short slug.
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://sportwarren.com';
    const share = await createTacticalPlanShare({
      formation,
      style: 'balanced',
      size: 11,
      color: '#ef4444',
      names: [],
    });
    const challengeUrl = `${baseUrl}${buildChallengeSharePath(share.slug)}`;

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

    const { sent } = await broadcastToSquadGroups({
      message,
      keyboard: {
        inline_keyboard: [
          [{ text: `🎯 Counter with ${counter}`, url: challengeUrl }],
          [{ text: '📐 Set up my formation', url: `${baseUrl}?formation=${formation}&size=11` }],
        ],
      },
    });

    return NextResponse.json({ sent, formation, counter });
  } catch (error) {
    console.error('[Cron] Formation of the Week error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
