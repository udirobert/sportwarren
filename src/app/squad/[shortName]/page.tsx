/**
 * Public squad page — `/squad/{shortName}`.
 *
 * Respects Squad.visibility:
 *   - "private"    → 404 (only members see anything, and they go via the app)
 *   - "group_only" → renders roster + aggregate stats; per-player cards hidden
 *   - "public"     → renders roster + per-player V3 cards (compact variant)
 *
 * V3 Risograph register throughout. Single source of truth for the
 * card component is `src/components/identity/V3PlayerCard.tsx`.
 *
 * This page is OUTSIDE `(app)` route group deliberately — it's a public
 * surface, no wallet/auth required. Discovery URL for sharing.
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
import { ATTRIBUTE_KEYS, type AttributeKey } from '@/server/services/personalization/twin-types';

interface PageProps {
  params: Promise<{ shortName: string }>;
}

export default async function PublicSquadPage({ params }: PageProps) {
  const { shortName } = await params;

  const squad = await prisma.squad.findFirst({
    where: {
      OR: [
        { shortName: shortName.toUpperCase() },
        { shortName },
      ],
    },
    include: {
      members: {
        include: {
          user: {
            include: { playerProfile: { include: { twin: true } } },
          },
        },
        orderBy: { user: { name: 'asc' } },
      },
    },
  });

  // Private squads simply don't exist publicly.
  if (!squad || squad.visibility === 'private') notFound();

  const captain = squad.members.find((m) => m.role === 'captain') ?? squad.members[0];
  const visibility = squad.visibility as 'group_only' | 'public';
  const showIndividualCards = visibility === 'public';

  // Compute aggregate squad stats — group avg by attribute, group avg
  // Overall. These are always-visible even at group_only.
  const groupByAttr: Record<AttributeKey, number[]> = {
    pace: [], shooting: [], passing: [], dribbling: [], defending: [], physical: [],
  };
  let groupOverallSum = 0;
  let twinCount = 0;
  for (const m of squad.members) {
    const twin = m.user.playerProfile?.twin;
    if (!twin) continue;
    const attrs = (twin.baseAttributes as Attrs | null) ?? baselineForPosition(m.user.position);
    twinCount++;
    groupOverallSum += computeOverall(attrs, m.user.position, twin.level, twin.prestige);
    for (const k of ATTRIBUTE_KEYS) {
      if (typeof attrs[k] === 'number') groupByAttr[k].push(attrs[k]);
    }
  }
  const groupAvgOverall = twinCount > 0 ? Math.round(groupOverallSum / twinCount) : null;
  const groupAvgByAttr: Partial<Record<AttributeKey, number>> = {};
  for (const k of ATTRIBUTE_KEYS) {
    if (groupByAttr[k].length > 0) {
      groupAvgByAttr[k] = Math.round(groupByAttr[k].reduce((s, v) => s + v, 0) / groupByAttr[k].length);
    }
  }

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
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        {/* Ribbon */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24 }}>
          <div style={{ width: 28, height: 4, background: PALETTE.mustard }} />
          <div style={{ width: 28, height: 4, background: PALETTE.red }} />
          <div style={{ width: 28, height: 4, background: PALETTE.navy }} />
          <div style={{ width: 28, height: 4, background: PALETTE.sage }} />
        </div>

        {/* Identity line */}
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
          SportWarren · {squad.shortName}
        </div>

        {/* Headline */}
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
          {squad.name}
        </h1>

        <p
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 14,
            color: PALETTE.inkLight,
            lineHeight: 1.55,
            marginTop: 18,
            marginBottom: 28,
            maxWidth: 520,
          }}
        >
          {squad.members.length} member{squad.members.length === 1 ? '' : 's'}
          {captain?.user.name ? ` · led by ${captain.user.name}` : ''}.
          {visibility === 'group_only'
            ? ' Group roster public, individual cards hidden by the captain.'
            : ' Public squad — individual cards visible.'}
        </p>

        {/* Squad-level aggregate */}
        {groupAvgOverall !== null && (
          <div
            style={{
              background: PALETTE.ink,
              color: PALETTE.cream,
              padding: '20px 22px',
              marginBottom: 28,
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
                Squad Overall · avg of {twinCount}
              </div>
              <div
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 11,
                  color: PALETTE.cream,
                  opacity: 0.8,
                  maxWidth: 320,
                }}
              >
                Aggregate strength — moves as the squad plays + lads rate
                each other.
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
              {groupAvgOverall}
            </div>
          </div>
        )}

        {/* Roster */}
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
          Roster
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 32 }}>
          {squad.members.map((m) => {
            const twin = m.user.playerProfile?.twin;
            const attrs = twin
              ? ((twin.baseAttributes as Attrs | null) ?? baselineForPosition(m.user.position))
              : baselineForPosition(m.user.position);
            const overall = computeOverall(attrs, m.user.position, twin?.level ?? 1, twin?.prestige ?? 0);
            const data = buildPlayerCardData({
              user: m.user,
              attrs,
              level: twin?.level ?? 1,
              overall,
            });

            // Discoverable players get linked to their public profile; others
            // render as compact-card-only (no link, no chess.com expansion).
            const playerLink = m.user.discoverable && m.user.handle
              ? `/player/${encodeURIComponent(m.user.handle)}`
              : null;

            const card = (
              <V3PlayerCard
                data={data}
                variant={showIndividualCards ? 'compact' : 'compact'}
              />
            );

            return showIndividualCards && playerLink ? (
              <Link
                key={m.id}
                href={playerLink}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                {card}
              </Link>
            ) : (
              <div key={m.id}>{card}</div>
            );
          })}
        </div>

        {/* Trust footer */}
        <div
          style={{
            background: 'rgba(0,0,0,0.04)',
            border: `1px solid ${PALETTE.inkLight}`,
            padding: '14px 16px',
            marginBottom: 24,
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 11,
            lineHeight: 1.55,
            color: PALETTE.inkLight,
          }}
        >
          <strong>Privacy:</strong> this page exists because the captain
          set this squad to <em>{visibility === 'public' ? 'public' : 'group-only'}</em>.
          {visibility === 'group_only' && ' Individual cards are hidden.'}
          {' Player-level discoverability is opt-in per player.'}
        </div>

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
          }}
        >
          ← SportWarren
        </Link>
      </div>
    </div>
  );
}
