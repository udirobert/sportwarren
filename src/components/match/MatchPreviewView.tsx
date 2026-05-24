"use client";

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Sparkles, Cpu, Users } from 'lucide-react';
import dynamic from 'next/dynamic';

const MatchEnginePreview = dynamic(
  () => import('@/components/dashboard/MatchEnginePreview').then(m => ({ default: m.MatchEnginePreview })),
  { ssr: false },
);

interface MatchPreviewViewProps {
  squadId: string | undefined;
}

export const MatchPreviewView: React.FC<MatchPreviewViewProps> = ({ squadId }) => (
  <div className="space-y-6">
    <Card className="border-blue-200 bg-blue-50/70 py-4">
      <div className="flex items-start gap-3">
        <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
        <div className="flex-1">
          <p className="font-semibold text-blue-900">Prepare for your next match</p>
          <p className="mt-1 text-sm text-blue-700">
            Scout your opponent, simulate tactics, and optimize your lineup before taking the pitch.
          </p>
        </div>
        <Link href="/match/preview">
          <Button size="sm">Open Preview</Button>
        </Link>
      </div>
    </Card>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="p-0 overflow-hidden border-emerald-100">
        <div className="bg-emerald-900 px-4 py-2 flex items-center justify-between">
          <span className="text-xs font-bold text-emerald-100 uppercase tracking-wider">Tactical Hub</span>
          <Cpu className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="p-4">
          <h3 className="font-bold text-gray-900 mb-2">Simulation Engine</h3>
          <p className="text-sm text-gray-600 mb-4">Run 1,000 simulations based on your current squad attributes and formation.</p>
          <Link href="/match/preview?simulate=1">
            <Button variant="outline" size="sm" className="w-full">Run Simulation</Button>
          </Link>
        </div>
      </Card>

      <Card className="p-0 overflow-hidden border-blue-100">
        <div className="bg-blue-900 px-4 py-2 flex items-center justify-between">
          <span className="text-xs font-bold text-blue-100 uppercase tracking-wider">Scouting Report</span>
          <Users className="w-4 h-4 text-blue-400" />
        </div>
        <div className="p-4">
          <h3 className="font-bold text-gray-900 mb-2">Opponent Intel</h3>
          <p className="text-sm text-gray-600 mb-4">Identify weaknesses in your next opponent's defensive line and exploit them.</p>
          <Link href="/match/preview?tab=scouting">
            <Button variant="outline" size="sm" className="w-full">View Intel</Button>
          </Link>
        </div>
      </Card>
    </div>

    <MatchEnginePreview squadId={squadId} />
  </div>
);
