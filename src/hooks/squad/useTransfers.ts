"use client";

import { useCallback } from 'react';
import { trpc } from '@/lib/trpc-client';
import type { TransferOffer, SquadPlayer } from '@/types';
import { useYellowSession } from '@/hooks/useYellowSession';

interface UseTransfersReturn {
  incomingOffers: TransferOffer[];
  outgoingOffers: TransferOffer[];
  loading: boolean;
  makeOffer: (playerId: string, amount: number, type: 'transfer' | 'loan', loanDuration?: number) => Promise<void>;
  respondToOffer: (offerId: string, accept: boolean) => Promise<void>;
  cancelOffer: (offerId: string) => Promise<void>;
  refreshOffers: () => Promise<void>;
}

// Transform DB offer to frontend type
function transformOffer(offer: any): TransferOffer {
  return {
    id: offer.id,
    fromSquad: offer.fromSquad.id,
    toSquad: offer.toSquad.id,
    fromSquadName: offer.fromSquad.name,
    toSquadName: offer.toSquad.name,
    player: { id: offer.playerId } as SquadPlayer,
    offerAmount: offer.amount,
    offerType: offer.offerType as 'transfer' | 'loan',
    loanDuration: offer.loanDuration || undefined,
    status: offer.status as TransferOffer['status'],
    timestamp: new Date(offer.createdAt),
    expiry: offer.expiresAt ? new Date(offer.expiresAt) : undefined,
    paymentSessionId: offer.yellowSessionId || null,
    paymentRail: {
      enabled: Boolean(offer.yellowSessionId),
      assetSymbol: 'USDC',
      status:
        offer.status === 'pending'
          ? 'locked'
          : offer.status === 'accepted'
            ? 'released'
            : 'refunded',
    },
  };
}

export function useTransfers(squadId?: string): UseTransfersReturn {
  const utils = trpc.useUtils();
  // Fetch incoming offers
  const { data: incomingData, isLoading: incomingLoading, refetch: refetchIncoming } = trpc.squad.getTransferOffers.useQuery(
    { squadId: squadId || '', type: 'incoming' },
    { enabled: !!squadId, staleTime: 30 * 1000 }
  );

  // Fetch outgoing offers
  const { data: outgoingData, isLoading: outgoingLoading, refetch: refetchOutgoing } = trpc.squad.getTransferOffers.useQuery(
    { squadId: squadId || '', type: 'outgoing' },
    { enabled: !!squadId, staleTime: 30 * 1000 }
  );

  // Create offer mutation
  const createMutation = trpc.squad.createTransferOffer.useMutation({
    onSuccess: () => {
      if (!squadId) return;
      utils.squad.getTransferOffers.invalidate({ squadId, type: 'incoming' });
      utils.squad.getTransferOffers.invalidate({ squadId, type: 'outgoing' });
    },
  });

  // Respond mutation
  const respondMutation = trpc.squad.respondToTransferOffer.useMutation({
    onSuccess: () => {
      refetchIncoming();
      refetchOutgoing();
    },
  });

  // Cancel mutation
  const cancelMutation = trpc.squad.cancelTransferOffer.useMutation({
    onSuccess: () => {
      refetchIncoming();
      refetchOutgoing();
    },
  });

  const makeOffer = useCallback(async (
    playerId: string,
    amount: number,
    type: 'transfer' | 'loan',
    loanDuration?: number
  ) => {
    if (!squadId) return;

    await createMutation.mutateAsync({
      toSquadId: squadId,
      playerId,
      offerType: type === 'transfer' ? 'permanent' : 'loan',
      amount,
      loanDuration,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });
  }, [squadId, createMutation]);

  const respondToOffer = useCallback(async (offerId: string, accept: boolean) => {
    await respondMutation.mutateAsync({ offerId, accept });
  }, [respondMutation]);

  const cancelOffer = useCallback(async (offerId: string) => {
    await cancelMutation.mutateAsync({ offerId });
  }, [cancelMutation]);

  const refreshOffers = useCallback(async () => {
    await Promise.all([refetchIncoming(), refetchOutgoing()]);
  }, [refetchIncoming, refetchOutgoing]);

  return {
    incomingOffers: incomingData?.map(transformOffer) || [],
    outgoingOffers: outgoingData?.map(transformOffer) || [],
    loading: incomingLoading || outgoingLoading || createMutation.isPending,
    makeOffer,
    respondToOffer,
    cancelOffer,
    refreshOffers,
  };
}
