/**
 * Moment render service — generates shareable PNG cards from moment rows.
 *
 * Uses satori (HTML→SVG) and @resvg/resvg-js (SVG→PNG) to produce a
 * 600×400 PNG for each moment. The rendered file is stored via the storage
 * adapter (`kind: 'moment-render'`) and the `renderedKey` + `renderedAt`
 * are written back to the Moment row.
 *
 * The font is fetched once from Google Fonts CDN and cached in memory for
 * the lifetime of the process.
 */

import satori from 'satori';
import { html } from 'satori-html';
import { Resvg } from '@resvg/resvg-js';
import { prisma } from '@/lib/db';
import { getStorageAdapter } from '../storage';

const WIDTH = 600;
const HEIGHT = 400;

let fontCache: { regular: ArrayBuffer; bold: ArrayBuffer } | null = null;

/**
 * Load Inter (400 + 700) from the Google Fonts CSS API.
 *
 * The previous implementation pinned a single hardcoded gstatic woff URL,
 * which Google has since removed (it now 404s). The 404 HTML body was then
 * handed to satori as font data, producing "Unsupported OpenType signature
 * <!DO" and a 500 from the cron. Resolving the URL through the CSS API at
 * runtime (as v2 does) avoids that rot. The IE user-agent forces the WOFF
 * (not WOFF2) variant, which satori supports.
 */
async function loadFonts(): Promise<{ regular: ArrayBuffer; bold: ArrayBuffer }> {
  if (fontCache) return fontCache;

  const ieUA =
    'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0)';

  async function fetchWeight(weight: number): Promise<ArrayBuffer> {
    const cssRes = await fetch(
      `https://fonts.googleapis.com/css2?family=Inter:wght@${weight}`,
      { headers: { 'User-Agent': ieUA } },
    );
    if (!cssRes.ok) {
      throw new Error(`Inter weight ${weight} CSS fetch failed: ${cssRes.status}`);
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

const TIER_COLORS: Record<string, string> = {
  standard: '#6b7280',
  premium: '#f59e0b',
  streak_reward: '#10b981',
  partner: '#8b5cf6',
  internal: '#3b82f6',
};

export function buildHtml(moment: { kind: string; tier: string; label: string; detail: string | null; createdAt: Date; subjectType: string }): string {
  const tierColor = TIER_COLORS[moment.tier] ?? '#6b7280';
  const date = moment.createdAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  return `
    <div style="display:flex;flex-direction:column;width:${WIDTH}px;height:${HEIGHT}px;background:linear-gradient(135deg,#0f172a,#1e293b);border-radius:16px;padding:32px;font-family:Inter,sans-serif;color:#f8fafc;">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
        <div style="display:flex;align-items:center;gap:6px;background:${tierColor}22;border:1px solid ${tierColor};border-radius:999px;padding:4px 12px;">
          <span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:${tierColor};">${moment.tier}</span>
        </div>
        <span style="font-size:12px;color:#94a3b8;">${moment.kind.replace(/_/g, ' ')}</span>
      </div>
      <div style="font-size:28px;font-weight:800;line-height:1.2;margin-bottom:12px;">${escapeHtml(moment.label)}</div>
      ${moment.detail ? `<div style="font-size:15px;color:#cbd5e1;line-height:1.5;flex:1;">${escapeHtml(moment.detail)}</div>` : '<div style="flex:1;"></div>'}
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:auto;padding-top:16px;border-top:1px solid #334155;">
        <span style="font-size:12px;font-weight:600;color:#64748b;">SportWarren</span>
        <span style="font-size:12px;color:#64748b;">${date}</span>
      </div>
    </div>
  `;
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export async function renderMoment(momentId: string): Promise<{ renderedKey: string }> {
  const moment = await prisma.moment.findUnique({ where: { id: momentId } });
  if (!moment) throw new Error(`Moment not found: ${momentId}`);
  if (moment.renderedKey) return { renderedKey: moment.renderedKey };

  const fonts = await loadFonts();
  // satori-html returns its own VNode type; satori's parameter is typed as
  // ReactNode. They are structurally compatible at runtime, so cast.
  const markup = html(buildHtml(moment)) as Parameters<typeof satori>[0];

  const svg = await satori(markup, {
    width: WIDTH,
    height: HEIGHT,
    fonts: [
      { name: 'Inter', data: fonts.regular, weight: 400, style: 'normal' },
      { name: 'Inter', data: fonts.bold, weight: 700, style: 'normal' },
    ],
  });

  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: WIDTH * 2 } });
  const png = resvg.render().asPng();

  const adapter = getStorageAdapter();
  const stored = await adapter.saveBase64({
    ownerType: moment.subjectType as 'player' | 'squad',
    ownerId: moment.subjectId,
    kind: 'moment-render',
    momentId: moment.id,
    base64Data: Buffer.from(png).toString('base64'),
    extension: 'png',
    mimeType: 'image/png',
  });

  await prisma.moment.update({
    where: { id: momentId },
    data: { renderedKey: stored.key, renderedAt: new Date() },
  });

  return { renderedKey: stored.key };
}

export async function renderPendingBatch(limit = 20): Promise<number> {
  const pending = await prisma.moment.findMany({
    where: { renderedKey: null },
    orderBy: { createdAt: 'asc' },
    take: limit,
  });

  let processed = 0;
  for (const moment of pending) {
    try {
      await renderMoment(moment.id);
      processed++;
    } catch (e) {
      console.error(`[MomentRender] Failed to render ${moment.id}:`, e);
    }
  }
  return processed;
}
