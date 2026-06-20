/**
 * Live capture entry point — the screen the captain has open during
 * the kickabout night. Token = captain's walletAddress.
 *
 * States:
 *   - No active session → "Start session" button
 *   - Session running → tap-to-score grid
 *   - Session ended (?done=1 query) → success screen with link to recap
 */

import React from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { PALETTE } from '../../../preview/_components/MiniAvatar';
import { LiveCapture } from './_components/LiveCapture';
import { startSession } from './_actions';

interface PageProps {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ done?: string }>;
}

export default async function LiveSessionPage({ params, searchParams }: PageProps) {
  const { token } = await params;
  const { done } = await searchParams;

  const user = await prisma.user.findUnique({
    where: { walletAddress: token },
    include: {
      squads: { include: { squad: true } },
    },
  });

  if (!user) notFound();

  const captainMembership = user.squads.find((m) => m.role === 'captain') ?? user.squads[0];
  if (!captainMembership) notFound();

  const squad = captainMembership.squad;

  // Find active session
  const activeSession = await prisma.session.findFirst({
    where: { squadId: squad.id, status: { in: ['open', 'balanced'] } },
    include: {
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
    orderBy: { createdAt: 'desc' },
  });

  if (done === '1' && !activeSession) {
    // Just finalized — find the most recent completed session
    const last = await prisma.session.findFirst({
      where: { squadId: squad.id, status: 'completed' },
      orderBy: { date: 'desc' },
    });
    return <DoneScreen token={token} squadName={squad.name} sessionId={last?.id ?? null} />;
  }

  if (!activeSession) {
    return <StartScreen token={token} squadName={squad.name} />;
  }

  const match = activeSession.matches[0];
  if (!match) return <StartScreen token={token} squadName={squad.name} />;

  const players = match.playerStats.map((ps) => ({
    profileId: ps.profileId,
    userId: ps.profile.user.id,
    name: ps.profile.user.name ?? 'Player',
    position: ps.profile.user.position,
    goals: ps.goals,
    avatar: {
      kit: ps.profile.user.avatarKitColor ?? undefined,
      accent: ps.profile.user.avatarAccentColor ?? undefined,
      skin: ps.profile.user.avatarSkinTone ?? undefined,
      hair: ps.profile.user.avatarHairColor ?? undefined,
      hairStyle: ps.profile.user.avatarHairStyle ?? 'short',
      number: ps.profile.user.avatarNumber ?? '',
    },
  }));

  return (
    <LiveCapture
      token={token}
      sessionId={activeSession.id}
      matchId={match.id}
      players={players}
    />
  );
}

async function startAction(token: string) {
  'use server';
  await startSession(token);
}

function StartScreen({ token, squadName }: { token: string; squadName: string }) {
  const boundStart = startAction.bind(null, token);
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
      <div style={{ maxWidth: 540, margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: 4, marginBottom: 28 }}>
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
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: PALETTE.navy,
            marginBottom: 12,
          }}
        >
          Captain mode · {squadName}
        </div>

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
          Ready when you are.
        </h1>

        <p
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 14,
            lineHeight: 1.6,
            color: PALETTE.inkLight,
            marginTop: 20,
            marginBottom: 36,
          }}
        >
          Hit start when the first game kicks off. From there, you've got
          one screen — tap a player to add a goal. Long-press to undo.
          No timers, no team management, no fuss. End the session when
          you're packing up and everyone gets a recap card.
        </p>

        <form action={boundStart}>
          <button
            type="submit"
            style={{
              background: PALETTE.mustard,
              color: PALETTE.ink,
              padding: '20px',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              border: `2px solid ${PALETTE.red}`,
              width: '100%',
              cursor: 'pointer',
            }}
          >
            Start the session →
          </button>
        </form>
      </div>
    </div>
  );
}

function DoneScreen({
  token,
  squadName,
  sessionId,
}: {
  token: string;
  squadName: string;
  sessionId: string | null;
}) {
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
      <div style={{ maxWidth: 540, margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: 4, marginBottom: 28 }}>
          <div style={{ width: 28, height: 4, background: PALETTE.sage }} />
          <div style={{ width: 28, height: 4, background: PALETTE.mustard }} />
          <div style={{ width: 28, height: 4, background: PALETTE.sage }} />
        </div>

        <h1
          style={{
            fontFamily: 'Antonio, Impact, sans-serif',
            fontSize: 72,
            fontWeight: 800,
            lineHeight: 0.95,
            margin: 0,
            letterSpacing: '-0.02em',
            textTransform: 'uppercase',
            color: PALETTE.sage,
          }}
        >
          Session done.
        </h1>

        <p
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 14,
            lineHeight: 1.6,
            color: PALETTE.inkLight,
            marginTop: 20,
            marginBottom: 36,
          }}
        >
          Twins updated. Recap cards generated. Time to fire the
          post-session WhatsApp blast — run the broadcast script to get
          per-player messages with their personal recap link.
        </p>

        {sessionId && (
          <Link
            href={`/session/broadcast/${encodeURIComponent(sessionId)}/${encodeURIComponent(token)}`}
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
              marginBottom: 16,
            }}
          >
            Open the WA broadcast →
          </Link>
        )}

        <Link
          href={`/session/live/${encodeURIComponent(token)}`}
          style={{
            background: 'transparent',
            color: PALETTE.ink,
            padding: '14px 18px',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            border: `2px solid ${PALETTE.ink}`,
            textDecoration: 'none',
            display: 'block',
            textAlign: 'center',
          }}
        >
          Start a new session
        </Link>
      </div>
    </div>
  );
}
