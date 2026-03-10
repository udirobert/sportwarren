"use client";

import React from 'react';
import { Card } from '@/components/ui/Card';
import { 
  AlertCircle, 
  TrendingUp, 
  Zap, 
  DollarSign, 
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { trpc } from '@/lib/trpc-client';
import { motion, AnimatePresence } from 'framer-motion';

interface StaffAdvisorProps {
  squadId: string;
}

export const StaffAdvisor: React.FC<StaffAdvisorProps> = ({ squadId }) => {
  const { data: alerts, isLoading } = trpc.squad.getManagerAlerts.useQuery(
    { squadId },
    { 
      enabled: !!squadId,
      refetchInterval: 30000, // Refresh every 30s for "live" feel
    }
  );

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map(i => (
          <div key={i} className="h-24 bg-white/5 animate-pulse rounded-2xl border border-white/5" />
        ))}
      </div>
    );
  }

  if (!alerts || alerts.length === 0) {
    return (
      <div className="p-8 text-center border-2 border-dashed border-white/5 rounded-2xl">
        <ShieldAlert className="w-8 h-8 text-gray-700 mx-auto mb-2" />
        <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">No Critical Alerts</p>
        <p className="text-[9px] text-gray-600 mt-1 uppercase">Backroom operations are stable</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <AnimatePresence mode="popLayout">
        {alerts.map((alert: any) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <Card className={`relative overflow-hidden border-none shadow-xl ${
              alert.priority === 'high' 
                ? 'bg-gradient-to-br from-red-500/10 to-red-900/20 ring-1 ring-red-500/30' 
                : 'bg-white/5 ring-1 ring-white/10'
            }`}>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className={`p-1.5 rounded-lg ${
                      alert.type === 'tactical' ? 'bg-blue-500/20 text-blue-400' :
                      alert.type === 'market' ? 'bg-indigo-500/20 text-indigo-400' :
                      'bg-orange-500/20 text-orange-400'
                    }`}>
                      {alert.type === 'tactical' ? <Zap className="w-3.5 h-3.5" /> :
                       alert.type === 'market' ? <DollarSign className="w-3.5 h-3.5" /> :
                       <ActivityIcon className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-white">{alert.title}</h4>
                      <p className="text-[8px] font-bold text-gray-500 uppercase">{alert.agentName}</p>
                    </div>
                  </div>
                  {alert.priority === 'high' && (
                    <div className="bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase animate-pulse">
                      Urgent
                    </div>
                  )}
                </div>

                <p className="text-xs text-gray-300 leading-relaxed mb-3">
                  {alert.message}
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <div className="flex items-center space-x-3">
                    {alert.metadata?.probs && (
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="w-3 h-3 text-green-500" />
                        <span className="text-[10px] font-mono text-gray-400">
                          {Math.round(alert.metadata.probs.homeWin * 100)}% Win
                        </span>
                      </div>
                    )}
                    {alert.metadata?.valuation && (
                      <div className="flex items-center space-x-1">
                        <span className="text-[10px] font-mono text-indigo-400">
                          ${alert.metadata.valuation.value.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                  <button className="flex items-center space-x-1 text-[10px] font-black uppercase text-blue-400 hover:text-blue-300 transition-colors">
                    <span>Action</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

const ActivityIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);
