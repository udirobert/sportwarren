/**
 * Card share-PNG endpoint — the chess.com card baked into a 1080×1350
 * Instagram-story-shaped PNG. Designed to share to WhatsApp / IG and
 * pull other players into the perception loop.
 *
 *   GET /api/og/card/[token]
 *
 * Tier-aware: the rendering matches what the player can see in their
 * dashboard. Tier 1 → name + position + blurred Overall. Tier 2 → full
 * card with attribute bars. Tier 3 → full card + top hot takes from
 * their perception aggregate.
 *
 * Built on the same satori pattern as /api/og/sim/[token]. Shares the
 * V3 Risograph register: cream background, Antonio display, JetBrains
 * Mono data, the V3 accents.
 */

import { NextRequest } from 'next/server';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { prisma } from '@/lib/db';
import React from 'react';
import {
  baselineForPosition,
  computeOverall,
} from '@/server/services/personalization/position-baselines';
import { ATTRIBUTE_KEYS } from '@/server/services/personalization/twin-types';
import {
  aggregateReceivedPerceptions,
  topChoice,
} from '@/server/services/perception/aggregate';
import { SCENARIOS, buildPrompt } from '@/server/services/perception/scenarios';

type Attrs = { pace: number; shooting: number; passing: number; dribbling: number; defending: number; physical: number };

const PALETTE = {
  cream: '#f0e8d6',
  ink: '#0a0a0a',
  inkLight: '#3a3a3a',
  red: '#c91022',
  navy: '#1c3a5e',
  sage: '#4a7549',
  mustard: '#d4a437',
};

const ATTR_SHORT: Record<string, string> = {
  pace: 'PAC', shooting: 'SHO', passing: 'PAS',
  dribbling: 'DRI', defending: 'DEF', physical: 'PHY',
};

function computeTier(givenCount: number): 0 | 1 | 2 | 3 {
  if (givenCount >= 20) return 3;
  if (givenCount >= 10) return 2;
  if (givenCount >= 5) return 1;
  return 0;
}

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

interface PageProps {
  params: Promise<{ token: string }>;
}

