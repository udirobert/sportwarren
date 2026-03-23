'use client';

import { useMemo } from 'react';
import { trpc } from '@/lib/trpc-client';
import { useWallet } from '@/contexts/WalletContext';
import type { PlatformConnections, PlatformType } from '@/types';

interface UsePlatformConnectionsOptions {
  squadId?: string;
}

export function usePlatformConnections({ squadId }: UsePlatformConnectionsOptions) {
  const utils = trpc.useUtils();
  const { isGuest, authStatus } = useWallet();
  const isVerified = !isGuest && authStatus.state === 'valid';

  const query = trpc.communication.getConnections.useQuery(
    { squadId: squadId || '' },
    {
      enabled: isVerified && !!squadId,
      retry: false,
      staleTime: 30 * 1000,
      refetchInterval: (queryState) => {
        const data = queryState.state.data as PlatformConnections | undefined;
        const hasPendingConnection = Object.values(data ?? {}).some(
          (connection) => connection?.status === 'pending'
        );

        return hasPendingConnection ? 5_000 : false;
      },
    }
  );

  const createTelegramLinkMutation = trpc.communication.createTelegramLink.useMutation({
    onSuccess: async () => {
      if (squadId) {
        await utils.communication.getConnections.invalidate({ squadId });
      }
    },
  });

  const disconnectMutation = trpc.communication.disconnectPlatform.useMutation({
    onSuccess: async () => {
      if (squadId) {
        await utils.communication.getConnections.invalidate({ squadId });
      }
    },
  });

  const connections = useMemo<PlatformConnections>(() => query.data ?? {}, [query.data]);

  return {
    connections,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isVerified,
    createTelegramLink: async () => {
      if (!squadId) {
        throw new Error('A squad is required to link Telegram');
      }

      return createTelegramLinkMutation.mutateAsync({ squadId });
    },
    disconnectPlatform: async (platform: PlatformType) => {
      if (!squadId) {
        throw new Error('A squad is required to unlink a platform');
      }

      return disconnectMutation.mutateAsync({ squadId, platform });
    },
    isCreatingTelegramLink: createTelegramLinkMutation.isPending,
    isDisconnectingPlatform: disconnectMutation.isPending,
  };
}
