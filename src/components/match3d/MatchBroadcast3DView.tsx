import React from 'react';
import type { DigitalTwin3DAccessResult } from '@/lib/digital-twin/access';
import type { MatchSimulationSnapshot } from '@/lib/match/matchSimulation';
import { Scene } from './Scene';
import { BroadcastHud } from './BroadcastHud';
import { useMatchBroadcastViewModel, type MatchBroadcastTwinData } from './useMatchBroadcastViewModel';
import { Card } from '@/components/ui/Card';
import { MatchBroadcast3DPlaceholder } from './MatchBroadcast3DPlaceholder';

export interface MatchBroadcast3DViewProps {
  squadId?: string;
  access: DigitalTwin3DAccessResult;
  snapshot?: MatchSimulationSnapshot | null;
  twin?: MatchBroadcastTwinData | null;
}

export const MatchBroadcast3DView: React.FC<MatchBroadcast3DViewProps> = ({ squadId, access, snapshot, twin }) => {
  const viewModel = useMatchBroadcastViewModel({ squadId, access, snapshot, twin });

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <MatchBroadcast3DPlaceholder squadId={squadId} access={access} />

      <div className="max-w-6xl mx-auto px-4 pb-8 md:px-6 md:pb-10 -mt-2">
        <Card className="overflow-hidden border-cyan-500/20 bg-slate-900/70 backdrop-blur-sm">
          <div className="relative">
            <Scene viewModel={viewModel} />
            <BroadcastHud viewModel={viewModel} />
          </div>

          <div className="grid gap-3 border-t border-white/10 p-4 md:grid-cols-5 md:p-5 bg-black/20">
            {viewModel.keyMetrics.map((metric) => (
              <div key={metric.label} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">{metric.label}</div>
                <div className="mt-1 text-sm font-semibold text-white truncate">{metric.value}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
