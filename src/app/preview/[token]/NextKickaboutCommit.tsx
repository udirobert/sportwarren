'use client';

import React, { useState, useTransition } from 'react';
import { PALETTE, TYPE, TRACKING } from '@/components/v3';
import { commitToNextKickabout } from './_actions';

/**
 * Preview-tier sibling of session/[sessionId]/analysis/[playerToken]'s
 * NextGameCommit — same "same time next week?" peak-end capture, scoped
 * through the preview-token model (guest players, not a claimed account).
 * Shown on the returning-visitor dashboard rather than a post-session
 * payoff page, since a pickup game with no live-capture operator won't
 * reliably produce one.
 */
export function NextKickaboutCommit({ token }: { token: string }) {
  const [isPending, startTransition] = useTransition();
  const [committed, setCommitted] = useState(false);
  const [line, setLine] = useState('');
  const [error, setError] = useState('');

  const onCommit = () => {
    startTransition(async () => {
      const res = await commitToNextKickabout(token);
      if (res.ok) {
        setCommitted(true);
        setLine(res.line);
      } else {
        setError(res.error ?? 'Could not commit');
      }
    });
  };

  return (
    <div>
      <p style={{
        fontFamily: TYPE.mono, fontSize: 9, fontWeight: 700,
        letterSpacing: '0.16em', textTransform: 'uppercase',
        color: PALETTE.inkLight, marginBottom: 8,
      }}>
        Same time next week?
      </p>
      {committed ? (
        <p style={{ fontFamily: TYPE.mono, fontSize: 12, lineHeight: 1.55, color: PALETTE.sage, margin: 0 }}>
          {line || "You're in. See you there."}
        </p>
      ) : (
        <>
          <button
            type="button"
            disabled={isPending}
            onClick={onCommit}
            style={{
              fontFamily: TYPE.display, fontSize: 16, fontWeight: 800,
              letterSpacing: '-0.01em', textTransform: 'uppercase',
              color: PALETTE.navy, textDecoration: 'none',
              background: 'transparent', border: 'none', cursor: isPending ? 'default' : 'pointer',
              padding: '10px 0', display: 'flex', alignItems: 'center', gap: 8,
              opacity: isPending ? 0.6 : 1,
            }}
          >
            <span>{isPending ? 'Locking you in…' : "I'm in →"}</span>
            <span style={{
              fontFamily: TYPE.mono, fontSize: 9, fontWeight: 700,
              letterSpacing: TRACKING.cap, color: PALETTE.mustard,
            }}>
              COMMIT
            </span>
          </button>
          {error && (
            <p style={{ fontFamily: TYPE.mono, fontSize: 11, color: PALETTE.red, margin: '4px 0 0' }}>
              {error}
            </p>
          )}
        </>
      )}
    </div>
  );
}
