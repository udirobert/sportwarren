"use client";

import { useState, useCallback } from 'react';
import type { Treasury, TreasuryTransaction } from '@/types';
import { MOCK_TREASURY } from '@/lib/mocks';

interface UseTreasuryReturn {
  treasury: Treasury | null;
  loading: boolean;
  deposit: (amount: number) => Promise<void>;
  withdraw: (amount: number, reason: string) => Promise<void>;
  refreshTreasury: () => Promise<void>;
}

export function useTreasury(squadId?: string): UseTreasuryReturn {
  const [treasury, setTreasury] = useState<Treasury | null>(MOCK_TREASURY);
  const [loading, setLoading] = useState(false);

  const refreshTreasury = useCallback(async () => {
    setLoading(true);
    try {
      // In production: fetch from API
      // const response = await fetch(`/api/squads/${squadId}/treasury`);
      // const data = await response.json();
      // setTreasury(data);
    } finally {
      setLoading(false);
    }
  }, [squadId]);

  const deposit = useCallback(async (amount: number) => {
    setLoading(true);
    try {
      // In production: submit to API and blockchain
      // await fetch(`/api/squads/${squadId}/treasury/deposit`, {
      //   method: 'POST',
      //   body: JSON.stringify({ amount }),
      // });
      
      // Optimistic update
      const newTransaction: TreasuryTransaction = {
        id: `tx_${Date.now()}`,
        type: 'income',
        category: 'transfer_in',
        amount,
        description: 'Treasury deposit',
        timestamp: new Date(),
        verified: true,
      };
      
      setTreasury(prev => prev ? {
        ...prev,
        balance: prev.balance + amount,
        transactions: [newTransaction, ...prev.transactions],
      } : null);
    } finally {
      setLoading(false);
    }
  }, [squadId]);

  const withdraw = useCallback(async (amount: number, reason: string) => {
    setLoading(true);
    try {
      // In production: submit to API and blockchain
      // await fetch(`/api/squads/${squadId}/treasury/withdraw`, {
      //   method: 'POST',
      //   body: JSON.stringify({ amount, reason }),
      // });
      
      // Optimistic update
      const newTransaction: TreasuryTransaction = {
        id: `tx_${Date.now()}`,
        type: 'expense',
        category: 'transfer_out',
        amount,
        description: reason,
        timestamp: new Date(),
        verified: true,
      };
      
      setTreasury(prev => prev ? {
        ...prev,
        balance: prev.balance - amount,
        transactions: [newTransaction, ...prev.transactions],
      } : null);
    } finally {
      setLoading(false);
    }
  }, [squadId]);

  return {
    treasury,
    loading,
    deposit,
    withdraw,
    refreshTreasury,
  };
}
