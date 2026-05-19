'use client';

import React from 'react';
import { ChainLabel } from '@/components/common/ChainLabel';
import {
  AlertCircle,
  Brain,
  CheckCircle2,
  ExternalLink,
  History,
  Star,
  TrendingUp,
  Trophy,
  Zap,
} from 'lucide-react';

export interface Attestation {
  id: string;
  kind: string;
  payload: any;
  timestamp: string;
  txHash?: string;
  amountUsdc?: number;
}

interface AttestationTimelineProps {
  attestations: Attestation[];
  loading?: boolean;
  marcusCommentary?: string;
}

export const AttestationTimeline: React.FC<AttestationTimelineProps> = ({
  attestations,
  loading = false,
  marcusCommentary,
}) => {
  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 rounded-xl bg-gray-100 dark:bg-gray-800" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {(marcusCommentary || attestations.length > 0) && (
        <div className="group relative overflow-hidden rounded-2xl border border-emerald-100 bg-emerald-50 p-4 dark:border-emerald-800/50 dark:bg-emerald-950/20">
          <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-emerald-500/10 blur-2xl transition-colors group-hover:bg-emerald-500/20" />
          <div className="relative z-10 flex items-start gap-4">
            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border-2 border-emerald-500/20 shadow-sm">
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus&backgroundColor=b6e3f4"
                alt="Marcus"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                  Academy Director Marcus
                </span>
                <div className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[8px] font-black text-emerald-500">
                  <Brain className="h-2 w-2" />
                  LIVE INSIGHT
                </div>
              </div>
              <p className="text-xs font-medium italic leading-relaxed text-gray-700 dark:text-gray-300">
                "
                {marcusCommentary ||
                  `I've been monitoring your Digital Twin's activity on the <ChainLabel chain="kite" />. The data shows clear progression in your tactical awareness and consistency. Keep this momentum.`}
                "
              </p>
            </div>
          </div>
        </div>
      )}

      {attestations.length === 0 && (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 py-10 text-center dark:border-gray-800 dark:bg-gray-900/50">
          <History className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <p className="text-sm font-medium text-gray-500">No on-chain attestations yet.</p>
          <p className="mt-1 text-[10px] uppercase tracking-widest text-gray-400">
            Awaiting first verifiable event
          </p>
        </div>
      )}

      {attestations.length > 0 && (
        <div className="relative space-y-3 before:absolute before:inset-0 before:left-[19px] before:w-[2px] before:bg-gradient-to-b before:from-emerald-500/20 before:via-gray-200 before:to-transparent dark:before:via-gray-800">
          {attestations.map((att) => {
            const Icon = getAttestationIcon(att.kind);
            const colorClass = getAttestationColor(att.kind);

            return (
              <div key={att.id} className="group relative py-1 pl-12">
                <div
                  className={`absolute left-0 top-1 z-10 flex h-10 w-10 items-center justify-center rounded-xl border-4 border-white shadow-sm transition-transform group-hover:scale-110 dark:border-gray-950 ${colorClass}`}
                >
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm transition-all group-hover:border-emerald-500/30 group-hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
                  <div className="mb-1 flex items-start justify-between gap-2">
                    <h4 className="text-xs font-black uppercase tracking-tight text-gray-900 dark:text-gray-100">
                      {formatAttestationKind(att.kind)}
                    </h4>
                    <span className="whitespace-nowrap text-[9px] font-medium text-gray-400">
                      {new Date(att.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="mb-2 text-[11px] leading-relaxed text-gray-600 dark:text-gray-400">
                    {renderAttestationSummary(att)}
                  </div>
                  <div className="flex items-center justify-between border-t border-gray-50 pt-2 dark:border-gray-800/50">
                    <div className="flex items-center gap-3">
                      {att.txHash && (
                        <a
                          href={`https://explorer.kite.ai/tx/${att.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[9px] font-bold text-emerald-600 transition-colors hover:text-emerald-500"
                        >
                          <Zap className="h-2.5 w-2.5" />
                          KITE SCAN
                          <ExternalLink className="h-2 w-2" />
                        </a>
                      )}
                      {att.amountUsdc !== undefined && att.amountUsdc > 0 && (
                        <div className="flex items-center gap-1 text-[9px] font-black text-gray-900 dark:text-gray-200">
                          <span className="text-emerald-500">$</span>
                          {att.amountUsdc.toFixed(2)} USDC
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-[8px] font-mono text-gray-400">
                      <CheckCircle2 className="h-2.5 w-2.5 text-emerald-500" />
                      VERIFIED
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

function getAttestationIcon(kind: string) {
  if (kind.includes('match')) return Trophy;
  if (kind.includes('reputation')) return TrendingUp;
  if (kind.includes('activity')) return Zap;
  if (kind.includes('coaching')) return Star;
  return AlertCircle;
}

function getAttestationColor(kind: string) {
  if (kind.includes('match')) return 'bg-amber-500';
  if (kind.includes('reputation')) return 'bg-emerald-500';
  if (kind.includes('activity')) return 'bg-blue-500';
  if (kind.includes('coaching')) return 'bg-purple-500';
  return 'bg-gray-500';
}

function formatAttestationKind(kind: string) {
  return kind
    .split(/[._:]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function renderAttestationSummary(att: Attestation) {
  const p = att.payload;

  switch (att.kind) {
    case 'reputation_delta':
      return `Reputation adjusted by ${p.change > 0 ? '+' : ''}${p.change} points. Reason: ${p.reason}`;
    case 'wage_payment':
      return `Platform settled squad wages of ${p.amountUsdc} USDC to wallet ${p.to.slice(0, 6)}...`;
    case 'match_result':
      return `Finalized match result: ${p.homeScore}-${p.awayScore} verified by consensus.`;
    case 'agent_hire':
      return `Authorized autonomous hiring of agent ${p.name} for ${p.durationDays} days.`;
    default:
      return p.message || `Verifiable ${att.kind} event recorded on-chain.`;
  }
}
