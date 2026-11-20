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
  title?: string;
  description?: string;
  href?: string;
  actionLabel?: string;
}

function DefaultFallback({
  title = 'Coming Soon',
  description = 'This feature is not yet available. Check back soon.',
  href = '/dashboard',
  actionLabel = 'Back to Dashboard',
}: Pick<FeatureGateProps, 'title' | 'description' | 'href' | 'actionLabel'>) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <Shield className="w-7 h-7 text-gray-400" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
          {title}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          {description}
        </p>
        <Link
          href={href}
          className="inline-flex items-center gap-2 text-sm font-medium text-green-600 hover:text-green-500 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {actionLabel}
        </Link>
      </div>
    </div>
  );
}

export function FeatureGate({ flag, children, fallback, title, description, href, actionLabel }: FeatureGateProps) {
  if (!isEnabled(flag)) {
    return <>{fallback ?? <DefaultFallback title={title} description={description} href={href} actionLabel={actionLabel} />}</>;
  }
  return <>{children}</>;
}