export async function GET(_req: NextRequest, { params }: PageProps) {
  const { token } = await params;

  const user = await prisma.user.findUnique({
    where: { walletAddress: token },
    include: {
      playerProfile: { include: { twin: true } },
      squads: { include: { squad: true } },
    },
  });
  if (!user || user.chain !== 'preview' || !user.playerProfile) {
    return new Response('not found', { status: 404 });
  }

  const profile = user.playerProfile;
  const squad = user.squads[0]?.squad;
  const squadName = squad?.name ?? '';

  // Determine tier from the rater's outbound count
  const perceptionsGiven = await prisma.playerPerception.count({
    where: { raterId: profile.id },
  });
  const tier = computeTier(perceptionsGiven);

  // Get current attributes (with baseline fallback)
  const twin = profile.twin;
  const attrs: Attrs = (twin?.baseAttributes as Attrs | null) ?? (baselineForPosition(user.position) as Attrs);
  const level = twin?.level ?? 1;
  const prestige = twin?.prestige ?? 0;
  const overall = computeOverall(attrs, user.position, level, prestige);

  // Pull perception aggregate for the top hot take (Tier 3)
  const { aggregate, uniqueRaters } = await aggregateReceivedPerceptions(profile.id);

  // Pick the best hot take to surface — the scenario where the group
  // has the most ratings + the modal choice has clearest dominance.
  let topTakeLine: string | null = null;
  if (tier >= 3) {
    let bestScore = 0;
    for (const s of SCENARIOS) {
      const bucket = aggregate[s.id]?.descriptive;
      if (!bucket || bucket.total === 0) continue;
      const top = topChoice(bucket);
      if (!top) continue;
      const dominance = bucket[top] / bucket.total;
      const score = bucket.total * dominance;
      if (score > bestScore) {
        bestScore = score;
        const opt = s.options.find((o) => o.id === top);
        if (opt) {
          const prompt = buildPrompt(s, user.name?.split(' ')[0] ?? 'this player');
          topTakeLine = `${prompt} → ${opt.label}`;
        }
      }
    }
  }

  const [antonioBold, monoBold, monoMedium] = await Promise.all([
    loadFont('Antonio', 700),
    loadFont('JetBrains Mono', 700),
    loadFont('JetBrains Mono', 500),
  ]);

  const firstName = user.name?.split(' ')[0] ?? 'Player';
  const position = user.position ?? '';

  const svg = await satori(
    <div
      style={{
        width: 1080,
        height: 1350,
        background: PALETTE.cream,
        display: 'flex',
        flexDirection: 'column',
        padding: 80,
        fontFamily: 'JetBrains Mono',
      }}
    >
      {/* Top ribbon */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 40 }}>
        <div style={{ width: 48, height: 6, background: PALETTE.mustard }} />
        <div style={{ width: 48, height: 6, background: PALETTE.red }} />
        <div style={{ width: 48, height: 6, background: PALETTE.navy }} />
        <div style={{ width: 48, height: 6, background: PALETTE.sage }} />
      </div>

      {/* Identity line */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          fontFamily: 'JetBrains Mono',
          fontSize: 18,
          fontWeight: 700,
          letterSpacing: '4px',
          textTransform: 'uppercase',
          color: PALETTE.navy,
          marginBottom: 24,
        }}
      >
        <div style={{ width: 10, height: 10, borderRadius: 5, background: PALETTE.red }} />
        SportWarren · {squadName}
      </div>

      {/* Name + position */}
      <div
        style={{
          fontFamily: 'Antonio',
          fontSize: 140,
          fontWeight: 700,
          lineHeight: 0.92,
          letterSpacing: '-0.03em',
          textTransform: 'uppercase',
          color: PALETTE.ink,
          marginBottom: 12,
        }}
      >
        {firstName.toUpperCase()}
      </div>
      <div
        style={{
          fontFamily: 'JetBrains Mono',
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: '3px',
          textTransform: 'uppercase',
          color: PALETTE.inkLight,
          marginBottom: 56,
        }}
      >
        {position} · LEVEL {level} · {uniqueRaters} lads weighed in
      </div>

      {/* Overall block */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 32,
          background: PALETTE.ink,
          color: PALETTE.cream,
          padding: '40px 48px',
          borderLeft: `12px solid ${PALETTE.mustard}`,
          marginBottom: 48,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <div
            style={{
              fontFamily: 'JetBrains Mono',
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: '5px',
              textTransform: 'uppercase',
              color: PALETTE.mustard,
              marginBottom: 8,
            }}
          >
            Overall
          </div>
          <div
            style={{
              fontFamily: 'JetBrains Mono',
              fontSize: 18,
              color: PALETTE.cream,
              opacity: 0.85,
            }}
          >
            {tier >= 2 ? 'Read by peer perception + match data' : 'Locked — rate 10 lads to reveal'}
          </div>
        </div>
        <div
          style={{
            fontFamily: 'Antonio',
            fontSize: 200,
            fontWeight: 700,
            lineHeight: 0.85,
            letterSpacing: '-0.04em',
            color: PALETTE.mustard,
            // satori doesn't support filter:blur on text — proxy
            // the "locked" state by hiding the number with a dot
            opacity: tier >= 2 ? 1 : 0,
          }}
        >
          {tier >= 2 ? overall : '·'}
        </div>
        {tier < 2 && (
          <div
            style={{
              fontFamily: 'Antonio',
              fontSize: 200,
              fontWeight: 700,
              lineHeight: 0.85,
              color: PALETTE.mustard,
              opacity: 0.25,
            }}
          >
            ?
          </div>
        )}
      </div>

      {/* Attribute bars — Tier 2+ */}
      {tier >= 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 32 }}>
          {ATTRIBUTE_KEYS.map((k) => {
            const v = attrs[k] ?? 50;
            const pct = Math.max(0, Math.min(99, v));
            return (
              <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <div
                  style={{
                    fontFamily: 'JetBrains Mono',
                    fontSize: 20,
                    fontWeight: 700,
                    letterSpacing: '2px',
                    color: PALETTE.navy,
                    width: 80,
                  }}
                >
                  {ATTR_SHORT[k]}
                </div>
                <div style={{ flex: 1, height: 14, background: 'rgba(0,0,0,0.08)', display: 'flex' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: PALETTE.ink }} />
                </div>
                <div
                  style={{
                    fontFamily: 'Antonio',
                    fontSize: 40,
                    fontWeight: 700,
                    letterSpacing: '-0.02em',
                    color: PALETTE.ink,
                    width: 80,
                    textAlign: 'right',
                    display: 'flex',
                    justifyContent: 'flex-end',
                  }}
                >
                  {v}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Top hot take — Tier 3 */}
      {topTakeLine && (
        <div
          style={{
            background: 'rgba(212,164,55,0.18)',
            border: `2px solid ${PALETTE.mustard}`,
            padding: '24px 32px',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            marginTop: 12,
          }}
        >
          <div
            style={{
              fontFamily: 'JetBrains Mono',
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: '4px',
              textTransform: 'uppercase',
              color: PALETTE.ink,
              opacity: 0.7,
            }}
          >
            What the lads said
          </div>
          <div
            style={{
              fontFamily: 'JetBrains Mono',
              fontSize: 20,
              lineHeight: 1.4,
              color: PALETTE.ink,
            }}
          >
            {topTakeLine}
          </div>
        </div>
      )}

      {/* Footer — call to action */}
      <div style={{ flex: 1 }} />
      <div
        style={{
          fontFamily: 'JetBrains Mono',
          fontSize: 16,
          fontWeight: 700,
          letterSpacing: '3px',
          textTransform: 'uppercase',
          color: PALETTE.inkLight,
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <div>SPORTWARREN</div>
        <div>Rate the lads → your card moves</div>
      </div>
    </div>,
    {
      width: 1080,
      height: 1350,
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
