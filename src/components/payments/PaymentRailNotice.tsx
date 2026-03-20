"use client";

import React from 'react';
import { Cpu, ShieldCheck } from 'lucide-react';
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
  const badgeLabel = enabled
    ? `${mode || 'live'} rail`
    : mode === 'unconfigured'
      ? 'unconfigured'
      : 'manual ledger';
  const footer = enabled
    ? `${assetSymbol} is reserved and settled through Yellow when both sides can complete the session.`
    : mode === 'unconfigured'
      ? 'Yellow is turned on in product logic but the deployment is missing required configuration, so settlement stays on the in-app ledger.'
      : 'The app will continue with the standard in-app ledger when the Yellow rail is unavailable.';

  return (
    <Card className={enabled ? 'border-blue-200 bg-blue-50/70' : 'border-gray-200 bg-gray-50/80'}>
      <div className="flex items-start gap-3">
        <div className={`rounded-xl p-2 ${enabled ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600'}`}>
          {enabled ? <Cpu className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${
              enabled ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-700'
            }`}>
              {badgeLabel}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-600">{body}</p>
          <p className="mt-2 text-xs text-gray-500">{footer}</p>
        </div>
      </div>
    </Card>
  );
};
