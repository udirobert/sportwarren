/**
 * Doctrine share-PNG endpoint — the captain's tactical doctrine baked
 * into a 1080×1350 Instagram-story-shaped PNG. Captain drops this into
 * the squad WhatsApp; the visible gaps create social pressure on
 * everyone to weigh in and "correct the record."
 *
 *   GET /api/og/doctrine/[token]
 *
 * Captain-gated: only resolves when the token's user has role=captain
 * on a squad. Surfaces up to 3 strongest descriptive-vs-prescriptive
 * gaps across positions. Position-anonymized — never names a player.
 *
 * Built on the same satori pattern as /api/og/card/[token].
 */

import { NextRequest } from 'next/server';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { prisma } from '@/lib/db';
import React from 'react';
import {
  aggregateSquadDoctrine,
  topChoice,
  type ChoiceCounts,
} from '@/server/services/perception/aggregate';
import { SCENARIOS } from '@/server/services/perception/scenarios';

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

interface PageProps {
  params: Promise<{ token: string }>;
}

interface Gap {
  position: string;
  descLabel: string;
  prescLabel: string;
  totalRatings: number;
  score: number;
}

/** Walk a position's scenarios to find the strongest IS-vs-SHOULD divergence. */
function findGapsForPosition(
  position: string,
  scenarios: Record<string, { descriptive: ChoiceCounts; prescriptive: ChoiceCounts }>,
): Gap[] {
  const gaps: Gap[] = [];
  for (const [scenarioId, buckets] of Object.entries(scenarios)) {
    const d = topChoice(buckets.descriptive);
    const p = topChoice(buckets.prescriptive);
    if (!d || !p || d === p) continue;
    const scenarioMeta = SCENARIOS.find((s) => s.id === scenarioId);
    if (!scenarioMeta) continue;
    const descOpt = scenarioMeta.options.find((o) => o.id === d);
    const prescOpt = scenarioMeta.options.find((o) => o.id === p);
    if (!descOpt || !prescOpt) continue;
    const totalRatings = buckets.descriptive.total + buckets.prescriptive.total;
    const dominance =
      buckets.descriptive[d] / Math.max(1, buckets.descriptive.total) +
      buckets.prescriptive[p] / Math.max(1, buckets.prescriptive.total);
    gaps.push({
      position,
      descLabel: descOpt.label,
      prescLabel: prescOpt.label,
      totalRatings,
      score: totalRatings * dominance,
    });
  }
  return gaps;
}

export async function GET(_req: NextRequest, { params }: PageProps) {
  const { token } = await params;

  const user = await prisma.user.findUnique({
    where: { walletAddress: token },
    include: { squads: { include: { squad: true } } },
  });
  if (!user || user.chain !== 'preview') {
    return new Response('not found', { status: 404 });
  }

  const captainMembership = user.squads.find((m) => m.role === 'captain');
  if (!captainMembership) return new Response('not found', { status: 404 });
  const squad = captainMembership.squad;

  const { byPosition, totalRows, uniqueRaters, uniqueTargets } =
    await aggregateSquadDoctrine(squad.id);

  // Pick the top 3 strongest gaps across all positions
  const allGaps: Gap[] = [];
  for (const [position, scenarios] of Object.entries(byPosition)) {
    allGaps.push(...findGapsForPosition(position, scenarios));
  }
  allGaps.sort((a, b) => b.score - a.score);
  const topGaps = allGaps.slice(0, 3);

  const [antonioBold, monoBold, monoMedium] = await Promise.all([
    loadFont('Antonio', 700),
    loadFont('JetBrains Mono', 700),
    loadFont('JetBrains Mono', 500),
  ]);

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
      {/* Top ribbon — reordered for doctrine (navy first) */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 40 }}>
        <div style={{ width: 48, height: 6, background: PALETTE.navy }} />
        <div style={{ width: 48, height: 6, background: PALETTE.sage }} />
        <div style={{ width: 48, height: 6, background: PALETTE.mustard }} />
        <div style={{ width: 48, height: 6, background: PALETTE.red }} />
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
          marginBottom: 28,
        }}
      >
        <div style={{ width: 10, height: 10, borderRadius: 5, background: PALETTE.red }} />
        SportWarren · {squad.name} · doctrine
      </div>

      {/* Headline */}
      <div
        style={{
          fontFamily: 'Antonio',
          fontSize: 100,
          fontWeight: 700,
          lineHeight: 0.92,
          letterSpacing: '-0.03em',
          textTransform: 'uppercase',
          color: PALETTE.ink,
          marginBottom: 20,
        }}
      >
        The group&apos;s read.
      </div>
      <div
        style={{
          fontFamily: 'JetBrains Mono',
          fontSize: 22,
          fontWeight: 500,
          color: PALETTE.inkLight,
          marginBottom: 48,
          maxWidth: 760,
          lineHeight: 1.4,
        }}
      >
        {totalRows} ratings · {uniqueRaters} voices · {uniqueTargets} lads read
      </div>

      {/* Gaps stack */}
      {topGaps.length === 0 ? (
        <div
          style={{
            display: 'flex',
            fontFamily: 'JetBrains Mono',
            fontSize: 22,
            color: PALETTE.inkLight,
            lineHeight: 1.5,
            background: 'rgba(0,0,0,0.04)',
            border: `2px solid ${PALETTE.ink}`,
            padding: '32px 36px',
          }}
        >
          Not enough ratings yet. Rate the lads to fill in the doctrine.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          {topGaps.map((gap, i) => (
            <div
              key={`${gap.position}-${i}`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                border: `3px solid ${PALETTE.ink}`,
                borderLeft: `16px solid ${PALETTE.red}`,
                background: PALETTE.cream,
                padding: '24px 28px',
              }}
            >
              <div
                style={{
                  fontFamily: 'Antonio',
                  fontSize: 52,
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  color: PALETTE.ink,
                  marginBottom: 12,
                  display: 'flex',
                }}
              >
                {gap.position}
              </div>
              <div
                style={{
                  fontFamily: 'JetBrains Mono',
                  fontSize: 18,
                  color: PALETTE.inkLight,
                  marginBottom: 6,
                  display: 'flex',
                }}
              >
                <span style={{ color: PALETTE.sage, fontWeight: 700, marginRight: 8 }}>IS</span>
                {gap.descLabel}
              </div>
              <div
                style={{
                  fontFamily: 'JetBrains Mono',
                  fontSize: 18,
                  color: PALETTE.inkLight,
                  display: 'flex',
                }}
              >
                <span style={{ color: PALETTE.navy, fontWeight: 700, marginRight: 8 }}>SHOULD</span>
                {gap.prescLabel}
              </div>
            </div>
          ))}
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
        <div>Disagree? Rate the lads.</div>
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
