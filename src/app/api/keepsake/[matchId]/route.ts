/**
 * Keepsake render — generates a match result PNG using satori/resvg.
 *
 * POST /api/keepsake/{matchId}
 * Body: { homeTeam, awayTeam, homeScore, awayScore, date, motmName?, motmConsensus? }
 * Returns: PNG image (Content-Type: image/png)
 *
 * The route is a thin wrapper around `KeepsakeCard` from
 * src/components/keepsake/. Composition + design tokens live with the
 * component so the keepsake stays in sync with the rest of the brand
 * surface (same Space Grotesk, same color/background, same accent
 * tokens as the moment-card library).
 *
 * Font loading mirrors `moment-render-v2.ts`: Space Grotesk weights
 * 400 + 700 fetched from the Google Fonts CSS API at runtime, cached
 * in-process for the lifetime of the worker. WOFF is forced via an IE
 * user-agent because satori 0.26 doesn't support WOFF2.
 */

import React from 'react';
import { NextRequest, NextResponse } from 'next/server';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

import {
  KeepsakeCard,
  KEEPSAKE_WIDTH,
  KEEPSAKE_HEIGHT,
  type KeepsakeProps,
} from '@/components/keepsake/KeepsakeCard';

let fontCache: { regular: ArrayBuffer; bold: ArrayBuffer } | null = null;

async function loadFonts(): Promise<{ regular: ArrayBuffer; bold: ArrayBuffer }> {
  if (fontCache) return fontCache;
  const ieUA =
    'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0)';

  async function fetchWeight(weight: number): Promise<ArrayBuffer> {
    const cssRes = await fetch(
      `https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@${weight}`,
      { headers: { 'User-Agent': ieUA } },
    );
    if (!cssRes.ok) {
      throw new Error(`Space Grotesk weight ${weight} CSS fetch failed: ${cssRes.status}`);
    }
    const css = await cssRes.text();
    const match = css.match(/src:\s*url\((https:[^)]+)\)/);
    if (!match) {
      throw new Error(`Could not locate font URL in CSS for weight ${weight}`);
    }
    const fontRes = await fetch(match[1]);
    if (!fontRes.ok) {
      throw new Error(`Font fetch failed (${match[1]}): ${fontRes.status}`);
    }
    return fontRes.arrayBuffer();
  }

  const [regular, bold] = await Promise.all([fetchWeight(400), fetchWeight(700)]);
  fontCache = { regular, bold };
  return fontCache;
}

export async function POST(req: NextRequest) {
  try {
    const body: KeepsakeProps = await req.json();

    if (
      !body.homeTeam ||
      !body.awayTeam ||
      body.homeScore === undefined ||
      body.awayScore === undefined ||
      !body.date
    ) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const fonts = await loadFonts();
    const element = React.createElement(KeepsakeCard, body);

    const svg = await satori(element, {
      width: KEEPSAKE_WIDTH,
      height: KEEPSAKE_HEIGHT,
      fonts: [
        { name: 'Space Grotesk', data: fonts.regular, weight: 400, style: 'normal' },
        { name: 'Space Grotesk', data: fonts.bold, weight: 700, style: 'normal' },
      ],
    });

    const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: KEEPSAKE_WIDTH * 2 } });
    const png = new Uint8Array(resvg.render().asPng());

    return new NextResponse(png, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="keepsake-${body.homeTeam.toLowerCase().replace(/\s+/g, '-')}-${body.awayTeam.toLowerCase().replace(/\s+/g, '-')}.png"`,
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (err) {
    console.error('[Keepsake] Render failed:', err);
    return NextResponse.json({ error: 'Failed to generate keepsake' }, { status: 500 });
  }
}
