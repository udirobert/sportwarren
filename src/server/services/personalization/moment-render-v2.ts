/**
 * Moment render service v2 — generative card pipeline.
 *
 * Resolves a per-kind React card component from
 * `src/components/moments/cards` and renders with satori.
 *
 * V3 register (Risograph): Antonio + JetBrains Mono, cream paper,
 * Panini-sticker layout. All cards are data-driven — avatar and squad
 * crest data resolved by `avatar.ts`.
 *
 * V1 register (Space Grotesk) is still loaded for any v1 components
 * that may be used as fallback or rollback.
 */

import React from 'react';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { prisma } from '@/lib/db';
import { getStorageAdapter } from '../storage';
import { resolveCard, CARDS } from '@/components/moments/cards';
import { CARD_WIDTH, CARD_HEIGHT } from '@/components/moments/cards/types';
import {
  resolveAvatarData,
  resolveCrestData,
  resolvePlayerSquadId,
} from './avatar';

export interface BatchResult {
  processed: number;
  byKind: Record<string, number>;
  fallbackCount: number;
  failed: number;
}

interface FontSet {
  groteskRegular: ArrayBuffer;
  groteskBold: ArrayBuffer;
  antonioBold: ArrayBuffer;
  monoBold: ArrayBuffer;
  monoMedium: ArrayBuffer;
}

let fontCache: FontSet | null = null;

async function fetchFont(family: string, weight: number): Promise<ArrayBuffer> {
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
  if (!match) {
    throw new Error(`Could not locate font URL in CSS for ${family} ${weight}`);
  }
  const fontRes = await fetch(match[1]);
  if (!fontRes.ok) {
    throw new Error(`Font fetch failed (${match[1]}): ${fontRes.status}`);
  }
  return fontRes.arrayBuffer();
}

async function loadFonts(): Promise<FontSet> {
  if (fontCache) return fontCache;

  const [groteskRegular, groteskBold, antonioBold, monoBold, monoMedium] =
    await Promise.all([
      fetchFont('Space Grotesk', 400),
      fetchFont('Space Grotesk', 700),
      fetchFont('Antonio', 700),
      fetchFont('JetBrains Mono', 700),
      fetchFont('JetBrains Mono', 500),
    ]);

  fontCache = { groteskRegular, groteskBold, antonioBold, monoBold, monoMedium };
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

interface CardContext {
  avatar?: Awaited<ReturnType<typeof resolveAvatarData>>;
  squad?: Awaited<ReturnType<typeof resolveCrestData>>;
  playerName?: string;
}

async function resolveCardContext(moment: RenderableMoment): Promise<CardContext> {
  if (moment.subjectType === 'player') {
    const squadId = await resolvePlayerSquadId(moment.subjectId);
    const [avatar, squad, user] = await Promise.all([
      resolveAvatarData(moment.subjectId, squadId ?? undefined),
      squadId ? resolveCrestData(squadId) : undefined,
      prisma.user.findUnique({
        where: { id: moment.subjectId },
        select: { name: true },
      }),
    ]);
    return { avatar, squad, playerName: user?.name ?? undefined };
  }

  if (moment.subjectType === 'squad') {
    const squad = await resolveCrestData(moment.subjectId);
    return { squad, playerName: squad.initials };
  }

  return {};
}

async function renderToPng(moment: RenderableMoment): Promise<Buffer> {
  const Card = resolveCard(moment.kind);
  const ctx = await resolveCardContext(moment);

  const element = React.createElement(Card, {
    moment: {
      kind: moment.kind,
      tier: moment.tier,
      label: moment.label,
      detail: moment.detail,
      createdAt: moment.createdAt,
      subjectType: moment.subjectType as 'player' | 'squad',
    },
    avatar: ctx.avatar,
    squad: ctx.squad,
    playerName: ctx.playerName,
  });

  const fonts = await loadFonts();
  const svg = await satori(element, {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    fonts: [
      { name: 'Space Grotesk', data: fonts.groteskRegular, weight: 400, style: 'normal' },
      { name: 'Space Grotesk', data: fonts.groteskBold, weight: 700, style: 'normal' },
      { name: 'Antonio', data: fonts.antonioBold, weight: 700, style: 'normal' },
      { name: 'JetBrains Mono', data: fonts.monoBold, weight: 700, style: 'normal' },
      { name: 'JetBrains Mono', data: fonts.monoMedium, weight: 500, style: 'normal' },
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

export function v2HandledKinds(): string[] {
  return Object.keys(CARDS);
}
