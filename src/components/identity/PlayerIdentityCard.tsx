'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Award, Calendar, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import type { PlayerIdentity } from '@/server/services/personalization/identity';
import { ATTRIBUTE_KEYS } from '@/server/services/personalization/twin-types';
import { ATTRIBUTE_DISPLAY, ATTRIBUTE_BAR_TONES } from '@/lib/attributes/display';

interface PlayerIdentityCardProps {
  identity: PlayerIdentity;
}

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

export const PlayerIdentityCard: React.FC<PlayerIdentityCardProps> = ({ identity }) => {
  const { skin, brain, moments, narrative, recentAttestations } = identity;

  return (
    <Card className="overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-700 text-white">
      {/* Header */}
      <div className="relative pb-4">
        {skin.avatarUrl && (
          <div className="absolute inset-x-0 top-0 h-24 opacity-20">
            <img src={skin.avatarUrl} alt="" className="w-full h-full object-cover blur-sm" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900" />
          </div>
        )}
        <div className="relative flex items-end gap-4 pt-4">
          {skin.avatarUrl ? (
            <img src={skin.avatarUrl} alt={skin.name} className="h-20 w-20 rounded-xl border-2 border-emerald-400 shadow-lg shadow-emerald-500/20 object-cover" />
          ) : (
            <div className="h-20 w-20 rounded-xl bg-slate-700 flex items-center justify-center">
              <span className="text-2xl font-bold text-slate-400">{skin.name[0]?.toUpperCase()}</span>
            </div>
          )}
          <div className="min-w-0 flex-1 pb-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold truncate">{skin.name}</h2>
              {skin.position && (
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {skin.position}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Award className="h-3 w-3" />
                Level {brain.level}
              </span>
              <span>Prestige {brain.prestige}</span>
              <span className="capitalize">{skin.chain}</span>
            </div>
          </div>
        </div>
      </div>

      {/* XP Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-[10px] text-slate-400 mb-1">
          <span>XP</span>
          <span>{brain.xp.toLocaleString()}</span>
        </div>
        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all" style={{ width: `${Math.min(100, (brain.xp % 1000) / 10)}%` }} />
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {[
          { label: 'Matches', value: brain.matchStats.matches },
          { label: 'Goals', value: brain.matchStats.goals },
          { label: 'Assists', value: brain.matchStats.assists },
          { label: 'Rep', value: brain.reputation },
        ].map((stat) => (
          <div key={stat.label} className="text-center p-2 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <div className="text-lg font-bold text-white">{stat.value}</div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Attributes */}
      <div className="mb-4">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Attributes</h3>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          {ATTRIBUTE_KEYS.map((key) => {
            const display = ATTRIBUTE_DISPLAY[key];
            const Icon = display.Icon;
            const base = brain.baseAttributes[key] ?? 0;
            const effective = brain.effectiveAttributes[key] ?? 0;
            const boost = effective - base;
            return (
              <div key={key} className="flex items-center gap-2">
                <span className="text-slate-400"><Icon className="h-3.5 w-3.5" /></span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between text-[10px] mb-0.5">
                    <span className="text-slate-300">{display.label}</span>
                    <span className={boost > 0 ? 'text-emerald-400' : 'text-slate-400'}>
                      {effective}{boost > 0 && ` (+${boost})`}
                    </span>
                  </div>
                  <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${ATTRIBUTE_BAR_TONES[key]} transition-all`} style={{ width: `${effective}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Narrative */}
      {narrative && (
        <div className="mb-4 p-3 rounded-lg bg-slate-800/30 border border-slate-700/30">
          <p className="text-sm text-slate-300 italic leading-relaxed">{narrative}</p>
        </div>
      )}

      {/* Active Modifiers */}
      {brain.activeModifiers.length > 0 && (
        <div className="mb-4">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Active Modifiers</h3>
          <div className="flex flex-wrap gap-1.5">
            {brain.activeModifiers.map((mod) => (
              <span key={mod.id} className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-semibold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {mod.source}
                {Object.entries(mod.deltas).map(([k, v]) => v !== undefined && (
                  <span key={k} className={v > 0 ? 'text-emerald-400' : 'text-red-400'}>
                    {v > 0 ? '+' : ''}{v} {k.slice(0, 3)}
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recent Moments */}
      {moments.recent.length > 0 && (
        <div className="mb-4">
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

      {/* Recent Attestations */}
      {recentAttestations.length > 0 && (
        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Recent Attestations</h3>
          <div className="space-y-1">
            {recentAttestations.slice(0, 3).map((att) => (
              <div key={att.id} className="flex items-center gap-2 text-[10px] text-slate-400">
                <Clock className="h-3 w-3 shrink-0" />
                <span className="capitalize">{att.kind.replace(/_/g, ' ')}</span>
                <span className="ml-auto">{new Date(att.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};
