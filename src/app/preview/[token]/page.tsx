/**
 * Preview landing — the half-finished portrait each pre-seeded
 * kickabout player lands on.
 *
 *   /preview/<token>
 *
 * The design rule: the provocation lives in the gaps. Show what we
 * know (rank + goals + games) AND what we don't yet (per-attribute
 * group comparison via V3PlayerCard). Stats are never self-editable.
 * Vanity is (kit/hair/number, via /customize); numbers only move via
 * verified third-party proof.
 *
 * Composed entirely from @/components/v3 primitives + V3PlayerCard.
 * The chess.com card pattern that used to inline ~200 lines of bars
 * here now lives in a single component call.
 */

import React from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { MiniAvatar } from '../_components/MiniAvatar';
import {
  PALETTE,
  TYPE,
  TRACKING,
  V3PageShell,
  V3Ribbon,
  V3IdentityLine,
  V3Heading,
  V3SectionLabel,
  V3StatBand,
  V3CTAButton,
  V3SolidCard,
  V3PlayerCard,
  buildPlayerCardData,
  type Attrs,
} from '@/components/v3';
import {
  baselineForPosition,
  computeOverall,
} from '@/server/services/personalization/position-baselines';
import { ATTRIBUTE_KEYS, type AttributeKey } from '@/server/services/personalization/twin-types';

interface PageProps {
  params: Promise<{ token: string }>;
}

function deriveInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
}

