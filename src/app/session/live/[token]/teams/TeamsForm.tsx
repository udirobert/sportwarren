'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { PALETTE } from '../../../../preview/_components/MiniAvatar';

interface Member {
  userId: string;
  name: string;
  position: string | null;
}

export function TeamsForm({
  token,
  allMembers,
  initialConfirmedIds,
  initialFormat,
}: {
  token: string;
  allMembers: Member[];
  initialConfirmedIds: string[];
  initialFormat: number | null;
}) {
  const router = useRouter();
  const [confirmed, setConfirmed] = useState<Set<string>>(new Set(initialConfirmedIds));
  const [format, setFormat] = useState<number | null>(initialFormat);
  const [isPending, startTransition] = useTransition();

  const toggle = (userId: string) => {
    setConfirmed((curr) => {
      const next = new Set(curr);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const onSuggest = () => {
    if (!format) return;
    const confirmedParam = Array.from(confirmed).join(',');
    startTransition(() => {
      router.push(
        `/session/live/${encodeURIComponent(token)}/teams?format=${format}&confirmed=${confirmedParam}`,
      );
    });
  };

  return (
    <div>
      {/* Format picker */}
      <div
        style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: PALETTE.navy,
          marginBottom: 10,
        }}
      >
        Format · players per side
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {[5, 6, 7, 8].map((n) => {
          const isActive = format === n;
          return (
            <button
              key={n}
              type="button"
              onClick={() => setFormat(n)}
              style={{
                background: isActive ? PALETTE.ink : 'transparent',
                color: isActive ? PALETTE.cream : PALETTE.ink,
                padding: '10px 18px',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: '0.1em',
                border: `2px solid ${PALETTE.ink}`,
                cursor: 'pointer',
                minWidth: 60,
              }}
            >
              {n}v{n}
            </button>
          );
        })}
      </div>

      {/* Confirmed picker */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: 10,
        }}
      >
        <span
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: PALETTE.navy,
          }}
        >
          Who's here · tick the lads
        </span>
        <span
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.14em',
            color: PALETTE.inkLight,
          }}
        >
          {confirmed.size} of {allMembers.length}
        </span>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: 8,
          marginBottom: 24,
        }}
      >
        {allMembers.map((m) => {
          const active = confirmed.has(m.userId);
          return (
            <button
              key={m.userId}
              type="button"
              onClick={() => toggle(m.userId)}
              style={{
                background: active ? PALETTE.sage : 'transparent',
                color: active ? PALETTE.cream : PALETTE.ink,
                padding: '10px 12px',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '0.08em',
                border: `2px solid ${active ? PALETTE.sage : PALETTE.inkLight}`,
                cursor: 'pointer',
                textAlign: 'left',
                opacity: active ? 1 : 0.7,
              }}
            >
              <div>{m.name}</div>
              <div
                style={{
                  fontSize: 9,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  opacity: 0.75,
                  marginTop: 2,
                }}
              >
                {m.position ?? '—'}
              </div>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        disabled={!format || confirmed.size < 4 || isPending}
        onClick={onSuggest}
        style={{
          background: format && confirmed.size >= 4 ? PALETTE.mustard : 'rgba(0,0,0,0.06)',
          color: PALETTE.ink,
          padding: '18px 20px',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 15,
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          textAlign: 'center',
          border: `2px solid ${format && confirmed.size >= 4 ? PALETTE.red : PALETTE.inkLight}`,
          cursor: format && confirmed.size >= 4 && !isPending ? 'pointer' : 'not-allowed',
          width: '100%',
          opacity: isPending ? 0.7 : 1,
        }}
      >
        {isPending
          ? 'Calculating…'
          : !format
          ? 'Pick a format first'
          : confirmed.size < 4
          ? `Need 4 confirmed (you have ${confirmed.size})`
          : 'Suggest balanced teams →'}
      </button>
    </div>
  );
}
