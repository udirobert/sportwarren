/**
 * WhatsApp post-session broadcast helper.
 *
 *   pnpm tsx scripts/whatsapp-session-recap.ts <sessionId>
 *
 * Reads a finalized Session + Match + PlayerMatchStats and outputs:
 *   1. A group-wide post-session blast (one message for the WA group)
 *   2. Per-player 1:1 messages with each player's personalized recap link
 *
 * You copy-paste each block. No automation — the captain (you) is the
 * conductor for week 1. Once we have telemetry on which messages drive
 * engagement, we automate.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const sessionId = process.argv[2];
  if (!sessionId) {
    console.error('Usage: pnpm tsx scripts/whatsapp-session-recap.ts <sessionId>');
    process.exit(1);
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      squad: true,
      matches: {
        include: {
          playerStats: {
            include: {
              profile: {
                include: { user: true },
              },
            },
          },
        },
      },
    },
  });

  if (!session) {
    console.error(`Session ${sessionId} not found`);
    process.exit(1);
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://sportwarren.com';
  const allStats = session.matches.flatMap((m) => m.playerStats);
  const totalGoals = allStats.reduce((s, st) => s + st.goals, 0);

  const ranked = [...allStats].sort((a, b) => b.goals - a.goals);
  const topScorer = ranked[0];
  const date = new Date(session.date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  // ── 1. Group message ──────────────────────────────────────────────
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  GROUP MESSAGE — paste into the squad WhatsApp chat');
  console.log('═══════════════════════════════════════════════════════\n');

  const scorerLines = ranked
    .filter((s) => s.goals > 0)
    .slice(0, 5)
    .map((s, i) => `${i + 1}. ${s.profile.user.name} — ${s.goals}`)
    .join('\n');

  const groupMessage = [
    `🟢 ${session.squad.name} · ${date}`,
    '',
    `${totalGoals} goals tonight. Top of the scoresheet:`,
    scorerLines,
    '',
    `Each of you is getting a personal recap link in the next message — pick your team of the night while it's fresh. Takes 90 seconds.`,
    '',
    `Cards drop in the morning.`,
  ].join('\n');

  console.log(groupMessage);
  console.log('\n═══════════════════════════════════════════════════════');

  // ── 2. Per-player 1:1 messages ────────────────────────────────────
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  PER-PLAYER MESSAGES — send each as a 1:1');
  console.log('═══════════════════════════════════════════════════════');

  for (const stats of allStats) {
    const user = stats.profile.user;
    const goals = stats.goals;
    const rank = ranked.findIndex((s) => s.profileId === stats.profileId) + 1;
    const isTopScorer = goals > 0 && goals >= (topScorer?.goals ?? 0);

    const recapUrl = `${baseUrl}/session/recap/${session.id}/${encodeURIComponent(
      user.walletAddress,
    )}`;

    const lines = [`Hey ${user.name?.split(' ')[0] ?? 'mate'} —`];

    if (goals === 0) {
      lines.push(`No goals tonight, but you played. Twin updated. Have a look:`);
    } else if (isTopScorer) {
      lines.push(`${goals} goals, top of the scoresheet — proper performance. Recap here:`);
    } else if (goals >= 3) {
      lines.push(`${goals} goals tonight — #${rank} for the night. Recap here:`);
    } else {
      lines.push(`${goals} goal${goals === 1 ? '' : 's'} tonight, twin updated. Recap here:`);
    }

    lines.push('');
    lines.push(recapUrl);
    lines.push('');
    lines.push(`Pick your team of the night when you tap through — 90 seconds, no faffing.`);

    console.log(`\n— ${user.name} —`);
    console.log(lines.join('\n'));
  }

  console.log('\n═══════════════════════════════════════════════════════\n');

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  prisma.$disconnect();
  process.exit(1);
});
