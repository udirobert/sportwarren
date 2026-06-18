/**
 * Keepsake render — generates a match result PNG using satori/resvg.
 *
 * Reuses the font loading and rendering pipeline from moment-render.ts
 * so the keepsake has the same pristine quality as moment cards.
 *
 * POST /api/keepsake/{matchId}
 * Body: { homeTeam, awayTeam, homeScore, awayScore, date }
 * Returns: PNG image (Content-Type: image/png)
 */

import { NextRequest, NextResponse } from 'next/server';
import satori from 'satori';
import { html } from 'satori-html';
import { Resvg } from '@resvg/resvg-js';

const WIDTH = 600;
const HEIGHT = 400;

let fontCache: { regular: ArrayBuffer; bold: ArrayBuffer } | null = null;

/**
 * Load Inter (400 + 700) from the Google Fonts CSS API.
 *
 * The previous implementation pinned a single hardcoded gstatic woff URL,
 * which Google has since removed (it now 404s). The 404 HTML body was then
 * handed to satori as font data, producing "Unsupported OpenType signature
 * <!DO" and a 500. Resolving the URL through the CSS API at runtime avoids
 * that rot. The IE user-agent forces the WOFF (not WOFF2) variant, which
 * satori supports.
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

interface KeepsakeRequest {
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  date: string;
  /** Optional MOTM highlight */
  motmName?: string;
  motmConsensus?: string;
}

function buildHtml(body: KeepsakeRequest): string {
  const isWin = body.homeScore > body.awayScore;
  const isDraw = body.homeScore === body.awayScore;
  const resultLabel = isWin ? 'VICTORY' : isDraw ? 'DRAW' : 'MATCH';
  const accentColor = isWin ? '#10b981' : isDraw ? '#f59e0b' : '#f43f5e';

  return `
    <div style="display:flex;flex-direction:column;width:${WIDTH}px;height:${HEIGHT}px;background:linear-gradient(135deg,#0f172a,#1e293b);border-radius:16px;padding:32px;font-family:Inter,sans-serif;color:#f8fafc;">
      <!-- Result label + date -->
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
        <span style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:0.25em;color:${accentColor};">${resultLabel}</span>
        <span style="font-size:10px;color:#64748b;font-family:monospace;">${body.date}</span>
      </div>

      <!-- Score -->
      <div style="display:flex;align-items:center;justify-content:center;gap:24px;flex:1;">
        <div style="display:flex;text-align:right;flex:1;">
          <span style="font-size:13px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em;">${escapeHtml(body.homeTeam)}</span>
        </div>
        <div style="display:flex;align-items:baseline;gap:12px;">
          <span style="font-size:64px;font-weight:900;color:#ffffff;letter-spacing:-0.02em;">${body.homeScore}</span>
          <span style="font-size:20px;color:#475569;font-weight:700;">–</span>
          <span style="font-size:64px;font-weight:900;color:#ffffff;letter-spacing:-0.02em;">${body.awayScore}</span>
        </div>
        <div style="display:flex;text-align:left;flex:1;">
          <span style="font-size:13px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em;">${escapeHtml(body.awayTeam)}</span>
        </div>
      </div>

      <!-- MOTM highlight -->
      ${body.motmName ? `
      <div style="display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:12px;">
        <span style="font-size:10px;font-weight:700;color:${accentColor};text-transform:uppercase;letter-spacing:0.1em;">★</span>
        <span style="font-size:12px;font-weight:800;color:#f8fafc;text-transform:uppercase;">${escapeHtml(body.motmName)}</span>
        ${body.motmConsensus ? `<span style="font-size:9px;color:#64748b;font-weight:600;">${body.motmConsensus} consensus</span>` : ''}
      </div>
      ` : ''}

      <!-- footer -->
      <div style="display:flex;justify-content:space-between;align-items:center;padding-top:16px;border-top:1px solid #1e293b;">
        <span style="font-size:10px;font-weight:800;letter-spacing:0.3em;color:#475569;text-transform:uppercase;">SportWarren</span>
        <span style="font-size:9px;color:#475569;font-style:italic;">Every match leaves a mark</span>
      </div>
    </div>
  `;
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export async function POST(req: NextRequest) {
  try {
    const body: KeepsakeRequest = await req.json();

    if (!body.homeTeam || !body.awayTeam || body.homeScore === undefined || body.awayScore === undefined || !body.date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const fonts = await loadFonts();
    // satori-html returns its own VNode type; satori's parameter is typed as
    // ReactNode. They are structurally compatible at runtime, so cast.
    const markup = html(buildHtml(body)) as Parameters<typeof satori>[0];

    const svg = await satori(markup, {
      width: WIDTH,
      height: HEIGHT,
      fonts: [
        { name: 'Inter', data: fonts.regular, weight: 400, style: 'normal' },
        { name: 'Inter', data: fonts.bold, weight: 700, style: 'normal' },
      ],
    });

    const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: WIDTH * 2 } });
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
