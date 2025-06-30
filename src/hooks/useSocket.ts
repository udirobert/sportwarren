import { useEffect, useRef } from 'react';
import { socketService } from '../lib/socket';

export function useSocket() {
  const isInitialized = useRef(false);

  useEffect(() => {
    if (!isInitialized.current) {
      socketService.connect();
      isInitialized.current = true;
    }

    return () => {
      // Don't disconnect on unmount as other components might be using it
      // socketService.disconnect();
    };
  }, []);

  return socketService;
}

export function useMatchSocket(matchId: string | null) {
  const socket = useSocket();

  useEffect(() => {
    if (matchId) {
      socket.joinMatch(matchId);
      return () => {
        socket.leaveMatch(matchId);
      };
    }
  }, [socket, matchId]);

  return socket;
}

export function useSquadSocket(squadId: string | null) {
  const socket = useSocket();

  useEffect(() => {
    if (squadId) {
      socket.joinSquad(squadId);
      return () => {
        socket.leaveSquad(squadId);
      };
    }
  }, [socket, squadId]);

  return socket;
}