'use client';

import React, { useState, useTransition } from 'react';
import { PALETTE } from '../../../../preview/_components/MiniAvatar';
import { broadcastTeams } from '../_actions';

/**
 * Captain-triggered "send teams to the group" button. Sits with the
 * suggested split; recomputes + pushes to the linked Telegram group via
 * the broadcastTeams server action. The delightful build-up beat, using
 * the real confirmed players the captain already ticked.
 */
export function BroadcastTeamsButton({
  token,
  playersPerSide,
  confirmedUserIds,
}: {
  token: string;
  playersPerSide: number;
  confirmedUserIds: string[];
}) {
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<'idle' | 'sent' | 'error'>('idle');
  const [detail, setDetail] = useState<string>('');

  const onSend = () => {
    startTransition(async () => {
      const res = await broadcastTeams(token, playersPerSide, confirmedUserIds);
      if (res.ok) {
        setState('sent');
        setDetail(
          res.sent && res.sent > 0
            ? `Sent to the group chat ✓`
            : 'No linked Telegram group yet — link one to drop teams there.',
        );
      } else {
        setState('error');
        setDetail(res.error ?? 'Could not send');
      }
    });
  };

  const sent = state === 'sent' && detail.startsWith('Sent');

  return (
    <div style={{ marginTop: 20 }}>
      <button
        type="button"
        disabled={isPending || sent}
        onClick={onSend}
        style={{
          background: sent ? PALETTE.sage : PALETTE.navy,
          color: PALETTE.cream,
          padding: '16px 20px',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          textAlign: 'center',
          border: 'none',
          cursor: isPending || sent ? 'default' : 'pointer',
          width: '100%',
          opacity: isPending ? 0.7 : 1,
        }}
      >
        {isPending ? 'Sending…' : sent ? 'Sent to the group ✓' : '📣 Send teams to the group'}
      </button>
      {state !== 'idle' && !sent && (
        <p
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 11,
            lineHeight: 1.5,
            color: state === 'error' ? PALETTE.red : PALETTE.inkLight,
            marginTop: 8,
            textAlign: 'center',
          }}
        >
          {detail}
        </p>
      )}
    </div>
  );
}
