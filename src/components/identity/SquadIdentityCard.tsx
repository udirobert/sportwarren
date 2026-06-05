'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Shield, Swords, Target, TrendingUp, Zap, Star, Award, Users, Battery } from 'lucide-react';
import type { SquadIdentity } from '@/server/services/personalization/identity';
import type { AttributeKey } from '@/server/services/personalization/twin-types';

interface SquadIdentityCardProps {
  identity: SquadIdentity;
}

const ATTRIBUTE_LABELS: Record<AttributeKey, { label: string; icon: React.ReactNode; color: string }> = {
  pace: { label: 'Pace', icon: <Zap className="h-3.5 w-3.5" />, color: 'bg-emerald-500' },
  shooting: { label: 'Shooting', icon: <Target className="h-3.5 w-3.5" />, color: 'bg-red-500' },
  passing: { label: 'Passing', icon: <TrendingUp className="h-3.5 w-3.5" />, color: 'bg-sky-500' },
  dribbling: { label: 'Dribbling', icon: <Star className="h-3.5 w-3.5" />, color: 'bg-amber-500' },
  defending: { label: 'Defending', icon: <Shield className="h-3.5 w-3.5" />, color: 'bg-violet-500' },
  physical: { label: 'Physical', icon: <Swords className="h-3.5 w-3.5" />, color: 'bg-orange-500' },
};

const ATTRIBUTE_KEYS: AttributeKey[] = ['pace', 'shooting', 'passing', 'dribbling', 'defending', 'physical'];

const MOMENT_ICONS: Record<string, string> = {
  twin_created: '✨',
  level_up: '⬆️',
  sim_complete: '🎮',
  achievement: '🏆',
  coaching_hired: '🎓',
  coaching_expired: '⏰',
  attestation_milestone: '✅',
  season_end: '🏁',
  record_broken: '💥',
};

export const SquadIdentityCard: React.FC<SquadIdentityCardProps> = ({ identity }) => {
  const { skin, brain, members, moments, narrative } = identity;
  const energyPct = brain.energyMax > 0 ? (brain.energy / brain.energyMax) * 100 : 100;
  const energyColor = energyPct > 60 ? 'from-emerald-500 to-emerald-400' : energyPct > 30 ? 'from-amber-500 to-amber-400' : 'from-red-500 to-red-400';

  return (
    <Card className="overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-700 text-white">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        {skin.logoUrl ? (
          <img src={skin.logoUrl} alt={skin.name} className="h-16 w-16 rounded-xl border-2 border-slate-600 object-cover" />
        ) : (
          <div className="h-16 w-16 rounded-xl bg-slate-700 flex items-center justify-center">
            <span className="text-xl font-bold text-slate-400">{skin.name[0]?.toUpperCase()}</span>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold truncate">{skin.name}</h2>
            {skin.shortName && (
              <span className="text-xs text-slate-400 font-mono">({skin.shortName})</span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
            <span className="flex items-center gap-1"><Award className="h-3 w-3" />Level {brain.level}</span>
            <span>Prestige {brain.prestige}</span>
            <span className="flex items-center gap-1"><Users className="h-3 w-3" />{members.total} members</span>
          </div>
        </div>
      </div>

      {/* Energy Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-[10px] text-slate-400 mb-1">
          <span className="flex items-center gap-1"><Battery className="h-3 w-3" />Energy</span>
          <span>{brain.energy}/{brain.energyMax}</span>
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <div className={`h-full bg-gradient-to-r ${energyColor} rounded-full transition-all`} style={{ width: `${energyPct}%` }} />
        </div>
      </div>

      {/* XP Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-[10px] text-slate-400 mb-1">
          <span>XP</span>
          <span>{brain.xp.toLocaleString()}</span>
        </div>
        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-violet-500 to-violet-400 rounded-full transition-all" style={{ width: `${Math.min(100, (brain.xp % 1000) / 10)}%` }} />
        </div>
      </div>

      {/* Attributes */}
      <div className="mb-4">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Attributes</h3>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          {ATTRIBUTE_KEYS.map((key) => {
            const attr = ATTRIBUTE_LABELS[key];
            const value = brain.baseAttributes[key] ?? 0;
            return (
              <div key={key} className="flex items-center gap-2">
                <span className="text-slate-400">{attr.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between text-[10px] mb-0.5">
                    <span className="text-slate-300">{attr.label}</span>
                    <span className="text-slate-400">{value}</span>
                  </div>
                  <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${attr.color} transition-all`} style={{ width: `${value}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Consensus Tags */}
      {brain.consensusTags.length > 0 && (
        <div className="mb-4">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Consensus</h3>
          <div className="flex flex-wrap gap-1.5">
            {brain.consensusTags.slice(0, 8).map(({ tag, count }) => (
              <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
                {tag} <span className="text-violet-500/60">{count}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Members */}
      {members.top.length > 0 && (
        <div className="mb-4">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Squad</h3>
          <div className="flex items-center gap-2 flex-wrap">
            {members.top.map((member) => (
              <div key={member.userId} className="relative group">
                {member.avatarUrl ? (
                  <img
                    src={member.avatarUrl}
                    alt={member.name}
                    className={`h-8 w-8 rounded-full object-cover border-2 ${member.isCaptain ? 'border-amber-400' : 'border-slate-600'}`}
                  />
                ) : (
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-bold ${member.isCaptain ? 'bg-amber-500/20 text-amber-400 border-2 border-amber-400' : 'bg-slate-700 text-slate-400 border-2 border-slate-600'}`}>
                    {member.name[0]?.toUpperCase()}
                  </div>
                )}
                {member.isCaptain && (
                  <span className="absolute -top-1 -right-1 text-[8px]">👑</span>
                )}
              </div>
            ))}
            {members.total > members.top.length && (
              <span className="text-[10px] text-slate-500">+{members.total - members.top.length} more</span>
            )}
          </div>
        </div>
      )}

      {/* Narrative */}
      {narrative && (
        <div className="mb-4 p-3 rounded-lg bg-slate-800/30 border border-slate-700/30">
          <p className="text-sm text-slate-300 italic leading-relaxed">{narrative}</p>
        </div>
      )}

      {/* Recent Moments */}
      {moments.recent.length > 0 && (
        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Recent Moments</h3>
          <div className="space-y-1.5">
            {moments.recent.slice(0, 5).map((moment) => (
              <div key={moment.id} className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/30 border border-slate-700/30">
                <span className="text-sm">{MOMENT_ICONS[moment.kind] ?? '📌'}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-slate-200 truncate">{moment.label}</div>
                  <div className="text-[10px] text-slate-500">
                    {new Date(moment.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </div>
                </div>
                {moment.renderedKey && (
                  <a href={`/api/storage/${moment.renderedKey}`} target="_blank" rel="noopener noreferrer" className="text-[10px] text-emerald-400 hover:text-emerald-300">
                    View
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};
