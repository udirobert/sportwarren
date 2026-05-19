'use client';
import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { ChainLabel } from '@/components/common/ChainLabel';
import { SoccerLoader } from '@/components/ui/SoccerLoader';
import { Wallet, Zap, ShieldCheck, ChevronRight, Minus, Plus } from 'lucide-react';

interface TacticalSpendProps {
  currentBudget: number;
  spentThisWeek: number;
  onUpdateBudget: (newBudget: number) => Promise<void>;
}

/**
 * TacticalSpend - Interactive UI for managing x402 autonomous budgets on Kite AI.
 * Demonstrates "Agentic Commerce" for the hackathon.
 */
export const TacticalSpend: React.FC<TacticalSpendProps> = ({
  currentBudget,
  spentThisWeek,
  onUpdateBudget,
}) => {
  const [targetBudget, setTargetBudget] = useState(currentBudget);
  const [isUpdating, setIsUpdating] = useState(false);
  const [step, setStep] = useState<'adjust' | 'confirm'>('adjust');

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      await onUpdateBudget(targetBudget);
      setStep('adjust');
    } finally {
      setIsUpdating(false);
    }
  };

  const remaining = Math.max(0, currentBudget - spentThisWeek);
  const percentageSpent = Math.min(100, (spentThisWeek / currentBudget) * 100);

  return (
    <Card className="bg-gray-950 border-gray-800 text-white overflow-hidden relative group">
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-emerald-500/10 transition-colors"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
              <Wallet className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest">Tactical Spend</h3>
              <p className="text-[9px] text-gray-500 uppercase font-bold tracking-tighter">x402 Autonomous Auth</p>
            </div>
          </div>
          <div className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[8px] font-black text-emerald-400">ACTIVE</span>
          </div>
        </div>

        {step === 'adjust' ? (
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Weekly Delegation</span>
                <span className="text-xl font-black text-white">${targetBudget.toFixed(2)} <span className="text-[10px] text-gray-500">USDC</span></span>
              </div>
              
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setTargetBudget(prev => Math.max(1, prev - 1))}
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                  aria-label="Decrease weekly budget"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden relative">
                  <div className="absolute inset-y-0 left-0 bg-emerald-500" style={{ width: `${(targetBudget / 50) * 100}%` }}></div>
                </div>
                <button 
                  onClick={() => setTargetBudget(prev => Math.min(50, prev + 1))}
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                  aria-label="Increase weekly budget"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-3">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-tight">
                <span className="text-gray-400">Week Utilization</span>
                <span className={percentageSpent > 80 ? 'text-amber-400' : 'text-emerald-400'}>{percentageSpent.toFixed(0)}%</span>
              </div>
              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: `${percentageSpent}%` }}></div>
              </div>
              <div className="flex justify-between items-center text-[9px] font-medium text-gray-500">
                <span>Spent: ${spentThisWeek.toFixed(2)}</span>
                <span>Available: ${remaining.toFixed(2)}</span>
              </div>
            </div>

            <button 
              onClick={() => setStep('confirm')}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
            >
              Update Authorization
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div className="py-4 space-y-6 flex flex-col items-center text-center">
            {isUpdating ? (
              <>
                <SoccerLoader size={64} />
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2 text-emerald-400">
                    <Zap className="w-3 h-3 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Signing x402 Auth</span>
                  </div>
                  <p className="text-[9px] text-gray-400 px-4">Updating your Digital Twin's autonomous spending policy on the <ChainLabel chain="kite" />.</p>
                </div>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 mb-2">
                  <ShieldCheck className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-bold">Confirm Policy Change</h4>
                  <p className="text-[10px] text-gray-400 px-6 leading-relaxed">
                    By confirming, you authorize your Twin Agent to spend up to <span className="text-white font-bold">${targetBudget} USDC</span> weekly for tactical services.
                  </p>
                </div>
                <div className="flex flex-col w-full gap-2">
                  <button 
                    onClick={handleUpdate}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    Confirm & Sign
                  </button>
                  <button 
                    onClick={() => setStep('adjust')}
                    className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};
