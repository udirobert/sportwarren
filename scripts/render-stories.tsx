/**
 * Generate 1080×1920 story-format PNGs for every archetype in
 * `CARDS_STORIES`. Used by the GTM workflow — captains and squad
 * accounts pull these directly for Instagram Stories / TikTok /
 * YouTube Shorts without reformatting.
 *
 *   pnpm tsx scripts/render-stories.tsx
 *
 * Outputs:
 *   docs/makeathon/assets/stories/<kind>-story.png
 *
 * No DB required — uses synthetic moment data shared with the
 * landscape + social render scripts.
 */

import React from 'react';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  CARDS_STORIES,
  STORY_WIDTH,
  STORY_HEIGHT,
} from '../src/components/moments/cards/stories';
import type { MomentForRender } from '../src/components/moments/cards/types';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ASSETS_DIR = path.resolve(HERE, '..', 'docs', 'makeathon', 'assets', 'stories');

const IE_UA = 'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0)';

async function loadFromGoogleFonts(family: string, weight: number): Promise<ArrayBuffer> {
  const cssRes = await fetch(
    `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}`,
    { headers: { 'User-Agent': IE_UA } },
  );
  if (!cssRes.ok) throw new Error(`${family} ${weight} CSS fetch failed: ${cssRes.status}`);
  const css = await cssRes.text();
  const match = css.match(/src:\s*url\((https:[^)]+)\)/);
  if (!match) throw new Error(`No font URL in CSS for ${family} ${weight}`);
  const fontRes = await fetch(match[1]);
  if (!fontRes.ok) throw new Error(`${family} ${weight} font fetch failed: ${fontRes.status}`);
  return fontRes.arrayBuffer();
}

const SAMPLE_MOMENTS: Array<MomentForRender & { kind: string }> = [
  { kind: 'record_broken', tier: 'standard', label: 'MOST GOALS IN A SEASON', detail: 'Marcus Tate — 28 goals — broke the squad record set 12 May 2019', createdAt: new Date('2026-06-15T15:30:00Z'), subjectType: 'squad' },
  { kind: 'level_up', tier: 'premium', label: 'Level 13', detail: 'Marcus Tate · midfielder · L12 → L13', createdAt: new Date('2026-06-15T15:30:00Z'), subjectType: 'player' },
  { kind: 'season_end', tier: 'standard', label: "Spring '26", detail: "Brockenhurst Rovers\n14 played · 9 won · 3 drawn · 2 lost\nTop scorer: Marcus Tate — 28 goals\nComeback of the season: 3-2 vs. Ballygally, Apr 12", createdAt: new Date('2026-06-15T15:30:00Z'), subjectType: 'squad' },
  { kind: 'match_imported', tier: 'standard', label: 'W 3-2 vs Ballygally United', detail: 'Brockenhurst Rovers 3 — 2 Ballygally United', createdAt: new Date('2019-05-12T15:30:00Z'), subjectType: 'squad' },
  { kind: 'achievement', tier: 'streak_reward', label: 'FIRST CLEAN SHEET', detail: 'No goals conceded across a full 90 — Marcus Tate, defender', createdAt: new Date('2026-06-15T15:30:00Z'), subjectType: 'player' },
  { kind: 'twin_created', tier: 'standard', label: 'Marcus Tate', detail: 'MIDFIELDER · BROCKENHURST ROVERS', createdAt: new Date('2026-06-15T15:30:00Z'), subjectType: 'player' },
  { kind: 'sim_complete', tier: 'standard', label: '7W 2D 1L', detail: '10-match round-robin · Brockenhurst Rovers Twin', createdAt: new Date('2026-06-15T15:30:00Z'), subjectType: 'squad' },
  { kind: 'attestation_milestone', tier: 'premium', label: '100 MATCHES ATTESTED', detail: 'Every match preserved on-chain. Your record outlasts the platform.', createdAt: new Date('2026-06-15T15:30:00Z'), subjectType: 'squad' },
  { kind: 'coaching_hired', tier: 'standard', label: 'MARCUS PRESSLEY', detail: 'YOUR NEW COACH · 8 WEEKS · TACTICAL FOCUS', createdAt: new Date('2026-06-15T15:30:00Z'), subjectType: 'player' },
  { kind: 'coaching_expired', tier: 'standard', label: 'Marcus Pressley', detail: '8 weeks · Tactical Focus · 19 Apr → 14 Jun', createdAt: new Date('2026-06-15T15:30:00Z'), subjectType: 'player' },
];

async function main() {
  await mkdir(ASSETS_DIR, { recursive: true });
  const [regular, bold] = await Promise.all([
    loadFromGoogleFonts('Space Grotesk', 400),
    loadFromGoogleFonts('Space Grotesk', 700),
  ]);

  let rendered = 0;
  for (const moment of SAMPLE_MOMENTS) {
    const Card = CARDS_STORIES[moment.kind];
    if (!Card) continue;
    console.log(`[${moment.kind}] rendering 1080×1920…`);
    const element = React.createElement(Card, { moment });
    const svg = await satori(element, {
      width: STORY_WIDTH,
      height: STORY_HEIGHT,
      fonts: [
        { name: 'Space Grotesk', data: regular, weight: 400, style: 'normal' },
        { name: 'Space Grotesk', data: bold, weight: 700, style: 'normal' },
      ],
    });
    const png = Buffer.from(new Resvg(svg, { fitTo: { mode: 'width', value: STORY_WIDTH } }).render().asPng());
    const outPath = path.join(ASSETS_DIR, `${moment.kind}-story.png`);
    await writeFile(outPath, png);
    console.log(`  → ${path.relative(process.cwd(), outPath)}  (${png.length} bytes)`);
    rendered++;
  }
  console.log(`\nDone. ${rendered} story PNGs written to docs/makeathon/assets/stories/.`);
}

main().catch((err) => { console.error(err); process.exit(1); });
