/**
 * Bibs Optimizer surface — captain's pre-match team allocation.
 *
 *   /session/live/<token>/teams?format=7&confirmed=<userId>,<userId>,...
 *
 * Captain opens this on the night when signups close. They:
 *   1. Tap the format buttons (5/6/7/8-a-side) to set players-per-side
 *   2. Tick the lads who actually showed (default: all squad members)
 *   3. Tap "Suggest teams" → balanced split via bibsOptimizer
 *   4. Read the recommendation + the reasoning lines
 *   5. Use it informally to call the bibs on the night
 *
 * No persistence in v1 — the captain reads it and uses it. Tracking
 * which suggestion they accepted (and how often it produced a tight
 * game) is a v2 instrument.
 */

import React from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { PALETTE } from '../../../../preview/_components/MiniAvatar';
import { bibsOptimizer } from '@/server/services/personalization/bibs-optimizer';
import { TeamsForm } from './TeamsForm';

interface PageProps {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ format?: string; confirmed?: string }>;
}

const VALID_FORMATS = [5, 6, 7, 8] as const;

export default async function TeamsPage({ params, searchParams }: PageProps) {
  const { token } = await params;
  const { format: formatRaw, confirmed: confirmedRaw } = await searchParams;

  const user = await prisma.user.findUnique({
    where: { walletAddress: token },
    include: { squads: { include: { squad: true } } },
  });
  if (!user) notFound();

  const captainMembership = user.squads.find((m) => m.role === 'captain') ?? user.squads[0];
  if (!captainMembership) notFound();
  const squad = captainMembership.squad;

  // All squad members the captain can pick from
  const allMembers = await prisma.squadMember.findMany({
    where: { squadId: squad.id },
    include: { user: true },
    orderBy: { user: { name: 'asc' } },
  });

  const playersPerSide = formatRaw && VALID_FORMATS.includes(Number(formatRaw) as 5 | 6 | 7 | 8)
    ? Number(formatRaw)
    : null;

  const confirmedUserIds = confirmedRaw
    ? confirmedRaw.split(',').filter((id) => id.length > 0)
    : allMembers.map((m) => m.userId);

  const result = playersPerSide
    ? await bibsOptimizer({
        prisma,
        squadId: squad.id,
        confirmedUserIds,
        playersPerSide,
      })
    : null;

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
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: 4, marginBottom: 24 }}>
          <div style={{ width: 28, height: 4, background: PALETTE.red }} />
          <div style={{ width: 28, height: 4, background: PALETTE.navy }} />
          <div style={{ width: 28, height: 4, background: PALETTE.sage }} />
          <div style={{ width: 28, height: 4, background: PALETTE.mustard }} />
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
          Bibs Optimizer · {squad.name}
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
          Pick balanced teams.<br />Numbers do the calling.
        </h1>

        <p
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 13,
            color: PALETTE.inkLight,
            lineHeight: 1.6,
            marginTop: 18,
            marginBottom: 32,
            maxWidth: 520,
          }}
        >
          Tick who's actually here, set the format, tap suggest. The
          system snake-drafts by Overall and tightens for balance.
          You override on the night — this is ammunition, not orders.
        </p>

        <TeamsForm
          token={token}
          allMembers={allMembers.map((m) => ({
            userId: m.userId,
            name: m.user.name ?? 'Player',
            position: m.user.position,
          }))}
          initialConfirmedIds={confirmedUserIds}
          initialFormat={playersPerSide}
        />

        {result && result.ok && (
          <div style={{ marginTop: 32 }}>
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
              {result.format.playersPerSide}-a-side · {result.balance.label}
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 14,
                marginBottom: 24,
              }}
            >
              {result.teams.map((team) => {
                const teamColor = team.name === 'Reds' ? PALETTE.red : PALETTE.navy;
                return (
                  <div
                    key={team.name}
                    style={{
                      background: PALETTE.cream,
                      border: `2px solid ${teamColor}`,
                      borderTop: `8px solid ${teamColor}`,
                      padding: 16,
                    }}
                  >
                    <div
                      style={{
                        fontFamily: 'Antonio, Impact, sans-serif',
                        fontSize: 32,
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '-0.01em',
                        color: teamColor,
                        marginBottom: 4,
                      }}
                    >
                      {team.name}
                    </div>
                    <div
                      style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        color: PALETTE.inkLight,
                        marginBottom: 12,
                      }}
                    >
                      Overall {team.aggregateOverall} · avg {Math.round(team.aggregateOverall / Math.max(1, team.players.length))}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {team.players.map((p) => (
                        <div
                          key={p.profileId}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'baseline',
                            gap: 6,
                            paddingBottom: 4,
                            borderBottom: '1px solid rgba(0,0,0,0.06)',
                          }}
                        >
                          <span
                            style={{
                              fontFamily: 'JetBrains Mono, monospace',
                              fontSize: 12,
                              fontWeight: 700,
                            }}
                          >
                            {p.name}
                          </span>
                          <span
                            style={{
                              fontFamily: 'JetBrains Mono, monospace',
                              fontSize: 9,
                              fontWeight: 700,
                              letterSpacing: '0.16em',
                              textTransform: 'uppercase',
                              color: teamColor,
                            }}
                          >
                            {p.suggestedRole} · {p.overall}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {result.bench.length > 0 && (
              <div
                style={{
                  background: 'rgba(0,0,0,0.04)',
                  border: `1px dashed ${PALETTE.inkLight}`,
                  padding: 14,
                  marginBottom: 20,
                }}
              >
                <div
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color: PALETTE.inkLight,
                    marginBottom: 8,
                  }}
                >
                  Bench · rotate via winner-stays-on
                </div>
                <div
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 12,
                    color: PALETTE.ink,
                  }}
                >
                  {result.bench.map((p) => `${p.name} (${p.suggestedRole})`).join(' · ')}
                </div>
              </div>
            )}

            <div
              style={{
                background: PALETTE.ink,
                color: PALETTE.cream,
                padding: 18,
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
                Reasoning
              </div>
              {result.reasoning.map((line, i) => (
                <div
                  key={i}
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 12,
                    lineHeight: 1.55,
                    marginBottom: 4,
                  }}
                >
                  {line}
                </div>
              ))}
            </div>
          </div>
        )}

        {result && !result.ok && (
          <div
            style={{
              background: 'rgba(201,16,34,0.05)',
              border: `2px solid ${PALETTE.red}`,
              padding: 18,
              marginTop: 24,
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 13,
              lineHeight: 1.55,
              color: PALETTE.ink,
            }}
          >
            <div style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.18em', fontSize: 11, marginBottom: 6, color: PALETTE.red }}>
              Can't allocate yet
            </div>
            {result.message}
          </div>
        )}

        <Link
          href={`/session/live/${encodeURIComponent(token)}`}
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
          ← Back to live capture
        </Link>
      </div>
    </div>
  );
}
