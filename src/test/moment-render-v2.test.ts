/**
 * Smoke tests for the v2 moment-card pipeline.
 *
 * For each kind registered in CARDS — plus the DefaultCard fallback path —
 * construct a synthetic Moment and render it through the same satori +
 * resvg stack the cron uses. Assert the PNG is non-trivial.
 *
 * Catches:
 *   - satori 0.26 rules (`display: flex` on every wrapping div, no
 *     ambiguous text nodes) at PR time rather than first deploy
 *   - missing font weights / unsupported style strings
 *   - regressions in any card component that would otherwise only
 *     surface in production cron logs
 *
 * The first test pays a one-time network cost to fetch the Space Grotesk
 * font from Google Fonts; subsequent tests reuse the in-process cache in
 * `moment-render-v2.ts`. If you're running this offline or behind a
 * firewall, the suite will skip gracefully rather than fail.
 */

import React from 'react';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { describe, it, expect, beforeAll } from 'vitest';

import {
  CARDS,
  FALLBACK_CARD,
  resolveCard,
} from '@/components/moments/cards';
import {
  CARD_WIDTH,
  CARD_HEIGHT,
  type MomentForRender,
} from '@/components/moments/cards/types';

const FONT_FAMILY = 'Space Grotesk';
const IE_UA =
  'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0)';

type FontData = { regular: ArrayBuffer; bold: ArrayBuffer } | null;
let fonts: FontData = null;
let networkAvailable = true;

async function fetchWeight(weight: number): Promise<ArrayBuffer> {
  const cssRes = await fetch(
    `https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@${weight}`,
    { headers: { 'User-Agent': IE_UA } },
  );
  if (!cssRes.ok) {
    throw new Error(`Font CSS fetch failed: ${cssRes.status}`);
  }
  const css = await cssRes.text();
  const match = css.match(/src:\s*url\((https:[^)]+)\)/);
  if (!match) throw new Error(`No font URL in CSS for weight ${weight}`);
  const fontRes = await fetch(match[1]);
  if (!fontRes.ok) throw new Error(`Font fetch failed: ${fontRes.status}`);
  return fontRes.arrayBuffer();
}

beforeAll(async () => {
  try {
    const [regular, bold] = await Promise.all([
      fetchWeight(400),
      fetchWeight(700),
    ]);
    fonts = { regular, bold };
  } catch (err) {
    console.warn(
      '[moment-render-v2.test] Font fetch failed; tests requiring real rendering will be skipped:',
      err,
    );
    networkAvailable = false;
  }
}, 30_000);

function syntheticMoment(kind: string, tier = 'standard'): MomentForRender {
  // Label intentionally numeric-heavy so `level_up`'s numeral parser exercises.
  // season_end gets a multi-line detail so SeasonEndCard's splitDetail runs.
  const labels: Record<string, string> = {
    record_broken: 'MOST GOALS IN A SEASON',
    level_up: 'Level 13',
    season_end: "Spring '26",
  };
  const details: Record<string, string> = {
    season_end:
      'Brockenhurst Rovers\n14 played · 9 won · 3 drawn · 2 lost\nTop scorer: Marcus Tate — 28 goals\nComeback of the season: 3-2 vs. Ballygally, Apr 12',
  };
  return {
    kind,
    tier,
    label: labels[kind] ?? `Sample ${kind} moment`,
    detail: details[kind] ?? `Detail copy for kind=${kind} tier=${tier}`,
    createdAt: new Date('2026-06-15T15:30:00Z'),
    subjectType: 'squad',
  };
}

async function renderToPng(moment: MomentForRender): Promise<Buffer> {
  if (!fonts) throw new Error('Fonts not available');
  const Card = resolveCard(moment.kind);
  const element = React.createElement(Card, { moment });
  const svg = await satori(element, {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    fonts: [
      { name: FONT_FAMILY, data: fonts.regular, weight: 400, style: 'normal' },
      { name: FONT_FAMILY, data: fonts.bold, weight: 700, style: 'normal' },
    ],
  });
  return Buffer.from(
    new Resvg(svg, { fitTo: { mode: 'width', value: CARD_WIDTH * 2 } })
      .render()
      .asPng(),
  );
}

describe('moment-render v2 — registry', () => {
  it('CARDS registry contains the kinds the manifest claims', () => {
    expect(Object.keys(CARDS).sort()).toEqual([
      'level_up',
      'record_broken',
      'season_end',
    ]);
  });

  it('resolveCard returns the registered card for known kinds', () => {
    expect(resolveCard('record_broken')).toBe(CARDS.record_broken);
    expect(resolveCard('level_up')).toBe(CARDS.level_up);
  });

  it('resolveCard falls back to FALLBACK_CARD for unknown kinds', () => {
    expect(resolveCard('not_a_real_kind')).toBe(FALLBACK_CARD);
    expect(resolveCard('')).toBe(FALLBACK_CARD);
  });
});

describe('moment-render v2 — card components render via satori', () => {
  // Every kind registered in CARDS, all five tier variants, plus the
  // fallback path via an unmapped kind.
  const tierMatrix: Array<MomentForRender['tier']> = [
    'standard',
    'premium',
    'streak_reward',
    'partner',
    'internal',
  ];

  for (const kind of Object.keys(CARDS)) {
    for (const tier of tierMatrix) {
      it(`renders ${kind} @ ${tier} to a non-empty PNG`, async () => {
        if (!networkAvailable) return;
        const png = await renderToPng(syntheticMoment(kind, tier));
        expect(png.length).toBeGreaterThan(1000);
        // PNG magic bytes
        expect(png[0]).toBe(0x89);
        expect(png[1]).toBe(0x50);
        expect(png[2]).toBe(0x4e);
        expect(png[3]).toBe(0x47);
      }, 15_000);
    }
  }

  it('renders an unmapped kind through DefaultCard', async () => {
    if (!networkAvailable) return;
    const png = await renderToPng(syntheticMoment('coaching_hired', 'premium'));
    expect(png.length).toBeGreaterThan(1000);
    expect(png[0]).toBe(0x89);
  }, 15_000);
});
