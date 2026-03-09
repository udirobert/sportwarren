"use client";

import { useMemo } from 'react';

export function useYellowSession(sessionId?: string | null) {
  return useMemo(() => {
    const enabled = process.env.NEXT_PUBLIC_YELLOW_ENABLED === 'true';
    const assetSymbol = process.env.NEXT_PUBLIC_YELLOW_ASSET_SYMBOL || 'USDC';

    return {
      enabled,
      assetSymbol,
      sessionId: sessionId ?? null,
      status: !enabled ? 'disabled' : sessionId ? 'connected' : 'ready',
    } as const;
  }, [sessionId]);
}
