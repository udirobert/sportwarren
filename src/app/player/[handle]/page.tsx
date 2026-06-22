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
import type { Metadata } from 'next';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import {
  PALETTE,
  TYPE,
  TRACKING,
  V3PageShell,
  V3Ribbon,
  V3IdentityLine,
  V3Heading,
  V3SectionLabel,
  V3PlayerCard,
  buildPlayerCardData,
  type Attrs,
} from '@/components/v3';
import {
  baselineForPosition,
  computeOverall,
} from '@/server/services/personalization/position-baselines';

interface PageProps {
  params: Promise<{ handle: string }>;
}

/**
 * Set `og:image` to the player's satori card PNG so WhatsApp / iMessage
 * / X / Instagram unfurls this URL with a rich image preview. Tapping
 * the unfurled card lands on this page (the public profile), not the
 * raw PNG endpoint — which is the structurally correct viral loop.
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { handle } = await params;
  const user = await prisma.user.findUnique({
    where: { handle: handle.toLowerCase() },
    select: { name: true, walletAddress: true, discoverable: true, position: true },
  });
  if (!user || !user.discoverable) {
    return { title: 'SportWarren' };
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://sportwarren.com';
  const cardImageUrl = `${baseUrl}/api/og/card/${encodeURIComponent(user.walletAddress)}`;
  const title = `${user.name ?? handle} · SportWarren`;
  const description = user.position
    ? `${user.position} on SportWarren. Rate the lads back, build your own card.`
    : 'See this player\'s SportWarren card. Rate the lads back, build your own card.';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: cardImageUrl, width: 1080, height: 1350, alt: title }],
      type: 'profile',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [cardImageUrl],
    },
  };
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
    <V3PageShell>
      <V3Ribbon marginBottom={24} />
      <V3IdentityLine context={`@${user.handle}`} showDot={false} />

      <V3Heading>{user.name}</V3Heading>

      <p
        style={{
          fontFamily: TYPE.mono,
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

      <V3PlayerCard data={cardData} variant="full" />

      {visibleSquads.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <V3SectionLabel>Their squads</V3SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {visibleSquads.map((m) => (
              <Link
                key={m.id}
                href={`/squad/${encodeURIComponent(m.squad.shortName)}`}
                style={{
                  padding: '12px 14px',
                  border: `1px solid ${PALETTE.ink}`,
                  background: PALETTE.cream,
                  fontFamily: TYPE.mono,
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
                    letterSpacing: TRACKING.cap,
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
          fontFamily: TYPE.mono,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: TRACKING.cap,
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
    </V3PageShell>
  );
}
