/**
 * Render the same moment row through both renderers and save the PNGs to
 * `docs/makeathon/assets/`. Used to produce the before/after pair that
 * carries the makeathon video, cover frame, and social post.
 *
 *   pnpm tsx scripts/render-before-after.ts
 *
 * Outputs:
 *   docs/makeathon/assets/<kind>-v1.png    (Inter + 135° gradient — old slop)
 *   docs/makeathon/assets/<kind>-v2.png    (Space Grotesk + per-archetype — new)
 *
 * No DB required — uses synthetic Moment data so the script reproduces
 * cleanly on a fresh clone.
 */

import React from 'react';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { resolveCard } from '../src/components/moments/cards';

/**
 * Production note (discovered while building this script):
 * v1 (`src/server/services/personalization/moment-render.ts`) calls
 * `satori(htmlString, ...)`, but satori 0.26 only accepts JSX —
 * passing a string causes it to render the raw HTML source as a single
 * text node, producing garbled PNGs. v1 has been silently broken in
 * production. v2 fixes both the bug and the design system.
 *
 * For the side-by-side asset, we render v1 here as a JSX component that
 * mirrors v1's *design intent* (Inter + 135° gradient + tier-color pill
 * + uniform composition across kinds). This gives an honest design-vs-
 * design comparison rather than a comparison against broken output.
 */

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ASSETS_DIR = path.resolve(HERE, '..', 'docs', 'makeathon', 'assets');

const WIDTH = 600;
const HEIGHT = 400;

interface SyntheticMoment {
  kind: string;
  tier: string;
  label: string;
  detail: string | null;
  createdAt: Date;
  subjectType: 'player' | 'squad';
}

async function loadFromGoogleFonts(family: string, weight: number): Promise<ArrayBuffer> {
  const ieUA =
    'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0)';
  const cssRes = await fetch(
    `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}`,
    { headers: { 'User-Agent': ieUA } },
  );
  if (!cssRes.ok) {
    throw new Error(`${family} ${weight} CSS fetch failed: ${cssRes.status}`);
  }
  const css = await cssRes.text();
  const match = css.match(/src:\s*url\((https:[^)]+)\)/);
  if (!match) throw new Error(`No font URL in CSS for ${family} ${weight}`);
  const fontRes = await fetch(match[1]);
  if (!fontRes.ok) throw new Error(`${family} ${weight} font fetch failed: ${fontRes.status}`);
  return fontRes.arrayBuffer();
}

async function loadSpaceGrotesk(weight: number): Promise<ArrayBuffer> {
  return loadFromGoogleFonts('Space Grotesk', weight);
}

const V1_TIER_COLORS: Record<string, string> = {
  standard: '#6b7280',
  premium: '#f59e0b',
  streak_reward: '#10b981',
  partner: '#8b5cf6',
  internal: '#3b82f6',
};

function V1IntentCard({ moment }: { moment: SyntheticMoment }) {
  const tierColor = V1_TIER_COLORS[moment.tier] ?? '#6b7280';
  const date = moment.createdAt.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: WIDTH,
        height: HEIGHT,
        background: 'linear-gradient(135deg, #0f172a, #1e293b)',
        borderRadius: 16,
        padding: 32,
        fontFamily: 'Inter',
        color: '#f8fafc',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: `${tierColor}22`,
            border: `1px solid ${tierColor}`,
            borderRadius: 999,
            padding: '4px 12px',
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: tierColor,
            }}
          >
            {moment.tier}
          </span>
        </div>
        <span style={{ fontSize: 12, color: '#94a3b8' }}>
          {moment.kind.replace(/_/g, ' ')}
        </span>
      </div>
      <div
        style={{
          display: 'flex',
          fontSize: 28,
          fontWeight: 800,
          lineHeight: 1.2,
          marginBottom: 12,
        }}
      >
        {moment.label}
      </div>
      {moment.detail ? (
        <div style={{ display: 'flex', fontSize: 15, color: '#cbd5e1', lineHeight: 1.5, flex: 1 }}>
          {moment.detail}
        </div>
      ) : (
        <div style={{ display: 'flex', flex: 1 }} />
      )}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 'auto',
          paddingTop: 16,
          borderTop: '1px solid #334155',
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>SportWarren</span>
        <span style={{ fontSize: 12, color: '#64748b' }}>{date}</span>
      </div>
    </div>
  );
}

async function renderV1(moment: SyntheticMoment): Promise<Buffer> {
  const [interRegular, interBold] = await Promise.all([
    loadFromGoogleFonts('Inter', 400),
    loadFromGoogleFonts('Inter', 700),
  ]);
  const svg = await satori(<V1IntentCard moment={moment} />, {
    width: WIDTH,
    height: HEIGHT,
    fonts: [
      { name: 'Inter', data: interRegular, weight: 400, style: 'normal' },
      { name: 'Inter', data: interBold, weight: 700, style: 'normal' },
    ],
  });
  return Buffer.from(
    new Resvg(svg, { fitTo: { mode: 'width', value: WIDTH * 2 } })
      .render()
      .asPng(),
  );
}

