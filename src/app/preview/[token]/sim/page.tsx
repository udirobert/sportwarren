/**
 * Preview sim — generates a quick simulated match between the player
 * and 5 random teammates vs 6 random opponents from the group. Uses
 * the squad's pre-seeded twin attributes to weight the result.
 *
 * Non-persistent — each page load runs a fresh sim. This is the
 * "playable demo" surface, not a tournament. If the player wants to
 * persist, they wait for Tuesday's real game.
 */

import React from 'react';
import { notFound } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import Link from 'next/link';
import { MiniAvatar, PALETTE } from '../../_components/MiniAvatar';

const prisma = new PrismaClient();

interface PageProps {
  params: Promise<{ token: string }>;
}

type Attrs = { PAC: number; SHO: number; PAS: number; DRI: number; DEF: number; PHY: number };

interface PlayerData {
  userId: string;
  name: string;
  position: string | null;
  avatar: {
    kit?: string;
    accent?: string;
    skin?: string;
    hair?: string;
    hairStyle?: string;
    number?: string;
  };
  attrs: Attrs;
}

function defaultAttrs(): Attrs {
  return { PAC: 55, SHO: 50, PAS: 55, DRI: 55, DEF: 55, PHY: 55 };
}

function poisson(rate: number): number {
  // Simple Knuth-style Poisson
  const L = Math.exp(-rate);
  let k = 0;
  let p = 1;
  do {
    k++;
    p *= Math.random();
  } while (p > L);
  return k - 1;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function distributeGoals(team: PlayerData[], totalGoals: number): Map<string, number> {
  const result = new Map<string, number>();
  if (totalGoals <= 0) return result;
  // Weight scoring chance by SHO + DRI
  const weights = team.map((p) => p.attrs.SHO + p.attrs.DRI * 0.6);
  const totalWeight = weights.reduce((s, w) => s + w, 0);
  for (let i = 0; i < totalGoals; i++) {
    let r = Math.random() * totalWeight;
    for (let j = 0; j < team.length; j++) {
      r -= weights[j];
      if (r <= 0) {
        result.set(team[j].userId, (result.get(team[j].userId) ?? 0) + 1);
        break;
      }
    }
  }
  return result;
}

function teamRate(team: PlayerData[]): number {
  return team.reduce((s, p) => s + p.attrs.SHO + p.attrs.PAS * 0.5, 0);
}

export default async function SimPage({ params }: PageProps) {
  const { token } = await params;

  const user = await prisma.user.findUnique({
    where: { walletAddress: token },
    include: {
      playerProfile: {
        include: {
          twin: true,
        },
      },
      squads: { include: { squad: true } },
    },
  });

  if (!user || user.chain !== 'preview') notFound();

  const squad = user.squads[0]?.squad;
  if (!squad) notFound();

  // Pull all members of the group
  const allMembers = await prisma.squadMember.findMany({
    where: { squadId: squad.id },
    include: {
      user: {
        include: {
          playerProfile: {
            include: { twin: true },
          },
        },
      },
    },
  });

  // Build PlayerData for each member
  const players: PlayerData[] = allMembers.map((m) => {
    const baseAttrs = m.user.playerProfile?.twin?.baseAttributes as Attrs | undefined;
    return {
      userId: m.userId,
      name: m.user.name ?? 'Player',
      position: m.user.position,
      avatar: {
        kit: m.user.avatarKitColor ?? undefined,
        accent: m.user.avatarAccentColor ?? undefined,
        skin: m.user.avatarSkinTone ?? undefined,
        hair: m.user.avatarHairColor ?? undefined,
        hairStyle: m.user.avatarHairStyle ?? 'short',
        number: m.user.avatarNumber ?? '',
      },
      attrs: baseAttrs && typeof baseAttrs.SHO === 'number' ? baseAttrs : defaultAttrs(),
    };
  });

  const me = players.find((p) => p.userId === user.id);
  const others = players.filter((p) => p.userId !== user.id);

  if (!me || others.length < 5) {
    // Not enough opponents — graceful fall-through
    return (
      <NotEnoughOpponents token={token} count={others.length} />
    );
  }

  const shuffled = shuffle(others);
  // Take up to 5 teammates + 5/6 opponents based on availability
  const teammates = shuffled.slice(0, Math.min(5, Math.floor(shuffled.length / 2)));
  const opponents = shuffled.slice(teammates.length, teammates.length + Math.min(6, shuffled.length - teammates.length));

  const myTeam = [me, ...teammates];

  const myRate = teamRate(myTeam);
  const oppRate = teamRate(opponents);
  const expectedTotal = 5.5; // average kickabout-game total goals
  const myGoalRate = (myRate / (myRate + oppRate)) * expectedTotal;
  const oppGoalRate = expectedTotal - myGoalRate;

  const myGoals = poisson(myGoalRate);
  const oppGoals = poisson(oppGoalRate);

  const myScorers = distributeGoals(myTeam, myGoals);
  const oppScorers = distributeGoals(opponents, oppGoals);

  const result = myGoals > oppGoals ? 'win' : oppGoals > myGoals ? 'loss' : 'draw';
  const myGoalsScored = myScorers.get(me.userId) ?? 0;

  const accentColor =
    result === 'win' ? PALETTE.sage : result === 'loss' ? PALETTE.red : PALETTE.navy;
  const resultLabel = result === 'win' ? 'WIN' : result === 'loss' ? 'LOSS' : 'DRAW';

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
          <div style={{ width: 28, height: 4, background: accentColor }} />
          <div style={{ width: 28, height: 4, background: PALETTE.navy }} />
          <div style={{ width: 28, height: 4, background: PALETTE.sage }} />
        </div>

        <Link
          href={`/preview/${encodeURIComponent(token)}`}
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: PALETTE.inkLight,
            textDecoration: 'none',
            marginBottom: 28,
            display: 'inline-block',
          }}
        >
          ← Back
        </Link>

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
          Simulated · {myTeam.length}v{opponents.length} · {squad.name}
        </div>

        <h1
          style={{
            fontFamily: 'Antonio, Impact, sans-serif',
            fontSize: 96,
            fontWeight: 800,
            lineHeight: 0.95,
            margin: 0,
            letterSpacing: '-0.03em',
            color: accentColor,
            textTransform: 'uppercase',
          }}
        >
          {resultLabel}
        </h1>

        <div
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 64,
            fontWeight: 700,
            letterSpacing: '-0.04em',
            color: PALETTE.ink,
            marginTop: 16,
            marginBottom: 36,
          }}
        >
          {myGoals} — {oppGoals}
        </div>

        {/* Your stat band */}
        <div
          style={{
            background: PALETTE.ink,
            color: PALETTE.cream,
            padding: '14px 18px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            borderLeft: `4px solid ${accentColor}`,
            marginBottom: 36,
          }}
        >
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 28, fontWeight: 700 }}>
            {myGoalsScored}
          </span>
          <span
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              opacity: 0.85,
              textAlign: 'right',
            }}
          >
            Your goals · {me.position ?? 'unset'}
          </span>
        </div>

        {/* Team sheets */}
        <TeamSheet
          label={`Your team · ${myGoals} goals`}
          team={myTeam}
          scorers={myScorers}
          highlight={me.userId}
          accent={result === 'win' ? PALETTE.sage : PALETTE.inkLight}
        />

        <TeamSheet
          label={`Opponents · ${oppGoals} goals`}
          team={opponents}
          scorers={oppScorers}
          accent={result === 'loss' ? PALETTE.red : PALETTE.inkLight}
        />

        {/* CTAs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 40 }}>
          <Link
            href={`/preview/${encodeURIComponent(token)}/sim?r=${Date.now()}`}
            prefetch={false}
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
            }}
          >
            Sim another →
          </Link>

          <Link
            href={`/preview/${encodeURIComponent(token)}`}
            style={{
              background: 'transparent',
              color: PALETTE.ink,
              padding: '16px 20px',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              textAlign: 'center',
              border: `2px solid ${PALETTE.navy}`,
              textDecoration: 'none',
              display: 'block',
            }}
          >
            Back to your twin
          </Link>
        </div>

        <p
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 11,
            lineHeight: 1.6,
            color: PALETTE.inkLight,
            marginTop: 36,
            fontStyle: 'italic',
          }}
        >
          This was a simulation — none of it counts toward your record.
          The real one's Tuesday. See you there.
        </p>
      </div>
    </div>
  );
}

function TeamSheet({
  label,
  team,
  scorers,
  accent,
  highlight,
}: {
  label: string;
  team: PlayerData[];
  scorers: Map<string, number>;
  accent: string;
  highlight?: string;
}) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div
        style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: accent,
          marginBottom: 14,
        }}
      >
        {label}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {team.map((p) => {
          const goals = scorers.get(p.userId) ?? 0;
          const isMe = p.userId === highlight;
          return (
            <div
              key={p.userId}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: 10,
                background: isMe ? 'rgba(212,164,55,0.18)' : 'transparent',
                border: isMe ? `1.5px solid ${PALETTE.mustard}` : '1px solid rgba(0,0,0,0.08)',
                borderRadius: 6,
              }}
            >
              <MiniAvatar
                kit={p.avatar.kit}
                accent={p.avatar.accent}
                skin={p.avatar.skin}
                hair={p.avatar.hair}
                hairStyle={p.avatar.hairStyle}
                number={p.avatar.number}
                size={44}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 13,
                    fontWeight: 700,
                    color: PALETTE.ink,
                  }}
                >
                  {p.name}
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
                  {p.position ?? '—'}
                </div>
              </div>
              {goals > 0 && (
                <div
                  style={{
                    background: PALETTE.ink,
                    color: PALETTE.cream,
                    padding: '4px 10px',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                  }}
                >
                  {goals} ⚽
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function NotEnoughOpponents({ token, count }: { token: string; count: number }) {
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
      <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center', paddingTop: 80 }}>
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
          Need more lads
        </h1>
        <p
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 14,
            color: PALETTE.inkLight,
            lineHeight: 1.6,
            marginBottom: 32,
          }}
        >
          Only {count} other players in your group right now. Sim needs at
          least 5 so we can build a proper team for you. Once the captain
          seeds the full roster, this will work.
        </p>
        <Link
          href={`/preview/${encodeURIComponent(token)}`}
          style={{
            background: 'transparent',
            color: PALETTE.ink,
            padding: '16px 20px',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            border: `2px solid ${PALETTE.navy}`,
            textDecoration: 'none',
            display: 'inline-block',
          }}
        >
          ← Back to your twin
        </Link>
      </div>
    </div>
  );
}
