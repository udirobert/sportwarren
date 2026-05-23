"use client";

import React from 'react';
import Link from 'next/link';
import { Zap, ArrowRight, ExternalLink, Plus, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { OnboardingChecklist } from '@/components/onboarding/OnboardingChecklist';
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow';
import { buildTelegramDeepLink } from '@/lib/telegram/deep-links';
import type { DashboardEntryAction } from '@/lib/dashboard/entry-state';
import dynamic from 'next/dynamic';

const AgenticConcierge = dynamic(() => import('@/components/adaptive/AgenticConcierge').then(m => ({ default: m.AgenticConcierge })), { ssr: false });

interface NewUserDashboardProps {
  entryState: {
    id: string;
    eyebrow: string;
    headline: string;
    description: string;
    primaryAction: DashboardEntryAction;
    secondaryAction?: DashboardEntryAction;
    steps: { number: number; label: string; completed: boolean }[];
  };
  isGuest: boolean;
  venue: string;
  isTourActive: boolean;
  setIsTourActive: (active: boolean) => void;
  setPersonalizationDone: (done: boolean) => void;
  completeChecklistItem: (id: string) => void;
  renderEntryAction: (action: DashboardEntryAction | undefined, tone: 'primary' | 'secondary') => React.ReactNode;
}

export const NewUserDashboard: React.FC<NewUserDashboardProps> = ({
  entryState,
  isGuest,
  venue,
  isTourActive,
  setIsTourActive,
  setPersonalizationDone,
  completeChecklistItem,
  renderEntryAction,
}) => {
  const entryAccountLabel = isGuest ? 'Guest preview' : 'Signed in';

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-6 py-6 md:py-10 nav-spacer-top nav-spacer-bottom">
      <Card className="overflow-hidden border-gray-200/80 bg-gradient-to-br from-white via-white to-green-50/30 dark:border-gray-700 dark:from-gray-900 dark:via-gray-900 dark:to-green-950/20">
        <div className="text-center space-y-6 p-6">
          <div className="text-[10px] font-black uppercase tracking-[0.22em] text-green-600 dark:text-green-400">
            {entryState.eyebrow}
          </div>
          <h1 className="text-2xl md:text-4xl font-black tracking-tight text-gray-900 dark:text-white">
            {entryState.headline}
          </h1>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 max-w-lg mx-auto">
            {entryState.description}
          </p>

          {entryState.primaryAction.href ? (
            <Link
              href={entryState.primaryAction.href}
              onClick={() => completeChecklistItem(entryState.primaryAction.intent === 'log_match' ? 'log_match' : 'set_formation')}
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-xl shadow-green-500/30 hover:shadow-green-500/50 transition-all duration-200 hover:scale-[1.02]"
            >
              <Zap className="w-5 h-5 mr-2" />
              {entryState.primaryAction.label}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          ) : (
            renderEntryAction(entryState.primaryAction, 'primary')
          )}

          {entryState.secondaryAction && (
            <div>
              {renderEntryAction(entryState.secondaryAction, 'secondary')}
            </div>
          )}

          {entryState.steps.length > 0 && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-center gap-1 md:gap-2">
                {entryState.steps.map((step, i) => (
                  <React.Fragment key={step.number}>
                    {i > 0 && (
                      <div className={`w-6 md:w-10 h-px ${step.completed ? 'bg-green-400' : 'bg-gray-300 dark:bg-gray-600'}`} />
                    )}
                    <div className="flex flex-col items-center gap-1.5">
                      <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-sm font-black transition-colors ${
                        step.completed
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-2 border-gray-300 dark:border-gray-600'
                      }`}>
                        {step.completed ? <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5" /> : step.number}
                      </div>
                      <span className={`text-[10px] md:text-xs font-bold uppercase tracking-wide ${
                        step.completed ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {step.label}
                      </span>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">
            {isGuest ? (
              <span>{venue} preview</span>
            ) : (
              <span>{entryAccountLabel}</span>
            )}
          </div>
        </div>
      </Card>

      <div className="mt-4">
        <OnboardingChecklist
          journeyStage={entryState.id}
          onStepAction={() => {}}
        />
      </div>

      <div className="md:hidden mt-4 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">📱</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-blue-900 dark:text-blue-100">Get the best mobile experience</p>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">Open SportWarren in Telegram for faster access and instant notifications.</p>
            <a
              href={buildTelegramDeepLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700"
            >
              Open in Telegram
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      <OnboardingFlow onVisibilityChange={setIsTourActive} journeyStage={entryState.id} />
      {!isTourActive && <AgenticConcierge journeyStage={entryState.id} />}

      <Link
        href={entryState.primaryAction.href || '/match?mode=capture'}
        className="fixed bottom-6 left-6 z-50 md:hidden bg-green-600 hover:bg-green-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-xl shadow-green-600/40 transition-all active:scale-95 animate-pulse"
        aria-label={entryState.primaryAction.label}
      >
        <Plus className="w-6 h-6" />
      </Link>
    </div>
  );
};
