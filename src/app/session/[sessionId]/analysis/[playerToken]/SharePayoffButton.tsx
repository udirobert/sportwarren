'use client';

import React from 'react';
import { PALETTE, TYPE, TRACKING } from '@/components/v3';
import { buildShareLinks } from '@/lib/share/links';

/**
 * One-tap share for the prediction payoff — the viral primitive. The
 * verdict (a resolved curiosity gap) is high-arousal + self-relevant, the
 * two things that drive sharing. WhatsApp / Telegram links carry the
 * verdict text; the shared URL's OG image renders the keepsake card.
 */
export function SharePayoffButton({ shareText, url }: { shareText: string; url: string }) {
  const links = buildShareLinks({ text: shareText, url });

  const base: React.CSSProperties = {
    flex: 1,
    textAlign: 'center',
    padding: '14px 16px',
    fontFamily: TYPE.mono,
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: TRACKING.cap,
    textTransform: 'uppercase',
    textDecoration: 'none',
    border: `2px solid ${PALETTE.ink}`,
  };

  return (
    <div style={{ marginBottom: 24 }}>
      <div
        style={{
          fontFamily: TYPE.mono,
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: TRACKING.capWide,
          textTransform: 'uppercase',
          color: PALETTE.inkLight,
          marginBottom: 8,
        }}
      >
        Settle it in the group chat
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <a href={links.whatsapp} target="_blank" rel="noopener noreferrer"
          style={{ ...base, background: PALETTE.ink, color: PALETTE.cream }}>
          📣 WhatsApp
        </a>
        <a href={links.telegram} target="_blank" rel="noopener noreferrer"
          style={{ ...base, background: 'transparent', color: PALETTE.ink }}>
          Telegram
        </a>
      </div>
    </div>
  );
}
