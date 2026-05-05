import React from 'react';
import { Card } from '@/components/ui/Card';
import { trpc } from '@/lib/trpc-client';
import { Trophy, Zap, Shield, Target, Users, Sparkles, TrendingUp, Eye, Lock, Stars } from 'lucide-react';
import { motion } from 'framer-motion';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useDigitalTwinBroadcastAccess } from '@/hooks/useDigitalTwinBroadcastAccess';
import {
  DIGITAL_TWIN_3D_TEASER_KEY,
  DIGITAL_TWIN_3D_UNLOCK_KEY,
  DIGITAL_TWIN_3D_USAGE_KEY,
} from '@/lib/digital-twin/access';
import { trackDigitalTwin3DInteraction } from '@/lib/digital-twin/analytics';

interface SquadDigitalTwinWidgetProps {
  squadId: string;
}

export const SquadDigitalTwinWidget: React.FC<SquadDigitalTwinWidgetProps> = ({ squadId }) => {
  const utils = trpc.useContext();
  const { preferences, unlockFeature, trackFeatureUsage } = useUserPreferences();
  const { twin, access: immersive3DAccess } = useDigitalTwinBroadcastAccess({
    squadId,
    preferences,
  });

  const simulate = trpc.squad.simulateGhostMatch.useMutation({
    onSuccess: () => {
      utils.squad.getDigitalTwin.invalidate({ squadId });
      trackFeatureUsage(DIGITAL_TWIN_3D_USAGE_KEY, 15_000);
      trackDigitalTwin3DInteraction({
        action: 'ghost_match_simulated',
        squadId,
        access: immersive3DAccess,
        source: 'digital_twin_widget',
      });
      if ((twin?.seasonPoints ?? 0) >= 12 || (twin?.squadEnergy ?? 0) >= 85 || twin?.digitalTwin3dEnabled) {
        unlockFeature(DIGITAL_TWIN_3D_UNLOCK_KEY);
      }
    }
  });

  const handle3DInterest = React.useCallback(() => {
    unlockFeature(DIGITAL_TWIN_3D_TEASER_KEY);
    trackFeatureUsage(DIGITAL_TWIN_3D_USAGE_KEY, 5_000);
    trackDigitalTwin3DInteraction({
      action: 'cta_clicked',
      squadId,
      access: immersive3DAccess,
      source: 'digital_twin_widget',
    });
  }, [immersive3DAccess, squadId, trackFeatureUsage, unlockFeature]);

  const isSimulating = simulate.status === 'pending';

  if (!twin) {
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

  const attrs = (twin.digitalAttributes as any) || { attack: 50, defense: 50, midfield: 50, teamwork: 50, prestige: 10 };
  const xpPercentage = Math.min(100, (twin.xp / twin.nextLevelXp) * 100);

  return (
    <Card className="relative overflow-hidden p-6 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/20 border-emerald-500/20">
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

      <div className="grid grid-cols-2 gap-3 mb-6">
        <AttributeItem icon={<Target className="w-3 h-3 text-rose-400" />} label="Attack" value={attrs.attack} />
        <AttributeItem icon={<Shield className="w-3 h-3 text-sky-400" />} label="Defense" value={attrs.defense} />
        <AttributeItem icon={<Users className="w-3 h-3 text-amber-400" />} label="Teamwork" value={attrs.teamwork} />
        <AttributeItem icon={<TrendingUp className="w-3 h-3 text-purple-400" />} label="Prestige" value={attrs.prestige} />
      </div>

      <div className="mb-4 rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-3">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <div className="flex items-center gap-2 text-white font-semibold text-sm">
              <Eye className="w-4 h-4 text-cyan-300" />
              Immersive Match Broadcast
            </div>
            <p className="mt-1 text-[11px] text-slate-300 leading-relaxed">
              Optional 3D spectator mode for high-engagement squads. The 2D match canvas remains your baseline tactical view.
            </p>
          </div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-cyan-300 font-bold">
            {immersive3DAccess.state}
          </div>
        </div>

        {immersive3DAccess.state === 'unlocked' ? (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-300 uppercase tracking-wider">
                <Stars className="w-3.5 h-3.5" />
                3D Broadcast unlocked
              </div>
              <p className="mt-1 text-[11px] text-slate-300">Renderer pending. Access logic is now wired for premium or streak-based rollout.</p>
            </div>
            <button
              type="button"
              onClick={handle3DInterest}
              className="px-3 py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-[11px] font-bold text-emerald-200"
            >
              Notify me
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-slate-950/40 px-3 py-2">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200 uppercase tracking-wider">
                <Lock className="w-3.5 h-3.5 text-amber-300" />
                {immersive3DAccess.reason === 'capability_limited' ? 'Best on higher-power devices' : 'Premium / streak upgrade'}
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                {immersive3DAccess.reason === 'capability_limited'
                  ? 'Your current session is optimized for the lighter 2D experience.'
                  : 'Unlock immersive broadcast mode via premium access or sustained squad momentum.'}
              </p>
            </div>
            <button
              type="button"
              onClick={handle3DInterest}
              className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-[11px] font-bold text-white hover:bg-white/10"
            >
              {immersive3DAccess.state === 'teaser' ? 'Preview' : 'Track unlock'}
            </button>
          </div>
        )}
      </div>

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
