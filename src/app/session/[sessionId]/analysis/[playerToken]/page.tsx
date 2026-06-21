/**
 * Post-session analysis page — the chess.com "your match" surface.
 *
 *   /session/<sessionId>/analysis/<playerToken>
 *
 * This is the missing emotional peak in the flywheel: the match
 * just ended, the player is hot, show them what happened to their
 * card. Goals scored → peer ratings received → twin attribute
 * deltas → "what to drill next." Each one of those is sourced
 * from real data already in the DB; this page just stitches them
 * into a story.
 *
 * Data sources:
 *   - PlayerMatchStats for the session's matches → goals, assists, minutes
 *   - PeerRating for ratings received this session (median, count)
 *   - PlayerTwin (current state) + recent twin event for diff
 *   - Position baseline + Overall computation
 */

import React from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { MiniAvatar, PALETTE } from '../../../../preview/_components/MiniAvatar';
import {
  computeOverall,
  baselineForPosition,
} from '@/server/services/personalization/position-baselines';
import { ATTRIBUTE_KEYS, type AttributeKey } from '@/server/services/personalization/twin-types';

interface PageProps {
  params: Promise<{ sessionId: string; playerToken: string }>;
}

type Attrs = Record<AttributeKey, number>;

const ATTR_LABEL: Record<AttributeKey, { short: string; long: string }> = {
  pace: { short: 'PAC', long: 'Pace' },
  shooting: { short: 'SHO', long: 'Shooting' },
  passing: { short: 'PAS', long: 'Passing' },
  dribbling: { short: 'DRI', long: 'Dribbling' },
  defending: { short: 'DEF', long: 'Defending' },
  physical: { short: 'PHY', long: 'Physical' },
};

function findWeakest(attrs: Attrs): AttributeKey {
  let weakest: AttributeKey = 'pace';
  let weakestVal = attrs.pace;
  for (const k of ATTRIBUTE_KEYS) {
    if (attrs[k] < weakestVal) {
      weakest = k;
      weakestVal = attrs[k];
    }
  }
  return weakest;
}

