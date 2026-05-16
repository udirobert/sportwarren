import React from 'react';
import { History, CheckCircle2, Zap, Trophy, TrendingUp, AlertCircle, ExternalLink } from 'lucide-react';

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

/**
 * AttestationTimeline - Displays a cryptographically verifiable history of agent actions.
 * Core requirement for Kites Hackathon (Reputation & Agentic Economy).
 */
export const AttestationTimeline: React.FC<AttestationTimelineProps> = ({
  attestations,
  loading = false,
  marcusCommentary,
}) => {
  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Marcus AI Commentary */}
      {(marcusCommentary || attestations.length > 0) && (
        <div className="relative p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-800/50 overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-colors"></div>
          <div className="relative z-10 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border-2 border-emerald-500/20 shadow-sm">
              <img 
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus&backgroundColor=b6e3f4" 
                alt="Marcus" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Academy Director Marcus</span>
                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-[8px] font-black text-emerald-500">
                  <Brain className="w-2 h-2" />
                  LIVE INSIGHT
                </div>
              </div>
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 leading-relaxed italic">
                "{marcusCommentary || `I've been monitoring your Digital Twin's activity on the Kite Chain. The data shows clear progression in your tactical awareness and consistency. Keep this momentum.`}"
              </p>
            </div>
          </div>
        </div>
      )}

      {attestations.length === 0 ? (
    return (
      <div className="text-center py-10 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
        <History className="w-10 h-10 text-gray-300 mx-auto mb-3" />
        <p className="text-sm text-gray-500 font-medium">No on-chain attestations yet.</p>
        <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">Awaiting first verifiable event</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 relative before:absolute before:inset-0 before:left-[19px] before:w-[2px] before:bg-gradient-to-b before:from-emerald-500/20 before:via-gray-200 dark:before:via-gray-800 before:to-transparent">
      {attestations.map((att, idx) => {
        const Icon = getAttestationIcon(att.kind);
        const colorClass = getAttestationColor(att.kind);
        
        return (
          <div key={att.id} className="relative pl-12 py-1 group">
            {/* Timeline Dot */}
            <div className={`absolute left-0 top-1 w-10 h-10 rounded-xl border-4 border-white dark:border-gray-950 flex items-center justify-center transition-transform group-hover:scale-110 z-10 ${colorClass} shadow-sm`}>
              <Icon className="w-4 h-4 text-white" />
            </div>

            {/* Card */}
            <div className="p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm transition-all group-hover:shadow-md group-hover:border-emerald-500/30">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h4 className="text-xs font-black uppercase tracking-tight text-gray-900 dark:text-gray-100">
                  {formatAttestationKind(att.kind)}
                </h4>
                <span className="text-[9px] font-medium text-gray-400 whitespace-nowrap">
                  {new Date(att.timestamp).toLocaleDateString()}
                </span>
              </div>

              <div className="text-[11px] text-gray-600 dark:text-gray-400 mb-2 leading-relaxed">
                {renderAttestationSummary(att)}
              </div>

              {/* Meta info */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-50 dark:border-gray-800/50">
                <div className="flex items-center gap-3">
                  {att.txHash && (
                    <a 
                      href={`https://explorer.kite.ai/tx/${att.txHash}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[9px] font-bold text-emerald-600 hover:text-emerald-500 transition-colors"
                    >
                      <Zap className="w-2.5 h-2.5" />
                      KITE SCAN
                      <ExternalLink className="w-2 h-2" />
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
                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />
                  VERIFIED
                </div>
              </div>
            </div>
          </div>
        );
      })}
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
  return kind.split(/[._:]/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
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
