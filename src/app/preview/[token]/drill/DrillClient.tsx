'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { PALETTE } from '../../_components/MiniAvatar';
import { claimDailyDrill, type DrillClaimResult } from './_actions';
import type { AttributeKey } from '@/server/services/personalization/twin-types';

const ATTR_SHORT: Record<AttributeKey, string> = {
  pace: 'PAC',
  shooting: 'SHO',
  passing: 'PAS',
  dribbling: 'DRI',
  defending: 'DEF',
  physical: 'PHY',
};

export function DrillClient({
  token,
  targetAttribute,
  alreadyDone,
}: {
  token: string;
  targetAttribute: AttributeKey;
  alreadyDone: boolean;
}) {
  const [result, setResult] = useState<DrillClaimResult | null>(null);
  const [isClaiming, startClaim] = useTransition();
  const done = alreadyDone || (result?.ok ?? false);

  const onClaim = () => {
    if (done || isClaiming) return;
    startClaim(async () => {
      const res = await claimDailyDrill({ token, targetAttribute });
      setResult(res);
    });
  };

  if (done) {
    return (
      <div
        style={{
          background: PALETTE.cream,
          border: `2px solid ${PALETTE.sage}`,
          borderLeft: `8px solid ${PALETTE.sage}`,
          padding: '20px 22px',
          marginBottom: 24,
        }}
      >
        <div
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: PALETTE.sage,
            marginBottom: 8,
          }}
        >
          {result?.ok ? 'Drill locked in · come back tomorrow' : 'Done for today · come back tomorrow'}
        </div>
        {result?.ok && (
          <div
            style={{
              fontFamily: 'Antonio, Impact, sans-serif',
              fontSize: 28,
              fontWeight: 800,
              lineHeight: 1.05,
              textTransform: 'uppercase',
              letterSpacing: '-0.01em',
            }}
          >
            <span style={{ color: PALETTE.sage }}>
              {ATTR_SHORT[result.attribute!]} +{result.attributeDelta} · +{result.xpAwarded} XP
            </span>
          </div>
        )}
        <div
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 11,
            lineHeight: 1.5,
            color: PALETTE.inkLight,
            marginTop: 8,
          }}
        >
          Your card updated. New drill at 00:00 UTC.
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClaim}
      disabled={isClaiming}
      style={{
        background: PALETTE.mustard,
        color: PALETTE.ink,
        padding: '20px',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 15,
        fontWeight: 700,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        textAlign: 'center',
        border: `2px solid ${PALETTE.red}`,
        cursor: isClaiming ? 'wait' : 'pointer',
        width: '100%',
        opacity: isClaiming ? 0.7 : 1,
        marginBottom: 24,
      }}
    >
      {isClaiming ? 'Locking in…' : 'Done it for real · claim +1 →'}
    </button>
  );
}
