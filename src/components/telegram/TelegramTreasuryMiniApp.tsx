'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { TonConnectButton, useTonAddress, useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { ArrowUpRight, CheckCircle2, Loader2, Wallet, Zap } from 'lucide-react';
import { buildTonCommentPayload, toTonNanoString } from '@/lib/ton/payload';

interface MiniAppTransaction {
  id: string;
  type: string;
  category: string;
  amount: number;
  description: string | null;
  createdAt: string;
  verified: boolean;
}

interface MiniAppContext {
  squadId: string;
  squadName: string;
  chatId: string | null;
  treasury: {
    balance: number;
    currency: string;
    pendingTopUps: number;
    recentTransactions: MiniAppTransaction[];
  };
  ton: {
    enabled: boolean;
    walletAddress: string | null;
    presets: number[];
  };
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        ready: () => void;
        expand: () => void;
        setHeaderColor?: (color: string) => void;
        setBackgroundColor?: (color: string) => void;
        BackButton?: { hide: () => void };
        MainButton?: { hide: () => void };
      };
    };
  }
}

export function TelegramTreasuryMiniApp() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();
  const tonAddress = useTonAddress();

  const [context, setContext] = useState<MiniAppContext | null>(null);
  const [amountTon, setAmountTon] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const canSubmit = Boolean(
    context?.ton.enabled &&
    context.ton.walletAddress &&
    wallet &&
    tonAddress &&
    Number.isInteger(amountTon) &&
    amountTon > 0
  );

  const shortTonAddress = useMemo(() => {
    if (!tonAddress) {
      return null;
    }

    return `${tonAddress.slice(0, 6)}...${tonAddress.slice(-4)}`;
  }, [tonAddress]);

  useEffect(() => {
    const webApp = window.Telegram?.WebApp;
    webApp?.ready();
    webApp?.expand();
    webApp?.BackButton?.hide();
    webApp?.MainButton?.hide();
    webApp?.setHeaderColor?.('#09111f');
    webApp?.setBackgroundColor?.('#09111f');
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadContext() {
      if (!token) {
        setError('Mini App token missing. Open this screen from Telegram.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/telegram/mini-app/context?token=${encodeURIComponent(token)}`, {
          cache: 'no-store',
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load Telegram Mini App context');
        }

        if (!cancelled) {
          setContext(data);
          setAmountTon(data.ton.presets[0] || 1);
        }
      } catch (fetchError) {
        if (!cancelled) {
          setError(fetchError instanceof Error ? fetchError.message : 'Failed to load Telegram Mini App context');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadContext();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleTopUp = async () => {
    if (!context?.ton.walletAddress) {
      setError('TON treasury top-ups are not configured for this squad yet.');
      return;
    }

    if (!canSubmit) {
      setError('Connect a TON wallet and choose a whole TON amount before submitting.');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    const comment = `SportWarren top-up:${context.squadId}:${amountTon}TON:${Date.now()}`;

    try {
      const result = await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 5 * 60,
        messages: [
          {
            address: context.ton.walletAddress,
            amount: toTonNanoString(amountTon),
            payload: buildTonCommentPayload(comment),
          },
        ],
      });

      const response = await fetch('/api/telegram/mini-app/top-up', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
        throw new Error(data.error || 'The TON transaction was sent, but SportWarren could not record it.');
      }

      setSuccessMessage(
        data.duplicate
          ? 'That TON top-up was already recorded in SportWarren.'
          : data.transaction?.verified
            ? 'TON top-up confirmed on-chain and applied to the squad treasury.'
            : 'TON top-up submitted. It is now visible as pending treasury reconciliation.'
      );

      const contextResponse = await fetch(`/api/telegram/mini-app/context?token=${encodeURIComponent(token)}`, {
        cache: 'no-store',
      });
      const nextContext = await contextResponse.json();
      if (contextResponse.ok) {
        setContext(nextContext);
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'TON top-up failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.18),_transparent_35%),linear-gradient(180deg,_#09111f_0%,_#101c30_100%)] px-4 py-6 text-slate-50">
      <div className="mx-auto flex w-full max-w-md flex-col gap-4">
        <section className="rounded-[28px] border border-white/10 bg-white/8 p-5 shadow-[0_24px_80px_rgba(3,7,18,0.35)] backdrop-blur">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-[11px] font-black uppercase tracking-[0.24em] text-emerald-300">Telegram Treasury</div>
              <h1 className="mt-2 text-2xl font-black tracking-tight text-white">
                {context?.squadName || 'Loading squad'}
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Connect a TON wallet and route a squad top-up through the Telegram Mini App. SportWarren records the submission as pending until treasury reconciliation.
              </p>
            </div>
            <div className="rounded-2xl bg-cyan-400/15 p-3 text-cyan-300">
              <Zap className="h-6 w-6" />
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Tracked Balance</div>
              <div className="mt-2 text-2xl font-black text-white">
                {loading ? '...' : context?.treasury.balance.toLocaleString()}
              </div>
              <div className="mt-1 text-xs text-slate-400">{context?.treasury.currency || 'TON'}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Pending Top-Ups</div>
              <div className="mt-2 text-2xl font-black text-amber-300">
                {loading ? '...' : context?.treasury.pendingTopUps ?? 0}
              </div>
              <div className="mt-1 text-xs text-slate-400">Awaiting verification</div>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-slate-950/55 p-5 shadow-[0_16px_48px_rgba(3,7,18,0.3)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[11px] font-black uppercase tracking-[0.22em] text-cyan-300">TON Connect</div>
              <p className="mt-2 text-sm text-slate-300">
                {shortTonAddress ? `Connected as ${shortTonAddress}` : 'Connect a TON wallet to continue.'}
              </p>
            </div>
            <TonConnectButton className="!w-auto" />
          </div>

          {loading && (
            <div className="mt-4 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading treasury context...
            </div>
          )}

          {!loading && !context?.ton.enabled && (
            <div className="mt-4 rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
              TON top-ups are not configured on this deployment yet. Set a squad TON vault address first.
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mt-4 flex items-start gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <div className="mt-5 rounded-[24px] border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Wallet className="h-4 w-4 text-cyan-300" />
              Squad TON vault
            </div>
            <p className="mt-2 break-all font-mono text-xs text-slate-300">
              {context?.ton.walletAddress || 'Not configured'}
            </p>
            <p className="mt-2 text-xs leading-5 text-slate-400">
              SportWarren writes this payment to the treasury ledger as a pending TON top-up. Balance stays unchanged until reconciliation.
            </p>
          </div>

          <div className="mt-5">
            <div className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">Choose amount</div>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {(context?.ton.presets || [1, 2, 5, 10]).map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmountTon(preset)}
                  className={`rounded-2xl border px-0 py-3 text-sm font-black transition ${
                    amountTon === preset
                      ? 'border-cyan-300 bg-cyan-300/15 text-cyan-100'
                      : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20'
                  }`}
                >
                  {preset} TON
                </button>
              ))}
            </div>
            <label className="mt-4 block text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
              Custom amount
            </label>
            <input
              type="number"
              min={1}
              step={1}
              value={amountTon}
              onChange={(event) => setAmountTon(Math.max(1, Math.round(Number(event.target.value) || 1)))}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-lg font-black text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300"
            />

            <button
              type="button"
              onClick={() => void handleTopUp()}
              disabled={!canSubmit || submitting}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-300 px-4 py-3 text-sm font-black uppercase tracking-[0.18em] text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting TON top-up
                </>
              ) : (
                <>
                  Submit TON top-up
                  <ArrowUpRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-slate-950/55 p-5 shadow-[0_16px_48px_rgba(3,7,18,0.3)]">
          <div className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">Recent treasury activity</div>
          <div className="mt-4 space-y-3">
            {context?.treasury.recentTransactions.length ? (
              context.treasury.recentTransactions.slice(0, 5).map((transaction) => (
                <div
                  key={transaction.id}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-bold text-white">
                        {transaction.description || transaction.category}
                      </div>
                      <div className="mt-1 text-xs text-slate-400">
                        {new Date(transaction.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-black ${transaction.type === 'income' ? 'text-emerald-300' : 'text-rose-300'}`}>
                        {transaction.type === 'income' ? '+' : '-'}
                        {transaction.amount.toLocaleString()} {context.treasury.currency}
                      </div>
                      <div className={`mt-1 text-[11px] font-bold uppercase tracking-[0.14em] ${transaction.verified ? 'text-emerald-200' : 'text-amber-200'}`}>
                        {transaction.verified ? 'Verified' : 'Pending'}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-slate-400">
                No treasury activity has been recorded for this Telegram-linked squad yet.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
