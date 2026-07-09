'use client';

import React, { useState, useTransition } from 'react';
import { PALETTE, TYPE, TRACKING } from '@/components/v3';
import { commitToNextSession } from './_actions';

/**
 * Peak-end "next game" capture. Placed right after the payoff verdict —
 * the endorphin peak — because that's when willingness to commit is
 * highest. Moving the ask from mid-week (discounted) to post-session is
 * the whole point: capture the yes while it exists.
 *
 * See product-calibration.md → behavioural-design doctrine (peak-end +
 * commitment/consistency + honest loss-framing of the group's ritual).
 */
export function NextGameCommit({
  playerToken,
  sessionId,
}: {
  playerToken: string;
  sessionId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [committed, setCommitted] = useState(false);
  const [line, setLine] = useState<string>('');
  const [error, setError] = useState<string>('');

  const onCommit = () => {
    startTransition(async () => {
      const res = await commitToNextSession(playerToken, sessionId);
      if (res.ok) {
        setCommitted(true);
        setLine(res.line);
      } else {
        setError(res.error ?? 'Could not commit');
      }
    });
  };

  return (
    <div
      style={{
        marginBottom: 24,
        padding: '18px 20px',
        background: committed ? PALETTE.sage : PALETTE.cream,
        border: `2px solid ${committed ? PALETTE.sage : PALETTE.ink}`,
        borderLeft: `8px solid ${committed ? PALETTE.sage : PALETTE.mustard}`,
      }}
    >
      <div
        style={{
          fontFamily: TYPE.mono,
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: TRACKING.capWide,
          textTransform: 'uppercase',
          color: committed ? PALETTE.cream : PALETTE.mustard,
          marginBottom: 6,
        }}
      >
        While you're buzzing
      </div>
      <div
        style={{
          fontFamily: TYPE.display,
          fontSize: 26,
          fontWeight: 800,
          lineHeight: 1.05,
          textTransform: 'uppercase',
          letterSpacing: '-0.01em',
          color: committed ? PALETTE.cream : PALETTE.ink,
          marginBottom: 12,
        }}
      >
        Same time next week?
      </div>

      {committed ? (
        <div
          style={{
            fontFamily: TYPE.mono,
            fontSize: 13,
            lineHeight: 1.5,
            color: PALETTE.cream,
          }}
        >
          {line || "You're in. See you there."}
        </div>
      ) : (
        <>
          <button
            type="button"
            disabled={isPending}
            onClick={onCommit}
            style={{
              width: '100%',
              background: PALETTE.ink,
              color: PALETTE.cream,
              padding: '15px 18px',
              fontFamily: TYPE.mono,
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: TRACKING.cap,
              textTransform: 'uppercase',
              border: 'none',
              cursor: isPending ? 'default' : 'pointer',
              opacity: isPending ? 0.7 : 1,
            }}
          >
            {isPending ? 'Locking you in…' : "I'm in →"}
          </button>
          {error && (
            <p style={{ fontFamily: TYPE.mono, fontSize: 11, color: PALETTE.red, marginTop: 8 }}>{error}</p>
          )}
          <p
            style={{
              fontFamily: TYPE.mono,
              fontSize: 10,
              lineHeight: 1.5,
              color: PALETTE.inkLight,
              marginTop: 8,
            }}
          >
            You can change it later — but locking in now is how the game
            actually happens.
          </p>
        </>
      )}
    </div>
  );
}
