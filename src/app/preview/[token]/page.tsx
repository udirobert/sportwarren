/**
 * Preview landing — the half-finished portrait each pre-seeded
 * kickabout player lands on.
 *
 *   /preview/<token>
 *
 * The design rule: the provocation lives in the gaps. Show what we
 * know (rank + goals + games) AND what we don't yet (pace, endurance,
 * composure, finishing). Each empty slot is tagged with how to fill
 * it — Strava sync, bleep test at the next session, peer rating.
 *
 * Stats are never self-editable. Vanity is (kit/hair/number, via
 * /customize); numbers only move via verified third-party proof.
 * We say this out loud so players know it's a record, not a costume.
 */

import React from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { MiniAvatar, PALETTE } from '../_components/MiniAvatar';
import {
  baselineForPosition,
  compareToGroup,
  computeOverall,
} from '@/server/services/personalization/position-baselines';
import type { AttributeKey } from '@/server/services/personalization/twin-types';


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

// The six chess.com-style attribute bars. Each is tagged with the
// VERIFIED path that moves it — "stats are never self-editable" from
// AGENTS.md still holds. Drills move XP, not these numbers.
const ATTRIBUTE_VIEWS: Array<{
  key: AttributeKey;
  short: string;
  label: string;
  movedBy: string;
  accent: 'red' | 'sage' | 'mustard' | 'navy';
}> = [
  { key: 'pace',      short: 'PAC', label: 'Pace',      movedBy: 'Link Strava · run splits',              accent: 'mustard' },
  { key: 'shooting',  short: 'SHO', label: 'Shooting',  movedBy: 'Goals + peer ratings on finishing',     accent: 'red' },
  { key: 'passing',   short: 'PAS', label: 'Passing',   movedBy: 'Match data + peer consensus',           accent: 'navy' },
  { key: 'dribbling', short: 'DRI', label: 'Dribbling', movedBy: 'Match data + peer ratings',             accent: 'sage' },
  { key: 'defending', short: 'DEF', label: 'Defending', movedBy: 'Tackles, clean sheets + peer ratings',  accent: 'navy' },
  { key: 'physical',  short: 'PHY', label: 'Physical',  movedBy: 'Bleep test + Strava endurance',         accent: 'red' },
];

type BaseAttributes = Record<AttributeKey, number>;

