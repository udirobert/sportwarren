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

// Each unknown slot is paired with the verified-third-party path that fills
// it. Stats are never self-editable; this list is the visible API for that.
const UNKNOWN_SLOTS: Array<{
  label: string;
  hint: string;
  via: string;
  accent: 'sage' | 'mustard' | 'navy' | 'red';
}> = [
  { label: 'Pace', hint: 'Bleep test', via: 'Verified by the lads at the next session', accent: 'sage' },
  { label: 'Endurance', hint: 'Link Strava', via: 'Synced from your real runs', accent: 'mustard' },
  { label: 'Composure', hint: 'Earn it on the pitch', via: 'Captured by the match log over time', accent: 'navy' },
  { label: 'Finishing', hint: 'Let the lads rate you', via: 'Aggregated from peer votes — needs 5+', accent: 'red' },
];

export default async function PreviewPage({ params }: PageProps) {
  const { token } = await params;

  const user = await prisma.user.findUnique({
    where: { walletAddress: token },
    include: {
      playerProfile: true,
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

        {/* What we don't know — the unknown slots panel. Each missing
            attribute is shown as a hollow card with a question mark and
            the verified path that fills it. Empty is the hook. */}
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
            <span style={{ color: PALETTE.navy }}>What we don't know yet</span>
            <span style={{ color: PALETTE.inkLight, fontSize: 10 }}>
              {UNKNOWN_SLOTS.length} blanks · 0 filled
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {UNKNOWN_SLOTS.map((slot) => {
              const accentColor = PALETTE[slot.accent];
              return (
                <div
                  key={slot.label}
                  style={{
                    border: `2px dashed ${accentColor}`,
                    padding: '14px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    background: 'rgba(0,0,0,0.015)',
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'Antonio, Impact, sans-serif',
                      fontSize: 40,
                      fontWeight: 800,
                      lineHeight: 1,
                      color: accentColor,
                      minWidth: 32,
                      textAlign: 'center',
                    }}
                  >
                    ?
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'baseline',
                        gap: 10,
                        flexWrap: 'wrap',
                      }}
                    >
                      <span
                        style={{
                          fontFamily: 'Antonio, Impact, sans-serif',
                          fontSize: 22,
                          fontWeight: 800,
                          letterSpacing: '-0.01em',
                          textTransform: 'uppercase',
                        }}
                      >
                        {slot.label}
                      </span>
                      <span
                        style={{
                          fontFamily: 'JetBrains Mono, monospace',
                          fontSize: 10,
                          fontWeight: 700,
                          letterSpacing: '0.16em',
                          textTransform: 'uppercase',
                          color: accentColor,
                        }}
                      >
                        → {slot.hint}
                      </span>
                    </div>
                    <div
                      style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: 11,
                        lineHeight: 1.45,
                        color: PALETTE.inkLight,
                        marginTop: 4,
                      }}
                    >
                      {slot.via}
                    </div>
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

        {/* CTAs — the kit CTA is explicitly tagged as vanity so the
            stat-immutability principle is visible at the action layer. */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
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
            See what your twin does vs the lads →
          </Link>

          <Link
            href={`/preview/${encodeURIComponent(token)}/customize`}
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
