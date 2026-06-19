/**
 * Render all 5 V3 Marketing Toolkit templates.
 *
 *   pnpm tsx scripts/render-v3-marketing.tsx
 *
 * Output: docs/makeathon/assets/marketing/<name>-v3.png
 */

import React from 'react';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  SquadRecruitmentSquare,
  SquadOfTheWeekSquare,
  CaptainSpotlightSquare,
  LandingHero,
  FeatureExplainerSquare,
} from '../src/components/moments/cards/V3Marketing';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(HERE, '..', 'docs', 'makeathon', 'assets', 'marketing');

async function loadFromGoogleFonts(family: string, weight: number): Promise<ArrayBuffer> {
  const ieUA = 'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0)';
  const cssRes = await fetch(
    `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}`,
    { headers: { 'User-Agent': ieUA } },
  );
  if (!cssRes.ok) throw new Error(`${family} ${weight} CSS fetch failed: ${cssRes.status}`);
  const css = await cssRes.text();
  const m = css.match(/src:\s*url\((https:[^)]+)\)/);
  if (!m) throw new Error(`No font URL in CSS for ${family} ${weight}`);
  const fontRes = await fetch(m[1]);
  if (!fontRes.ok) throw new Error(`${family} ${weight} font fetch failed: ${fontRes.status}`);
  return fontRes.arrayBuffer();
}

const TEMPLATES: Record<string, { Component: () => JSX.Element; w: number; h: number }> = {
  'squad-recruitment': { Component: SquadRecruitmentSquare, w: 1080, h: 1080 },
  'squad-of-the-week': { Component: SquadOfTheWeekSquare, w: 1080, h: 1080 },
  'captain-spotlight': { Component: CaptainSpotlightSquare, w: 1080, h: 1080 },
  'landing-hero': { Component: LandingHero, w: 1920, h: 1080 },
  'feature-explainer': { Component: FeatureExplainerSquare, w: 1080, h: 1080 },
};

async function main() {
  console.log('[v3-mkt] loading fonts…');
  const [antonioBold, jetbrainsBold, jetbrainsMedium] = await Promise.all([
    loadFromGoogleFonts('Antonio', 700),
    loadFromGoogleFonts('JetBrains Mono', 700),
    loadFromGoogleFonts('JetBrains Mono', 500),
  ]);

  await mkdir(OUT_DIR, { recursive: true });

  for (const [name, { Component, w, h }] of Object.entries(TEMPLATES)) {
    console.log(`[v3-mkt] rendering ${name} (${w}×${h})…`);
    const svg = await satori(<Component />, {
      width: w,
      height: h,
      fonts: [
        { name: 'Antonio', data: antonioBold, weight: 700, style: 'normal' },
        { name: 'JetBrains Mono', data: jetbrainsBold, weight: 700, style: 'normal' },
        { name: 'JetBrains Mono', data: jetbrainsMedium, weight: 500, style: 'normal' },
      ],
    });
    const png = new Resvg(svg, { fitTo: { mode: 'width', value: w } }).render().asPng();
    const out = path.join(OUT_DIR, `${name}-v3.png`);
    await writeFile(out, png);
    console.log(`  → ${path.relative(process.cwd(), out)}  (${png.length} bytes)`);
  }

  console.log(`[v3-mkt] done — ${Object.keys(TEMPLATES).length} templates rendered.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
