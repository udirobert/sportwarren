/**
 * Render all 10 V3 archetype concept pieces.
 *
 *   pnpm tsx scripts/render-v3-concept.tsx
 *
 * Output: docs/makeathon/assets/<kind>-v3.png for each archetype.
 */

import React from 'react';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { RecordBrokenCardV3 } from '../src/components/moments/cards/RecordBrokenCardV3';
import {
  LevelUpCardV3,
  SeasonEndCardV3,
  TwinCreatedCardV3,
  AchievementCardV3,
  SimCompleteCardV3,
  AttestationMilestoneCardV3,
  CoachingHiredCardV3,
  CoachingExpiredCardV3,
  MatchImportedCardV3,
} from '../src/components/moments/cards/V3Cards';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(HERE, '..', 'docs', 'makeathon', 'assets');

const WIDTH = 600;
const HEIGHT = 400;

async function loadFromGoogleFonts(
  family: string,
  weight: number,
): Promise<ArrayBuffer> {
  const ieUA =
    'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0)';
  const cssRes = await fetch(
    `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
      family,
    )}:wght@${weight}`,
    { headers: { 'User-Agent': ieUA } },
  );
  if (!cssRes.ok) {
    throw new Error(`${family} ${weight} CSS fetch failed: ${cssRes.status}`);
  }
  const css = await cssRes.text();
  const match = css.match(/src:\s*url\((https:[^)]+)\)/);
  if (!match) throw new Error(`No font URL in CSS for ${family} ${weight}`);
  const fontRes = await fetch(match[1]);
  if (!fontRes.ok) {
    throw new Error(`${family} ${weight} font fetch failed: ${fontRes.status}`);
  }
  return fontRes.arrayBuffer();
}

const SAMPLES: Record<
  string,
  {
    kind: string;
    tier: string;
    label: string;
    detail: string | null;
    createdAt: Date;
    subjectType: 'player' | 'squad';
  }
> = {
  record_broken: {
    kind: 'record_broken', tier: 'standard',
    label: 'MOST GOALS IN A SEASON', detail: 'Marcus Tate · 28 goals',
    createdAt: new Date('2026-06-18T19:00:00Z'), subjectType: 'player',
  },
  level_up: {
    kind: 'level_up', tier: 'standard',
    label: 'Level 47', detail: 'Marcus Tate · midfielder',
    createdAt: new Date('2026-06-18T19:00:00Z'), subjectType: 'player',
  },
  season_end: {
    kind: 'season_end', tier: 'partner',
    label: 'Spring 2026 wrapped', detail: 'Brockenhurst Rovers · 14 played',
    createdAt: new Date('2026-06-18T19:00:00Z'), subjectType: 'squad',
  },
  twin_created: {
    kind: 'twin_created', tier: 'standard',
    label: 'MARCUS TATE', detail: 'midfielder · brockenhurst rovers',
    createdAt: new Date('2026-06-18T19:00:00Z'), subjectType: 'player',
  },
  achievement: {
    kind: 'achievement', tier: 'streak_reward',
    label: 'FIRST CLEAN SHEET', detail: 'No goals conceded · across a full 90',
    createdAt: new Date('2026-06-18T19:00:00Z'), subjectType: 'player',
  },
  sim_complete: {
    kind: 'sim_complete', tier: 'standard',
    label: '7W 2D 1L', detail: '10 squads · ghost round',
    createdAt: new Date('2026-06-18T19:00:00Z'), subjectType: 'squad',
  },
  attestation_milestone: {
    kind: 'attestation_milestone', tier: 'partner',
    label: '100 MATCHES ATTESTED', detail: 'Every match preserved on-chain',
    createdAt: new Date('2026-06-18T19:00:00Z'), subjectType: 'squad',
  },
  coaching_hired: {
    kind: 'coaching_hired', tier: 'standard',
    label: 'COACH ELENA OWENS', detail: '30 days · shooting +5, pace +3',
    createdAt: new Date('2026-06-18T19:00:00Z'), subjectType: 'player',
  },
  coaching_expired: {
    kind: 'coaching_expired', tier: 'standard',
    label: 'COACH ELENA OWENS', detail: '30 sessions complete',
    createdAt: new Date('2026-06-18T19:00:00Z'), subjectType: 'player',
  },
  match_imported: {
    kind: 'match_imported', tier: 'standard',
    label: '3-1 vs BALLYGALLY', detail: '18 Jun 2024 · league · home',
    createdAt: new Date('2026-06-18T19:00:00Z'), subjectType: 'player',
  },
};

const RENDERERS: Record<string, (props: { moment: typeof SAMPLES['record_broken'] }) => JSX.Element> = {
  record_broken: RecordBrokenCardV3,
  level_up: LevelUpCardV3,
  season_end: SeasonEndCardV3,
  twin_created: TwinCreatedCardV3,
  achievement: AchievementCardV3,
  sim_complete: SimCompleteCardV3,
  attestation_milestone: AttestationMilestoneCardV3,
  coaching_hired: CoachingHiredCardV3,
  coaching_expired: CoachingExpiredCardV3,
  match_imported: MatchImportedCardV3,
};

async function main() {
  console.log('[v3] loading fonts (Antonio, JetBrains Mono)…');
  const [antonioBold, jetbrainsBold, jetbrainsMedium] = await Promise.all([
    loadFromGoogleFonts('Antonio', 700),
    loadFromGoogleFonts('JetBrains Mono', 700),
    loadFromGoogleFonts('JetBrains Mono', 500),
  ]);

  await mkdir(OUT_DIR, { recursive: true });

  for (const [kind, Renderer] of Object.entries(RENDERERS)) {
    const sample = SAMPLES[kind];
    console.log(`[v3] rendering ${kind}…`);
    const svg = await satori(<Renderer moment={sample} />, {
      width: WIDTH,
      height: HEIGHT,
      fonts: [
        { name: 'Antonio', data: antonioBold, weight: 700, style: 'normal' },
        { name: 'JetBrains Mono', data: jetbrainsBold, weight: 700, style: 'normal' },
        { name: 'JetBrains Mono', data: jetbrainsMedium, weight: 500, style: 'normal' },
      ],
    });
    const png = new Resvg(svg, { fitTo: { mode: 'width', value: WIDTH } })
      .render()
      .asPng();
    const out = path.join(OUT_DIR, `${kind}-v3.png`);
    await writeFile(out, png);
    console.log(`  → ${path.relative(process.cwd(), out)} (${png.length} bytes)`);
  }

  console.log(`[v3] done — ${Object.keys(RENDERERS).length} cards rendered.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
