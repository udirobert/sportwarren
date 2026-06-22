/**
 * Preview sim — generates a quick simulated match between the player
 * and ~5 random teammates vs ~6 random opponents from the group.
 * Hands off to <SimReveal /> for the staged anticipation + reveal.
 *
 * Sim is computed deterministically per-load (seeded by ?r= query), so
 * the share-image route can recreate the same outcome for a given URL.
 */

import React from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { PALETTE } from '../../_components/MiniAvatar';
import { SimReveal } from './SimReveal';
import { aggregatePerceptionsForPlayers } from '@/server/services/perception/aggregate';
import {
  generateMatchCommentary,
  type CommentaryPlayer,
} from '@/server/services/perception/match-commentary';

interface PageProps {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ r?: string }>;
}

type Attrs = { PAC: number; SHO: number; PAS: number; DRI: number; DEF: number; PHY: number };

function defaultAttrs(): Attrs {
  return { PAC: 55, SHO: 50, PAS: 55, DRI: 55, DEF: 55, PHY: 55 };
}

// Seeded RNG for deterministic sims per ?r= value (so the share PNG matches)
function makeRng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

function poisson(rate: number, rng: () => number): number {
  const L = Math.exp(-rate);
  let k = 0;
  let p = 1;
  do {
    k++;
    p *= rng();
  } while (p > L);
  return k - 1;
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface PlayerData {
  userId: string;
  profileId: string | null;
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

function distributeGoals(
  team: PlayerData[],
  totalGoals: number,
  rng: () => number,
): Array<{ userId: string; goals: number }> {
  if (totalGoals <= 0) return [];
  const map = new Map<string, number>();
  const weights = team.map((p) => p.attrs.SHO + p.attrs.DRI * 0.6);
  const total = weights.reduce((s, w) => s + w, 0);
  for (let i = 0; i < totalGoals; i++) {
    let r = rng() * total;
    for (let j = 0; j < team.length; j++) {
      r -= weights[j];
      if (r <= 0) {
        map.set(team[j].userId, (map.get(team[j].userId) ?? 0) + 1);
        break;
      }
    }
  }
  return Array.from(map.entries()).map(([userId, goals]) => ({ userId, goals }));
}

function teamRate(team: PlayerData[]): number {
  return team.reduce((s, p) => s + p.attrs.SHO + p.attrs.PAS * 0.5, 0);
}

export default async function SimPage({ params, searchParams }: PageProps) {
  const { token } = await params;
  const { r } = await searchParams;
  const seed = parseInt(r ?? String(Date.now() % 100000), 10) || 1;
  const rng = makeRng(seed);

  const user = await prisma.user.findUnique({
    where: { walletAddress: token },
    include: {
      playerProfile: { include: { twin: true } },
      squads: { include: { squad: true } },
    },
  });

  if (!user || user.chain !== 'preview') notFound();

  const squad = user.squads[0]?.squad;
  if (!squad) notFound();

  const allMembers = await prisma.squadMember.findMany({
    where: { squadId: squad.id },
    include: {
      user: {
        include: { playerProfile: { include: { twin: true } } },
      },
    },
  });

  const players: PlayerData[] = allMembers.map((m) => {
    const ba = m.user.playerProfile?.twin?.baseAttributes as Attrs | undefined;
    return {
      userId: m.userId,
      profileId: m.user.playerProfile?.id ?? null,
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
      attrs: ba && typeof ba.SHO === 'number' ? ba : defaultAttrs(),
    };
  });

  const me = players.find((p) => p.userId === user.id);
  const others = players.filter((p) => p.userId !== user.id);
  if (!me || others.length < 5) {
    return <NotEnoughOpponents token={token} count={others.length} />;
  }

  const shuffled = shuffle(others, rng);
  const teammates = shuffled.slice(0, Math.min(5, Math.floor(shuffled.length / 2)));
  const opponents = shuffled.slice(
    teammates.length,
    teammates.length + Math.min(6, shuffled.length - teammates.length),
  );

  const myTeam = [me, ...teammates];
  const myRate = teamRate(myTeam);
  const oppRate = teamRate(opponents);
  const expectedTotal = 5.5;
  const myGoalRate = (myRate / (myRate + oppRate)) * expectedTotal;
  const oppGoalRate = expectedTotal - myGoalRate;

  const myGoals = poisson(myGoalRate, rng);
  const oppGoals = poisson(oppGoalRate, rng);

  const myScorers = distributeGoals(myTeam, myGoals, rng);
  const oppScorers = distributeGoals(opponents, oppGoals, rng);

  // Perception commentary — pulls each on-pitch player's aggregate and
  // weaves a 2-4 beat narrative coloured by what the lads said. Stays
  // deterministic via the same seed so share links reproduce.
  const allOnPitch = [me, ...teammates, ...opponents];
  const profileIds = allOnPitch.map((p) => p.profileId).filter((id): id is string => !!id);
  const perceptionMap = await aggregatePerceptionsForPlayers(profileIds);

  const goalsByUser = new Map<string, number>();
  for (const s of myScorers) goalsByUser.set(s.userId, s.goals);
  for (const s of oppScorers) goalsByUser.set(s.userId, s.goals);

  const commentaryPlayers: CommentaryPlayer[] = allOnPitch
    .filter((p) => p.profileId)
    .map((p) => ({
      profileId: p.profileId!,
      firstName: p.name.split(' ')[0],
      position: p.position,
      onMyTeam: p.userId === me.userId || teammates.some((t) => t.userId === p.userId),
      goals: goalsByUser.get(p.userId) ?? 0,
    }));

  const commentary = generateMatchCommentary({
    players: commentaryPlayers,
    perceptions: perceptionMap,
    myGoals,
    oppGoals,
    seed,
  });

  // Share PNG URL — re-uses the same seed so the image matches
  const shareUrl = `/api/og/sim/${encodeURIComponent(token)}?r=${seed}`;

  return (
    <SimReveal
      token={token}
      squadName={squad.name}
      me={me}
      teammates={teammates}
      opponents={opponents}
      myGoals={myGoals}
      oppGoals={oppGoals}
      myScorers={myScorers}
      oppScorers={oppScorers}
      shareUrl={shareUrl}
      commentary={commentary}
    />
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
          least 5 so we can build a proper team for you.
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
