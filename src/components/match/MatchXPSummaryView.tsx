"use client";

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { XPGainSummary } from '@/components/player/XPGainPopup';
import { Sparkles, Clock3, CheckCircle2 } from 'lucide-react';

interface XPSummaryData {
  totalXP: number;
  attributeGains: { attribute: string; xp: number; oldRating: number; newRating: number }[];
}

interface MatchXPSummaryViewProps {
  xpResultState: 'idle' | 'pending' | 'available';
  xpSummaryData: XPSummaryData | null;
  onBack: () => void;
}

export const MatchXPSummaryView: React.FC<MatchXPSummaryViewProps> = ({
  xpResultState,
  xpSummaryData,
  onBack,
}) => (
  <div className="space-y-4">
    <Button onClick={onBack} variant="outline">
      ← Back to Matches
    </Button>

    {xpResultState === 'available' && xpSummaryData ? (
      <>
        {/* Card-as-anchor: bridges the landing page promise
            ("See how stats become real") to the actual XP event.
            Mirrors the visual language used in OnboardingFlow's
            hasPendingPersona banner so the journey reads as one
            continuous surface. */}
        <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 p-4 shadow-lg shadow-emerald-500/5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-emerald-400/40 bg-emerald-500/15">
              <CheckCircle2 className="h-6 w-6 text-emerald-300" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-300">
                Match Verified
              </p>
              <p className="truncate text-base font-black text-white">
                Your stats are now real
              </p>
              <div className="mt-1 flex items-center gap-2">
                <span className="rounded-full border border-emerald-400/30 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-emerald-200">
                  +{xpSummaryData.totalXP} XP
                </span>
              </div>
            </div>
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-emerald-200/80">
            Your provisional stats have been upgraded based on the verified match result.
          </p>
        </div>

        <XPGainSummary
          totalXP={xpSummaryData.totalXP}
          attributeGains={xpSummaryData.attributeGains as any}
        />

        <Card className="py-6 text-center">
          <Sparkles className="mx-auto mb-3 h-12 w-12 text-yellow-500" />
          <h3 className="mb-2 text-lg font-semibold text-gray-900">XP Applied</h3>
          <p className="mb-4 text-gray-600">
            Your attributes have been updated from the verified match.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/reputation">
              <Button variant="outline">View Reputation →</Button>
            </Link>
            <Button onClick={onBack}>Back to Matches</Button>
          </div>
        </Card>
      </>
    ) : (
      <Card className="py-8 text-center">
        <Clock3 className="mx-auto mb-3 h-12 w-12 text-blue-500" />
        <h3 className="mb-2 text-lg font-semibold text-gray-900">Verification recorded</h3>
        <p className="mx-auto mb-4 max-w-xl text-gray-600">
          Your confirmation has been saved. XP and reputation will appear here once the remaining verification threshold is reached and the settlement run completes.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={onBack}>Back to Matches</Button>
          <Link href="/reputation">
            <Button variant="outline">Open Reputation</Button>
          </Link>
        </div>
      </Card>
    )}
  </div>
);
