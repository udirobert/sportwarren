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
import { Resvg } from '@resvg/resvg-js';

const WIDTH = 600;
const HEIGHT = 400;

let fontCache: ArrayBuffer | null = null;

async function loadFont(): Promise<ArrayBuffer> {
  if (fontCache) return fontCache;
  const url =
    'https://fonts.gstatic.com/s/inter/v18/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa2ZL7W0Q5n-wU.woff';
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Font fetch failed: ${res.status}`);
  fontCache = await res.arrayBuffer();
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
        <div style="text-align:right;flex:1;">
          <span style="font-size:13px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em;">${escapeHtml(body.homeTeam)}</span>
        </div>
        <div style="display:flex;align-items:baseline;gap:12px;">
          <span style="font-size:64px;font-weight:900;color:#ffffff;letter-spacing:-0.02em;">${body.homeScore}</span>
          <span style="font-size:20px;color:#475569;font-weight:700;">–</span>
          <span style="font-size:64px;font-weight:900;color:#ffffff;letter-spacing:-0.02em;">${body.awayScore}</span>
        </div>
        <div style="text-align:left;flex:1;">
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

    const font = await loadFont();
    const html = buildHtml(body);

    const svg = await satori(html, {
      width: WIDTH,
      height: HEIGHT,
      fonts: [{ name: 'Inter', data: font, weight: 400, style: 'normal' }],
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
