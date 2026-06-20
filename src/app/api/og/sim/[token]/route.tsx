/**
 * Sim share-PNG endpoint.
 *
 *   GET /api/og/sim/[token]?r=<seed>
 *
 * Recomputes the same sim the preview page rendered (deterministic
 * via the ?r= seed) and outputs a 1080×1080 satori PNG that drops
 * cleanly into WhatsApp / Instagram. Designed as a Panini-sticker
 * style result card in the V3 Risograph register.
 */

import { NextRequest } from 'next/server';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { prisma } from '@/lib/db';
import React from 'react';

type Attrs = { PAC: number; SHO: number; PAS: number; DRI: number; DEF: number; PHY: number };

function defaultAttrs(): Attrs {
  return { PAC: 55, SHO: 50, PAS: 55, DRI: 55, DEF: 55, PHY: 55 };
}

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

interface MiniPlayer {
  userId: string;
  name: string;
  attrs: Attrs;
  avatar: {
    kit?: string;
    accent?: string;
    skin?: string;
    hair?: string;
    hairStyle?: string;
    number?: string;
  };
}

function distributeGoals(team: MiniPlayer[], total: number, rng: () => number) {
  const map = new Map<string, number>();
  if (total <= 0) return map;
  const weights = team.map((p) => p.attrs.SHO + p.attrs.DRI * 0.6);
  const totalW = weights.reduce((s, w) => s + w, 0);
  for (let i = 0; i < total; i++) {
    let r = rng() * totalW;
    for (let j = 0; j < team.length; j++) {
      r -= weights[j];
      if (r <= 0) {
        map.set(team[j].userId, (map.get(team[j].userId) ?? 0) + 1);
        break;
      }
    }
  }
  return map;
}

function teamRate(team: MiniPlayer[]): number {
  return team.reduce((s, p) => s + p.attrs.SHO + p.attrs.PAS * 0.5, 0);
}

// V3 Risograph palette
const PALETTE = {
  cream: '#f0e8d6',
  ink: '#0a0a0a',
  inkLight: '#3a3a3a',
  red: '#c91022',
  navy: '#1c3a5e',
  sage: '#4a7549',
  mustard: '#d4a437',
};

async function loadFont(family: string, weight: number): Promise<ArrayBuffer> {
  const ieUA = 'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0)';
  const cssRes = await fetch(
    `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}`,
    { headers: { 'User-Agent': ieUA } },
  );
  const css = await cssRes.text();
  const match = css.match(/src:\s*url\((https:[^)]+)\)/);
  if (!match) throw new Error(`No font URL for ${family} ${weight}`);
  const fontRes = await fetch(match[1]);
  return fontRes.arrayBuffer();
}

const HAIR_PATHS: Record<string, string> = {
  short: 'M 30 38 Q 32 22 50 22 Q 68 22 70 38 Q 65 26 50 26 Q 35 26 30 38 Z',
  tall: 'M 28 40 Q 30 14 50 14 Q 70 14 72 40 Q 65 24 50 24 Q 35 24 28 40 Z',
  shaved: '',
  cap: 'M 28 38 L 28 30 Q 28 18 50 18 Q 72 18 72 30 L 72 38 Q 65 30 50 30 Q 35 30 28 38 Z',
};

