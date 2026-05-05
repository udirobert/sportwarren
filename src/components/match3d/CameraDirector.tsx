import React from 'react';
import type { MatchBroadcastViewModel } from './useMatchBroadcastViewModel';

interface CameraDirectorProps {
  viewModel: MatchBroadcastViewModel;
}

export const CameraDirector: React.FC<CameraDirectorProps> = ({ viewModel }) => {
  return (
    <div className="absolute top-4 right-4 rounded-2xl border border-white/10 bg-black/40 px-3 py-2 backdrop-blur-md">
      <div className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">Camera director</div>
      <div className="mt-1 text-sm font-semibold text-white">{viewModel.cameraLabel}</div>
      <div className="mt-1 text-[11px] text-cyan-300">{viewModel.highlightLabel}</div>
    </div>
  );
};