async function renderV2(moment: SyntheticMoment): Promise<Buffer> {
  const [regular, bold] = await Promise.all([
    loadSpaceGrotesk(400),
    loadSpaceGrotesk(700),
  ]);
  const Card = resolveCard(moment.kind);
  const element = React.createElement(Card, { moment });
  const svg = await satori(element, {
    width: WIDTH,
    height: HEIGHT,
    fonts: [
      { name: 'Space Grotesk', data: regular, weight: 400, style: 'normal' },
      { name: 'Space Grotesk', data: bold, weight: 700, style: 'normal' },
    ],
  });
  return Buffer.from(
    new Resvg(svg, { fitTo: { mode: 'width', value: WIDTH * 2 } })
      .render()
      .asPng(),
  );
}

const SAMPLE_MOMENTS: SyntheticMoment[] = [
  {
    kind: 'record_broken',
    tier: 'standard',
    label: 'MOST GOALS IN A SEASON',
    detail:
      'Marcus Tate — 28 goals — broke the squad record set 12 May 2019',
    createdAt: new Date('2026-06-15T15:30:00Z'),
    subjectType: 'squad',
  },
  {
    kind: 'level_up',
    tier: 'premium',
    label: 'Level 13',
    detail: 'Marcus Tate · midfielder · L12 → L13',
    createdAt: new Date('2026-06-15T15:30:00Z'),
    subjectType: 'player',
  },
  {
    kind: 'season_end',
    tier: 'standard',
    label: "Spring '26",
    detail:
      'Brockenhurst Rovers\n14 played · 9 won · 3 drawn · 2 lost\nTop scorer: Marcus Tate — 28 goals\nComeback of the season: 3-2 vs. Ballygally, Apr 12',
    createdAt: new Date('2026-06-15T15:30:00Z'),
    subjectType: 'squad',
  },
  {
    kind: 'match_imported',
    tier: 'standard',
    label: 'W 3-2 vs Ballygally United',
    detail: 'Brockenhurst Rovers 3 — 2 Ballygally United',
    createdAt: new Date('2019-05-12T15:30:00Z'),
    subjectType: 'squad',
  },
  {
    kind: 'achievement',
    tier: 'streak_reward',
    label: 'FIRST CLEAN SHEET',
    detail: 'No goals conceded across a full 90 — Marcus Tate, defender',
    createdAt: new Date('2026-06-15T15:30:00Z'),
    subjectType: 'player',
  },
  {
    kind: 'twin_created',
    tier: 'standard',
    label: 'Marcus Tate',
    detail: 'MIDFIELDER · BROCKENHURST ROVERS',
    createdAt: new Date('2026-06-15T15:30:00Z'),
    subjectType: 'player',
  },
  {
    kind: 'sim_complete',
    tier: 'standard',
    label: '7W 2D 1L',
    detail: '10-match round-robin · Brockenhurst Rovers Twin',
    createdAt: new Date('2026-06-15T15:30:00Z'),
    subjectType: 'squad',
  },
  {
    kind: 'attestation_milestone',
    tier: 'premium',
    label: '100 MATCHES ATTESTED',
    detail: 'Every match preserved on-chain. Your record outlasts the platform.',
    createdAt: new Date('2026-06-15T15:30:00Z'),
    subjectType: 'squad',
  },
  {
    kind: 'coaching_hired',
    tier: 'standard',
    label: 'MARCUS PRESSLEY',
    detail: 'YOUR NEW COACH · 8 WEEKS · TACTICAL FOCUS',
    createdAt: new Date('2026-06-15T15:30:00Z'),
    subjectType: 'player',
  },
  {
    kind: 'coaching_expired',
    tier: 'standard',
    label: 'Marcus Pressley',
    detail: '8 weeks · Tactical Focus · 19 Apr → 14 Jun',
    createdAt: new Date('2026-06-15T15:30:00Z'),
    subjectType: 'player',
  },
];

async function main() {
  await mkdir(ASSETS_DIR, { recursive: true });

  for (const moment of SAMPLE_MOMENTS) {
    console.log(`[${moment.kind}] rendering v1 (Inter + gradient)…`);
    const v1Png = await renderV1(moment);
    const v1Path = path.join(ASSETS_DIR, `${moment.kind}-v1.png`);
    await writeFile(v1Path, v1Png);
    console.log(`  → ${path.relative(process.cwd(), v1Path)}  (${v1Png.length} bytes)`);

    console.log(`[${moment.kind}] rendering v2 (Space Grotesk + archetype)…`);
    const v2Png = await renderV2(moment);
    const v2Path = path.join(ASSETS_DIR, `${moment.kind}-v2.png`);
    await writeFile(v2Path, v2Png);
    console.log(`  → ${path.relative(process.cwd(), v2Path)}  (${v2Png.length} bytes)`);
  }

  console.log('\nDone. PNGs written to docs/makeathon/assets/.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
