"use client";

import React from 'react';
import { Card } from '@/components/ui/Card';
import { DollarSign, TrendingUp, TrendingDown, Activity, Info, AlertCircle } from 'lucide-react';
import { trpc } from '@/lib/trpc-client';
import { useMatchPreview } from '@/hooks/match/useMatchPreview';

interface MarketReportProps {
  userId: string;
  squadId?: string;
  opponentSquadId?: string;
}

export const MarketReport: React.FC<MarketReportProps> = ({ 
  userId, 
  squadId, 
  opponentSquadId 
}) => {
  // 1. Fetch Player Valuation
  const { data: valuation, isLoading: valLoading } = trpc.market.getPlayerValuation.useQuery(
    { userId },
    { enabled: !!userId }
  );

  // 2. Fetch Player Training/Fitness Data
  const { data: training, isLoading: trainLoading } = trpc.player.getTrainingData.useQuery(
    { userId },
    { enabled: !!userId }
  );

  // 3. Fetch Match Simulation (if opponent is known)
  const { stats: simStats, isLoading: _simLoading } = useMatchPreview(squadId, opponentSquadId);

  if (valLoading || trainLoading) {
    return (
      <Card className="p-6 animate-pulse bg-gray-50 border-gray-200">
        <div className="h-4 w-32 bg-gray-200 rounded mb-6"></div>
        <div className="space-y-4">
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-2 border-indigo-100 shadow-xl shadow-indigo-500/5">
      {/* Header */}
      <div className="bg-indigo-600 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5" />
            <h2 className="font-black uppercase tracking-tighter italic text-lg">Market Executive Report</h2>
          </div>
          <div className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest">
            {valuation?.tier} Tier Asset
          </div>
        </div>
      </div>

      <div className="p-5 space-y-6">
        {/* Valuation Section */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Current Fair Market Value</p>
            <div className="flex items-baseline space-x-2">
              <span className="text-4xl font-black tracking-tighter text-gray-900">${valuation?.value?.toLocaleString()}</span>
              <span className="text-xs font-bold text-gray-400 uppercase">USDC</span>
            </div>
          </div>
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-lg font-bold text-xs ${
            valuation?.breakdown.formMultiplier && valuation.breakdown.formMultiplier > 1 
              ? 'bg-green-100 text-green-700' 
              : 'bg-gray-100 text-gray-600'
          }`}>
            {valuation?.breakdown.formMultiplier && valuation.breakdown.formMultiplier > 1 ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span>{(valuation?.breakdown.formMultiplier || 1) > 1 ? 'High Demand' : 'Stable'}</span>
          </div>
        </div>

        {/* Dynamic Insights Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Fitness Insight */}
          <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
            <div className="flex items-center space-x-2 mb-2">
              <Activity className="w-3.5 h-3.5 text-orange-500" />
              <span className="text-[10px] font-black uppercase text-gray-500">Condition Report</span>
            </div>
            <p className="text-xs font-bold text-gray-800 leading-tight">
              {training?.sharpness && training.sharpness > 80 
                ? "Peak Match Sharpness. +10% Attribute modifier active."
                : "Fitness deficit detected. Potential performance penalties in next match."}
            </p>
          </div>

          {/* Market Insight */}
          <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
            <div className="flex items-center space-x-2 mb-2">
              <Info className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-[10px] font-black uppercase text-gray-500">Agent Note</span>
            </div>
            <p className="text-xs font-bold text-gray-800 leading-tight">
              {valuation?.breakdown.potentialMultiplier && valuation.breakdown.potentialMultiplier > 1
                ? "High Potential asset. Valuation expected to rise with consistent playtime."
                : "Established professional. Valuation tied strictly to performance form."}
            </p>
          </div>
        </div>

        {/* Simulation Preview (Conditional) */}
        {simStats && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-black uppercase text-gray-900 tracking-wider">Shadow Engine Projection</h3>
              </div>
              <span className="text-[10px] font-bold text-gray-400 uppercase">vs Opponent Squad</span>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex-1 space-y-1">
                <div className="flex justify-between text-[10px] font-bold uppercase mb-1">
                  <span>Win Probability</span>
                  <span>{simStats.homeWinPct}%</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-600 transition-all duration-1000" 
                    style={{ width: `${simStats.homeWinPct}%` }}
                  />
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs font-black text-indigo-600 uppercase tracking-widest">{simStats.confidence}</div>
                <div className="text-[10px] font-bold text-gray-400 uppercase">Confidence</div>
              </div>
            </div>
          </div>
        )}

        <button className="w-full py-3 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all">
          Request Transfer Appraisal
        </button>
      </div>
    </Card>
  );
};
