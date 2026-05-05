import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Eye, Lock, Sparkles, Stars, Zap } from 'lucide-react';
import type { DigitalTwin3DAccessResult } from '@/lib/digital-twin/access';
import { trackDigitalTwin3DInteraction } from '@/lib/digital-twin/analytics';

interface DigitalTwinUpgradeGateProps {
  access: DigitalTwin3DAccessResult;
  onPreview: () => void;
  squadId?: string;
}

export const DigitalTwinUpgradeGate: React.FC<DigitalTwinUpgradeGateProps> = ({ access, onPreview, squadId }) => {
  const isUnlocked = access.state === 'unlocked';

  React.useEffect(() => {
    trackDigitalTwin3DInteraction({
      action: 'gate_viewed',
      squadId,
      access,
      source: 'dashboard_gate',
    });
  }, [access, squadId]);

  const handlePreview = React.useCallback(() => {
    trackDigitalTwin3DInteraction({
      action: 'cta_clicked',
      squadId,
      access,
      source: 'dashboard_gate',
    });
    onPreview();
  }, [access, onPreview, squadId]);

  return (
    <Card className="overflow-hidden border-cyan-500/20 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/30">
      <div className="p-5 md:p-6">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-300 text-[10px] font-black uppercase tracking-[0.24em]">
              <Sparkles className="w-3.5 h-3.5" />
              Optional upgrade
            </div>
            <h3 className="mt-2 text-xl font-black tracking-tight text-white">Digital Twin 3D Broadcast</h3>
            <p className="mt-2 text-sm text-slate-300 max-w-2xl leading-relaxed">
              An immersive spectator-mode layer for your digital twin. Keep the 2D pitch as your tactical baseline and unlock a richer match-day presentation when your squad momentum or plan qualifies.
            </p>
          </div>
          <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-200">
            {access.state}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3 mb-5">
          <FeaturePill icon={<Eye className="w-3.5 h-3.5 text-cyan-300" />} label="Broadcast camera" />
          <FeaturePill icon={<Zap className="w-3.5 h-3.5 text-emerald-300" />} label="IRL-driven condition" />
          <FeaturePill icon={<Stars className="w-3.5 h-3.5 text-amber-300" />} label="Premium or streak unlock" />
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              {isUnlocked ? <Stars className="w-4 h-4 text-emerald-300" /> : <Lock className="w-4 h-4 text-amber-300" />}
              {isUnlocked ? 'Immersive access is ready for rollout' : '2D remains default while 3D stays gated'}
            </div>
            <p className="mt-1 text-xs text-slate-400">
              {access.reason === 'capability_limited'
                ? 'This session is better served by the lighter 2D pitch experience.'
                : isUnlocked
                  ? 'The renderer can be attached later without changing the access contract.'
                  : 'Use this entry point to track interest, reward streaks, and protect performance.'}
            </p>
          </div>
          <Button
            type="button"
            onClick={handlePreview}
            variant={isUnlocked ? undefined : 'outline'}
            className={isUnlocked ? 'bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-black' : 'border-white/15 text-white font-black'}
          >
            {isUnlocked ? 'Track rollout' : access.state === 'teaser' ? 'Preview unlock path' : 'Track unlock'}
          </Button>
        </div>
      </div>
    </Card>
  );
};

const FeaturePill = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
  <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200">
    {icon}
    <span>{label}</span>
  </div>
);
