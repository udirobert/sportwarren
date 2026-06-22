/**
 * Perception quiz — the hot-take engine.
 *
 *   /preview/<token>/perceive
 *
 * Tinder-swipe-style quiz: rotating (target, scenario) pairs the
 * player rates as they go. Each round picks a squad-mate + scenario
 * that hasn't been rated yet by this rater. Both descriptive and
 * prescriptive variants per scenario (when supported) so the lads
 * argue about "what they do" vs "what they should do."
 *
 * Reciprocity-gated: the player's own perception report at
 * /perceived only unlocks after they've rated ~5 others.
 */

import React from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { PerceiveClient } from './PerceiveClient';
import { SCENARIOS } from '@/server/services/perception/scenarios';

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function PerceivePage({ params }: PageProps) {
  const { token } = await params;

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

  // All squad-mates except the rater.
  const mates = await prisma.squadMember.findMany({
    where: { squadId: squad.id },
    include: {
      user: { include: { playerProfile: true } },
    },
  });
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

  // Already-rated combos so the client can skip them.
  const alreadyRated = await prisma.playerPerception.findMany({
    where: { raterId: rater.id },
    select: { targetId: true, scenarioId: true, kind: true, choice: true },
  });

  // Scenario library payload (id + prompt + options + hasPrescriptive).
  // Strip server-only fields so client doesn't get unused metadata.
  const scenariosPayload = SCENARIOS.map((s) => ({
    id: s.id,
    prompt: s.prompt,
    context: s.context,
    hasPrescriptive: s.hasPrescriptive,
    options: s.options.map((o) => ({ id: o.id, label: o.label })),
  }));

  const totalCombos =
    targets.length *
    SCENARIOS.reduce((sum, s) => sum + (s.hasPrescriptive ? 2 : 1), 0);

  return (
    <PerceiveClient
      token={token}
      squadName={squad.name}
      raterName={user.name ?? 'Player'}
      targets={targets}
      scenarios={scenariosPayload}
      alreadyRated={alreadyRated}
      totalCombos={totalCombos}
    />
  );
}
