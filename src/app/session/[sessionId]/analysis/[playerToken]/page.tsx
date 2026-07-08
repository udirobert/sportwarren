/**
 * Post-session analysis page — the chess.com "your match" surface.
 *
 *   /session/<sessionId>/analysis/<playerToken>
 *
 * The missing emotional peak in the flywheel: the match just ended,
 * the player is hot, show them what happened to their card. Goals
 * scored → peer ratings received → current attribute bars (weakest
 * highlighted) → "what to drill next."
 *
 * Composed from V3 primitives + V3PlayerCard. TwinEvent isn't a
 * persisted table so before/after deltas aren't shown yet — see
 * docs/flywheel.md for the v2 plan.
 */

import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { MiniAvatar } from '../../../../preview/_components/MiniAvatar';
import {
  PALETTE,
  TYPE,
  TRACKING,
  V3PageShell,
  V3Ribbon,
  V3IdentityLine,
  V3Heading,
  V3SectionLabel,
  V3CTAButton,
  V3SolidCard,
  V3HollowCard,
  V3Reveal,
  type Attrs,
} from '@/components/v3';
import {
  baselineForPosition,
  computeOverall,
} from '@/server/services/personalization/position-baselines';
import { ATTRIBUTE_KEYS, type AttributeKey } from '@/server/services/personalization/twin-types';

interface PageProps {
  params: Promise<{ sessionId: string; playerToken: string }>;
}

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

/**
 * Compute real attribute deltas by comparing the session's before-attributes
 * snapshot against the player's current twin state. The before-attributes
 * were captured by `startSession()` when the captain kicked off the night,
 * so the delta shows exactly how the card moved during the session — goals
 * scored, minutes played, peer ratings applied, etc.
 *
 * Accepts Partial<Attrs> for the beforeAttrs since snapshot values may be
 * missing for players who joined mid-session or whose twin didn't exist yet.
 */
