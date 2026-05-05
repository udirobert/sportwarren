import React from 'react';
import type { MatchBroadcastViewModel } from './useMatchBroadcastViewModel';
import { CameraDirector } from './CameraDirector';

interface BroadcastHudProps {
  viewModel: MatchBroadcastViewModel;
}

export const BroadcastHud: React.FC<BroadcastHudProps> = ({ viewModel }) => {
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 md:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="rounded-2xl border border-white/10 bg-black/35 backdrop-blur-md px-4 py-3 max-w-xl">
          <div className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-300">Broadcast HUD</div>
          <h2 className="mt-2 text-xl md:text-2xl font-black text-white tracking-tight">{viewModel.heroTitle}</h2>
          <p className="mt-2 text-xs md:text-sm text-slate-300 leading-relaxed">{viewModel.heroSubtitle}</p>
        </div>

        <div className="flex flex-col items-end gap-3">
          <CameraDirector viewModel={viewModel} />
          <div className="rounded-2xl border border-white/10 bg-black/45 backdrop-blur-md px-4 py-3 text-right min-w-[120px]">
            <div className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Phase</div>
            <div className="mt-2 text-lg md:text-2xl font-black text-white">{viewModel.phaseLabel}</div>
            <div className="text-xs text-cyan-300 mt-1">{viewModel.scoreline}</div>
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md p-4">
          <div className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400 mb-3">Live commentary</div>
          <div className="space-y-2">
            {viewModel.commentary.map((item, index) => (
              <div key={`${index}-${item}`} className="text-sm text-white/90 leading-relaxed border-l border-cyan-400/30 pl-3">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md p-4">
          <div className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400 mb-3">Signals</div>
          <div className="space-y-3">
            <Signal label="Momentum" value={viewModel.momentumLabel} />
            <Signal label="Intensity" value={viewModel.intensityLabel} />
            <Signal label="Condition" value={viewModel.conditionLabel} />
          </div>
        </div>
      </div>
    </div>
  );
};

const Signal = ({ label, value }: { label: string; value: string }) => (
  <div>
    <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">{label}</div>
    <div className="mt-1 text-sm font-semibold text-white">{value}</div>
  </div>
);
