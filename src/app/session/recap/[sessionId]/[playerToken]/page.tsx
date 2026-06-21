/**
 * Per-player session recap — what each player sees after the captain
 * fires the post-session WhatsApp blast. Their personal "you scored X,
 * played Y, here's your moment" surface.
 */

import React from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { MiniAvatar, PALETTE } from '../../../../preview/_components/MiniAvatar';

interface PageProps {
  params: Promise<{ sessionId: string; playerToken: string }>;
}

export default async function RecapPage({ params }: PageProps) {
  const { sessionId, playerToken } = await params;

  const player = await prisma.user.findUnique({
    where: { walletAddress: playerToken },
    include: { playerProfile: true },
  });

  if (!player || !player.playerProfile) notFound();

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

  if (!session) notFound();

  const allStats = session.matches.flatMap((m) => m.playerStats);
  const myStats = allStats.find((s) => s.profileId === player.playerProfile!.id);
  if (!myStats) notFound();

  const myGoals = myStats.goals;

  // Compute session totals
  const totalGoals = allStats.reduce((s, st) => s + st.goals, 0);
  const topScorer = [...allStats]
    .filter((s) => s.profileId !== player.playerProfile!.id)
    .sort((a, b) => b.goals - a.goals)[0];

  const isTopScorer = allStats.every(
    (s) => s.profileId === player.playerProfile!.id || s.goals <= myGoals,
  );

  // Rank
  const ranked = [...allStats].sort((a, b) => b.goals - a.goals);
  const myRank = ranked.findIndex((s) => s.profileId === player.playerProfile!.id) + 1;
  const totalPlayers = ranked.filter((s) => s.goals > 0 || s.profileId === player.playerProfile!.id).length;

  // Squad-mates who scored
  const otherScorers = allStats
    .filter((s) => s.profileId !== player.playerProfile!.id && s.goals > 0)
    .sort((a, b) => b.goals - a.goals);

  const date = new Date(session.date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  // Reciprocity gate — SubmitHub-style. How many lads has this player
  // rated in this session, and how many have rated them. The "give to
  // receive" framing creates the social pressure that drives engagement.
  const profileId = player.playerProfile!.id;
  const [givenCount, receivedCount] = await Promise.all([
    prisma.peerRating.count({
      where: { raterId: profileId, match: { sessionId } },
    }),
    prisma.peerRating.count({
      where: { targetId: profileId, match: { sessionId } },
    }),
  ]);
  const RATING_THRESHOLD = 5;
  const givenEnough = givenCount >= RATING_THRESHOLD;
  const receivedEnough = receivedCount >= RATING_THRESHOLD;

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

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 36,
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: PALETTE.navy,
          }}
        >
          <div style={{ width: 7, height: 7, borderRadius: 3.5, background: PALETTE.red }} />
          Session recap · {date}
        </div>

        {/* Hero — big goal number */}
        <div style={{ display: 'flex', gap: 28, alignItems: 'center', marginBottom: 32 }}>
          <MiniAvatar
            kit={player.avatarKitColor ?? undefined}
            accent={player.avatarAccentColor ?? undefined}
            skin={player.avatarSkinTone ?? undefined}
            hair={player.avatarHairColor ?? undefined}
            hairStyle={player.avatarHairStyle ?? 'short'}
            number={player.avatarNumber ?? ''}
            size={140}
          />

          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: PALETTE.inkLight,
                marginBottom: 4,
              }}
            >
              {player.name} · {player.position ?? '—'}
            </div>

            <div
              style={{
                fontFamily: 'Antonio, Impact, sans-serif',
                fontSize: 120,
                fontWeight: 800,
                lineHeight: 0.9,
                color: isTopScorer && myGoals > 0 ? PALETTE.red : PALETTE.ink,
                letterSpacing: '-0.04em',
              }}
            >
              {myGoals}
            </div>
            <div
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: PALETTE.inkLight,
                marginTop: -4,
              }}
            >
              Goals tonight
            </div>
          </div>
        </div>

        {/* Top scorer banner */}
        {isTopScorer && myGoals > 0 && (
          <div
            style={{
              background: PALETTE.mustard,
              color: PALETTE.ink,
              padding: 18,
              border: `2px solid ${PALETTE.red}`,
              marginBottom: 28,
            }}
          >
            <div
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                marginBottom: 6,
              }}
            >
              Top scorer · {session.squad.name}
            </div>
            <div
              style={{
                fontFamily: 'Antonio, Impact, sans-serif',
                fontSize: 32,
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '-0.01em',
                lineHeight: 1,
              }}
            >
              You were the night's leading scorer.
            </div>
          </div>
        )}

        {/* Rank line */}
        {!isTopScorer && (
          <div
            style={{
              background: 'rgba(28,58,94,0.08)',
              padding: 14,
              borderLeft: `4px solid ${PALETTE.navy}`,
              marginBottom: 28,
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 13,
              color: PALETTE.ink,
            }}
          >
            #{myRank} of {totalPlayers} scorers · top scorer was{' '}
            <strong>{topScorer?.profile.user.name ?? '—'}</strong> with{' '}
            {topScorer?.goals ?? 0}
          </div>
        )}

        {/* Session totals stat band */}
        <div
          style={{
            background: PALETTE.ink,
            color: PALETTE.cream,
            padding: '14px 18px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            borderLeft: `4px solid ${PALETTE.red}`,
            marginBottom: 36,
          }}
        >
          <span
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 26,
              fontWeight: 700,
            }}
          >
            {totalGoals}
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
            Goals tonight · {session.squad.name}
          </span>
        </div>

        {/* Other scorers */}
        {otherScorers.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <div
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: PALETTE.navy,
                marginBottom: 14,
              }}
            >
              Others on the scoresheet
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {otherScorers.slice(0, 6).map((s) => (
                <div
                  key={s.profileId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: 10,
                    border: '1px solid rgba(0,0,0,0.08)',
                  }}
                >
                  <MiniAvatar
                    kit={s.profile.user.avatarKitColor ?? undefined}
                    accent={s.profile.user.avatarAccentColor ?? undefined}
                    skin={s.profile.user.avatarSkinTone ?? undefined}
                    hair={s.profile.user.avatarHairColor ?? undefined}
                    hairStyle={s.profile.user.avatarHairStyle ?? 'short'}
                    number={s.profile.user.avatarNumber ?? ''}
                    size={44}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: 13,
                        fontWeight: 700,
                      }}
                    >
                      {s.profile.user.name}
                    </div>
                    <div
                      style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: 10,
                        fontWeight: 600,
                        color: PALETTE.inkLight,
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                      }}
                    >
                      {s.profile.user.position ?? '—'}
                    </div>
                  </div>
                  <div
                    style={{
                      background: PALETTE.ink,
                      color: PALETTE.cream,
                      padding: '4px 10px',
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    {s.goals} ⚽
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reciprocity gate — SubmitHub for football. Your card unlocks
            once you've rated the threshold. Empty state = the lever. */}
        <div
          style={{
            background: PALETTE.cream,
            border: `2px solid ${PALETTE.ink}`,
            padding: '18px 20px',
            marginBottom: 16,
            borderLeft: `6px solid ${givenEnough && receivedEnough ? PALETTE.sage : PALETTE.red}`,
          }}
        >
          <div
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.22em',
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
              fontSize: 28,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: '-0.01em',
              textTransform: 'uppercase',
              marginBottom: 6,
            }}
          >
            {givenCount} given · {receivedCount} received
          </div>
          <div
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 12,
              lineHeight: 1.55,
              color: PALETTE.ink,
            }}
          >
            {!givenEnough && receivedCount === 0 && (
              <>
                Rate {RATING_THRESHOLD - givenCount} more lads and your card
                unlocks ratings back. <strong>No free rides.</strong>
              </>
            )}
            {!givenEnough && receivedCount > 0 && (
              <>
                {receivedCount} lad{receivedCount === 1 ? ' has' : 's have'} rated
                you so far. Rate {RATING_THRESHOLD - givenCount} more to see
                what they said.
              </>
            )}
            {givenEnough && !receivedEnough && (
              <>
                You're in — waiting on{' '}
                <strong>{RATING_THRESHOLD - receivedCount} more lads</strong> to
                rate you. The group decides what your numbers say next.
              </>
            )}
            {givenEnough && receivedEnough && (
              <>
                Unlocked. {receivedCount} lads have weighed in. The next
                kickabout reflects what they said.
              </>
            )}
          </div>
        </div>

        {/* CTA — rate teammates */}
        <Link
          href={`/session/${encodeURIComponent(sessionId)}/rate/${encodeURIComponent(playerToken)}`}
          style={{
            background: givenEnough ? 'transparent' : PALETTE.mustard,
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
            marginBottom: 16,
          }}
        >
          {givenEnough
            ? 'Edit your picks →'
            : givenCount === 0
            ? 'Pick your Team of the Night →'
            : `Keep rating · ${RATING_THRESHOLD - givenCount} to go →`}
        </Link>

        <p
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 11,
            lineHeight: 1.6,
            color: PALETTE.inkLight,
            fontStyle: 'italic',
            textAlign: 'center',
            marginTop: 12,
          }}
        >
          Takes 90 seconds. Could be skill, could be vibes. Top picks across
          the night form the XI — and your votes are what unlock yours.
        </p>

        <div
          style={{
            marginTop: 48,
            paddingTop: 24,
            borderTop: '1px solid rgba(58,58,58,0.2)',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: PALETTE.inkLight,
            textAlign: 'center',
          }}
        >
          SPORTWARREN · {session.squad.name}
        </div>
      </div>
    </div>
  );
}
