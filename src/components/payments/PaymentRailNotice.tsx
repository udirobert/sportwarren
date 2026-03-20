"use client";

import React from 'react';
import { ShieldCheck, Zap } from 'lucide-react';
import { Card } from '@/components/ui/Card';

interface PaymentRailNoticeProps {
  title: string;
  assetSymbol: string;
  enabled: boolean;
  mode?: string | null;
  body: string;
}

export const PaymentRailNotice: React.FC<PaymentRailNoticeProps> = ({
  title,
  assetSymbol,
  enabled,
  mode,
  body,
}) => {
  const normalizedMode = (mode || 'nitrolite').replace(/[_-]/g, ' ');
  const badgeLabel = enabled
    ? `${normalizedMode} rail`
    : mode === 'unconfigured'
      ? 'unconfigured'
      : 'manual ledger';
  const highlights = enabled
    ? ['Off-chain first', 'Fewer wallet prompts', 'Final closeout']
    : mode === 'unconfigured'
      ? ['Yellow unavailable', 'Config missing', 'Ledger fallback']
      : ['Manual ledger', 'No live session'];
  const footer = enabled
    ? `${assetSymbol} moves inside a Yellow session first. Escrow changes and balance updates are coordinated off-chain, then finalized when the session closes.`
    : mode === 'unconfigured'
      ? 'Yellow is turned on in product logic but this deployment is missing required configuration, so settlement stays on the in-app ledger.'
      : 'The app continues with the standard in-app ledger when the Yellow rail is unavailable.';

  return (
    <Card className={enabled ? 'border-yellow-200 bg-yellow-50/50' : 'border-gray-200 bg-gray-50/80'}>
      <div className="flex items-start gap-3">
        <div className={`rounded-xl p-2 ${enabled ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-200 text-gray-600'}`}>
          {enabled ? <Zap className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${
              enabled ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-700'
            }`}>
              {badgeLabel}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-600">{body}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {highlights.map((highlight) => (
              <span
                key={highlight}
                className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${
                  enabled
                    ? 'bg-white/80 text-yellow-700 ring-1 ring-yellow-200'
                    : 'bg-white/90 text-gray-600 ring-1 ring-gray-200'
                }`}
              >
                {highlight}
              </span>
            ))}
          </div>
          <p className="mt-2 text-xs text-gray-500">{footer}</p>
        </div>
      </div>
    </Card>
  );
};
