"use client";

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PaymentRailNotice } from '@/components/payments/PaymentRailNotice';
import { useToast } from '@/contexts/ToastContext';
import { 
  Wallet, ArrowUpRight, ArrowDownRight, Plus, Minus, 
  History, PieChart
} from 'lucide-react';
import type { Treasury as TreasuryType, TreasuryTransaction } from '@/types';
import { MOCK_TREASURY } from '@/lib/mocks';

interface TreasuryProps {
  treasury?: TreasuryType;
  onDeposit?: (amount: number) => Promise<void>;
  onWithdraw?: (amount: number, reason: string) => Promise<void>;
  onSetTonWalletAddress?: (walletAddress: string | null) => Promise<void>;
  onReconcilePendingTopUp?: (transactionId: string, settledTxHash?: string) => Promise<void>;
}

export const Treasury: React.FC<TreasuryProps> = ({
  treasury = MOCK_TREASURY,
  onDeposit,
  onWithdraw,
  onSetTonWalletAddress,
  onReconcilePendingTopUp,
}) => {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'deposit' | 'withdraw'>('overview');
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawReason, setWithdrawReason] = useState('');
  const [tonWalletAddress, setTonWalletAddress] = useState(treasury.tonRail?.walletAddress ?? '');
  const [settlementReferences, setSettlementReferences] = useState<Record<string, string>>({});
  const [savingTonWallet, setSavingTonWallet] = useState(false);
  const [reconcilingTransactionId, setReconcilingTransactionId] = useState<string | null>(null);

  useEffect(() => {
    setTonWalletAddress(treasury.tonRail?.walletAddress ?? '');
  }, [treasury.tonRail?.walletAddress]);

  // Calculate stats
  const totalIncome = treasury.transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpenses = treasury.transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyIncome = treasury.transactions
    .filter(t => t.type === 'income' && t.timestamp > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingTonTopUps = treasury.transactions.filter(
    (transaction) => transaction.category === 'deposit_pending' && !transaction.verified
  );

  const handleDeposit = async () => {
    const amount = parseInt(depositAmount);
    if (amount > 0) {
      try {
        await onDeposit?.(amount);
        setDepositAmount('');
        setActiveTab('overview');
        addToast({
          title: 'Treasury',
          message: 'Deposit recorded successfully.',
          tone: 'success',
        });
      } catch (error) {
        addToast({
          title: 'Treasury',
          message: error instanceof Error ? error.message : 'Deposit failed.',
          tone: 'error',
        });
      }
    }
  };

  const handleWithdraw = async () => {
    const amount = parseInt(withdrawAmount);
    if (amount > 0 && withdrawReason.trim()) {
      try {
        await onWithdraw?.(amount, withdrawReason);
        setWithdrawAmount('');
        setWithdrawReason('');
        setActiveTab('overview');
        addToast({
          title: 'Treasury',
          message: 'Withdrawal recorded successfully.',
          tone: 'success',
        });
      } catch (error) {
        addToast({
          title: 'Treasury',
          message: error instanceof Error ? error.message : 'Withdrawal failed.',
          tone: 'error',
        });
      }
    }
  };

  const handleSaveTonWallet = async (nextWalletAddress = tonWalletAddress) => {
    if (!onSetTonWalletAddress) {
      return;
    }

    setSavingTonWallet(true);
    try {
      const trimmedWalletAddress = nextWalletAddress.trim();
      await onSetTonWalletAddress(trimmedWalletAddress || null);
      setTonWalletAddress(trimmedWalletAddress);
      addToast({
        title: 'TON Vault',
        message: trimmedWalletAddress
          ? 'Squad TON vault updated.'
          : 'Squad TON vault cleared.',
        tone: 'success',
      });
    } catch (error) {
      addToast({
        title: 'TON Vault',
        message: error instanceof Error ? error.message : 'Failed to update the squad TON vault.',
        tone: 'error',
      });
    } finally {
      setSavingTonWallet(false);
    }
  };

  const handleReconcilePendingTopUp = async (transactionId: string) => {
    if (!onReconcilePendingTopUp) {
      return;
    }

    setReconcilingTransactionId(transactionId);
    try {
      const settlementReference = settlementReferences[transactionId]?.trim();
      await onReconcilePendingTopUp(transactionId, settlementReference || undefined);
      setSettlementReferences((current) => ({
        ...current,
        [transactionId]: '',
      }));
      addToast({
        title: 'TON Treasury',
        message: 'Pending TON top-up reconciled into the squad treasury.',
        tone: 'success',
      });
    } catch (error) {
      addToast({
        title: 'TON Treasury',
        message: error instanceof Error ? error.message : 'Failed to reconcile the TON top-up.',
        tone: 'error',
      });
    } finally {
      setReconcilingTransactionId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Balance Card */}
      <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-100 mb-1">Treasury Balance</p>
            <h2 className="text-4xl font-bold">{treasury.balance.toLocaleString()} {treasury.currency}</h2>
            {treasury.paymentRail && (
              <p className="mt-2 text-sm text-green-100">
                {treasury.paymentRail.enabled
                  ? 'Yellow off-chain rail'
                  : treasury.paymentRail.mode === 'unconfigured'
                    ? 'Yellow unavailable'
                    : 'Manual ledger'}{' '}
                •{' '}
                {treasury.paymentRail.enabled ? 'Session balance' : 'Tracked balance'}{' '}
                {treasury.paymentRail.settledBalance.toLocaleString()} {treasury.paymentRail.assetSymbol}
              </p>
            )}
          </div>
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <Wallet className="w-8 h-8 text-white" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/20">
          <div>
            <p className="text-green-100 text-sm">Monthly Income</p>
            <p className="text-xl font-semibold">+{monthlyIncome.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-green-100 text-sm">All Time Income</p>
            <p className="text-xl font-semibold">+{totalIncome.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-green-100 text-sm">All Time Expenses</p>
            <p className="text-xl font-semibold">-{totalExpenses.toLocaleString()}</p>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Button 
          onClick={() => setActiveTab('deposit')}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Deposit Funds
        </Button>
        <Button 
          onClick={() => setActiveTab('withdraw')}
          variant="outline"
        >
          <Minus className="w-4 h-4 mr-2" />
          Withdraw
        </Button>
      </div>

      {treasury.paymentRail && (
        <PaymentRailNotice
          title="Treasury settlement rail"
          assetSymbol={treasury.paymentRail.assetSymbol}
          enabled={treasury.paymentRail.enabled}
          mode={treasury.paymentRail.mode}
          body="Deposits and withdrawals update the treasury ledger immediately. When Yellow is available, the matching balance changes are coordinated inside the squad's off-chain session instead of restarting the full wallet flow each time."
        />
      )}

      {(treasury.tonRail || onSetTonWalletAddress || onReconcilePendingTopUp) && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
            <Wallet className="w-5 h-5 mr-2 text-cyan-600" />
            TON Treasury Rail
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-300 mt-2">
            Telegram Mini App top-ups land here first and appear in the ledger as pending until a squad leader reconciles them into treasury balance.
          </p>

          <div className="mt-4 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Squad TON vault address
              </label>
              <input
                type="text"
                value={tonWalletAddress}
                onChange={(event) => setTonWalletAddress(event.target.value)}
                placeholder="Enter the squad's TON wallet address"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-2 break-all">
                Current vault: {treasury.tonRail?.walletAddress || 'Not configured yet'}
              </p>
            </div>

            {onSetTonWalletAddress && (
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => void handleSaveTonWallet()} loading={savingTonWallet}>
                  Save TON Vault
                </Button>
                <Button
                  onClick={() => {
                    setTonWalletAddress('');
                    void handleSaveTonWallet('');
                  }}
                  variant="outline"
                  disabled={savingTonWallet || !treasury.tonRail?.walletAddress}
                >
                  Clear Vault
                </Button>
              </div>
            )}

            {!treasury.tonRail?.enabled && !treasury.tonRail?.walletAddress && (
              <p className="text-xs font-semibold text-amber-600">
                Set a TON vault address to enable Telegram Mini App top-ups for this squad.
              </p>
            )}
          </div>

          {pendingTonTopUps.length > 0 && (
            <div className="mt-5 border-t border-gray-200 pt-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
                Pending TON top-ups
              </p>
              <div className="mt-3 space-y-3">
                {pendingTonTopUps.map((transaction) => {
                  const senderAddress = getTransactionMetadataString(transaction, 'senderAddress');
                  const settlementReference = settlementReferences[transaction.id] ?? '';

                  return (
                    <div key={transaction.id} className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {transaction.amount.toLocaleString()} TON pending
                          </p>
                          <p className="text-sm text-gray-700 mt-1">
                            {transaction.description}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            {transaction.timestamp.toLocaleString()}
                          </p>
                          {senderAddress && (
                            <p className="text-xs text-gray-600 mt-2 break-all">
                              Sender: {senderAddress}
                            </p>
                          )}
                        </div>
                        <p className="text-xs font-semibold text-amber-700">
                          Awaiting reconciliation
                        </p>
                      </div>

                      {onReconcilePendingTopUp && (
                        <div className="mt-3 flex flex-col gap-3 md:flex-row">
                          <input
                            type="text"
                            value={settlementReference}
                            onChange={(event) => setSettlementReferences((current) => ({
                              ...current,
                              [transaction.id]: event.target.value,
                            }))}
                            placeholder="Optional on-chain tx hash"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                          />
                          <Button
                            onClick={() => void handleReconcilePendingTopUp(transaction.id)}
                            loading={reconcilingTransactionId === transaction.id}
                            className="md:min-w-[180px]"
                          >
                            Mark Reconciled
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Budget Allowances */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <PieChart className="w-5 h-5 mr-2 text-purple-600" />
          Budget Allowances
        </h3>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">Weekly Wages</span>
              <span className="text-sm text-gray-900">{treasury.allowances.weeklyWages.toLocaleString()} {treasury.currency}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '60%' }} />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">Transfer Budget</span>
              <span className="text-sm text-gray-900">{treasury.allowances.transferBudget.toLocaleString()} {treasury.currency}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '40%' }} />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">Facility Upgrades</span>
              <span className="text-sm text-gray-900">{treasury.allowances.facilityUpgrades.toLocaleString()} {treasury.currency}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-purple-500 h-2 rounded-full" style={{ width: '25%' }} />
            </div>
          </div>
        </div>
      </Card>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <History className="w-5 h-5 mr-2 text-blue-600" />
              Recent Transactions
            </h3>
            <button 
              onClick={() => setActiveTab('transactions')}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              View All
            </button>
          </div>
          <div className="space-y-3">
            {treasury.transactions.slice(0, 5).map((tx) => (
              <TransactionRow key={tx.id} transaction={tx} currency={treasury.currency} />
            ))}
          </div>
        </Card>
      )}

      {activeTab === 'transactions' && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">All Transactions</h3>
            <button 
              onClick={() => setActiveTab('overview')}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              ← Back
            </button>
          </div>
          <div className="space-y-3">
            {treasury.transactions.map((tx) => (
              <TransactionRow key={tx.id} transaction={tx} currency={treasury.currency} />
            ))}
          </div>
        </Card>
      )}

      {activeTab === 'deposit' && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Deposit Funds</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount ({treasury.currency})
              </label>
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="flex space-x-3">
              <Button onClick={handleDeposit} className="flex-1">
                Confirm Deposit
              </Button>
              <Button onClick={() => setActiveTab('overview')} variant="outline">
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'withdraw' && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Withdraw Funds</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount ({treasury.currency})
              </label>
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                Available: {treasury.balance.toLocaleString()} {treasury.currency}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason / Description
              </label>
              <textarea
                value={withdrawReason}
                onChange={(e) => setWithdrawReason(e.target.value)}
                placeholder="Why are you withdrawing these funds?"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                rows={3}
              />
            </div>
            <div className="flex space-x-3">
              <Button onClick={handleWithdraw} className="flex-1">
                Request Withdrawal
              </Button>
              <Button onClick={() => setActiveTab('overview')} variant="outline">
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

// Transaction row component
interface TransactionRowProps {
  transaction: TreasuryTransaction;
  currency: string;
}

function getTransactionMetadataString(transaction: TreasuryTransaction, key: string): string | null {
  const value = transaction.metadata?.[key];
  return typeof value === 'string' && value.trim() ? value : null;
}

const TransactionRow: React.FC<TransactionRowProps> = ({ transaction, currency }) => {
  const isIncome = transaction.type === 'income';
  
  const categoryLabels: Record<string, string> = {
    deposit_pending: 'TON Top-Up Pending',
    match_fee: 'Match Fee',
    sponsor: 'Sponsorship',
    prize: 'Prize Money',
    transfer_in: 'Player Sale',
    wages: 'Player Wages',
    transfer_out: 'Player Purchase',
    facility: 'Facility Cost',
  };

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          isIncome ? 'bg-green-100' : 'bg-red-100'
        }`}>
          {isIncome ? (
            <ArrowDownRight className={`w-5 h-5 ${isIncome ? 'text-green-600' : 'text-red-600'}`} />
          ) : (
            <ArrowUpRight className={`w-5 h-5 ${isIncome ? 'text-green-600' : 'text-red-600'}`} />
          )}
        </div>
        <div>
          <p className="font-medium text-gray-900">{transaction.description}</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {categoryLabels[transaction.category] || transaction.category} • {transaction.timestamp.toLocaleDateString()}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className={`font-bold ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
          {isIncome ? '+' : '-'}{transaction.amount.toLocaleString()} {currency}
        </p>
        <p className={`text-xs ${transaction.verified ? 'text-green-600' : 'text-amber-600'}`}>
          {transaction.verified ? '✓ Verified' : 'Pending'}
        </p>
      </div>
    </div>
  );
};
