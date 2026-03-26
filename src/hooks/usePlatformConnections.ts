'use client';

import { useMemo } from 'react';
import { trpc } from '@/lib/trpc-client';
import { useWallet } from '@/contexts/WalletContext';
import type { PlatformConnections, PlatformType, SquadGroupConnections } from '@/types';

interface UsePlatformConnectionsOptions {
  squadId?: string;
}

function toPlatformConnections(groups: SquadGroupConnections): PlatformConnections {
  const telegram = groups.telegram;
  if (!telegram) return {};

  const isConnected = !!telegram.chatId;
  const isPending = !isConnected && !!telegram.linkUrl;

  return {
    telegram: {
      connected: isConnected,
      status: isConnected ? 'connected' : isPending ? 'pending' : 'connected',
      connectedAt: telegram.linkedAt ?? undefined,
      username: telegram.username ?? undefined,
      chatId: telegram.chatId ?? undefined,
      linkUrl: telegram.linkUrl,
    },
  };
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
        const data = queryState.state.data as SquadGroupConnections | undefined;
        const hasPendingLink = Object.values(data ?? {}).some(
          (group) => !group.chatId && !!group.linkUrl,
        );

        return hasPendingLink ? 5_000 : false;
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

  const connections = useMemo<PlatformConnections>(
    () => toPlatformConnections((query.data as SquadGroupConnections) ?? {}),
    [query.data],
  );

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
