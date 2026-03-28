'use client';

import { useState } from 'react';
import { Vote, Shield, Check, X, Clock, Plus, AlertCircle } from 'lucide-react';
import { trpc } from '@/lib/trpc-client';
import type { MiniAppContext } from './TelegramMiniAppShell';

interface TelegramGovernanceTabProps {
  context: MiniAppContext;
  onRefresh: () => void;
}

export function TelegramGovernanceTab({ context }: TelegramGovernanceTabProps) {
  const squadId = context.squadId;
  const { data: proposals, refetch, isLoading } = trpc.squad.getProposals.useQuery({ squadId });

  const voteMutation = trpc.squad.voteOnProposal.useMutation({
    onSuccess: () => {
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');
      refetch();
    }
  });

  const [filter, setFilter] = useState<'active' | 'passed' | 'failed'>('active');

  const filteredProposals = (proposals as any[] || []).filter((p: any) => {
    if (filter === 'active') return p.status === 'active';
    if (filter === 'passed') return p.status === 'passed';
    return p.status === 'failed';
  });

  const handleVote = (proposalId: string, vote: 'yes' | 'no') => {
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('medium');
    voteMutation.mutate({ proposalId, vote });
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-400/10 text-blue-400">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Squad Governance</h2>
            <p className="text-[10px] text-slate-400">Decide your squad's future</p>
          </div>
        </div>
        <button 
          className="p-2 rounded-lg bg-white/5 text-slate-400 transition active:scale-95"
          onClick={() => {
            window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('light');
            window.Telegram?.WebApp?.showAlert('Proposal creation is currently only available on the Web App.');
          }}
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {/* Filter Chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {(['active', 'passed', 'failed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => {
              window.Telegram?.WebApp?.HapticFeedback?.selectionChanged();
              setFilter(f);
            }}
            className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition ${
              filter === f 
                ? 'bg-blue-500 text-white' 
                : 'bg-white/5 text-slate-400 border border-white/5'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Proposals List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="flex flex-col items-center py-12 text-slate-500 gap-3">
            <Clock className="h-8 w-8 animate-spin opacity-20" />
            <p className="text-xs">Scanning the ledger...</p>
          </div>
        ) : filteredProposals.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center">
            <Vote className="h-10 w-10 text-slate-700 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-400">No {filter} proposals</p>
            <p className="mt-1 text-xs text-slate-500">Every decision counts. Start one on the web.</p>
          </div>
        ) : (
          filteredProposals.map((proposal: any) => {
            const yesVotes = proposal.votes.filter((v: any) => v.vote === 'yes').length;
            const noVotes = proposal.votes.filter((v: any) => v.vote === 'no').length;
            const totalVotes = yesVotes + noVotes;
            const progress = totalVotes > 0 ? (yesVotes / proposal.quorum) * 100 : 0;
            const hasVoted = proposal.votes.some((v: any) => v.userId === context.userId);

            return (
              <div key={proposal.id} className="rounded-2xl border border-white/5 bg-white/[0.04] p-4 space-y-3 transition active:bg-white/[0.06]">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-white truncate">{proposal.title}</h3>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">{proposal.description}</p>
                  </div>
                  <span className="shrink-0 text-[10px] font-black bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full uppercase tracking-tighter ml-2">
                    {proposal.type.replace('_', ' ')}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <span>Quorum Progress</span>
                    <span className="text-slate-300">{totalVotes} / {proposal.quorum} Votes</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 transition-all duration-500" 
                      style={{ width: `${Math.min(100, progress)}%` }} 
                    />
                  </div>
                </div>

                {/* Actions */}
                {proposal.status === 'active' && !hasVoted && (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => handleVote(proposal.id, 'yes')}
                      disabled={voteMutation.isPending}
                      className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 py-2.5 text-xs font-bold text-emerald-400 transition active:scale-95 disabled:opacity-50"
                    >
                      <Check className="h-4 w-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleVote(proposal.id, 'no')}
                      disabled={voteMutation.isPending}
                      className="flex items-center justify-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 py-2.5 text-xs font-bold text-rose-400 transition active:scale-95 disabled:opacity-50"
                    >
                      <X className="h-4 w-4" />
                      Reject
                    </button>
                  </div>
                )}

                {hasVoted && proposal.status === 'active' && (
                  <div className="flex items-center justify-center gap-2 py-2 text-[11px] font-bold text-emerald-400 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                    <Check className="h-3.5 w-3.5" />
                    Vote Recorded
                  </div>
                )}

                {proposal.status !== 'active' && (
                  <div className={`flex items-center justify-center gap-2 py-2 text-[11px] font-bold rounded-xl border ${
                    proposal.status === 'passed' 
                      ? 'text-emerald-400 bg-emerald-500/5 border-emerald-500/10' 
                      : 'text-rose-400 bg-rose-500/5 border-rose-500/10'
                  }`}>
                    {proposal.status === 'passed' ? <Check className="h-3.5 w-3.5" /> : <X className="h-4 w-4" />}
                    Proposal {proposal.status.toUpperCase()}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Info Card */}
      <div className="rounded-2xl bg-amber-500/5 border border-amber-500/10 p-4 flex gap-3">
        <AlertCircle className="h-5 w-5 text-amber-400 shrink-0" />
        <p className="text-[11px] leading-relaxed text-amber-200/70">
          Governance actions require a minimum quorum to pass. Votes are immutable once recorded on the squad's private ledger.
        </p>
      </div>
    </div>
  );
}