// Avatar element for satori (inline SVG paths converted to satori-friendly shapes)
function SatoriAvatar({
  size,
  kit,
  accent,
  skin,
  hair,
  hairStyle,
  number,
}: {
  size: number;
  kit: string;
  accent: string;
  skin: string;
  hair: string;
  hairStyle: string;
  number: string;
}) {
  const hairD = HAIR_PATHS[hairStyle] ?? HAIR_PATHS.short;
  return (
    <div
      style={{
        display: 'flex',
        position: 'relative',
        width: size,
        height: size,
        borderRadius: size / 2,
        background: PALETTE.cream,
        border: `${size > 200 ? 6 : 3}px solid ${PALETTE.ink}`,
        overflow: 'hidden',
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M 8 100 Q 12 70, 32 62 Q 50 72, 68 62 Q 88 70, 92 100 Z" fill={kit} />
        <path d="M 40 64 L 50 76 L 60 64" stroke={accent} strokeWidth="1.5" fill="none" />
        <rect x="43" y="52" width="14" height="14" fill={skin} />
        <circle cx="50" cy="40" r="20" fill={skin} />
        {hairD && <path d={hairD} fill={hair} />}
        <rect x="40" y="40" width="4" height="1.5" fill={PALETTE.ink} opacity="0.65" />
        <rect x="56" y="40" width="4" height="1.5" fill={PALETTE.ink} opacity="0.65" />
        <circle cx="50" cy={88} r={5} fill={PALETTE.cream} stroke={accent} strokeWidth="1.5" />
      </svg>
      {number && (
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            top: size * 0.84,
            left: 0,
            width: size,
            justifyContent: 'center',
            fontFamily: 'JetBrains Mono',
            fontWeight: 700,
            fontSize: size * 0.08,
            color: PALETTE.ink,
            lineHeight: 1,
          }}
        >
          {number}
        </div>
      )}
    </div>
  );
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ token: string }> },
) {
  const { token } = await context.params;
  const url = new URL(req.url);
  const seed = parseInt(url.searchParams.get('r') ?? '1', 10) || 1;
  const rng = makeRng(seed);

  const user = await prisma.user.findUnique({
    where: { walletAddress: token },
    include: {
      playerProfile: { include: { twin: true } },
      squads: { include: { squad: true } },
    },
  });

  if (!user) {
    return new Response('Not found', { status: 404 });
  }

  const squad = user.squads[0]?.squad;
  if (!squad) {
    return new Response('No squad', { status: 404 });
  }

  const allMembers = await prisma.squadMember.findMany({
    where: { squadId: squad.id },
    include: {
      user: { include: { playerProfile: { include: { twin: true } } } },
    },
  });

  const players: MiniPlayer[] = allMembers.map((m) => {
    const ba = m.user.playerProfile?.twin?.baseAttributes as Attrs | undefined;
    return {
      userId: m.userId,
      name: m.user.name ?? 'Player',
      attrs: ba && typeof ba.SHO === 'number' ? ba : defaultAttrs(),
      avatar: {
        kit: m.user.avatarKitColor ?? PALETTE.red,
        accent: m.user.avatarAccentColor ?? PALETTE.navy,
        skin: m.user.avatarSkinTone ?? '#c89e7c',
        hair: m.user.avatarHairColor ?? '#2a1a10',
        hairStyle: m.user.avatarHairStyle ?? 'short',
        number: m.user.avatarNumber ?? '',
      },
    };
  });

  const me = players.find((p) => p.userId === user.id);
  const others = players.filter((p) => p.userId !== user.id);

  if (!me || others.length < 5) {
    return new Response('Not enough players', { status: 400 });
  }

  // Recompute sim with same seed → matches the preview reveal
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
  distributeGoals(myTeam, myGoals, rng); // consume rng to stay deterministic
  distributeGoals(opponents, oppGoals, rng);

  const result =
    myGoals > oppGoals ? 'WIN' : oppGoals > myGoals ? 'LOSS' : 'DRAW';
  const accentColor =
    result === 'WIN' ? PALETTE.sage : result === 'LOSS' ? PALETTE.red : PALETTE.navy;

  // Load fonts
  const [antonioBold, monoBold, monoMedium] = await Promise.all([
    loadFont('Antonio', 700),
    loadFont('JetBrains Mono', 700),
    loadFont('JetBrains Mono', 500),
  ]);

  // 1080×1080 share card
  const svg = await satori(
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: 1080,
        height: 1080,
        background: PALETTE.cream,
        padding: 80,
        position: 'relative',
      }}
    >
      {/* Ribbon */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 40 }}>
        <div style={{ display: 'flex', width: 44, height: 6, background: PALETTE.mustard }} />
        <div style={{ display: 'flex', width: 44, height: 6, background: accentColor }} />
        <div style={{ display: 'flex', width: 44, height: 6, background: PALETTE.navy }} />
        <div style={{ display: 'flex', width: 44, height: 6, background: PALETTE.sage }} />
      </div>

      {/* Top label */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          marginBottom: 20,
        }}
      >
        <div
          style={{
            display: 'flex',
            width: 10,
            height: 10,
            borderRadius: 5,
            background: accentColor,
          }}
        />
        <div
          style={{
            fontFamily: 'JetBrains Mono',
            fontSize: 22,
            fontWeight: 700,
            color: PALETTE.navy,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
          }}
        >
          Simulated · {squad.name}
        </div>
      </div>

      {/* RESULT — huge */}
      <div
        style={{
          display: 'flex',
          fontFamily: 'Antonio',
          fontWeight: 700,
          fontSize: 320,
          color: accentColor,
          letterSpacing: '-0.05em',
          lineHeight: 0.85,
          textTransform: 'uppercase',
          marginBottom: 12,
        }}
      >
        {result}
      </div>

      {/* SCORE */}
      <div
        style={{
          display: 'flex',
          fontFamily: 'JetBrains Mono',
          fontWeight: 700,
          fontSize: 160,
          color: PALETTE.ink,
          letterSpacing: '-0.04em',
          lineHeight: 1,
          marginBottom: 60,
        }}
      >
        {myGoals} — {oppGoals}
      </div>

      {/* Player identity strip */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 28,
          marginBottom: 32,
        }}
      >
        <SatoriAvatar
          size={140}
          kit={me.avatar.kit ?? PALETTE.red}
          accent={me.avatar.accent ?? PALETTE.navy}
          skin={me.avatar.skin ?? '#c89e7c'}
          hair={me.avatar.hair ?? '#2a1a10'}
          hairStyle={me.avatar.hairStyle ?? 'short'}
          number={me.avatar.number ?? ''}
        />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            flex: 1,
          }}
        >
          <div
            style={{
              fontFamily: 'JetBrains Mono',
              fontSize: 18,
              fontWeight: 700,
              color: PALETTE.inkLight,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              marginBottom: 8,
            }}
          >
            {me.name}
          </div>
          <div
            style={{
              fontFamily: 'Antonio',
              fontSize: 80,
              fontWeight: 700,
              color: PALETTE.ink,
              lineHeight: 0.9,
              letterSpacing: '-0.02em',
              textTransform: 'uppercase',
            }}
          >
            {myTeam.length}v{opponents.length}
          </div>
        </div>
      </div>

      {/* Attestation chain — editorial detail row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          marginTop: 'auto',
          marginBottom: 18,
          paddingTop: 24,
          borderTop: `1px solid ${PALETTE.inkLight}`,
        }}
      >
        <div
          style={{
            display: 'flex',
            padding: '4px 10px',
            fontFamily: 'JetBrains Mono',
            fontSize: 16,
            fontWeight: 700,
            color: PALETTE.cream,
            background: PALETTE.navy,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
          }}
        >
          ATTESTED
        </div>
        <div
          style={{
            fontFamily: 'JetBrains Mono',
            fontSize: 16,
            fontWeight: 700,
            color: PALETTE.navy,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
          }}
        >
          Simulated · oracle-signed · seed {seed}
        </div>
      </div>

      {/* Bottom footer */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            fontFamily: 'JetBrains Mono',
            fontSize: 22,
            fontWeight: 700,
            color: PALETTE.ink,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
          }}
        >
          SportWarren · Preview Sim
        </div>
        <div
          style={{
            fontFamily: 'JetBrains Mono',
            fontSize: 18,
            fontWeight: 700,
            color: PALETTE.inkLight,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            fontStyle: 'italic',
          }}
        >
          Not the real one · just a sim
        </div>
      </div>
    </div>,
    {
      width: 1080,
      height: 1080,
      fonts: [
        { name: 'Antonio', data: antonioBold, weight: 700, style: 'normal' },
        { name: 'JetBrains Mono', data: monoBold, weight: 700, style: 'normal' },
        { name: 'JetBrains Mono', data: monoMedium, weight: 500, style: 'normal' },
      ],
    },
  );

  const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1080 } }).render().asPng();

  return new Response(new Uint8Array(png), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=300',
    },
  });
}
