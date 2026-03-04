"use client";

import { useCallback } from 'react';
import { trpc } from '@/lib/trpc-client';
import type { Treasury, TreasuryTransaction } from '@/types';

interface UseTreasuryReturn {
  treasury: Treasury | null;
  loading: boolean;
  deposit: (amount: number, description?: string) => Promise<void>;
  withdraw: (amount: number, reason: string, category: 'wages' | 'transfers' | 'facilities' | 'other') => Promise<void>;
  refreshTreasury: () => Promise<void>;
}

export function useTreasury(squadId?: string): UseTreasuryReturn {
  const { data: rawData, isLoading } = trpc.squad.getTreasury.useQuery(
    { squadId: squadId || '' },
    { enabled: !!squadId, staleTime: 30 * 1000 }
  ) as { data: any; isLoading: boolean };

  const depositMutation = trpc.squad.depositToTreasury.useMutation({
    onSuccess: () => {
      /* refetch handled automatically */
    },
  });

  const withdrawMutation = trpc.squad.withdrawFromTreasury.useMutation({
    onSuccess: () => {
      /* refetch handled automatically */
    },
  });

  const deposit = useCallback(async (amount: number, description?: string) => {
    if (!squadId) return;
    await depositMutation.mutateAsync({
      squadId,
      amount,
      description,
    });
  }, [squadId, depositMutation]);

  const withdraw = useCallback(async (
    amount: number,
    reason: string,
    category: 'wages' | 'transfers' | 'facilities' | 'other'
  ) => {
    if (!squadId) return;
    await withdrawMutation.mutateAsync({
      squadId,
      amount,
      reason,
      category,
    });
  }, [squadId, withdrawMutation]);

  const refreshTreasury = useCallback(async () => {
    /* Can add manual refetch if needed */
  }, []);

  const treasury: Treasury | null = rawData
    ? {
        balance: rawData.balance || 0,
        currency: 'ALGO',
        allowances: {
          weeklyWages: rawData.budgets?.wages || 0,
          transferBudget: rawData.budgets?.transfers || 0,
          facilityUpgrades: rawData.budgets?.facilities || 0,
        },
        transactions: (rawData.transactions || []).map((tx: any) => ({
          id: tx.id,
          type: tx.type as 'income' | 'expense',
          category: tx.category as any,
          amount: tx.amount,
          description: tx.description || '',
          timestamp: new Date(tx.createdAt),
          verified: tx.verified,
          txHash: tx.txHash || undefined,
        })),
      }
    : null;

  return {
    treasury,
    loading: isLoading || depositMutation.isPending || withdrawMutation.isPending,
    deposit,
    withdraw,
    refreshTreasury,
  };
}
