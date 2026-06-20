/**
 * Spectator scoreboard — what non-captain players see during the
 * session. Lives at /session/watch/[squadShortName] so it's
 * memorable enough to share to the WA group as a single short link.
 *
 * No auth, no token. Anyone in the group can open it. Shows:
 *   - Live total goals tonight
 *   - Last scorer (with their avatar)
 *   - Ranked leaderboard
 *   - "Session running" pulse if active, "ended N min ago" if done
 *
 * Polls every 5s via a meta-refresh fallback + client polling. Kept
 * simple — no SSE/websocket. 12 phones polling is nothing.
 */

import React from 'react';
import { notFound } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import { MiniAvatar, PALETTE } from '../../../preview/_components/MiniAvatar';

const prisma = new PrismaClient();

// Force this page to be rendered fresh on every request — no SSG/ISR
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: Promise<{ squadShortName: string }>;
}

export default async function WatchPage({ params }: PageProps) {
  const { squadShortName } = await params;

  const squad = await prisma.squad.findFirst({
    where: {
      OR: [
        { shortName: squadShortName.toUpperCase() },
        { shortName: squadShortName },
      ],
    },
  });

  if (!squad) notFound();

  // Find the most recent session — active OR recently completed
  const session = await prisma.session.findFirst({
    where: { squadId: squad.id },
    orderBy: { createdAt: 'desc' },
    include: {
      matches: {
        include: {
          playerStats: {
            include: {
              profile: { include: { user: true } },
            },
            orderBy: { goals: 'desc' },
          },
        },
      },
    },
  });

  if (!session) {
    return <NoActiveSession squadName={squad.name} />;
  }

  const match = session.matches[0];
  const allStats = match?.playerStats ?? [];
  const totalGoals = allStats.reduce((s, st) => s + st.goals, 0);
  const isLive = session.status === 'open' || session.status === 'balanced';

  // Top scorer right now
  const sorted = [...allStats].sort((a, b) => b.goals - a.goals);
  const topScorer = sorted[0];

  // Last scorer — we don't track timestamps per goal, so we surface
  // whoever currently has the highest goal count as a proxy. Once we
  // add a Goal row with timestamps, this becomes the real last-scorer.
  const lastScorer = topScorer?.goals && topScorer.goals > 0 ? topScorer : null;

  const refreshSeconds = isLive ? 5 : 30;

  return (
    <div
      style={{
        minHeight: '100vh',
        background: PALETTE.cream,
        padding: '32px 20px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: PALETTE.ink,
      }}
    >
      <meta httpEquiv="refresh" content={String(refreshSeconds)} />

      <div style={{ maxWidth: 540, margin: '0 auto' }}>
        {/* Live ribbon */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24 }}>
          <div style={{ width: 28, height: 4, background: PALETTE.mustard }} />
          <div
            style={{
              width: 28,
              height: 4,
              background: isLive ? PALETTE.red : PALETTE.inkLight,
              animation: isLive ? 'livePulse 1.4s ease-in-out infinite' : undefined,
            }}
          />
          <div style={{ width: 28, height: 4, background: PALETTE.navy }} />
          <div style={{ width: 28, height: 4, background: PALETTE.sage }} />
        </div>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          {isLive && (
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                background: PALETTE.red,
                animation: 'livePulse 1.4s ease-in-out infinite',
              }}
            />
          )}
          <div
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: isLive ? PALETTE.red : PALETTE.inkLight,
            }}
          >
            {isLive ? 'Live · session running' : `Final · ${formatRelative(session.updatedAt)}`}
          </div>
        </div>

        <div
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: PALETTE.navy,
            marginBottom: 12,
          }}
        >
          {squad.name} · {formatDate(session.date)}
        </div>

        {/* Total goals hero */}
        <div
          style={{
            fontFamily: 'Antonio, Impact, sans-serif',
            fontSize: 144,
            fontWeight: 800,
            color: PALETTE.ink,
            letterSpacing: '-0.05em',
            lineHeight: 0.85,
            marginBottom: 4,
          }}
        >
          {totalGoals}
        </div>

        <div
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: PALETTE.inkLight,
            marginBottom: 32,
          }}
        >
          Goals tonight
        </div>

        {/* Last scorer card */}
        {lastScorer && (
          <div
            style={{
              background: PALETTE.cream,
              border: `2px solid ${PALETTE.ink}`,
              padding: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              marginBottom: 28,
              borderLeft: `6px solid ${PALETTE.mustard}`,
            }}
          >
            <MiniAvatar
              kit={lastScorer.profile.user.avatarKitColor ?? undefined}
              accent={lastScorer.profile.user.avatarAccentColor ?? undefined}
              skin={lastScorer.profile.user.avatarSkinTone ?? undefined}
              hair={lastScorer.profile.user.avatarHairColor ?? undefined}
              hairStyle={lastScorer.profile.user.avatarHairStyle ?? 'short'}
              number={lastScorer.profile.user.avatarNumber ?? ''}
              size={64}
            />
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: PALETTE.inkLight,
                }}
              >
                Top scorer
              </div>
              <div
                style={{
                  fontFamily: 'Antonio, Impact, sans-serif',
                  fontSize: 32,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '-0.01em',
                  marginTop: 2,
                }}
              >
                {lastScorer.profile.user.name}
              </div>
            </div>
            <div
              style={{
                background: PALETTE.ink,
                color: PALETTE.cream,
                padding: '10px 14px',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 22,
                fontWeight: 700,
              }}
            >
              {lastScorer.goals}
            </div>
          </div>
        )}

        {/* Leaderboard */}
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
          Leaderboard
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {sorted.length === 0 && (
            <div
              style={{
                padding: 24,
                textAlign: 'center',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 12,
                color: PALETTE.inkLight,
                border: `1px dashed ${PALETTE.inkLight}`,
              }}
            >
              No goals yet. Be patient.
            </div>
          )}
          {sorted.map((s, i) => {
            const isScorer = s.goals > 0;
            return (
              <div
                key={s.profileId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: 10,
                  border: '1px solid rgba(0,0,0,0.08)',
                  background: i === 0 && isScorer ? 'rgba(212,164,55,0.12)' : 'transparent',
                  opacity: isScorer ? 1 : 0.5,
                }}
              >
                <div
                  style={{
                    width: 28,
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 13,
                    fontWeight: 700,
                    color: PALETTE.inkLight,
                  }}
                >
                  {i + 1}.
                </div>
                <MiniAvatar
                  kit={s.profile.user.avatarKitColor ?? undefined}
                  accent={s.profile.user.avatarAccentColor ?? undefined}
                  skin={s.profile.user.avatarSkinTone ?? undefined}
                  hair={s.profile.user.avatarHairColor ?? undefined}
                  hairStyle={s.profile.user.avatarHairStyle ?? 'short'}
                  number={s.profile.user.avatarNumber ?? ''}
                  size={40}
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
                </div>
                {s.goals > 0 && (
                  <div
                    style={{
                      background: PALETTE.ink,
                      color: PALETTE.cream,
                      padding: '4px 10px',
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    {s.goals} ⚽
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: 36,
            paddingTop: 18,
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
          SPORTWARREN · refresh every {refreshSeconds}s
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes livePulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.3; }
            }
          `,
        }}
      />
    </div>
  );
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatRelative(d: Date): string {
  const mins = Math.floor((Date.now() - d.getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return formatDate(d);
}

function NoActiveSession({ squadName }: { squadName: string }) {
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
      <div style={{ maxWidth: 540, margin: '0 auto', textAlign: 'center', paddingTop: 80 }}>
        <h1
          style={{
            fontFamily: 'Antonio, Impact, sans-serif',
            fontSize: 56,
            fontWeight: 800,
            margin: 0,
            marginBottom: 20,
            textTransform: 'uppercase',
          }}
        >
          Nothing on yet
        </h1>
        <p
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 14,
            color: PALETTE.inkLight,
            lineHeight: 1.6,
          }}
        >
          {squadName} hasn't started a session. Check back when the
          captain's at the pitch.
        </p>
      </div>
    </div>
  );
}
