"use client";

import { useCallback } from 'react';
import {
  RPCAppStateIntent,
  RPCProtocolVersion,
  type RPCAppSessionAllocation,
} from '@erc7824/nitrolite';
import { isHex, type Hex } from 'viem';
import { trpc } from '@/lib/trpc-client';
import { useYellowSession } from '@/hooks/useYellowSession';
import type { Treasury } from '@/types';

interface YellowSettlementInput {
  sessionId: string;
  version: number;
  settlementId: string;
}

interface UseTreasuryReturn {
  treasury: Treasury | null;
  loading: boolean;
  deposit: (amount: number, description?: string) => Promise<void>;
  withdraw: (amount: number, reason: string, category: 'wages' | 'transfers' | 'facilities' | 'other') => Promise<void>;
  refreshTreasury: () => Promise<void>;
}

const DEFAULT_PROTOCOL = RPCProtocolVersion.NitroRPC_0_4;
const DEFAULT_CHALLENGE_WINDOW = 60 * 60;

function toAtomicAmount(amount: number) {
  return Math.max(0, Math.round(amount * 1_000_000)).toString();
}

function buildSettlementId(sessionId: string, version: number) {
  return `${sessionId}:v${version}`;
}

export function useTreasury(squadId?: string): UseTreasuryReturn {
  const utils = trpc.useUtils();
  const { data: rawData, isLoading } = trpc.squad.getTreasury.useQuery(
    { squadId: squadId || '' },
    { enabled: !!squadId, staleTime: 30 * 1000 }
  ) as { data: any; isLoading: boolean };
  const yellowSession = useYellowSession(rawData?.paymentRail?.sessionId);

  const depositMutation = trpc.squad.depositToTreasury.useMutation({
    onSuccess: () => {
      if (squadId) {
        utils.squad.getTreasury.invalidate({ squadId });
      }
    },
  });

  const withdrawMutation = trpc.squad.withdrawFromTreasury.useMutation({
    onSuccess: () => {
      if (squadId) {
        utils.squad.getTreasury.invalidate({ squadId });
      }
    },
  });

  const createYellowSettlement = useCallback(async (
    nextBalance: number,
    intent: 'deposit' | 'withdraw',
    description?: string,
  ): Promise<YellowSettlementInput | undefined> => {
    if (
      !squadId ||
      !yellowSession.enabled ||
      yellowSession.status !== 'authenticated' ||
      !yellowSession.accountAddress
    ) {
      return undefined;
    }

    const participant = yellowSession.accountAddress as Hex;
    if (!isHex(participant)) {
      return undefined;
    }

    const asset = (rawData?.paymentRail?.assetSymbol || yellowSession.assetSymbol || 'USDC').toLowerCase();
    const allocations: RPCAppSessionAllocation[] = [
      {
        participant,
        asset,
        amount: toAtomicAmount(nextBalance),
      },
    ];
    const sessionData = JSON.stringify({
      squadId,
      intent,
      description: description ?? null,
      balance: nextBalance,
      asset,
      timestamp: new Date().toISOString(),
    });

    const existingSessionId = rawData?.paymentRail?.sessionId;

    if (existingSessionId && isHex(existingSessionId)) {
      const sessions = await yellowSession.getAppSessions(participant);
      const currentSession = sessions.find((session: { appSessionId: string }) => session.appSessionId === existingSessionId);

      if (currentSession) {
        const result = await yellowSession.submitState({
          appSessionId: existingSessionId as Hex,
          version: currentSession.version + 1,
          allocations,
          sessionData,
          intent: intent === 'deposit' ? RPCAppStateIntent.Deposit : RPCAppStateIntent.Withdraw,
        });

        return {
          sessionId: result.appSessionId,
          version: result.version,
          settlementId: buildSettlementId(result.appSessionId, result.version),
        };
      }
    }

    const result = await yellowSession.createSession({
      definition: {
        application: `sportwarren-treasury-${squadId}`,
        protocol: DEFAULT_PROTOCOL,
        participants: [participant],
        weights: [100],
        quorum: 100,
        challenge: DEFAULT_CHALLENGE_WINDOW,
      },
      allocations,
      sessionData,
    });

    return {
      sessionId: result.appSessionId,
      version: result.version,
      settlementId: buildSettlementId(result.appSessionId, result.version),
    };
  }, [
    rawData?.paymentRail?.assetSymbol,
    rawData?.paymentRail?.sessionId,
    squadId,
    yellowSession,
  ]);

  const deposit = useCallback(async (amount: number, description?: string) => {
    if (!squadId) return;
    const yellowSettlement = await createYellowSettlement(
      (rawData?.balance || 0) + amount,
      'deposit',
      description,
    );
    await depositMutation.mutateAsync({
      squadId,
      amount,
      description,
      yellowSettlement,
    });
  }, [createYellowSettlement, depositMutation, rawData?.balance, squadId]);

  const withdraw = useCallback(async (
    amount: number,
    reason: string,
    category: 'wages' | 'transfers' | 'facilities' | 'other'
  ) => {
    if (!squadId) return;
    const yellowSettlement = await createYellowSettlement(
      Math.max(0, (rawData?.balance || 0) - amount),
      'withdraw',
      reason,
    );
    await withdrawMutation.mutateAsync({
      squadId,
      amount,
      reason,
      category,
      yellowSettlement,
    });
  }, [createYellowSettlement, rawData?.balance, squadId, withdrawMutation]);

  const refreshTreasury = useCallback(async () => {
    if (squadId) {
      await utils.squad.getTreasury.invalidate({ squadId });
    }
  }, [squadId, utils]);

  const treasury: Treasury | null = rawData
    ? {
        balance: rawData.balance || 0,
        currency: rawData.paymentRail?.assetSymbol || yellowSession.assetSymbol || 'ALGO',
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
        paymentRail: {
          enabled: rawData.paymentRail?.enabled ?? yellowSession.enabled,
          mode: rawData.paymentRail?.mode || (yellowSession.enabled ? 'simulated' : 'disabled'),
          assetSymbol: rawData.paymentRail?.assetSymbol || yellowSession.assetSymbol,
          sessionId: rawData.paymentRail?.sessionId || yellowSession.sessionId,
          settledBalance: rawData.paymentRail?.settledBalance ?? rawData.balance ?? 0,
        },
      }
    : null;

  return {
    treasury,
    loading:
      isLoading ||
      depositMutation.isPending ||
      withdrawMutation.isPending ||
      yellowSession.status === 'connecting',
    deposit,
    withdraw,
    refreshTreasury,
  };
}
