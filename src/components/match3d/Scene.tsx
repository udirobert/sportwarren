import React from 'react';
import type { MatchBroadcastViewModel } from './useMatchBroadcastViewModel';

interface SceneProps {
  viewModel: MatchBroadcastViewModel;
}

export const Scene: React.FC<SceneProps> = ({ viewModel }) => {
  const highlightStyles = {
    calm: 'from-cyan-400/10 to-transparent border-cyan-400/20',
    pressure: 'from-amber-400/15 to-transparent border-amber-400/30',
    surge: 'from-emerald-400/15 to-transparent border-emerald-400/30',
  } as const;

  return (
    <div className="relative aspect-[16/9] overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.18),transparent_40%),linear-gradient(180deg,rgba(15,23,42,0.85),rgba(2,6,23,1))]">
      <div className="absolute inset-0 opacity-70">
        <div className="absolute inset-x-[18%] top-[12%] bottom-[12%] rounded-[28px] border border-emerald-400/20 bg-gradient-to-b from-emerald-500/10 to-emerald-950/20" />
        <div className="absolute left-1/2 top-[12%] bottom-[12%] w-px -translate-x-1/2 bg-white/15" />
        <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/15" />
        <div className="absolute left-[18%] top-[32%] h-[36%] w-[10%] border border-white/15 border-l-0" />
        <div className="absolute right-[18%] top-[32%] h-[36%] w-[10%] border border-white/15 border-r-0" />
      </div>

      <div className={`absolute inset-0 bg-gradient-to-r ${highlightStyles[viewModel.highlightTone]} pointer-events-none`} />

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="grid grid-cols-6 gap-4 md:gap-6 w-[64%] max-w-3xl px-6">
          {Array.from({ length: 12 }).map((_, index) => {
            const isHome = index < 6;
            const top = isHome ? 30 + (index % 3) * 18 : 34 + (index % 3) * 18;
            const left = isHome ? 18 + Math.floor(index / 3) * 18 : 56 + Math.floor((index - 6) / 3) * 18;
            return (
              <div
                key={index}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${left}%`, top: `${top}%` }}
              >
                <div className={`h-5 w-5 md:h-6 md:w-6 rounded-full border-2 shadow-[0_0_20px_rgba(255,255,255,0.08)] ${isHome ? 'bg-cyan-400 border-cyan-100' : 'bg-rose-500 border-rose-200'}`} />
              </div>
            );
          })}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="h-3.5 w-3.5 rounded-full bg-white shadow-[0_0_20px_rgba(255,255,255,0.35)]" />
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 left-4 rounded-full border border-white/10 bg-black/35 px-3 py-1.5 text-[11px] font-semibold text-slate-200 backdrop-blur-md">
        {viewModel.stateLabel}
      </div>

      <div className="absolute bottom-4 right-4 rounded-2xl border border-white/10 bg-black/35 px-3 py-2 backdrop-blur-md text-right">
        <div className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Highlight</div>
        <div className="mt-1 text-sm font-semibold text-white">{viewModel.highlightLabel}</div>
      </div>
    </div>
  );
};