function computeRealDeltas(
  beforeAttrs: Partial<Attrs> | null | undefined,
  currentAttrs: Attrs,
): Partial<Record<AttributeKey, number>> {
  if (!beforeAttrs) return {};
  const deltas: Partial<Record<AttributeKey, number>> = {};
  for (const k of ATTRIBUTE_KEYS) {
    const before = beforeAttrs[k];
    const after = currentAttrs[k];
    if (typeof before === 'number' && typeof after === 'number' && after !== before) {
      deltas[k] = after - before;
    }
  }
  return deltas;
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
          playerStats: { include: { profile: { include: { user: true } } } },
        },
      },
    },
  });
  if (!session) notFound();

  const profileId = player.playerProfile.id;
  const myStats = session.matches.flatMap((m) => m.playerStats).filter((s) => s.profileId === profileId);

  const myGoals = myStats.reduce((s, st) => s + st.goals, 0);
  const myAssists = myStats.reduce((s, st) => s + st.assists, 0);
  const myMinutes = myStats.reduce((s, st) => s + st.minutesPlayed, 0);

  const allStats = session.matches.flatMap((m) => m.playerStats);
  const byProfile = new Map<string, number>();
  for (const st of allStats) {
    byProfile.set(st.profileId, (byProfile.get(st.profileId) ?? 0) + st.goals);
  }
  const ranked = [...byProfile.entries()].sort((a, b) => b[1] - a[1]);
  const myRank = ranked.findIndex(([pid]) => pid === profileId) + 1 || null;
  const totalScorers = ranked.filter(([, g]) => g > 0).length;

  const ratingsReceived = await prisma.peerRating.findMany({
    where: { targetId: profileId, match: { sessionId } },
    select: { score: true, attribute: true, raterId: true },
  });
  const ratersCount = new Set(ratingsReceived.map((r) => r.raterId)).size;
  const avgScore = ratingsReceived.length > 0
    ? ratingsReceived.reduce((s, r) => s + r.score, 0) / ratingsReceived.length
    : null;

  const twin = player.playerProfile.twin;
  const currentAttrs: Attrs = (twin?.baseAttributes as Attrs | null) ?? baselineForPosition(player.position);
  const level = twin?.level ?? 1;
  const overall = computeOverall(currentAttrs, player.position, level, twin?.prestige ?? 0);
  const weakest = findWeakest(currentAttrs);
  const weakestLabel = ATTR_LABEL[weakest];

  // ── Real attribute delta from session before/after snapshot ──
  // beforeAttributes was captured by startSession() — it's a JSON object
  // keyed by profileId, each value is { pace: 55, shooting: 50, ... }.
  // If no snapshot exists (pre-migration sessions), fall back to empty —
  // the UI degrades gracefully (no delta shown).
  const beforeAttrsMap = session.beforeAttributes as Record<string, Attrs> | null;
  const myBeforeAttrs: Partial<Attrs> | null = beforeAttrsMap?.[profileId] ?? null;
  const realDeltas = computeRealDeltas(myBeforeAttrs, currentAttrs);
  const hasRealMovement = Object.values(realDeltas).some((d) => d !== 0);

  // ── Alternate reality sim seed ──
  // Deterministic from session+player so the same link always produces the
  // same sim outcome. The player can share it and their mates see the same.
  const simSeed = `alt-${sessionId}-${profileId}`.split('').reduce((s, c) => s * 31 + c.charCodeAt(0), 0) % 100000;

  const dateLabel = new Date(session.date).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  return (
    <V3PageShell paddingTop={32}>
      <V3Ribbon marginBottom={24} />
      <V3IdentityLine context={`Post-session analysis · ${dateLabel}`} marginBottom={14} showDot={false} />

      <V3Heading size="large">
        Your card<br />tonight.
      </V3Heading>

      {/* Hero — avatar + overall */}
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
              fontFamily: TYPE.mono,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: TRACKING.capWide,
              textTransform: 'uppercase',
              color: PALETTE.mustard,
              marginBottom: 4,
            }}
          >
            {player.name} · {player.position ?? '—'} · L{level}
          </div>
          <div
            style={{
              fontFamily: TYPE.display,
              fontSize: 64,
              fontWeight: 800,
              lineHeight: 0.95,
              letterSpacing: TRACKING.displayBig,
              color: PALETTE.mustard,
            }}
          >
            {overall}
          </div>
          <div
            style={{
              fontFamily: TYPE.mono,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: TRACKING.cap,
              textTransform: 'uppercase',
              color: PALETTE.cream,
              opacity: 0.8,
            }}
          >
            Overall rating
          </div>
        </div>
      </div>

      <V3Reveal delay={100}>
        <V3SectionLabel marginTop={32}>What you did tonight</V3SectionLabel>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 24 }}>
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
              marginBottom: 24,
              fontFamily: TYPE.mono,
              fontSize: 12,
              color: PALETTE.ink,
            }}
          >
            #{myRank} of {totalScorers} scorers on the night
          </div>
        )}
      </V3Reveal>

      <V3Reveal delay={150}>
        <V3SectionLabel marginTop={12}>What the lads said</V3SectionLabel>

        {ratersCount === 0 ? (
          <V3HollowCard>
            <div style={{ fontFamily: TYPE.mono, fontSize: 12, lineHeight: 1.55, color: PALETTE.ink }}>
              <strong>0 lads have rated you yet.</strong> Your card moves
              when at least 5 weigh in — rate teammates first to unlock
              yours back. <em>SubmitHub rules apply.</em>
            </div>
          </V3HollowCard>
        ) : (
          <V3SolidCard accent="sage" padding="16px 18px" marginBottom={24}>
            <div
              style={{
                fontFamily: TYPE.display,
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
                fontFamily: TYPE.mono,
                fontSize: 11,
                lineHeight: 1.5,
                color: PALETTE.inkLight,
                marginTop: 6,
              }}
            >
              {ratingsReceived.length} ratings across attributes.
              Once the consensus window closes, your card adjusts.
            </div>
          </V3SolidCard>
        )}
      </V3Reveal>

      <V3Reveal delay={200}>
        <V3SectionLabel marginTop={12}>Where your card stands</V3SectionLabel>

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
                fontFamily: TYPE.mono,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: TRACKING.capNarrow,
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
                fontFamily: TYPE.display,
                fontSize: 18,
                fontWeight: 800,
                letterSpacing: '-0.01em',
                minWidth: 28,
                textAlign: 'right',
              }}
            >
              {currentAttrs[k]}
            </span>
            {(() => {
              const delta = realDeltas[k];
              if (delta === undefined || delta === 0) return null;
              return (
                <span
                  style={{
                    fontFamily: TYPE.mono,
                    fontSize: 10,
                    fontWeight: 700,
                    color: delta > 0 ? PALETTE.sage : PALETTE.red,
                    minWidth: 24,
                    textAlign: 'right',
                  }}
                >
                  {delta > 0 ? '+' : ''}{delta}
                </span>
              );
            })()}
          </div>
        ))}
      </div>
      </V3Reveal>

      {/* What to drill next */}
      <V3Reveal delay={250}>
      <V3SolidCard
        accent="red"
        background={PALETTE.ink}
        padding="20px"
        marginBottom={16}
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
          What to drill next
        </div>
        <div
          style={{
            fontFamily: TYPE.display,
            fontSize: 22,
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-0.01em',
            textTransform: 'uppercase',
            marginBottom: 10,
            color: PALETTE.cream,
          }}
        >
          {weakestLabel.long} · {currentAttrs[weakest]}
        </div>
        <div
          style={{
            fontFamily: TYPE.mono,
            fontSize: 12,
            lineHeight: 1.55,
            color: PALETTE.cream,
            opacity: 0.85,
          }}
        >
          Your weakest attribute. Tomorrow&apos;s drill will target it —
          +1 if you complete it. Streaks compound.
        </div>
      </V3SolidCard>

      {/* Real card movement from session snapshot */}
      {hasRealMovement && (
        <V3SolidCard accent="sage" padding="16px 18px" marginBottom={16}>
          <div
            style={{
              fontFamily: TYPE.mono,
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: TRACKING.cap,
              textTransform: 'uppercase',
              color: PALETTE.sage,
              marginBottom: 6,
            }}
          >
            Card movement · this session
          </div>
          <div
            style={{
              fontFamily: TYPE.mono,
              fontSize: 13,
              lineHeight: 1.55,
              color: PALETTE.ink,
            }}
          >
            Your card moved{' '}
            {Object.entries(realDeltas)
              .filter(([, d]) => d !== 0)
              .map(([attr, delta]) => `${ATTR_LABEL[attr as AttributeKey].short} ${delta > 0 ? '+' : ''}${delta}`)
              .join(' · ')}
            {' '}during the session. Peer ratings will continue to adjust
            once the consensus window closes.
          </div>
        </V3SolidCard>
      )
      }

      {/* When there's a snapshot but the card hasn't moved yet */}
      {!hasRealMovement && myBeforeAttrs && (
        <p
          style={{
            fontFamily: TYPE.mono,
            fontSize: 11,
            color: PALETTE.inkLight,
            fontStyle: 'italic',
            textAlign: 'center',
            marginBottom: 16,
          }}
        >
          Card recorded when the session started — movement expected once
          peer ratings are processed.
        </p>
      )}

      </V3Reveal>

      {/* Alternate reality sim — "what if" anchor */}
      <V3Reveal delay={300}>
      <V3SolidCard accent="navy" padding="16px 18px" marginBottom={16}>
        <div
          style={{
            fontFamily: TYPE.mono,
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: TRACKING.cap,
            textTransform: 'uppercase',
            color: PALETTE.navy,
            marginBottom: 6,
          }}
        >
          Alternate reality
        </div>
        <div
          style={{
            fontFamily: TYPE.display,
            fontSize: 20,
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-0.01em',
            textTransform: 'uppercase',
            color: PALETTE.ink,
            marginBottom: 10,
          }}
        >
          What if the match went differently?
        </div>
        <div
          style={{
            fontFamily: TYPE.mono,
            fontSize: 12,
            lineHeight: 1.55,
            color: PALETTE.inkLight,
            marginBottom: 16,
          }}
        >
          Same lads, different outcome. The sim rewinds and runs again —
          seeded from tonight so every share produces the same alternate
          timeline.
        </div>
        <Link
          href={`/preview/${encodeURIComponent(playerToken)}/sim?r=${simSeed}`}
          style={{
            fontFamily: TYPE.mono,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: PALETTE.navy,
            textDecoration: 'none',
            padding: '8px 14px',
            border: `1.5px solid ${PALETTE.navy}`,
            display: 'inline-block',
          }}
        >
          Run the alternate sim →
        </Link>
      </V3SolidCard>
      </V3Reveal>

      <V3Reveal delay={350}>
      <V3CTAButton href={`/preview/${encodeURIComponent(playerToken)}/drill`} marginBottom={12}>
        Go drill → +1 {weakestLabel.short}
      </V3CTAButton>

      <V3CTAButton href={`/preview/${encodeURIComponent(playerToken)}`} variant="secondary" marginBottom={12}>
        Open my current card →
      </V3CTAButton>

      <V3CTAButton href={`/preview/${encodeURIComponent(playerToken)}/squad`} variant="tertiary">
        The clubhouse →
      </V3CTAButton>
      </V3Reveal>

      <p
        style={{
          fontFamily: TYPE.mono,
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
    </V3PageShell>
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
          fontFamily: TYPE.display,
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
          fontFamily: TYPE.mono,
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: TRACKING.cap,
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
