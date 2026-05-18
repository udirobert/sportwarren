'use client';

import { useState, useCallback } from 'react';
import { Vote, Shield, Clock, ExternalLink, Check, X, AlertCircle, Info, ArrowUpRight } from 'lucide-react';
import { trpc } from '@/lib/trpc-client';
import type { MiniAppContext } from './TelegramMiniAppShell';

interface TelegramGovernanceTabProps {
  context: MiniAppContext;
  onRefresh: () => void;
}

type FilterState = 'active' | 'passed' | 'failed';

const STATUS_FILTER_MAP: Record<FilterState, string[]> = {
  active: ['Pending', 'Active'],
  passed: ['Succeeded', 'Queued', 'Executed'],
  failed: ['Canceled', 'Defeated', 'Expired'],
};

function VoteProgressBar({ votesFor, votesAgainst }: { votesFor: number; votesAgainst: number }) {
  const total = votesFor + votesAgainst;
  const forPercent = total > 0 ? (votesFor / total) * 100 : 0;
  const againstPercent = total > 0 ? (votesAgainst / total) * 100 : 0;

  return (
    <div className="space-y-1.5">
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full bg-emerald-500 transition-all duration-500"
          style={{ width: `${forPercent}%` }}
        />
        <div
          className="h-full bg-rose-500 transition-all duration-500"
          style={{ width: `${againstPercent}%` }}
        />
      </div>
      <div className="flex justify-between text-[10px] font-medium text-slate-500">
        <span className="text-emerald-400">{votesFor.toLocaleString()} For</span>
        <span className="text-rose-400">{votesAgainst.toLocaleString()} Against</span>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; label: string; pulse?: boolean }> = {
    Pending: { bg: 'bg-blue-500/10 border-blue-500/20', text: 'text-blue-400', label: 'Pending' },
    Active: { bg: 'bg-emerald-500/10 border-emerald-500/20', text: 'text-emerald-400', label: 'Active', pulse: true },
    Canceled: { bg: 'bg-slate-500/10 border-slate-500/20', text: 'text-slate-400', label: 'Canceled' },
    Defeated: { bg: 'bg-rose-500/10 border-rose-500/20', text: 'text-rose-400', label: 'Defeated' },
    Succeeded: { bg: 'bg-emerald-500/10 border-emerald-500/20', text: 'text-emerald-400', label: 'Passed ✓' },
    Queued: { bg: 'bg-amber-500/10 border-amber-500/20', text: 'text-amber-400', label: 'Queued' },
    Expired: { bg: 'bg-slate-500/10 border-slate-500/20', text: 'text-slate-400', label: 'Expired' },
    Executed: { bg: 'bg-emerald-500/10 border-emerald-500/20', text: 'text-emerald-400', label: 'Executed ✓' },
  };

  const c = config[status] || { bg: 'bg-white/5 border-white/10', text: 'text-slate-400', label: status };

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${c.bg} ${c.text}`}>
      {c.pulse && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />}
      {c.label}
    </span>
  );
}

export function TelegramGovernanceTab({ context, onRefresh: _onRefresh }: TelegramGovernanceTabProps) {
  const squadId = context.squadId;
  const { data: proposals, isLoading, error: fetchError, refetch } = trpc.squad.getProposals.useQuery({ squadId });
  const voteMutation = trpc.squad.castVote.useMutation({
    onSuccess: () => {
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');
      setVotingResult({ success: true, message: 'Vote cast on-chain!' });
      // Refetch after a brief delay for the tx to propagate
      setTimeout(() => refetch(), 3000);
    },
    onError: (err) => {
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('error');
      setVotingResult({ success: false, message: err.message || 'Vote failed' });
    },
  });

  const [filter, setFilter] = useState<FilterState>('active');
  const [votingResult, setVotingResult] = useState<{ success: boolean; message: string } | null>(null);
  const [confirmingVote, setConfirmingVote] = useState<{ proposalId: string; support: number } | null>(null);

  const filteredProposals = (proposals || []).filter((p) =>
    STATUS_FILTER_MAP[filter].includes(p.status),
  );

  const handleVote = useCallback((proposalId: string, support: 0 | 1) => {
    setConfirmingVote({ proposalId, support });
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('medium');
  }, []);

  const confirmVote = useCallback(() => {
    if (!confirmingVote) return;
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('heavy');
    voteMutation.mutate({
      proposalId: confirmingVote.proposalId,
      support: confirmingVote.support,
    });
    setConfirmingVote(null);
  }, [confirmingVote, voteMutation]);

  const cancelConfirm = useCallback(() => {
    setConfirmingVote(null);
    window.Telegram?.WebApp?.HapticFeedback?.selectionChanged();
  }, []);

  return (
    <div className="p-4 space-y-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-400/10 text-blue-400">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Squad Governance</h2>
            <p className="text-[10px] text-slate-400">On-chain • {proposals?.length || 0} proposals</p>
          </div>
        </div>
        <a
          href="https://testnet.snowtrace.io/address/0x2e98aF1871bF208Ad361202884AB88F904eFf826"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 rounded-lg bg-white/5 px-3 py-2 text-[10px] font-bold text-blue-400 transition active:scale-95"
          onClick={() => window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('light')}
        >
          Governor <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {/* Filter Chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {(['active', 'passed', 'failed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => {
              window.Telegram?.WebApp?.HapticFeedback?.selectionChanged();
              setFilter(f);
              setVotingResult(null);
            }}
            className={`px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition ${
              filter === f 
                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25' 
                : 'bg-white/5 text-slate-400 border border-white/5'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Voting Confirmation Modal */}
      {confirmingVote && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm pb-12">
          <div className="mx-4 w-full max-w-sm rounded-3xl border border-white/10 bg-[#0f172a] p-6 shadow-2xl">
            <div className="mb-4 text-center">
              <div className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl ${
                confirmingVote.support === 1 ? 'bg-emerald-500/20' : 'bg-rose-500/20'
              }`}>
                {confirmingVote.support === 1 ? (
                  <Check className="h-6 w-6 text-emerald-400" />
                ) : (
                  <X className="h-6 w-6 text-rose-400" />
                )}
              </div>
              <h3 className="text-sm font-bold text-white">Confirm Vote</h3>
              <p className="mt-1 text-xs text-slate-400">
                Vote <span className={`font-bold ${confirmingVote.support === 1 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {confirmingVote.support === 1 ? 'FOR' : 'AGAINST'}
                </span> this proposal?
              </p>
            </div>
            <div className="mb-4 rounded-xl bg-blue-500/5 border border-blue-500/10 p-3 flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-blue-200/70 leading-relaxed">
                Your vote is cast via the platform relayer on Avalanche Fuji. The transaction will be signed and submitted on-chain.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={cancelConfirm}
                disabled={voteMutation.isPending}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 text-xs font-bold text-slate-300 transition active:scale-95 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmVote}
                disabled={voteMutation.isPending}
                className={`flex-1 rounded-xl py-3 text-xs font-bold text-white transition active:scale-95 disabled:opacity-50 ${
                  confirmingVote.support === 1
                    ? 'bg-emerald-500 shadow-lg shadow-emerald-500/25'
                    : 'bg-rose-500 shadow-lg shadow-rose-500/25'
                }`}
              >
                {voteMutation.isPending ? 'Broadcasting...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vote Result Toast */}
      {votingResult && (
        <div className={`flex items-center gap-2 rounded-2xl border p-4 text-sm ${
          votingResult.success
            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
            : 'border-rose-500/30 bg-rose-500/10 text-rose-300'
        }`}>
          {votingResult.success ? <Check className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
          <span className="text-xs">{votingResult.message}</span>
          <button
            onClick={() => setVotingResult(null)}
            className="ml-auto text-slate-500 hover:text-slate-300"
          >
            ✕
          </button>
        </div>
      )}

      {/* Error State */}
      {fetchError && (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
          <div>
            <p className="text-xs font-bold text-rose-300">Failed to load proposals</p>
            <p className="text-[11px] text-rose-200/60 mt-0.5">The on-chain indexer may be unavailable. Try again shortly.</p>
            <button
              onClick={() => refetch()}
              className="mt-2 rounded-lg bg-white/5 px-3 py-1 text-[10px] font-bold text-slate-400"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Proposals List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="flex flex-col items-center py-12 text-slate-500 gap-3">
            <Clock className="h-8 w-8 animate-spin opacity-20" />
            <p className="text-xs">Indexing on-chain proposals...</p>
          </div>
        ) : filteredProposals.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center">
            <Vote className="h-10 w-10 text-slate-700 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-400">No {filter} proposals</p>
            <p className="mt-1 text-xs text-slate-500">
              {filter === 'active'
                ? 'Create a proposal on-chain to get started.'
                : 'Proposals will appear here once they reach this stage.'}
            </p>
            <a
              href="https://testnet.snowtrace.io/address/0x2e98aF1871bF208Ad361202884AB88F904eFf826#writeContract"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1 rounded-xl bg-blue-500/10 px-4 py-2 text-xs font-bold text-blue-400 border border-blue-500/20"
            >
              Create on Snowtrace <ArrowUpRight className="h-3 w-3" />
            </a>
          </div>
        ) : (
          filteredProposals.map((proposal: any) => (
            <div
              key={proposal.id}
              className={`rounded-2xl border bg-white/[0.04] p-4 space-y-3 transition ${
                proposal.status === 'Active' ? 'border-emerald-500/20 ring-1 ring-emerald-500/5' : 'border-white/5'
              }`}
            >
              {/* Header */}
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <StatusBadge status={proposal.status} />
                    <span className="text-[10px] text-slate-600 font-mono">
                      #{proposal.id.slice(0, 8)}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white leading-tight line-clamp-2">
                    {proposal.description || 'Untitled Proposal'}
                  </h3>
                </div>
              </div>

              {/* Vote Progress */}
              {(proposal.status === 'Active' || proposal.status === 'Pending') && (
                <VoteProgressBar
                  votesFor={proposal.votesFor || 0}
                  votesAgainst={proposal.votesAgainst || 0}
                />
              )}

              {/* Final Vote Tally for closed proposals */}
              {!['Active', 'Pending'].includes(proposal.status) && (
                <div className={`rounded-xl px-3 py-2 text-center text-xs font-bold ${
                  proposal.status === 'Defeated' || proposal.status === 'Canceled'
                    ? 'bg-rose-500/10 text-rose-300'
                    : 'bg-emerald-500/10 text-emerald-300'
                }`}>
                  {proposal.votesFor > proposal.votesAgainst ? '✓ Approved' : '✗ Defeated'} 
                  {' · '}{proposal.votesFor || 0}F / {proposal.votesAgainst || 0}A
                </div>
              )}

              {/* Vote Actions (Active only) */}
              {proposal.status === 'Active' && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => handleVote(proposal.id, 1)}
                    disabled={voteMutation.isPending}
                    className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 py-2.5 text-xs font-bold text-emerald-400 transition active:scale-95 disabled:opacity-50 hover:bg-emerald-500/20"
                  >
                    <Check className="h-4 w-4" />
                    For
                  </button>
                  <button
                    onClick={() => handleVote(proposal.id, 0)}
                    disabled={voteMutation.isPending}
                    className="flex items-center justify-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 py-2.5 text-xs font-bold text-rose-400 transition active:scale-95 disabled:opacity-50 hover:bg-rose-500/20"
                  >
                    <X className="h-4 w-4" />
                    Against
                  </button>
                </div>
              )}

              {/* Explorer Link */}
              <div className="pt-1 flex items-center justify-between border-t border-white/5">
                <span className="text-[10px] text-slate-600">Proposer: {proposal.proposer?.slice(0, 6)}...{proposal.proposer?.slice(-4)}</span>
                <a
                  href={`https://testnet.snowtrace.io/tx/${proposal.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1"
                  onClick={() => window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('light')}
                >
                  Tx <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Info Card */}
      <div className="rounded-2xl bg-blue-500/5 border border-blue-500/10 p-4 flex gap-3">
        <Shield className="h-5 w-5 text-blue-400 shrink-0" />
        <p className="text-[11px] leading-relaxed text-blue-200/70">
          Proposals are fetched directly from the SquadGovernor contract on Avalanche Fuji. 
          Votes are submitted on-chain via the platform relayer.
        </p>
      </div>
    </div>
  );
}