export default async function PreviewPage({ params }: PageProps) {
  const { token } = await params;

  const user = await prisma.user.findUnique({
    where: { walletAddress: token },
    include: {
      playerProfile: { include: { twin: true } },
      squads: { include: { squad: true } },
    },
  });
  if (!user || user.chain !== 'preview') notFound();

  const profile = user.playerProfile;
  const squad = user.squads[0]?.squad;
  if (!squad) notFound();

  // Last session leaderboard for the rank line on the stat band.
  const lastSession = await prisma.match.findFirst({
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
  });

  const playerStats = lastSession?.playerStats.find((s) => s.profileId === profile?.id);
  const sessionLeaderboard = lastSession?.playerStats ?? [];
  const goals = playerStats?.goals ?? 0;
  const minutesPlayed = playerStats?.minutesPlayed ?? 0;
  const gamesPlayed = Math.max(1, Math.round(minutesPlayed / 7));
  const playersAhead = sessionLeaderboard.filter((s) => s.goals > goals).length;
  const sessionRank = playerStats ? playersAhead + 1 : null;
  const tiedCount = playerStats
    ? sessionLeaderboard.filter((s) => s.goals === goals).length
    : 0;

  // Reciprocity counts (peer ratings given vs received). Empty state
  // IS the hook — "be the first to rate."
  const [ratedByMe, ratedMe, perceptionsGiven, perceptionsReceived, uniquePerceivers] = profile
    ? await Promise.all([
        prisma.peerRating.count({ where: { raterId: profile.id } }),
        prisma.peerRating.count({ where: { targetId: profile.id } }),
        prisma.playerPerception.count({ where: { raterId: profile.id } }),
        prisma.playerPerception.count({ where: { targetId: profile.id } }),
        // Distinct raters that have weighed in on this player
        prisma.playerPerception
          .findMany({
            where: { targetId: profile.id },
            select: { raterId: true },
            distinct: ['raterId'],
          })
          .then((rows) => rows.length),
      ])
    : [0, 0, 0, 0, 0];

  // Card data + group comparison for each attribute.
  const myAttrs: Attrs = (profile?.twin?.baseAttributes as Attrs | null) ?? baselineForPosition(user.position);
  const myLevel = profile?.twin?.level ?? 1;
  const myPrestige = profile?.twin?.prestige ?? 0;
  const overall = computeOverall(myAttrs, user.position, myLevel, myPrestige);

  const squadTwins = await prisma.playerTwin.findMany({
    where: { profile: { user: { squads: { some: { squadId: squad.id } } } } },
    select: { profileId: true, baseAttributes: true },
  });
  const groupByAttr: Record<AttributeKey, number[]> = {
    pace: [], shooting: [], passing: [], dribbling: [], defending: [], physical: [],
  };
  for (const t of squadTwins) {
    if (t.profileId === profile?.id) continue;
    const attrs = t.baseAttributes as Attrs | null;
    if (!attrs) continue;
    for (const k of ATTRIBUTE_KEYS) {
      if (typeof attrs[k] === 'number') groupByAttr[k].push(attrs[k]);
    }
  }
  const groupAvgByAttr: Partial<Record<AttributeKey, number>> = {};
  for (const k of ATTRIBUTE_KEYS) {
    if (groupByAttr[k].length > 0) {
      groupAvgByAttr[k] = Math.round(groupByAttr[k].reduce((s, v) => s + v, 0) / groupByAttr[k].length);
    }
  }
  const otherTwinsCount = squadTwins.filter((t) => t.profileId !== profile?.id).length;

  const cardData = buildPlayerCardData({
    user,
    attrs: myAttrs,
    level: myLevel,
    overall,
  });

  const statBandLabel =
    goals === 0
      ? "Didn't trouble the scorers · last week"
      : sessionRank === 1 && tiedCount === 1
      ? `Top of the scoresheet · ${gamesPlayed} games`
      : tiedCount > 1
      ? `Goals · Joint ${ordinal(sessionRank!)} · ${gamesPlayed} games`
      : `Goals · ${ordinal(sessionRank!)} of the night · ${gamesPlayed} games`;

  const reciprocityCopy =
    ratedByMe === 0 && ratedMe === 0
      ? "Rate 5 lads after Tuesday and your card unlocks ratings back. No free rides."
      : `Keep going — ratings only weigh in once you've given ${Math.max(0, 5 - ratedByMe)} more.`;

  return (
    <V3PageShell>
      <V3Ribbon />
      <V3IdentityLine context="Preview" marginBottom={36} />

      <V3Heading>Hello {user.name?.split(' ')[0] ?? 'there'}.</V3Heading>

      <p
        style={{
          fontFamily: TYPE.mono,
          fontSize: 15,
          lineHeight: 1.6,
          color: PALETTE.inkLight,
          marginTop: 18,
          marginBottom: 28,
          maxWidth: 520,
        }}
      >
        Last week&apos;s record is in. Most of you isn&apos;t — yet. The
        hottest takes about how you actually play live below. Rate the
        lads first — your own perception card unlocks once they&apos;ve
        rated you back.
      </p>

      {/* HERO — perception is the lead hook. Above the chess.com card
          because what the LADS think of each other generates more
          banter than your own stat dump. Cold stats are the record;
          hot takes are the engagement loop. */}
      <V3SolidCard
        accent="red"
        background={PALETTE.ink}
        padding="22px 24px"
        marginBottom={20}
      >
        <div
          style={{
            fontFamily: TYPE.mono,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: TRACKING.capWide,
            textTransform: 'uppercase',
            color: PALETTE.mustard,
            marginBottom: 10,
          }}
        >
          Perception · the hot-take engine
        </div>
        <div
          style={{
            fontFamily: TYPE.display,
            fontSize: 30,
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: '-0.01em',
            textTransform: 'uppercase',
            color: PALETTE.cream,
            marginBottom: 10,
          }}
        >
          {uniquePerceivers === 0
            ? 'No takes yet. Be the first to call.'
            : `${uniquePerceivers} lad${uniquePerceivers === 1 ? '' : 's'} have weighed in on you.`}
        </div>
        <div
          style={{
            fontFamily: TYPE.mono,
            fontSize: 12,
            lineHeight: 1.55,
            color: PALETTE.cream,
            opacity: 0.85,
            marginBottom: 14,
          }}
        >
          Rate the lads — what do they DO in pressure moments, what
          SHOULD they do? Aggregate only, no names attached. Your
          card unlocks at 5 ratings given.
        </div>
        <div
          style={{
            fontFamily: TYPE.mono,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: TRACKING.cap,
            textTransform: 'uppercase',
            color: PALETTE.mustard,
          }}
        >
          {perceptionsGiven} given · {perceptionsReceived} received
        </div>
      </V3SolidCard>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
        <V3CTAButton href={`/preview/${encodeURIComponent(token)}/perceive`}>
          {perceptionsGiven === 0
            ? 'Rate the lads · start the hot takes →'
            : perceptionsGiven < 5
            ? `Keep rating · ${5 - perceptionsGiven} more to unlock yours →`
            : 'Rate more · keep the takes coming →'}
        </V3CTAButton>
        {perceptionsGiven >= 5 && (
          <V3CTAButton
            href={`/preview/${encodeURIComponent(token)}/perceived`}
            variant="secondary"
          >
            See what the lads said about me →
          </V3CTAButton>
        )}
      </div>

      {/* Twin identity card — avatar + name + stat band */}
      <div
        style={{
          background: PALETTE.cream,
          border: `2px solid ${PALETTE.ink}`,
          borderRadius: 12,
          padding: 28,
          display: 'flex',
          gap: 24,
          alignItems: 'center',
          marginBottom: 28,
        }}
      >
        <MiniAvatar {...cardData.avatar} size={140} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: TYPE.mono,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: TRACKING.cap,
              textTransform: 'uppercase',
              color: PALETTE.navy,
              marginBottom: 6,
            }}
          >
            You · {user.position ?? 'No position set'}
          </div>
          <div
            style={{
              fontFamily: TYPE.display,
              fontSize: 36,
              fontWeight: 800,
              lineHeight: 1,
              marginBottom: 16,
              textTransform: 'uppercase',
              letterSpacing: '-0.01em',
            }}
          >
            {user.name}
          </div>
          <V3StatBand
            value={goals}
            label={statBandLabel}
            accent={goals > 0 ? 'mustard' : 'red'}
          />
        </div>
      </div>

      {/* Chess.com card — single component call, was ~200 lines inline */}
      <V3PlayerCard
        data={cardData}
        variant="full"
        groupAvgByAttr={groupAvgByAttr}
        groupSize={otherTwinsCount}
      />

      {/* Reciprocity band */}
      <V3SolidCard accent="red" marginBottom={28} padding="18px 20px">
        <div
          style={{
            fontFamily: TYPE.mono,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: TRACKING.cap,
            textTransform: 'uppercase',
            color: PALETTE.navy,
            marginBottom: 6,
          }}
        >
          Peer rating · the loop
        </div>
        <div
          style={{
            fontFamily: TYPE.display,
            fontSize: 26,
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: '-0.01em',
            textTransform: 'uppercase',
            marginBottom: 6,
          }}
        >
          {ratedByMe} given · {ratedMe} received
        </div>
        <div style={{ fontFamily: TYPE.mono, fontSize: 11, lineHeight: 1.5, color: PALETTE.inkLight }}>
          {reciprocityCopy}
        </div>
      </V3SolidCard>

      {/* The rule — said out loud */}
      <V3SolidCard
        accent="mustard"
        background={PALETTE.ink}
        padding="20px 22px"
        marginBottom={32}
      >
        <div
          style={{
            fontFamily: TYPE.mono,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: TRACKING.capWide,
            textTransform: 'uppercase',
            color: PALETTE.mustard,
            marginBottom: 8,
          }}
        >
          The rule
        </div>
        <p
          style={{
            fontFamily: TYPE.display,
            fontSize: 22,
            lineHeight: 1.2,
            margin: 0,
            letterSpacing: '-0.005em',
            textTransform: 'uppercase',
            fontWeight: 800,
            color: PALETTE.cream,
          }}
        >
          These numbers are how the group remembers you. You can&apos;t fake them. So make them real.
        </p>
      </V3SolidCard>

      {/* Train-your-card CTAs */}
      <V3SectionLabel>Train your card</V3SectionLabel>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <V3CTAButton href={`/preview/${encodeURIComponent(token)}/sim`}>
          Sim a match · move your numbers →
        </V3CTAButton>
        <V3CTAButton
          href={`/preview/${encodeURIComponent(token)}/drill`}
          variant="secondary"
        >
          Today&apos;s drill · +1 on your weakest →
        </V3CTAButton>
        <V3CTAButton
          href={`/preview/${encodeURIComponent(token)}/tactics`}
          variant="secondary"
        >
          Tactics puzzle · scaffold →
        </V3CTAButton>
        <V3CTAButton
          href={`/preview/${encodeURIComponent(token)}/customize`}
          variant="tertiary"
          marginBottom={6}
        >
          Pick your kit (vanity only — won&apos;t change stats)
        </V3CTAButton>
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: 48,
          paddingTop: 24,
          borderTop: `1px solid rgba(58,58,58,0.2)`,
          fontFamily: TYPE.mono,
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: TRACKING.cap,
          textTransform: 'uppercase',
          color: PALETTE.inkLight,
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <span>SPORTWARREN · {squad.shortName ?? deriveInitials(squad.name)}</span>
        <span>{squad.name}</span>
      </div>
    </V3PageShell>
  );
}
