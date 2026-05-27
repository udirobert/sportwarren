"use client";

import React from "react";
import { TrendingUp } from "lucide-react";
import { StaffAdvisor } from "../StaffAdvisor";

interface StaffIntelSidebarProps {
  squadId: string;
  rotationGap: number;
  hasLiveTreasury: boolean;
  treasuryBalance: number;
}

export const StaffIntelSidebar: React.FC<StaffIntelSidebarProps> = ({
  squadId,
  rotationGap,
  hasLiveTreasury,
  treasuryBalance,
}) => (
  <div className="hidden lg:block w-80 bg-black/40 border-l border-white/5 p-6 overflow-y-auto">
    <div className="flex items-center justify-between mb-6">
      <h4 className="section-title text-gray-300">Staff Intel</h4>
      <div className="flex items-center space-x-1">
        <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
        <span className="text-[8px] font-bold text-green-500 uppercase">Live Analysis</span>
      </div>
    </div>

    <StaffAdvisor squadId={squadId} />

    <div className="mt-8 bg-blue-600/10 p-4 rounded-2xl border border-blue-500/20">
      <TrendingUp className="w-5 h-5 text-blue-500 mb-2" />
      <h5 className="section-title text-white mb-1">Economic Outlook</h5>
      <p className="text-[9px] text-blue-100 leading-tight">
        {hasLiveTreasury
          ? rotationGap > 0
            ? `Depth is still ${rotationGap} player${rotationGap > 1 ? 's' : ''} short of a full rotation squad. Protect the treasury for priority positions first.`
            : treasuryBalance < 3000
              ? 'Treasury is tight. One verified result or sponsor move would materially improve squad flexibility.'
              : 'Treasury is healthy enough to be selective. Use the next move on quality, not just volume.'
          : 'Live finance signals appear here once treasury data is available.'}
      </p>
    </div>
  </div>
);
