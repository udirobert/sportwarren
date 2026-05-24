"use client";

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { XPGainSummary } from '@/components/player/XPGainPopup';
import { Sparkles, Clock3 } from 'lucide-react';

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
