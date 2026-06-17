/**
 * Moment render service v2 — generative card pipeline.
 *
 * Differences from v1 (`moment-render.ts`):
 *  - Resolves a per-kind React card component from
 *    `src/components/moments/cards` instead of building a single hardcoded
 *    HTML template for every moment.
 *  - Renders with Space Grotesk (the project's actual brand font) rather
 *    than Inter, which `docs/DESIGN_TOKENS.md` explicitly rejects.
 *  - Card components are bound to the same Figma library
 *    (SportWarren — Moment Cards) via Code Connect, so design and code
 *    stay in sync.
 *
 * v1 remains untouched and is still wired to the cron. The cron callsite
 * will be flipped to v2 in a follow-up PR; running both side-by-side lets
 * the demo A/B the output.
 */

import React from 'react';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { prisma } from '@/lib/db';
import { getStorageAdapter } from '../storage';
import { resolveCard, CARDS } from '@/components/moments/cards';
import { CARD_WIDTH, CARD_HEIGHT } from '@/components/moments/cards/types';

export interface BatchResult {
  processed: number;
  byKind: Record<string, number>;
  fallbackCount: number;
  failed: number;
}

let fontCache: { regular: ArrayBuffer; bold: ArrayBuffer } | null = null;

/**
 * Load Space Grotesk from the Google Fonts CSS API.
 *
 * The `User-Agent` is set to an old IE string so the CSS endpoint serves
 * WOFF (not WOFF2) URLs — satori supports WOFF but not WOFF2.
 */
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
      throw new Error(
        `Space Grotesk weight ${weight} CSS fetch failed: ${cssRes.status}`,
      );
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

  const [regular, bold] = await Promise.all([
    fetchWeight(400),
    fetchWeight(700),
  ]);
  fontCache = { regular, bold };
  return fontCache;
}

interface RenderableMoment {
  id: string;
  kind: string;
  tier: string;
  label: string;
  detail: string | null;
  createdAt: Date;
  subjectType: string;
  subjectId: string;
  renderedKey: string | null;
}

async function renderToPng(moment: RenderableMoment): Promise<Buffer> {
  const Card = resolveCard(moment.kind);
  const element = React.createElement(Card, {
    moment: {
      kind: moment.kind,
      tier: moment.tier,
      label: moment.label,
      detail: moment.detail,
      createdAt: moment.createdAt,
      subjectType: moment.subjectType as 'player' | 'squad',
    },
  });

  const fonts = await loadFonts();
  const svg = await satori(element, {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    fonts: [
      { name: 'Space Grotesk', data: fonts.regular, weight: 400, style: 'normal' },
      { name: 'Space Grotesk', data: fonts.bold, weight: 700, style: 'normal' },
    ],
  });

  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: CARD_WIDTH * 2 } });
  return Buffer.from(resvg.render().asPng());
}

export async function renderMoment(momentId: string): Promise<{ renderedKey: string }> {
  const moment = await prisma.moment.findUnique({ where: { id: momentId } });
  if (!moment) throw new Error(`Moment not found: ${momentId}`);
  if (moment.renderedKey) return { renderedKey: moment.renderedKey };

  const png = await renderToPng(moment as RenderableMoment);

  const adapter = getStorageAdapter();
  const stored = await adapter.saveBase64({
    ownerType: moment.subjectType as 'player' | 'squad',
    ownerId: moment.subjectId,
    kind: 'moment-render',
    momentId: moment.id,
    base64Data: png.toString('base64'),
    extension: 'png',
    mimeType: 'image/png',
  });

  await prisma.moment.update({
    where: { id: momentId },
    data: { renderedKey: stored.key, renderedAt: new Date() },
  });

  return { renderedKey: stored.key };
}

export async function renderPendingBatch(limit = 20): Promise<BatchResult> {
  const pending = await prisma.moment.findMany({
    where: { renderedKey: null },
    orderBy: { createdAt: 'asc' },
    take: limit,
  });

  const result: BatchResult = {
    processed: 0,
    byKind: {},
    fallbackCount: 0,
    failed: 0,
  };

  for (const moment of pending) {
    const usedFallback = !(moment.kind in CARDS);
    try {
      await renderMoment(moment.id);
      result.processed++;
      result.byKind[moment.kind] = (result.byKind[moment.kind] ?? 0) + 1;
      if (usedFallback) result.fallbackCount++;
    } catch (e) {
      result.failed++;
      console.error(`[MomentRenderV2] Failed to render ${moment.id}:`, e);
    }
  }
  return result;
}

/**
 * Lightweight introspection helper — exposes which moment kinds the v2
 * pipeline currently has a dedicated card for. Useful for the demo studio
 * and for any feature-flag gate that needs to know whether v2 should
 * handle a given kind or defer to v1.
 */
export function v2HandledKinds(): string[] {
  return Object.keys(CARDS);
}
