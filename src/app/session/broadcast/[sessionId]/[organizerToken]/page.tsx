/**
 * Post-session WhatsApp broadcast UI — captain's one-tap-to-send
 * surface after the session ends. Lists every message with a
 * "Send to [name]" button that opens WhatsApp with the message
 * pre-filled to that phone number.
 *
 * Uses wa.me URL scheme so it works on any phone with WhatsApp
 * installed (or WhatsApp Web on desktop). No Business API
 * required — the captain is the conductor, the app just removes
 * the copy-paste friction.
 *
 * Each card has a "Mark sent" toggle so the captain can track
 * progress through the list. Persisted to localStorage so refreshes
 * preserve state.
 */

import React from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { BroadcastClient } from './BroadcastClient';

interface PageProps {
  params: Promise<{ sessionId: string; organizerToken: string }>;
}

export default async function BroadcastPage({ params }: PageProps) {
  const { sessionId, organizerToken } = await params;

  const organizer = await prisma.user.findUnique({
    where: { walletAddress: organizerToken },
    include: {
      squads: { include: { squad: true } },
    },
  });

  if (!organizer) notFound();

  const captainMembership = organizer.squads.find((m) => m.role === 'captain') ?? organizer.squads[0];
  if (!captainMembership) notFound();

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      squad: true,
      matches: {
        include: {
          playerStats: {
            include: {
              profile: {
                include: {
                  user: {
                    include: {
                      platformIdentities: { where: { platform: 'whatsapp' } },
                    },
                  },
                },
              },
            },
            orderBy: { goals: 'desc' },
          },
        },
      },
    },
  });

  if (!session) notFound();
  if (session.squad.id !== captainMembership.squadId) notFound();

  const allStats = session.matches.flatMap((m) => m.playerStats);
  const totalGoals = allStats.reduce((s, st) => s + st.goals, 0);
  const ranked = [...allStats].sort((a, b) => b.goals - a.goals);
  const topScorer = ranked[0];

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? '';
  const dateLabel = new Date(session.date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  // Build per-player messages + WA URLs
  const playerMessages = ranked.map((stats) => {
    const u = stats.profile.user;
    const goals = stats.goals;
    const rank = ranked.findIndex((s) => s.profileId === stats.profileId) + 1;
    const isTopScorer = goals > 0 && goals >= (topScorer?.goals ?? 0);

    const recapUrl = `${baseUrl}/session/recap/${session.id}/${encodeURIComponent(u.walletAddress)}`;

    let body: string;
    if (goals === 0) {
      body = `No goals tonight, but you played. Twin updated. Have a look:`;
    } else if (isTopScorer) {
      body = `${goals} goals, top of the scoresheet — proper performance. Recap here:`;
    } else if (goals >= 3) {
      body = `${goals} goals tonight — #${rank} for the night. Recap here:`;
    } else {
      body = `${goals} goal${goals === 1 ? '' : 's'} tonight, twin updated. Recap here:`;
    }

    const message = [
      `Hey ${u.name?.split(' ')[0] ?? 'mate'} —`,
      body,
      '',
      recapUrl,
      '',
      `Pick your team of the night when you tap through — 90 seconds, no faffing.`,
    ].join('\n');

    const phone = u.platformIdentities[0]?.platformUserId ?? null;

    return {
      profileId: stats.profileId,
      name: u.name ?? 'Player',
      goals,
      phone,
      message,
    };
  });

  // Scorer summary lines for the group message
  const scorerLines = ranked
    .filter((s) => s.goals > 0)
    .slice(0, 5)
    .map((s, i) => `${i + 1}. ${s.profile.user.name} — ${s.goals}`)
    .join('\n');

  const groupMessage = [
    `🟢 ${session.squad.name} · ${dateLabel}`,
    '',
    `${totalGoals} goals tonight. Top of the scoresheet:`,
    scorerLines,
    '',
    `Each of you is getting a personal recap link — pick your team of the night while it's fresh. 90 seconds.`,
  ].join('\n');

  return (
    <BroadcastClient
      sessionId={session.id}
      squadName={session.squad.name}
      totalGoals={totalGoals}
      dateLabel={dateLabel}
      groupMessage={groupMessage}
      playerMessages={playerMessages}
    />
  );
}
