import React from 'react';
import { Card } from '@/components/ui/Card';
import { trpc } from '@/lib/trpc-client';
import { Trophy, Zap, Shield, Target, Users, Sparkles, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface SquadDigitalTwinWidgetProps {
  squadId: string;
}

export const SquadDigitalTwinWidget: React.FC<SquadDigitalTwinWidgetProps> = ({ squadId }) => {
  const utils = trpc.useContext();
  const { data: twinData, isLoading } = trpc.squad.getDigitalTwin.useQuery({ squadId });
  const twin = twinData as any;
  
  const simulate = trpc.squad.simulateGhostMatch.useMutation({
    onSuccess: () => {
      utils.squad.getDigitalTwin.invalidate({ squadId });
    }
  });

  const isSimulating = simulate.status === 'pending';

  if (isLoading) {
    return (
      <Card className="p-6 bg-slate-900/50 border-slate-800 animate-pulse">
        <div className="h-4 w-32 bg-slate-800 rounded mb-4" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-10 bg-slate-800 rounded" />
          <div className="h-10 bg-slate-800 rounded" />
        </div>
      </Card>
    );
  }

  if (!twin) return null;

  const attrs = (twin.digitalAttributes as any) || { attack: 50, defense: 50, midfield: 50, teamwork: 50, prestige: 10 };
  const xpPercentage = Math.min(100, (twin.xp / twin.nextLevelXp) * 100);

  return (
    <Card className="relative overflow-hidden p-6 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/20 border-emerald-500/20">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl" />
      
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            Digital Twin Season
          </h3>
          <p className="text-xs text-slate-400">IRL results sync to your On-chain twin</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
          <Trophy className="w-3 h-3 text-emerald-400" />
          <span className="text-xs font-bold text-emerald-400">{twin.seasonPoints} pts</span>
        </div>
      </div>
      
      {/* Energy & Hype Tags */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight flex items-center gap-1">
              <Zap className={`w-2.5 h-2.5 ${twin.squadEnergy > 70 ? 'text-emerald-400' : 'text-amber-400'}`} />
              Squad Energy
            </span>
            <span className={`text-[10px] font-bold ${twin.squadEnergy > 70 ? 'text-emerald-400' : twin.squadEnergy > 30 ? 'text-amber-400' : 'text-rose-400'}`}>
              {twin.squadEnergy}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${twin.squadEnergy}%` }}
              className={`h-full ${twin.squadEnergy > 70 ? 'bg-emerald-500' : twin.squadEnergy > 30 ? 'bg-amber-500' : 'bg-rose-500'}`}
            />
          </div>
        </div>
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight block mb-1.5">Consensus Tags</span>
          <div className="flex flex-wrap gap-1">
            {Object.keys(twin.squadHypeTags || {}).length > 0 ? (
              Object.keys(twin.squadHypeTags).map(tag => (
                <span key={tag} className="px-1.5 py-0.5 bg-slate-800 text-[9px] font-bold text-slate-300 rounded border border-slate-700">
                  #{tag}
                </span>
              ))
            ) : (
              <span className="text-[9px] text-slate-500 italic">No tags yet</span>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-300">Level {twin.level} Squad</span>
          <span className="text-[10px] text-slate-500">{twin.xp} / {twin.nextLevelXp} XP</span>
        </div>
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${xpPercentage}%` }}
            className="h-full bg-gradient-to-r from-emerald-600 to-teal-400"
          />
        </div>
      </div>

      {/* Attributes Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <AttributeItem icon={<Target className="w-3 h-3 text-rose-400" />} label="Attack" value={attrs.attack} />
        <AttributeItem icon={<Shield className="w-3 h-3 text-sky-400" />} label="Defense" value={attrs.defense} />
        <AttributeItem icon={<Users className="w-3 h-3 text-amber-400" />} label="Teamwork" value={attrs.teamwork} />
        <AttributeItem icon={<TrendingUp className="w-3 h-3 text-purple-400" />} label="Prestige" value={attrs.prestige} />
      </div>

      {/* Ghost Match Simulation */}
      <div className="mb-6">
        <button 
          onClick={() => simulate.mutate({ squadId })}
          disabled={isSimulating || (twin.squadEnergy || 0) < 40}
          className={`w-full py-2.5 rounded-lg border flex items-center justify-center gap-2 transition-all ${
            (twin.squadEnergy || 0) >= 40 
            ? 'bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-400' 
            : 'bg-slate-800/50 border-slate-700 text-slate-500 cursor-not-allowed'
          }`}
        >
          <Zap className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
          <span className="text-xs font-bold uppercase tracking-wider">
            {isSimulating ? 'Simulating...' : 'Simulate Ghost Match'}
          </span>
          <span className="text-[10px] opacity-60">(-40 Energy)</span>
        </button>
      </div>

      {/* AI Narrative */}
      {twin.narrative && (
        <div className="relative p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
          <div className="absolute -top-2 left-3 px-2 bg-slate-900 text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
            Marcus' Insights
          </div>
          <p className="text-xs text-slate-300 italic">
            "{twin.narrative}"
          </p>
        </div>
      )}
    </Card>
  );
};

const AttributeItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: number }) => (
  <div className="flex items-center justify-between p-2 bg-slate-800/30 border border-slate-700/50 rounded-lg">
    <div className="flex items-center gap-2">
      {icon}
      <span className="text-[10px] text-slate-400 font-medium">{label}</span>
    </div>
    <span className="text-xs font-bold text-white">{Math.floor(value)}</span>
  </div>
);
