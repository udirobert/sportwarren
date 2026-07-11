'use client';

/**
 * The voluntary "link WhatsApp" ask, shared by two placements:
 * PreviewFirstContact (pre-game, low-key, secondary to "rate the lads") and
 * PreviewCardDashboard (post-engagement, bundled with "same time next
 * week?"). Same component, different `context` + `promptLine` — the
 * request/confirm plumbing and copy-by-context already lives in
 * phone-link.ts, this just drives the form.
 *
 * No polling for "did they confirm" — that closes over WhatsApp itself (the
 * webhook replies once they text the code back). This just shows the
 * confirm word once sent and trusts the WhatsApp message to finish the loop.
 */

import React, { useState, useTransition } from 'react';
import { PALETTE, TYPE, TRACKING } from '@/components/v3';
import { requestPhoneLink } from './_actions';
import type { PhoneLinkContext } from '@/server/services/personalization/phone-link';

export function PhoneLinkPrompt({
  token,
  context,
  promptLine,
}: {
  token: string;
  context: PhoneLinkContext;
  promptLine: string;
}) {
  const [phone, setPhone] = useState('');
  const [sentCode, setSentCode] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    startTransition(async () => {
      const res = await requestPhoneLink({ token, phone, context });
      if (res.ok && res.code) {
        setSentCode(res.code);
      } else {
        setError(res.error ?? 'Could not send that — try again');
      }
    });
  };

  if (sentCode) {
    return (
      <p
        style={{
          fontFamily: TYPE.mono,
          fontSize: 12,
          lineHeight: 1.6,
          color: PALETTE.sage,
          margin: 0,
        }}
      >
        Sent. Reply <strong>{sentCode}</strong> on WhatsApp to confirm — that's it.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} style={{ margin: 0 }}>
      <p
        style={{
          fontFamily: TYPE.mono,
          fontSize: 12,
          lineHeight: 1.6,
          color: PALETTE.inkLight,
          margin: '0 0 10px',
        }}
      >
        {promptLine}
      </p>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          type="tel"
          inputMode="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Your number"
          disabled={isPending}
          style={{
            flex: 1,
            minWidth: 0,
            fontFamily: TYPE.mono,
            fontSize: 13,
            padding: '10px 12px',
            border: `2px solid ${PALETTE.ink}`,
            background: PALETTE.cream,
            color: PALETTE.ink,
          }}
        />
        <button
          type="submit"
          disabled={isPending || !phone}
          style={{
            fontFamily: TYPE.mono,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: TRACKING.cap,
            textTransform: 'uppercase',
            color: PALETTE.cream,
            background: PALETTE.ink,
            border: 'none',
            padding: '10px 16px',
            cursor: isPending || !phone ? 'default' : 'pointer',
            opacity: isPending || !phone ? 0.6 : 1,
            whiteSpace: 'nowrap',
          }}
        >
          {isPending ? '…' : 'Send'}
        </button>
      </div>
      {error && (
        <p style={{ fontFamily: TYPE.mono, fontSize: 11, color: PALETTE.red, margin: '8px 0 0' }}>
          {error}
        </p>
      )}
    </form>
  );
}
