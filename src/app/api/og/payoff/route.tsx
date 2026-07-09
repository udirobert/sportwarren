import { ImageResponse } from 'next/og';
import { prisma } from '@/lib/db';
import { resolveSessionPayoff } from '@/server/services/personalization/session-payoff';

export const runtime = 'nodejs';

// V3 archival palette (cream paper + ink + accents) — the RECORD register.
const CREAM = '#f0e8d6';
const INK = '#0a0a0a';
const SAGE = '#5b7553';
const RED = '#c91022';
const MUSTARD = '#d4a437';
const NAVY = '#1c3a5e';

function accentFor(result: 'answered' | 'unproven' | 'open'): string {
  if (result === 'answered') return SAGE;
  if (result === 'unproven') return MUSTARD;
  return NAVY;
}

/**
 * Shareable payoff card — the viral primitive on top of the prediction
 * payoff loop. A resolved curiosity gap ("we said X → here's what
 * happened") rendered as a V3 keepsake image, previewed in WhatsApp when
 * the analysis link is shared.
 *
 *   /api/og/payoff?session=<sessionId>&token=<playerToken>
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('session');
  const token = searchParams.get('token');

  if (!sessionId || !token) {
    return new Response('session and token required', { status: 400 });
  }

  const payoff = await resolveSessionPayoff(prisma, sessionId, token);
  if (!payoff) {
    return new Response('Not found', { status: 404 });
  }

  const accent = accentFor(payoff.verdict.result);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: CREAM,
          color: INK,
          fontFamily: 'sans-serif',
          padding: '64px 72px',
          justifyContent: 'space-between',
        }}
      >
        {/* Ribbon */}
        <div style={{ display: 'flex', gap: '6px' }}>
          <div style={{ width: '44px', height: '6px', background: RED }} />
          <div style={{ width: '44px', height: '6px', background: NAVY }} />
          <div style={{ width: '44px', height: '6px', background: SAGE }} />
          <div style={{ width: '44px', height: '6px', background: MUSTARD }} />
        </div>

        {/* Header row: identity + overall */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '4px', color: NAVY, textTransform: 'uppercase' }}>
              SportWarren · Our call, settled
            </div>
            <div style={{ fontSize: '40px', fontWeight: 800, marginTop: '10px' }}>
              {payoff.name}{payoff.position ? ` · ${payoff.position}` : ''}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: '96px', fontWeight: 800, lineHeight: '1', color: accent }}>
              {payoff.overall}
            </div>
            <div style={{ fontSize: '16px', fontWeight: 700, letterSpacing: '3px', color: INK, textTransform: 'uppercase' }}>
              Overall
            </div>
          </div>
        </div>

        {/* Verdict */}
        <div style={{ display: 'flex', flexDirection: 'column', borderLeft: `10px solid ${accent}`, paddingLeft: '28px' }}>
          <div style={{ fontSize: '72px', fontWeight: 800, lineHeight: '1.02', textTransform: 'uppercase', color: INK }}>
            {payoff.verdict.headline}
          </div>
          <div style={{ fontSize: '30px', lineHeight: '1.4', color: INK, marginTop: '18px', maxWidth: '900px' }}>
            {payoff.verdict.line}
          </div>
        </div>

        {/* Footer stat strip */}
        <div style={{ display: 'flex', gap: '20px' }}>
          <div style={{ display: 'flex', fontSize: '24px', fontWeight: 700, color: INK, background: 'rgba(0,0,0,0.05)', padding: '10px 20px' }}>
            {payoff.goals} goals
          </div>
          <div style={{ display: 'flex', fontSize: '24px', fontWeight: 700, color: INK, background: 'rgba(0,0,0,0.05)', padding: '10px 20px' }}>
            {payoff.assists} assists
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