export default async function AnalysisPage({ params }: PageProps) {
  const { sessionId, playerToken } = await params;

  const player = await prisma.user.findUnique({
    where: { walletAddress: playerToken },
    include: { playerProfile: { include: { twin: true } } },
  });
  if (!player || !player.playerProfile) notFound();

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      squad: true,
      matches: {
        include: {
          playerStats: {
            include: { profile: { include: { user: true } } },
          },
        },
      },
    },
  });
  if (!session) notFound();

  const profileId = player.playerProfile.id;
  const myStats = session.matches
    .flatMap((m) => m.playerStats)
    .filter((s) => s.profileId === profileId);

  const myGoals = myStats.reduce((s, st) => s + st.goals, 0);
  const myAssists = myStats.reduce((s, st) => s + st.assists, 0);
  const myMinutes = myStats.reduce((s, st) => s + st.minutesPlayed, 0);

  // Session-wide leaderboard for rank context
  const allStats = session.matches.flatMap((m) => m.playerStats);
  const byProfile = new Map<string, number>();
  for (const st of allStats) {
    byProfile.set(st.profileId, (byProfile.get(st.profileId) ?? 0) + st.goals);
  }
  const ranked = [...byProfile.entries()].sort((a, b) => b[1] - a[1]);
  const myRank = ranked.findIndex(([pid]) => pid === profileId) + 1 || null;
  const totalScorers = ranked.filter(([, g]) => g > 0).length;

  // Peer ratings received this session
  const ratingsReceived = await prisma.peerRating.findMany({
    where: {
      targetId: profileId,
      match: { sessionId },
    },
    select: { score: true, attribute: true, raterId: true },
  });
  const ratersCount = new Set(ratingsReceived.map((r) => r.raterId)).size;
  const avgScore = ratingsReceived.length > 0
    ? ratingsReceived.reduce((s, r) => s + r.score, 0) / ratingsReceived.length
    : null;

  // (TwinEvent isn't persisted as a queryable row — diffs flow through
  // TwinService and land on PlayerTwin + Moment + Attestation. Showing
  // before/after deltas requires either snapshotting at session start
  // or pulling from Moment rows; v2 work — see docs/flywheel.md.)
  const twin = player.playerProfile.twin;
  const currentAttrs: Attrs = (twin?.baseAttributes as Attrs | null) ?? baselineForPosition(player.position);
  const level = twin?.level ?? 1;
  const overall = computeOverall(currentAttrs, player.position, level, twin?.prestige ?? 0);

  const weakest = findWeakest(currentAttrs);
  const weakestLabel = ATTR_LABEL[weakest];

  const dateLabel = new Date(session.date).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  return (
    <div
      style={{
        minHeight: '100vh',
        background: PALETTE.cream,
        padding: '32px 20px 80px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: PALETTE.ink,
      }}
    >
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: 4, marginBottom: 24 }}>
          <div style={{ width: 28, height: 4, background: PALETTE.mustard }} />
          <div style={{ width: 28, height: 4, background: PALETTE.red }} />
          <div style={{ width: 28, height: 4, background: PALETTE.navy }} />
          <div style={{ width: 28, height: 4, background: PALETTE.sage }} />
        </div>

        <div
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: PALETTE.navy,
            marginBottom: 12,
          }}
        >
          Post-session analysis · {dateLabel}
        </div>

        <h1
          style={{
            fontFamily: 'Antonio, Impact, sans-serif',
            fontSize: 56,
            fontWeight: 800,
            lineHeight: 0.95,
            margin: 0,
            letterSpacing: '-0.02em',
            textTransform: 'uppercase',
          }}
        >
          Your card<br />tonight.
        </h1>

        {/* Player hero — avatar + overall */}
        <div
          style={{
            display: 'flex',
            gap: 24,
            alignItems: 'center',
            marginTop: 28,
            marginBottom: 24,
            padding: '20px 22px',
            background: PALETTE.ink,
            color: PALETTE.cream,
            borderLeft: `8px solid ${PALETTE.mustard}`,
          }}
        >
          <MiniAvatar
            kit={player.avatarKitColor ?? undefined}
            accent={player.avatarAccentColor ?? undefined}
            skin={player.avatarSkinTone ?? undefined}
            hair={player.avatarHairColor ?? undefined}
            hairStyle={player.avatarHairStyle ?? 'short'}
            number={player.avatarNumber ?? ''}
            size={88}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: PALETTE.mustard,
                marginBottom: 4,
              }}
            >
              {player.name} · {player.position ?? '—'} · L{level}
            </div>
            <div
              style={{
                fontFamily: 'Antonio, Impact, sans-serif',
                fontSize: 64,
                fontWeight: 800,
                lineHeight: 0.95,
                letterSpacing: '-0.03em',
                color: PALETTE.mustard,
              }}
            >
              {overall}
            </div>
            <div
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: PALETTE.cream,
                opacity: 0.8,
              }}
            >
              Overall rating
            </div>
          </div>
        </div>

        {/* What you did */}
        <div
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: PALETTE.navy,
            marginTop: 32,
            marginBottom: 12,
          }}
        >
          What you did tonight
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 10,
            marginBottom: 24,
          }}
        >
          <StatCell label="Goals" value={myGoals} accent={myGoals > 0 ? PALETTE.red : PALETTE.inkLight} />
          <StatCell label="Assists" value={myAssists} accent={myAssists > 0 ? PALETTE.sage : PALETTE.inkLight} />
          <StatCell label="Minutes" value={myMinutes} accent={PALETTE.navy} />
        </div>

        {myRank && totalScorers > 0 && myGoals > 0 && (
          <div
            style={{
              background: 'rgba(28,58,94,0.06)',
              padding: 12,
              borderLeft: `4px solid ${PALETTE.navy}`,
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 12,
              color: PALETTE.ink,
              marginBottom: 24,
            }}
          >
            #{myRank} of {totalScorers} scorers on the night
          </div>
        )}

        {/* What the lads said */}
        <div
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: PALETTE.navy,
            marginTop: 12,
            marginBottom: 12,
          }}
        >
          What the lads said
        </div>

        {ratersCount === 0 ? (
          <div
            style={{
              background: 'rgba(0,0,0,0.04)',
              border: `1px dashed ${PALETTE.inkLight}`,
              padding: '14px 16px',
              marginBottom: 24,
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 12,
              lineHeight: 1.55,
              color: PALETTE.ink,
            }}
          >
            <strong>0 lads have rated you yet.</strong> Your card moves
            when at least 5 weigh in — rate teammates first to unlock
            yours back. <em>SubmitHub rules apply.</em>
          </div>
        ) : (
          <div
            style={{
              background: PALETTE.cream,
              border: `2px solid ${PALETTE.sage}`,
              borderLeft: `8px solid ${PALETTE.sage}`,
              padding: '16px 18px',
              marginBottom: 24,
            }}
          >
            <div
              style={{
                fontFamily: 'Antonio, Impact, sans-serif',
                fontSize: 28,
                fontWeight: 800,
                lineHeight: 1.05,
                textTransform: 'uppercase',
                letterSpacing: '-0.01em',
              }}
            >
              {ratersCount} lad{ratersCount === 1 ? '' : 's'} weighed in
              {avgScore !== null && (
                <span style={{ color: PALETTE.sage }}> · avg {avgScore.toFixed(1)}/10</span>
              )}
            </div>
            <div
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 11,
                lineHeight: 1.5,
                color: PALETTE.inkLight,
                marginTop: 6,
              }}
            >
              {ratingsReceived.length} ratings across attributes.
              Once the consensus window closes, your card adjusts.
            </div>
          </div>
        )}

        {/* Current attribute bars */}
        <div
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: PALETTE.navy,
            marginTop: 12,
            marginBottom: 12,
          }}
        >
          Where your card stands
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
          {ATTRIBUTE_KEYS.map((k) => (
            <div
              key={k}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 10px',
                border: '1px solid rgba(0,0,0,0.08)',
              }}
            >
              <span
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: PALETTE.navy,
                  minWidth: 36,
                }}
              >
                {ATTR_LABEL[k].short}
              </span>
              <div
                style={{
                  position: 'relative',
                  flex: 1,
                  height: 5,
                  background: 'rgba(0,0,0,0.08)',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    height: '100%',
                    width: `${Math.max(0, Math.min(99, currentAttrs[k]))}%`,
                    background: k === weakest ? PALETTE.red : PALETTE.ink,
                  }}
                />
              </div>
              <span
                style={{
                  fontFamily: 'Antonio, Impact, sans-serif',
                  fontSize: 18,
                  fontWeight: 800,
                  letterSpacing: '-0.01em',
                  minWidth: 28,
                  textAlign: 'right',
                }}
              >
                {currentAttrs[k]}
              </span>
            </div>
          ))}
        </div>

        {/* What to drill next */}
        <div
          style={{
            background: PALETTE.ink,
            color: PALETTE.cream,
            padding: 20,
            borderLeft: `6px solid ${PALETTE.red}`,
            marginBottom: 16,
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
            What to drill next
          </div>
          <div
            style={{
              fontFamily: 'Antonio, Impact, sans-serif',
              fontSize: 22,
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-0.01em',
              textTransform: 'uppercase',
              marginBottom: 10,
            }}
          >
            {weakestLabel.long} · {currentAttrs[weakest]}
          </div>
          <div
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 12,
              lineHeight: 1.55,
              opacity: 0.85,
            }}
          >
            Your weakest attribute. Tomorrow's drill will target it —
            +1 if you complete it. Streaks compound.
          </div>
        </div>

        <Link
          href={`/preview/${encodeURIComponent(playerToken)}/drill`}
          style={{
            background: PALETTE.mustard,
            color: PALETTE.ink,
            padding: '16px 20px',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            textAlign: 'center',
            border: `2px solid ${PALETTE.red}`,
            textDecoration: 'none',
            display: 'block',
            marginBottom: 12,
          }}
        >
          Go drill → +1 {weakestLabel.short}
        </Link>

        <Link
          href={`/preview/${encodeURIComponent(playerToken)}`}
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
          Open my current card →
        </Link>

        <p
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 10,
            lineHeight: 1.6,
            color: PALETTE.inkLight,
            marginTop: 32,
            fontStyle: 'italic',
            textAlign: 'center',
          }}
        >
          {session.squad.name} · {session.name ?? 'Session'}
        </p>
      </div>
    </div>
  );
}

function StatCell({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div
      style={{
        padding: '12px 14px',
        background: PALETTE.cream,
        border: `2px solid ${accent}`,
        borderTop: `6px solid ${accent}`,
      }}
    >
      <div
        style={{
          fontFamily: 'Antonio, Impact, sans-serif',
          fontSize: 36,
          fontWeight: 800,
          lineHeight: 1,
          letterSpacing: '-0.02em',
          color: PALETTE.ink,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: PALETTE.inkLight,
          marginTop: 2,
        }}
      >
        {label}
      </div>
    </div>
  );
}
