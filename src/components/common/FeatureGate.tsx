'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, ArrowLeft } from 'lucide-react';
import type { FeatureFlag } from '@/lib/feature-flags';
import { isEnabled } from '@/lib/feature-flags';

interface FeatureGateProps {
  flag: FeatureFlag;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

function DefaultFallback({ flag }: { flag: FeatureFlag }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <Shield className="w-7 h-7 text-gray-400" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
          Coming Soon
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          This feature is not yet available. Check back soon.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-medium text-green-600 hover:text-green-500 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

export function FeatureGate({ flag, children, fallback }: FeatureGateProps) {
  if (!isEnabled(flag)) {
    return <>{fallback ?? <DefaultFallback flag={flag} />}</>;
  }
  return <>{children}</>;
}
