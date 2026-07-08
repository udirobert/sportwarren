import { useEffect, useRef, useState } from 'react';
import { socketService, type ReconnectState } from '../lib/socket';

export function useSocket() {
  const isInitialized = useRef(false);
  const [reconnectState, setReconnectState] = useState<ReconnectState>({
    isReconnecting: false,
    attempt: 0,
    delayMs: 1000,
  });

  useEffect(() => {
    if (!isInitialized.current) {
      socketService.connect();
      isInitialized.current = true;
    }

    const handler = (state: unknown) => {
      setReconnectState(state as ReconnectState);
    };
    socketService.on('reconnect-state', handler);

    return () => {
      socketService.off('reconnect-state', handler);
      // Don't disconnect on unmount as other components might be using it
      // socketService.disconnect();
    };
  }, []);

  return { socket: socketService, reconnectState };
}

export function useMatchSocket(matchId: string | null) {
  const { socket, reconnectState } = useSocket();

  useEffect(() => {
    if (matchId) {
      socket.joinMatch(matchId);
      return () => {
        socket.leaveMatch(matchId);
      };
    }
  }, [socket, matchId]);

  return { socket, reconnectState };
}

export function useSquadSocket(squadId: string | null, token: string | null) {
  const { socket, reconnectState } = useSocket();

  useEffect(() => {
    // Both are required: the server gates the squad room on a valid
    // preview token, so joining without one is pointless (and denied).
    if (squadId && token) {
      socket.joinSquad(squadId, token);
      return () => {
        socket.leaveSquad(squadId);
      };
    }
  }, [socket, squadId, token]);

  return { socket, reconnectState };
}