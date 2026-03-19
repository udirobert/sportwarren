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
import type { TransferOffer } from '@/types';
import { useWallet } from '@/contexts/WalletContext';

interface UseTransfersReturn {
  incomingOffers: TransferOffer[];
  outgoingOffers: TransferOffer[];
  loading: boolean;
  makeOffer: (playerId: string, targetSquadId: string, amount: number, type: 'transfer' | 'loan', loanDuration?: number) => Promise<void>;
  respondToOffer: (offerId: string, accept: boolean) => Promise<void>;
  cancelOffer: (offerId: string) => Promise<void>;
  refreshOffers: () => Promise<void>;
}

interface YellowSettlementInput {
  sessionId: string;
  version: number;
  settlementId: string;
}

const DEFAULT_PROTOCOL = RPCProtocolVersion.NitroRPC_0_4;
const DEFAULT_CHALLENGE_WINDOW = 24 * 60 * 60;

function toAtomicAmount(amount: number) {
  return Math.max(0, Math.round(amount * 1_000_000)).toString();
}

function buildSettlementId(sessionId: string, version: number) {
  return `${sessionId}:v${version}`;
}

// Transform DB offer to frontend type
function transformOffer(offer: any): TransferOffer {
  return {
    id: offer.id,
    fromSquad: offer.fromSquad.id,
    toSquad: offer.toSquad.id,
    fromSquadName: offer.fromSquad.name,
    toSquadName: offer.toSquad.name,
    player: {
      id: offer.player?.id || offer.playerId,
      address: offer.player?.walletAddress || '',
      name: offer.player?.name || 'Unnamed Player',
      position: (offer.player?.position || 'MF') as any,
      status: 'available',
      squadNumber: 0,
      contract: {
        type: 'amateur',
        wage: 0,
        expiry: offer.expiresAt ? new Date(offer.expiresAt) : new Date(),
      },
      isCaptain: false,
      isViceCaptain: false,
    } as any,
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
  const yellowSession = useYellowSession();
  const { isVerified } = useWallet();
  // Fetch incoming offers
  const { data: incomingData, isLoading: incomingLoading, refetch: refetchIncoming } = trpc.squad.getTransferOffers.useQuery(
    { squadId: squadId || '', type: 'incoming' },
    { enabled: !!squadId && isVerified, staleTime: 30 * 1000 }
  );

  // Fetch outgoing offers
  const { data: outgoingData, isLoading: outgoingLoading, refetch: refetchOutgoing } = trpc.squad.getTransferOffers.useQuery(
    { squadId: squadId || '', type: 'outgoing' },
    { enabled: !!squadId && isVerified, staleTime: 30 * 1000 }
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

  const getSquadLeaderWallets = useCallback(async (targetSquadId: string) => {
    const squad = await utils.squad.getById.fetch({ id: targetSquadId });
    return (squad.members || [])
      .filter((member: any) => member.role === 'captain' || member.role === 'vice_captain')
      .map((member: any) => member.user?.walletAddress)
      .filter((walletAddress: string | null | undefined): walletAddress is Hex => Boolean(walletAddress) && isHex(walletAddress))
      .slice(0, 2);
  }, [utils.squad.getById]);

  const createYellowEscrow = useCallback(async (
    toSquadId: string,
    amount: number,
    offerType: 'transfer' | 'loan',
    playerId: string,
  ): Promise<YellowSettlementInput | undefined> => {
    if (
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

    const counterpartyParticipants = await getSquadLeaderWallets(toSquadId);
    const participants = Array.from(new Set([participant, ...counterpartyParticipants])) as Hex[];

    const asset = (process.env.NEXT_PUBLIC_YELLOW_ASSET_SYMBOL || yellowSession.assetSymbol || 'USDC').toLowerCase();
    const allocations: RPCAppSessionAllocation[] = participants.map((sessionParticipant, index) => ({
      participant: sessionParticipant,
      asset,
      amount: index === 0 ? toAtomicAmount(amount) : '0',
    }));

    const result = await yellowSession.createSession({
      definition: {
        application: `sportwarren-transfer-${offerType}-${playerId}-${Date.now()}`,
        protocol: DEFAULT_PROTOCOL,
        participants,
        weights: participants.map(() => Math.floor(100 / participants.length)),
        quorum: participants.length > 1 ? 50 : 100,
        challenge: DEFAULT_CHALLENGE_WINDOW,
      },
      allocations,
      sessionData: JSON.stringify({
        squadId,
        toSquadId,
        playerId,
        offerType,
        amount,
        asset,
        timestamp: new Date().toISOString(),
      }),
    });

    return {
      sessionId: result.appSessionId,
      version: result.version,
      settlementId: buildSettlementId(result.appSessionId, result.version),
    };
  }, [getSquadLeaderWallets, squadId, yellowSession]);

  const closeYellowEscrow = useCallback(async (
    sessionId: string | null | undefined,
    amount: number,
    offerId: string,
    recipient: 'buyer' | 'seller',
  ): Promise<YellowSettlementInput | undefined> => {
    if (
      !sessionId ||
      !isHex(sessionId) ||
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

    const sessions = await yellowSession.getAppSessions(participant);
    const existingSession = sessions.find((session: { appSessionId: string }) => session.appSessionId === sessionId);
    if (!existingSession) {
      return undefined;
    }

    const asset = (process.env.NEXT_PUBLIC_YELLOW_ASSET_SYMBOL || yellowSession.assetSymbol || 'USDC').toLowerCase();
    const allocations: RPCAppSessionAllocation[] = existingSession.participants.map((sessionParticipant: Hex, index: number) => ({
      participant: sessionParticipant,
      asset,
      amount:
        recipient === 'buyer'
          ? index === 0 ? toAtomicAmount(amount) : '0'
          : index === 1 ? toAtomicAmount(amount) : '0',
    }));

    const result = await yellowSession.closeSession({
      appSessionId: sessionId as Hex,
      allocations,
      sessionData: JSON.stringify({
        offerId,
        amount,
        asset,
        recipient,
        intent: RPCAppStateIntent.Withdraw,
        timestamp: new Date().toISOString(),
      }),
    });

    return {
      sessionId: result.appSessionId,
      version: result.version,
      settlementId: buildSettlementId(result.appSessionId, result.version),
    };
  }, [yellowSession]);

  const makeOffer = useCallback(async (
    playerId: string,
    targetSquadId: string,
    amount: number,
    type: 'transfer' | 'loan',
    loanDuration?: number
  ) => {
    if (!squadId || !targetSquadId) return;
    const yellowSettlement = await createYellowEscrow(targetSquadId, amount, type, playerId);

    await createMutation.mutateAsync({
      toSquadId: targetSquadId,
      playerId,
      offerType: type === 'transfer' ? 'permanent' : 'loan',
      amount,
      loanDuration,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      yellowSettlement,
    });
  }, [createMutation, createYellowEscrow, squadId]);

  const respondToOffer = useCallback(async (offerId: string, accept: boolean) => {
    const offer = incomingData?.find((entry) => entry.id === offerId);
    const yellowSettlement = await closeYellowEscrow(
      offer?.yellowSessionId,
      offer?.amount || 0,
      offerId,
      accept ? 'seller' : 'buyer',
    );

    await respondMutation.mutateAsync({ offerId, accept, yellowSettlement });
  }, [closeYellowEscrow, incomingData, respondMutation]);

  const cancelOffer = useCallback(async (offerId: string) => {
    const offer = outgoingData?.find((entry) => entry.id === offerId);
    const yellowSettlement = await closeYellowEscrow(
      offer?.yellowSessionId,
      offer?.amount || 0,
      offerId,
      'buyer',
    );

    await cancelMutation.mutateAsync({ offerId, yellowSettlement });
  }, [cancelMutation, closeYellowEscrow, outgoingData]);

  const refreshOffers = useCallback(async () => {
    await Promise.all([refetchIncoming(), refetchOutgoing()]);
  }, [refetchIncoming, refetchOutgoing]);

  return {
    incomingOffers: incomingData?.map(transformOffer) || [],
    outgoingOffers: outgoingData?.map(transformOffer) || [],
    loading:
      incomingLoading ||
      outgoingLoading ||
      createMutation.isPending ||
      respondMutation.isPending ||
      cancelMutation.isPending ||
      yellowSession.status === 'connecting',
    makeOffer,
    respondToOffer,
    cancelOffer,
    refreshOffers,
  };
}
