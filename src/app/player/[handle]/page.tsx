/**
 * Public player page — `/player/{handle}`.
 *
 * Respects User.discoverable. The handle is the slug — a player sets it
 * in Settings → Privacy, and it's URL-friendly (lowercase, no spaces).
 *
 * Privacy model:
 *   - discoverable=false → 404 (the player has not opted in)
 *   - discoverable=true  → public chess.com card surface + groups they're
 *     in (but only the groups that are themselves public or group_only)
 *
 * V3 Risograph register throughout. Uses the shared V3PlayerCard.
 */

import React from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { PALETTE } from '@/app/preview/_components/MiniAvatar';
import {
  V3PlayerCard,
  buildPlayerCardData,
  type Attrs,
} from '@/components/identity/V3PlayerCard';
import {
  baselineForPosition,
  computeOverall,
} from '@/server/services/personalization/position-baselines';

interface PageProps {
  params: Promise<{ handle: string }>;
}

export default async function PublicPlayerPage({ params }: PageProps) {
  const { handle } = await params;

  const user = await prisma.user.findUnique({
    where: { handle: handle.toLowerCase() },
    include: {
      playerProfile: { include: { twin: true } },
      squads: { include: { squad: true } },
    },
  });

  if (!user || !user.discoverable) notFound();

  const twin = user.playerProfile?.twin;
  const attrs: Attrs = twin
    ? ((twin.baseAttributes as Attrs | null) ?? baselineForPosition(user.position))
    : baselineForPosition(user.position);
  const level = twin?.level ?? 1;
  const overall = computeOverall(attrs, user.position, level, twin?.prestige ?? 0);

  const cardData = buildPlayerCardData({
    user,
    attrs,
    level,
    overall,
  });

  // Surface only squads that are themselves visible. A discoverable
  // player in a private squad shows their card but not the squad name.
  const visibleSquads = user.squads.filter((m) => m.squad.visibility !== 'private');

  return (
    <div
      style={{
        minHeight: '100vh',
        background: PALETTE.cream,
        padding: '40px 20px 80px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: PALETTE.ink,
      }}
    >
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        {/* Ribbon */}
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
          SportWarren · @{user.handle}
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
          {user.name}
        </h1>

        <p
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 14,
            color: PALETTE.inkLight,
            lineHeight: 1.55,
            marginTop: 18,
            marginBottom: 28,
            maxWidth: 480,
          }}
        >
          {user.position ?? 'Position not set'} · L{level}
          {visibleSquads.length > 0
            ? ` · plays for ${visibleSquads.map((m) => m.squad.name).join(', ')}`
            : ''}
        </p>

        {/* The card */}
        <V3PlayerCard data={cardData} variant="full" />

        {/* Squad links */}
        {visibleSquads.length > 0 && (
          <div style={{ marginTop: 32 }}>
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
              Their squads
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {visibleSquads.map((m) => (
                <Link
                  key={m.id}
                  href={`/squad/${encodeURIComponent(m.squad.shortName)}`}
                  style={{
                    padding: '12px 14px',
                    border: `1px solid ${PALETTE.ink}`,
                    background: PALETTE.cream,
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 13,
                    fontWeight: 700,
                    color: PALETTE.ink,
                    textDecoration: 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span>{m.squad.name}</span>
                  <span
                    style={{
                      fontSize: 9,
                      letterSpacing: '0.18em',
                      textTransform: 'uppercase',
                      color: PALETTE.inkLight,
                    }}
                  >
                    {m.role} · {m.squad.visibility}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        <Link
          href="/"
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: PALETTE.inkLight,
            textDecoration: 'none',
            textAlign: 'center',
            display: 'block',
            marginTop: 36,
          }}
        >
          ← SportWarren
        </Link>
      </div>
    </div>
  );
}
