import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Function[]> = new Map();

  connect(): void {
    if (this.socket?.connected) return;

    this.socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000', {
      transports: ['websocket'],
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      console.log('🔌 Connected to Socket.IO server');
    });

    this.socket.on('disconnect', () => {
      console.log('🔌 Disconnected from Socket.IO server');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    // Set up event listeners
    this.setupEventListeners();
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    // Match events
    this.socket.on('match-event', (data) => {
      this.emit('match-event', data);
    });

    this.socket.on('score-update', (data) => {
      this.emit('score-update', data);
    });

    // Squad events
    this.socket.on('squad-update', (data) => {
      this.emit('squad-update', data);
    });

    // Notifications
    this.socket.on('notification', (data) => {
      this.emit('notification', data);
    });

    this.socket.on('achievement-unlocked', (data) => {
      this.emit('achievement-unlocked', data);
    });
  }

  // Join match room for live updates
  joinMatch(matchId: string): void {
    if (this.socket) {
      this.socket.emit('join-match', matchId);
    }
  }

  // Leave match room
  leaveMatch(matchId: string): void {
    if (this.socket) {
      this.socket.emit('leave-match', matchId);
    }
  }

  // Join squad room
  joinSquad(squadId: string): void {
    if (this.socket) {
      this.socket.emit('join-squad', squadId);
    }
  }

  // Leave squad room
  leaveSquad(squadId: string): void {
    if (this.socket) {
      this.socket.emit('leave-squad', squadId);
    }
  }

  // Send match event
  sendMatchEvent(matchId: string, event: any): void {
    if (this.socket) {
      this.socket.emit('match-event', { matchId, event });
    }
  }

  // Send score update
  sendScoreUpdate(matchId: string, score: any): void {
    if (this.socket) {
      this.socket.emit('score-update', { matchId, score });
    }
  }

  // Event listener management
  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => callback(data));
    }
  }

  // Check connection status
  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();