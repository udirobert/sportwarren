"use client";

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  Wallet, ArrowUpRight, ArrowDownRight, Plus, Minus, 
  History, PieChart, TrendingUp, AlertCircle 
} from 'lucide-react';
import type { Treasury as TreasuryType, TreasuryTransaction } from '@/types';

// Mock treasury data
const MOCK_TREASURY: TreasuryType = {
  balance: 15000,
  currency: 'ALGO',
  transactions: [
    { id: 't1', type: 'income', category: 'match_fee', amount: 500, description: 'Match fee vs Red Lions', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), verified: true },
    { id: 't2', type: 'income', category: 'sponsor', amount: 2000, description: 'Local sponsor payment', timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), verified: true },
    { id: 't3', type: 'expense', category: 'wages', amount: 800, description: 'Weekly player wages', timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), verified: true },
    { id: 't4', type: 'expense', category: 'facility', amount: 300, description: 'Pitch rental', timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), verified: true },
    { id: 't5', type: 'income', category: 'prize', amount: 1500, description: 'Tournament prize', timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), verified: true },
  ],
  allowances: {
    weeklyWages: 1000,
    transferBudget: 5000,
    facilityUpgrades: 2000,
  },
};

interface TreasuryProps {
  treasury?: TreasuryType;
  onDeposit?: (amount: number) => void;
  onWithdraw?: (amount: number, reason: string) => void;
}

export const Treasury: React.FC<TreasuryProps> = ({
  treasury = MOCK_TREASURY,
  onDeposit,
  onWithdraw,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'deposit' | 'withdraw'>('overview');
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawReason, setWithdrawReason] = useState('');

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

  const handleDeposit = () => {
    const amount = parseInt(depositAmount);
    if (amount > 0) {
      onDeposit?.(amount);
      setDepositAmount('');
      setActiveTab('overview');
    }
  };

  const handleWithdraw = () => {
    const amount = parseInt(withdrawAmount);
    if (amount > 0 && withdrawReason.trim()) {
      onWithdraw?.(amount, withdrawReason);
      setWithdrawAmount('');
      setWithdrawReason('');
      setActiveTab('overview');
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
              <span className="text-sm text-gray-900">{treasury.allowances.weeklyWages.toLocaleString()} ALGO</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '60%' }} />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">Transfer Budget</span>
              <span className="text-sm text-gray-900">{treasury.allowances.transferBudget.toLocaleString()} ALGO</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '40%' }} />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">Facility Upgrades</span>
              <span className="text-sm text-gray-900">{treasury.allowances.facilityUpgrades.toLocaleString()} ALGO</span>
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
              <TransactionRow key={tx.id} transaction={tx} />
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
              <TransactionRow key={tx.id} transaction={tx} />
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
                Amount (ALGO)
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
                Amount (ALGO)
              </label>
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <p className="text-sm text-gray-500 mt-1">
                Available: {treasury.balance.toLocaleString()} ALGO
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
const TransactionRow: React.FC<{ transaction: TreasuryTransaction }> = ({ transaction }) => {
  const isIncome = transaction.type === 'income';
  
  const categoryLabels: Record<string, string> = {
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
          <p className="text-sm text-gray-500">
            {categoryLabels[transaction.category] || transaction.category} • {transaction.timestamp.toLocaleDateString()}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className={`font-bold ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
          {isIncome ? '+' : '-'}{transaction.amount.toLocaleString()} ALGO
        </p>
        {transaction.verified && (
          <p className="text-xs text-green-600">✓ Verified</p>
        )}
      </div>
    </div>
  );
};
