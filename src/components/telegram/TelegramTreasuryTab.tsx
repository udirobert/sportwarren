'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { TonConnectButton, useTonAddress, useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  Clock,
  Loader2,
  AlertCircle,
  Zap,
  RefreshCw,
  Copy,
  TrendingUp,
  Banknote,
} from 'lucide-react';
import type { MiniAppContext, TreasuryTransaction } from './TelegramMiniAppShell';

// Import TON payload utilities
const toTonNanoString = (ton: number): string => {
  return String(Math.floor(ton * 1_000_000_000));
};

const buildTonCommentPayload = (comment: string): string => {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(comment);
  const base64 = btoa(String.fromCharCode(...bytes));
  return base64;
};

interface TelegramTreasuryTabProps {
  context: MiniAppContext;
  onRefresh?: () => void;
}

// Transaction item component
function TransactionItem({ transaction }: { transaction: TreasuryTransaction }) {
  const isIncome = transaction.type === 'income';
  const isPending = !transaction.verified;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      deposit_pending: 'Top-up (Pending)',
      deposit: 'Top-up',
      withdrawal: 'Withdrawal',
      match_fee: 'Match Fee',
      reward: 'Reward',
      transfer: 'Transfer',
    };
    return labels[category] || category;
  };

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <div className="flex items-center gap-3">
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${
          isIncome ? 'bg-emerald-500/10' : 'bg-rose-500/10'
        }`}>
          {isIncome ? (
            <ArrowDownLeft className={`h-4 w-4 ${isPending ? 'text-amber-400' : 'text-emerald-400'}`} />
          ) : (
            <ArrowUpRight className="h-4 w-4 text-rose-400" />
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-white">
            {transaction.description || getCategoryLabel(transaction.category)}
          </p>
          <p className="text-[10px] text-slate-500">{formatDate(transaction.createdAt)}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={`text-sm font-bold ${isIncome ? 'text-emerald-400' : 'text-rose-400'}`}>
          {isIncome ? '+' : '-'}{transaction.amount.toLocaleString()}
        </p>
        <div className="flex items-center justify-end gap-1">
          {isPending ? (
            <>
              <Clock className="h-3 w-3 text-amber-400" />
              <span className="text-[10px] font-medium text-amber-400">Pending</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="h-3 w-3 text-emerald-400" />
              <span className="text-[10px] font-medium text-emerald-400">Verified</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function TelegramTreasuryTab({ context, onRefresh }: TelegramTreasuryTabProps) {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();
  const tonAddress = useTonAddress();

  const [amountTon, setAmountTon] = useState<number>(context.ton.presets[0] || 1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { treasury, ton, squad: _squad } = context;

  // Check if can submit
  const canSubmit = Boolean(
    ton.enabled &&
    ton.walletAddress &&
    wallet &&
    tonAddress &&
    Number.isInteger(amountTon) &&
    amountTon > 0
  );

  // Format wallet address for display
  const shortTonAddress = useMemo(() => {
    if (!tonAddress) return null;
    return `${tonAddress.slice(0, 6)}...${tonAddress.slice(-4)}`;
  }, [tonAddress]);

  const shortVaultAddress = useMemo(() => {
    if (!ton.walletAddress) return null;
    return `${ton.walletAddress.slice(0, 8)}...${ton.walletAddress.slice(-6)}`;
  }, [ton.walletAddress]);

  // Handle copy vault address
  const handleCopyVault = async () => {
    if (!ton.walletAddress) return;
    try {
      await navigator.clipboard.writeText(ton.walletAddress);
      setCopied(true);
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('error');
    }
  };

  // Handle TON top-up
  const handleTopUp = useCallback(async () => {
    if (!ton.walletAddress || !canSubmit || submitting) {
      if (!canSubmit && !submitting) {
        setError('Connect a TON wallet and choose an amount before submitting.');
        window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('error');
      }
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);
    window.Telegram?.WebApp?.MainButton?.showProgress();

    const comment = `SportWarren top-up:${context.squadId}:${amountTon}TON:${Date.now()}`;

    try {
      // Send TON transaction
      const result = await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 5 * 60, // 5 min validity
        messages: [
          {
            address: ton.walletAddress,
            amount: toTonNanoString(amountTon),
            payload: buildTonCommentPayload(comment),
          },
        ],
      });

      // Record the top-up in SportWarren
      const response = await fetch('/api/telegram/mini-app/top-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          senderAddress: tonAddress,
          amountTon,
          boc: result.boc,
          comment,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to record top-up');
      }

      setSuccess(
        data.duplicate
          ? 'This top-up was already recorded.'
          : data.transaction?.verified
            ? 'Top-up confirmed and applied!'
            : 'Top-up submitted! Pending verification.'
      );

      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');

      // Refresh context after success
      setTimeout(() => {
        onRefresh?.();
        setSuccess(null);
      }, 2000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Top-up failed';
      setError(message);
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('error');
    } finally {
      setSubmitting(false);
      window.Telegram?.WebApp?.MainButton?.hideProgress();
    }
  }, [ton.walletAddress, canSubmit, submitting, context.squadId, amountTon, tonConnectUI, token, tonAddress, onRefresh]);

  // Integration with Telegram native buttons
  useEffect(() => {
    const webApp = window.Telegram?.WebApp;
    if (!webApp) return;

    if (canSubmit && !submitting) {
      webApp.MainButton.setText(`TOP UP ${amountTon} TON`);
      webApp.MainButton.onClick(handleTopUp);
      webApp.MainButton.show();
    } else {
      webApp.MainButton.hide();
      webApp.MainButton.offClick(handleTopUp);
    }

    return () => {
      webApp.MainButton.offClick(handleTopUp);
    };
  }, [canSubmit, submitting, amountTon, handleTopUp]);

  // Handle preset selection with haptic feedback
  const selectPreset = (amount: number) => {
    setAmountTon(amount);
    window.Telegram?.WebApp?.HapticFeedback?.selectionChanged();
  };

  return (
    <div className="space-y-4 p-4 pb-24">
      {/* Balance Card */}
      <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-900/30 via-slate-800/50 to-slate-900/50">
        <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative p-6">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            <Wallet className="h-4 w-4 text-cyan-400" />
            Squad Treasury
          </div>

          <div className="mt-4">
            <p className="text-4xl font-black text-white">
              {treasury.balance.toLocaleString()}
              <span className="ml-2 text-lg font-bold text-slate-400">{treasury.currency}</span>
            </p>
            {treasury.pendingTopUps > 0 && (
              <p className="mt-1 flex items-center gap-1 text-xs text-amber-400">
                <Clock className="h-3 w-3" />
                {treasury.pendingTopUps} pending top-up{treasury.pendingTopUps > 1 ? 's' : ''}
              </p>
            )}
          </div>

          <div className="mt-4 flex items-center gap-4 rounded-xl bg-black/20 px-4 py-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              <div>
                <p className="text-[10px] text-slate-500">Income</p>
                <p className="text-sm font-bold text-emerald-400">
                  +{treasury.recentTransactions
                    .filter(t => t.type === 'income' && t.verified)
                    .reduce((sum, t) => sum + t.amount, 0)
                    .toLocaleString()}
                </p>
              </div>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="flex items-center gap-2">
              <Banknote className="h-4 w-4 text-rose-400" />
              <div>
                <p className="text-[10px] text-slate-500">Expenses</p>
                <p className="text-sm font-bold text-rose-400">
                  -{treasury.recentTransactions
                    .filter(t => t.type === 'expense' && t.verified)
                    .reduce((sum, t) => sum + t.amount, 0)
                    .toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TON Connect Section */}
      <section className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
        <div className="border-b border-white/5 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-cyan-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">TON Connect</span>
            </div>
            <TonConnectButton className="!h-8" />
          </div>
        </div>

        <div className="p-4">
          {shortTonAddress ? (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span className="text-sm text-emerald-300">Connected as {shortTonAddress}</span>
            </div>
          ) : (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
              <AlertCircle className="h-4 w-4 text-slate-400" />
              <span className="text-sm text-slate-400">Connect wallet to top up</span>
            </div>
          )}

          {!ton.enabled && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
              <AlertCircle className="h-4 w-4 text-amber-400" />
              <span className="text-sm text-amber-300">TON top-ups not configured for this squad</span>
            </div>
          )}

          {ton.walletAddress && (
            <div className="mb-4 rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Squad Vault</p>
                  <p className="mt-1 font-mono text-xs text-slate-300">{shortVaultAddress}</p>
                </div>
                <button
                  onClick={handleCopyVault}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-slate-400 transition hover:bg-white/10 hover:text-white"
                >
                  {copied ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          )}

          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">Amount</p>
            <div className="grid grid-cols-4 gap-2">
              {ton.presets.map((preset) => (
                <button
                  key={preset}
                  onClick={() => selectPreset(preset)}
                  className={`rounded-xl border py-3 text-sm font-bold transition ${
                    amountTon === preset
                      ? 'border-cyan-400/50 bg-cyan-400/10 text-cyan-300'
                      : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-white'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>

            <div className="mt-3">
              <input
                type="number"
                min={1}
                step={1}
                value={amountTon}
                onChange={(e) => setAmountTon(Math.max(1, Math.round(Number(e.target.value) || 1)))}
                className="w-full rounded-xl border border-white/10 bg-slate-800/50 px-4 py-3 text-center text-lg font-bold text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400/50"
              />
              <p className="mt-1 text-center text-[10px] text-slate-500">Enter custom amount in TON</p>
            </div>
          </div>

          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {success && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              {success}
            </div>
          )}

          {!window.Telegram?.WebApp && (
            <button
              onClick={handleTopUp}
              disabled={!canSubmit || submitting}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-500 px-4 py-4 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <ArrowUpRight className="h-4 w-4" />
                  Top Up {amountTon} TON
                </>
              )}
            </button>
          )}

          <p className="mt-3 text-center text-[10px] text-slate-500">
            Top-ups are recorded as pending until verified on-chain
          </p>
        </div>
      </section>

      {/* Recent Activity */}
      <section className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
        <div className="border-b border-white/5 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Recent Activity</span>
            </div>
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="flex h-6 w-6 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white/5 hover:text-white"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="divide-y divide-white/5">
          {treasury.recentTransactions.length > 0 ? (
            treasury.recentTransactions.slice(0, 8).map((transaction) => (
              <TransactionItem key={transaction.id} transaction={transaction} />
            ))
          ) : (
            <div className="py-8 text-center">
              <Wallet className="mx-auto h-8 w-8 text-slate-600" />
              <p className="mt-2 text-sm text-slate-500">No transactions yet</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default TelegramTreasuryTab;
