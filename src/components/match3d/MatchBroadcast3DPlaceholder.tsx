import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Eye, Sparkles, ArrowLeft, Activity, Trophy, Zap, Lock } from 'lucide-react';
import type { DigitalTwin3DAccessResult } from '@/lib/digital-twin/access';

interface MatchBroadcast3DPlaceholderProps {
  squadId?: string;
  access: DigitalTwin3DAccessResult;
}

export const MatchBroadcast3DPlaceholder: React.FC<MatchBroadcast3DPlaceholderProps> = ({ squadId, access }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="border-b border-white/10 bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950/40">
        <div className="max-w-6xl mx-auto px-4 py-6 md:px-6 md:py-8">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="border-white/15 text-white hover:bg-white/5">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-cyan-200">
              {access.state}
            </div>
          </div>

          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-cyan-300 text-[10px] font-black uppercase tracking-[0.24em]">
              <Sparkles className="w-3.5 h-3.5" />
              Digital twin broadcast
            </div>
            <h1 className="mt-3 text-3xl md:text-5xl font-black tracking-tight">Immersive 3D matchday layer</h1>
            <p className="mt-3 text-slate-300 text-sm md:text-base leading-relaxed">
              This placeholder marks the future lazy-loaded broadcast surface. The 2D match preview remains your primary tactical tool; this route is reserved for the optional premium or streak-based spectator upgrade.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 md:px-6 md:py-8 space-y-6">
        <Card className="overflow-hidden border-cyan-500/20 bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/20">
          <div className="aspect-[16/9] relative border-b border-white/10 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.18),transparent_40%),linear-gradient(180deg,rgba(15,23,42,0.85),rgba(2,6,23,1))]">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center px-6">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
                  <Eye className="w-8 h-8 text-cyan-200" />
                </div>
                <h2 className="text-2xl font-black tracking-tight">3D renderer placeholder</h2>
                <p className="mt-2 text-sm text-slate-300 max-w-xl">
                  Future React-driven broadcast scene with camera direction, HUD overlays, and IRL-influenced player condition.
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 md:p-6 grid gap-4 md:grid-cols-3">
            <BroadcastSignal icon={<Activity className="w-4 h-4 text-emerald-300" />} title="Shared simulation" copy="Use the same match simulation baseline that powers the 2D preview." />
            <BroadcastSignal icon={<Zap className="w-4 h-4 text-amber-300" />} title="Adaptive loading" copy="Only load heavier 3D code for eligible users and capable devices." />
            <BroadcastSignal icon={<Trophy className="w-4 h-4 text-cyan-300" />} title="Upgrade-safe rollout" copy="Keep entitlements and UX separate from the renderer implementation." />
          </div>
        </Card>

        <Card className="border-white/10 bg-white/[0.03]">
          <div className="p-5 md:p-6">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-xl border border-amber-400/20 bg-amber-400/10 p-2">
                <Lock className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Current rollout status</h3>
                <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                  Access is now wired at the product level. The next step is attaching a real lazy-loaded broadcast renderer here without changing the access contract or replacing the existing 2D match engine.
                </p>
                <div className="mt-4 text-xs text-slate-400">
                  Squad: <span className="text-slate-200 font-semibold">{squadId || 'No active squad selected'}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

const BroadcastSignal = ({ icon, title, copy }: { icon: React.ReactNode; title: string; copy: string }) => (
  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
    <div className="flex items-center gap-2 text-sm font-bold text-white">
      {icon}
      {title}
    </div>
    <p className="mt-2 text-xs leading-relaxed text-slate-400">{copy}</p>
  </div>
);