export default async function PreviewPage({ params }: PageProps) {
  const { token } = await params;

  const user = await prisma.user.findUnique({
    where: { walletAddress: token },
    include: {
      playerProfile: { include: { twin: true } },
      squads: {
        include: {
          squad: true,
        },
      },
    },
  });

  if (!user || user.chain !== 'preview') {
    notFound();
  }

  const profile = user.playerProfile;
  const squadMembership = user.squads[0];
  const squad = squadMembership?.squad;

  if (!squad) {
    notFound();
  }

  // Pull last session's per-player stats — include EVERYONE so we can
  // compute the player's rank for the night (the comparative framing
  // is the hook: "1 goal · joint 4th" lands harder than "1 goal").
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

  // Rank-with-ties: count how many players had strictly more goals,
  // then add 1. Joint-4th, joint-7th etc are the natural register.
  const goals = playerStats?.goals ?? 0;
  const minutesPlayed = playerStats?.minutesPlayed ?? 0;
  const gamesPlayed = Math.max(1, Math.round(minutesPlayed / 7));
  const playersAhead = sessionLeaderboard.filter((s) => s.goals > goals).length;
  const sessionRank = playerStats ? playersAhead + 1 : null;
  const tiedCount = playerStats
    ? sessionLeaderboard.filter((s) => s.goals === goals).length
    : 0;

  // Reciprocity counts — how many lads has this player rated, and how
  // many have rated them. Empty state is the hook ("be the first").
  // The TwinService writes ratings via PeerRating; for the pre-Tuesday
  // preview these will both be zero, which is exactly the provocation.
  const [ratedByMe, ratedMe] = profile
    ? await Promise.all([
        prisma.peerRating.count({ where: { raterId: profile.id } }),
        prisma.peerRating.count({ where: { targetId: profile.id } }),
      ])
    : [0, 0];

  // Chess.com card data — pull this player's twin attributes and every
  // squad-mate's twin attributes so we can show per-attribute group avg.
  const myAttrs: BaseAttributes = (profile?.twin?.baseAttributes as BaseAttributes | null) ?? baselineForPosition(user.position);
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
    const attrs = t.baseAttributes as BaseAttributes | null;
    if (!attrs) continue;
    for (const k of Object.keys(groupByAttr) as AttributeKey[]) {
      if (typeof attrs[k] === 'number') groupByAttr[k].push(attrs[k]);
    }
  }

  const avatar = {
    kit: user.avatarKitColor ?? PALETTE.red,
    accent: user.avatarAccentColor ?? PALETTE.navy,
    skin: user.avatarSkinTone ?? '#c89e7c',
    hair: user.avatarHairColor ?? '#2a1a10',
    hairStyle: user.avatarHairStyle ?? 'short',
    number: user.avatarNumber ?? '',
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: PALETTE.cream,
        padding: '40px 20px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: PALETTE.ink,
      }}
    >
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        {/* Top ribbon */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 28 }}>
          <div style={{ width: 28, height: 4, background: PALETTE.mustard }} />
          <div style={{ width: 28, height: 4, background: PALETTE.red }} />
          <div style={{ width: 28, height: 4, background: PALETTE.navy }} />
          <div style={{ width: 28, height: 4, background: PALETTE.sage }} />
        </div>

        {/* Identity line */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 36,
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: PALETTE.navy,
          }}
        >
          <div style={{ width: 7, height: 7, borderRadius: 3.5, background: PALETTE.red }} />
          SportWarren · Preview
        </div>

        {/* Hello headline */}
        <h1
          style={{
            fontFamily: 'Antonio, Impact, sans-serif',
            fontSize: 72,
            fontWeight: 800,
            lineHeight: 0.95,
            margin: 0,
            letterSpacing: '-0.02em',
            textTransform: 'uppercase',
          }}
        >
          Hello {user.name?.split(' ')[0] ?? 'there'}.
        </h1>

        <p
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 15,
            lineHeight: 1.6,
            color: PALETTE.inkLight,
            marginTop: 18,
            marginBottom: 36,
            maxWidth: 520,
          }}
        >
          Last week is in the record. Most of you isn't — yet. This is
          a half-finished portrait of you as a footballer in the {squad.name} group.
          What's filled in stays filled. The blanks below are how you fill the rest.
        </p>

        {/* Twin card */}
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
          <MiniAvatar {...avatar} size={140} />

          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: PALETTE.navy,
                marginBottom: 6,
              }}
            >
              You · {user.position ?? 'No position set'}
            </div>
            <div
              style={{
                fontFamily: 'Antonio, Impact, sans-serif',
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

            {/* Inline stat band with rank framing — comparative is the
                hook. Tied or solo positioning carries the social pressure. */}
            <div
              style={{
                background: PALETTE.ink,
                color: PALETTE.cream,
                padding: '10px 14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 12,
                borderLeft: `4px solid ${goals > 0 ? PALETTE.mustard : PALETTE.red}`,
              }}
            >
              <span
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 22,
                  fontWeight: 700,
                }}
              >
                {goals}
              </span>
              <span
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  opacity: 0.85,
                  textAlign: 'right',
                }}
              >
                {goals === 0
                  ? "Didn't trouble the scorers · last week"
                  : sessionRank === 1 && tiedCount === 1
                  ? `Top of the scoresheet · ${gamesPlayed} games`
                  : tiedCount > 1
                  ? `Goals · Joint ${ordinal(sessionRank!)} · ${gamesPlayed} games`
                  : `Goals · ${ordinal(sessionRank!)} of the night · ${gamesPlayed} games`}
              </span>
            </div>
          </div>
        </div>

        {/* Overall badge — the chess.com single number, prominent so
            players see their rank in the hierarchy at a glance. */}
        <div
          style={{
            background: PALETTE.ink,
            color: PALETTE.cream,
            padding: '24px 26px',
            marginBottom: 16,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 18,
            borderLeft: `8px solid ${PALETTE.mustard}`,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: PALETTE.mustard,
                marginBottom: 6,
              }}
            >
              Overall · level {myLevel}
            </div>
            <div
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 11,
                color: PALETTE.cream,
                opacity: 0.8,
                lineHeight: 1.45,
                maxWidth: 320,
              }}
            >
              Your starting rating. Sims, peer ratings, and verified runs
              move it up or down. Refresh after Tuesday to see it shift.
            </div>
          </div>
          <div
            style={{
              fontFamily: 'Antonio, Impact, sans-serif',
              fontSize: 84,
              fontWeight: 800,
              lineHeight: 0.9,
              letterSpacing: '-0.03em',
              color: PALETTE.mustard,
            }}
          >
            {overall}
          </div>
        </div>

        {/* The chess.com six-bar card. Each attribute is rendered as a
            bar with the player's value + group avg marker + a one-line
            "How to move this" tied to a verified path. */}
        <div style={{ marginBottom: 28 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: 14,
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
            }}
          >
            <span style={{ color: PALETTE.navy }}>Your card · {user.position ?? '—'}</span>
            <span style={{ color: PALETTE.inkLight, fontSize: 10 }}>
              vs {squadTwins.length - (profile?.twin ? 1 : 0)} lads in the group
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {ATTRIBUTE_VIEWS.map((view) => {
              const accentColor = PALETTE[view.accent];
              const value = myAttrs[view.key] ?? 50;
              const { groupAvg, verdict } = compareToGroup(value, groupByAttr[view.key]);
              const verdictCopy =
                verdict === 'ahead'
                  ? `+${value - groupAvg} vs group`
                  : verdict === 'behind'
                  ? `${value - groupAvg} vs group`
                  : `parity (${groupAvg} group avg)`;
              const verdictColor =
                verdict === 'ahead' ? PALETTE.sage : verdict === 'behind' ? PALETTE.red : PALETTE.inkLight;
              return (
                <div
                  key={view.key}
                  style={{
                    border: `1px solid ${PALETTE.ink}`,
                    padding: '12px 14px 14px',
                    background: PALETTE.cream,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: 10,
                      marginBottom: 8,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'Antonio, Impact, sans-serif',
                        fontSize: 22,
                        fontWeight: 800,
                        letterSpacing: '-0.01em',
                        color: accentColor,
                        minWidth: 48,
                      }}
                    >
                      {view.short}
                    </span>
                    <span
                      style={{
                        fontFamily: 'Antonio, Impact, sans-serif',
                        fontSize: 28,
                        fontWeight: 800,
                        lineHeight: 1,
                        letterSpacing: '-0.02em',
                      }}
                    >
                      {value}
                    </span>
                    <span
                      style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: '0.14em',
                        textTransform: 'uppercase',
                        color: verdictColor,
                        marginLeft: 'auto',
                      }}
                    >
                      {verdictCopy}
                    </span>
                  </div>

                  {/* Bar with the player's value filled + group-avg tick */}
                  <div
                    style={{
                      position: 'relative',
                      width: '100%',
                      height: 6,
                      background: 'rgba(0,0,0,0.08)',
                      marginBottom: 8,
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        height: '100%',
                        width: `${Math.max(0, Math.min(99, value))}%`,
                        background: accentColor,
                      }}
                    />
                    {/* Group-avg tick */}
                    {groupByAttr[view.key].length > 0 && (
                      <div
                        style={{
                          position: 'absolute',
                          top: -3,
                          left: `${Math.max(0, Math.min(99, groupAvg))}%`,
                          width: 2,
                          height: 12,
                          background: PALETTE.ink,
                          transform: 'translateX(-1px)',
                        }}
                      />
                    )}
                  </div>

                  <div
                    style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: PALETTE.inkLight,
                    }}
                  >
                    → {view.movedBy}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Reciprocity band — the SubmitHub loop, stated bluntly.
            Empty state is itself the lever ("be the first to rate"). */}
        <div
          style={{
            background: PALETTE.cream,
            border: `2px solid ${PALETTE.ink}`,
            padding: '18px 20px',
            marginBottom: 28,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 14,
            borderLeft: `6px solid ${PALETTE.red}`,
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: PALETTE.navy,
                marginBottom: 6,
              }}
            >
              Peer rating · the loop
            </div>
            <div
              style={{
                fontFamily: 'Antonio, Impact, sans-serif',
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
            <div
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 11,
                lineHeight: 1.5,
                color: PALETTE.inkLight,
              }}
            >
              {ratedByMe === 0 && ratedMe === 0
                ? "Rate 5 lads after Tuesday and your card unlocks ratings back. No free rides."
                : `Keep going — ratings only weigh in once you've given ${Math.max(0, 5 - ratedByMe)} more.`}
            </div>
          </div>
        </div>

        {/* The design principle, said out loud. The whole point in 26 words. */}
        <div
          style={{
            background: PALETTE.ink,
            color: PALETTE.cream,
            padding: '20px 22px',
            marginBottom: 32,
            borderLeft: `6px solid ${PALETTE.mustard}`,
          }}
        >
          <div
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: PALETTE.mustard,
              marginBottom: 8,
            }}
          >
            The rule
          </div>
          <p
            style={{
              fontFamily: 'Antonio, Impact, sans-serif',
              fontSize: 22,
              lineHeight: 1.2,
              margin: 0,
              letterSpacing: '-0.005em',
              textTransform: 'uppercase',
              fontWeight: 800,
            }}
          >
            These numbers are how the group remembers you. You can't fake them. So make them real.
          </p>
        </div>

        {/* "Train your card" — the chess.com-style action menu. Sim is
            the headline (it actually moves the card now). Drill is the
            daily-engagement loop. Tactics is a scaffold pointing at the
            post-Tuesday lichess-training equivalent. Customize is the
            vanity-only escape hatch. */}
        <div
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: PALETTE.navy,
            marginBottom: 14,
          }}
        >
          Train your card
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Link
            href={`/preview/${encodeURIComponent(token)}/sim`}
            style={{
              background: PALETTE.mustard,
              color: PALETTE.ink,
              padding: '18px 20px',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              textAlign: 'center',
              border: `2px solid ${PALETTE.red}`,
              textDecoration: 'none',
              display: 'block',
            }}
          >
            Sim a match · move your numbers →
          </Link>

          <Link
            href={`/preview/${encodeURIComponent(token)}/drill`}
            style={{
              background: 'transparent',
              color: PALETTE.ink,
              padding: '14px 20px',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              textAlign: 'center',
              border: `2px solid ${PALETTE.sage}`,
              textDecoration: 'none',
              display: 'block',
            }}
          >
            Today's drill · +1 on your weakest →
          </Link>

          <Link
            href={`/preview/${encodeURIComponent(token)}/tactics`}
            style={{
              background: 'transparent',
              color: PALETTE.ink,
              padding: '14px 20px',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              textAlign: 'center',
              border: `2px solid ${PALETTE.navy}`,
              textDecoration: 'none',
              display: 'block',
            }}
          >
            Tactics puzzle · scaffold →
          </Link>

          <Link
            href={`/preview/${encodeURIComponent(token)}/customize`}
            style={{
              background: 'transparent',
              color: PALETTE.inkLight,
              padding: '12px 20px',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              textAlign: 'center',
              border: `1px solid ${PALETTE.inkLight}`,
              textDecoration: 'none',
              display: 'block',
              marginTop: 6,
            }}
          >
            Pick your kit (vanity only — won't change stats)
          </Link>
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: 48,
            paddingTop: 24,
            borderTop: `1px solid rgba(58,58,58,0.2)`,
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: PALETTE.inkLight,
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <span>SPORTWARREN · {squad.shortName ?? deriveInitials(squad.name)}</span>
          <span>{squad.name}</span>
        </div>
      </div>
    </div>
  );
}
