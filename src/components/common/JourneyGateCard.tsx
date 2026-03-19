'use client';

import React from 'react';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { ShieldAlert } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { JourneyGateAction } from '@/lib/journey/action-gates';

interface JourneyGateCardProps {
  eyebrow: string;
  title: string;
  description: string;
  primaryAction?: JourneyGateAction;
  secondaryAction?: JourneyGateAction;
  icon?: LucideIcon;
  className?: string;
  onPrimaryAction?: () => void;
}

export const JourneyGateCard: React.FC<JourneyGateCardProps> = ({
  eyebrow,
  title,
  description,
  primaryAction,
  secondaryAction,
  icon: Icon = ShieldAlert,
  className = '',
  onPrimaryAction,
}) => {
  const renderAction = (
    action: JourneyGateAction | undefined,
    tone: 'primary' | 'secondary',
  ) => {
    if (!action) return null;

    const button = (
      <Button variant={tone === 'primary' ? 'primary' : 'outline'}>
        {action.label}
      </Button>
    );

    if (tone === 'primary' && onPrimaryAction) {
      return (
        <Button key={action.label} onClick={onPrimaryAction}>
          {action.label}
        </Button>
      );
    }

    if (!action.href) {
      return button;
    }

    return (
      <Link key={action.label} href={action.href}>
        {button}
      </Link>
    );
  };

  return (
    <Card className={`py-12 text-center border-emerald-200 bg-gradient-to-br from-emerald-50/80 to-white ${className}`}>
      <div className="mx-auto max-w-2xl">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
          <Icon className="h-7 w-7 text-emerald-600" />
        </div>
        <div className="mb-2 text-[10px] font-black uppercase tracking-[0.22em] text-emerald-700">
          {eyebrow}
        </div>
        <h1 className="mb-3 text-2xl font-bold text-gray-900">{title}</h1>
        <p className="mx-auto mb-6 max-w-xl text-gray-600">
          {description}
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          {renderAction(primaryAction, 'primary')}
          {renderAction(secondaryAction, 'secondary')}
        </div>
      </div>
    </Card>
  );
};
