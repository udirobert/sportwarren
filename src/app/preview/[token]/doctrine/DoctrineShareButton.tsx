'use client';

/**
 * Doctrine share button — captain → squad WhatsApp.
 *
 * Uses Web Share API when available (mobile Safari + Chrome Android)
 * to attach the PNG directly as a file. WhatsApp inlines it as an
 * image message, no link preview required. Falls back to opening the
 * PNG in a new tab for desktop, where the captain saves + shares manually.
 *
 * Why not the wa.me + og:image pattern (like the player card)? The
 * doctrine doesn't have a meaningful public landing page — it's the
 * captain's strategic read — so we share the artifact directly.
 */

import React, { useState } from 'react';
import { PALETTE, TYPE, TRACKING } from '@/components/v3';

interface DoctrineShareButtonProps {
  token: string;
  squadName: string;
}

export function DoctrineShareButton({ token, squadName }: DoctrineShareButtonProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pngUrl = `/api/og/doctrine/${encodeURIComponent(token)}`;

  async function handleShare() {
    setError(null);
    setBusy(true);

    try {
      const res = await fetch(pngUrl);
      if (!res.ok) throw new Error('Could not render the doctrine PNG');
      const blob = await res.blob();
      const file = new File([blob], `${squadName.toLowerCase().replace(/\s+/g, '-')}-doctrine.png`, {
        type: 'image/png',
      });

      const shareData: ShareData = {
        files: [file],
        text: `${squadName} — the lads' read. Where do you stand?`,
      };

      if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Desktop fallback — open the PNG so the captain can save + share
        window.open(pngUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (e) {
      // User cancellation surfaces as AbortError — silent
      if (e instanceof Error && e.name === 'AbortError') return;
      setError(e instanceof Error ? e.message : 'Share failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ marginBottom: 16 }}>
      <button
        type="button"
        onClick={handleShare}
        disabled={busy}
        style={{
          width: '100%',
          padding: '14px 16px',
          fontFamily: TYPE.display,
          fontSize: 18,
          fontWeight: 800,
          letterSpacing: '-0.01em',
          textTransform: 'uppercase',
          color: PALETTE.ink,
          textDecoration: 'none',
          background: PALETTE.mustard,
          border: `2px solid ${PALETTE.red}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          cursor: busy ? 'wait' : 'pointer',
          opacity: busy ? 0.7 : 1,
        }}
      >
        <span>{busy ? 'Rendering…' : 'Share doctrine to WhatsApp'}</span>
        <span
          style={{
            fontFamily: TYPE.mono,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: TRACKING.cap,
            color: PALETTE.ink,
            opacity: 0.7,
          }}
        >
          PNG →
        </span>
      </button>
      {error && (
        <p
          style={{
            fontFamily: TYPE.mono,
            fontSize: 11,
            color: PALETTE.red,
            marginTop: 8,
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
