/**
 * Post-session analysis page — STUB.
 *
 *   /session/<sessionId>/analysis/<playerToken>
 *
 * The full surface (docs/flywheel.md item #2) tells the player's
 * session story: goals → peer ratings → attribute deltas → "where
 * your card moved" → "what to drill next." It's the missing
 * emotional peak in the loop — match just ended, player is hot,
 * show them what happened to their card.
 *
 * This stub holds the URL space so:
 *  - the WhatsApp post-session broadcast template can reference it
 *  - future-us doesn't have to rename routes when shipping the real one
 *
 * Build target: post-Tuesday, after we see what the three test
 * players actually engage with. Real version pulls the session +
 * matches + playerStats + peerRatings + twin diff and renders the
 * V3 chess.com card with an animated before/after.
 */

import React from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { PALETTE } from '../../../../preview/_components/MiniAvatar';

interface PageProps {
  params: Promise<{ sessionId: string; playerToken: string }>;
}

export default async function AnalysisStubPage({ params }: PageProps) {
  const { sessionId, playerToken } = await params;

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    select: { id: true, name: true, date: true, squad: { select: { name: true } } },
  });
  if (!session) notFound();

  const player = await prisma.user.findUnique({
    where: { walletAddress: playerToken },
    select: { name: true, chain: true },
  });
  if (!player) notFound();

  const dateLabel = new Date(session.date).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

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
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
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
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: PALETTE.navy,
            marginBottom: 14,
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
          Your full card<br />analysis lands soon.
        </h1>

        <p
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 13,
            color: PALETTE.inkLight,
            lineHeight: 1.6,
            marginTop: 20,
            marginBottom: 28,
          }}
        >
          {player.name?.split(' ')[0] ?? 'Mate'} — the full story of
          tonight (goals, what the lads said about you, how your card
          shifted, what to drill next) lands after the rebuild. For
          now you've got the recap card.
        </p>

        <div
          style={{
            background: 'rgba(28,58,94,0.06)',
            border: `1px dashed ${PALETTE.navy}`,
            padding: '14px 16px',
            marginBottom: 28,
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 11,
            lineHeight: 1.55,
            color: PALETTE.navy,
          }}
        >
          <strong>Why this is a stub:</strong> we want to see what
          you actually engage with first. Whatever you tap (or don't)
          shapes which version of this we build.
        </div>

        <Link
          href={`/session/recap/${encodeURIComponent(sessionId)}/${encodeURIComponent(playerToken)}`}
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
          Back to your recap →
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
          See your current card →
        </Link>

        <p
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 10,
            lineHeight: 1.6,
            color: PALETTE.inkLight,
            marginTop: 36,
            fontStyle: 'italic',
            textAlign: 'center',
          }}
        >
          Session: {session.name} · {session.squad.name}
        </p>
      </div>
    </div>
  );
}
