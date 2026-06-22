import React from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { PreviewQuizFlow } from './PreviewQuizFlow';
import { SCENARIOS } from '@/server/services/perception/scenarios';
import { aggregateReceivedPerceptions } from '@/server/services/perception/aggregate';

interface PageProps {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ mode?: string }>;
}

function computeTier(givenCount: number): number {
  if (givenCount >= 20) return 3;
  if (givenCount >= 10) return 2;
  if (givenCount >= 5) return 1;
  return 0;
}

export default async function PreviewPage({ params, searchParams }: PageProps) {
  const { token } = await params;
  const { mode } = await searchParams;
  // `?mode=quiz` forces the quiz flow even when the user is past Tier 1
  // (i.e. has already unlocked the dashboard). Lets the "Rate more lads"
  // CTA on the dashboard send them back to the quiz without a separate
  // route. CONSOLIDATION — one URL, two modes, no /perceive duplicate.
  const forceQuiz = mode === 'quiz';

  const user = await prisma.user.findUnique({
    where: { walletAddress: token },
    include: {
      playerProfile: true,
      squads: { include: { squad: true } },
    },
  });
  if (!user || user.chain !== 'preview') notFound();

  const rater = user.playerProfile;
  const squad = user.squads[0]?.squad;
  if (!rater || !squad) notFound();

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://sportwarren.com';

  const [perceptionsGiven, aggregateResult, mates] = await Promise.all([
    prisma.playerPerception.count({ where: { raterId: rater.id } }),
    aggregateReceivedPerceptions(rater.id),
    prisma.squadMember.findMany({
      where: { squadId: squad.id },
      include: { user: { include: { playerProfile: true } } },
    }),
  ]);
  const { aggregate, uniqueRaters: uniquePerceivers, totalReceived: perceptionsReceived } = aggregateResult;

  const targets = mates
    .filter((m) => m.userId !== user.id && m.user.playerProfile)
    .map((m) => ({
      profileId: m.user.playerProfile!.id,
      name: m.user.name ?? 'Player',
      firstName: (m.user.name ?? 'Player').split(' ')[0],
      position: m.user.position,
      avatar: {
        kit: m.user.avatarKitColor ?? undefined,
        accent: m.user.avatarAccentColor ?? undefined,
        skin: m.user.avatarSkinTone ?? undefined,
        hair: m.user.avatarHairColor ?? undefined,
        hairStyle: m.user.avatarHairStyle ?? 'short',
        number: m.user.avatarNumber ?? '',
      },
    }));

  const totalCombosPerTarget = SCENARIOS.reduce((sum, s) => sum + (s.hasPrescriptive ? 2 : 1), 0);
  const totalCombos = targets.length * totalCombosPerTarget;

  const alreadyRated = await prisma.playerPerception.findMany({
    where: { raterId: rater.id },
    select: { targetId: true, scenarioId: true, kind: true, choice: true },
  });

  const remainingCombos = totalCombos - alreadyRated.length;

  const tier = computeTier(perceptionsGiven);

  if (tier >= 1 && !forceQuiz) {
    const [squadTwins, lastSession] = await Promise.all([
      prisma.playerTwin.findMany({
        where: { profile: { user: { squads: { some: { squadId: squad.id } } } } },
        select: { profileId: true, baseAttributes: true },
      }),
      prisma.match.findFirst({
        where: {
          OR: [{ homeSquadId: squad.id }, { awaySquadId: squad.id }],
          status: 'verified',
        },
        orderBy: { createdAt: 'desc' },
        include: {
          playerStats: {
            include: { profile: { include: { user: true } } },
            orderBy: { goals: 'desc' },
          },
        },
      }),
    ]);

    const { PreviewCardDashboard } = await import('./PreviewCardDashboard');
    return (
      <PreviewCardDashboard
        user={user}
        rater={rater}
        squad={squad}
        baseUrl={baseUrl}
        token={token}
        perceptionsGiven={perceptionsGiven}
        perceptionsReceived={perceptionsReceived}
        uniquePerceivers={uniquePerceivers}
        tier={tier}
        remainingCombos={remainingCombos}
        squadTwins={squadTwins}
        lastSession={lastSession}
        aggregate={aggregate}
        scenarios={SCENARIOS.map((s) => ({
          id: s.id,
          prompt: s.prompt,
          context: s.context,
          hasPrescriptive: s.hasPrescriptive,
          options: s.options.map((o) => ({ id: o.id, label: o.label })),
        }))}
      />
    );
  }

  // Tier 0 — quiz only
  const scenariosPayload = SCENARIOS.map((s) => ({
    id: s.id,
    prompt: s.prompt,
    context: s.context,
    hasPrescriptive: s.hasPrescriptive,
    options: s.options.map((o) => ({ id: o.id, label: o.label })),
  }));

  return (
    <PreviewQuizFlow
      token={token}
      squadName={squad.name}
      raterName={user.name ?? 'Player'}
      targets={targets}
      scenarios={scenariosPayload}
      alreadyRated={alreadyRated}
      totalCombos={totalCombos}
      completedInit={alreadyRated.length}
    />
  );
}
