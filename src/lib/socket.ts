import { io, Socket } from 'socket.io-client';

export interface ReconnectState {
  isReconnecting: boolean;
  attempt: number;
  delayMs: number;
}

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, ((...args: unknown[]) => void)[]> = new Map();

  // Reconnection state
  private _reconnectAttempt = 0;
  private _isReconnecting = false;
  private _reconnectDelayMs = 1000;

  /** Current reconnect attempt number (0 = connected or never tried) */
  get reconnectAttempt(): number {
    return this._reconnectAttempt;
  }
  /** Whether the socket is currently trying to reconnect */
  get isReconnecting(): boolean {
    return this._isReconnecting;
  }
  /** Delay before the current/next reconnect attempt in ms */
  get reconnectDelayMs(): number {
    return this._reconnectDelayMs;
  }

  // ── Backoff config ──
  private readonly BACKOFF_BASE_MS = 1000;     // 1s
  private readonly BACKOFF_MAX_MS = 30_000;    // 30s
  private readonly BACKOFF_MULTIPLIER = 2;     // exponential
  private readonly BACKOFF_JITTER = 0.3;       // ±30%

  /**
   * Compute the next delay using exponential backoff with jitter:
   *   delay = min(BACKOFF_MAX_MS, BACKOFF_BASE_MS * BACKOFF_MULTIPLIER^attempt)
   *   jittered = delay * (1 + uniform(-BACKOFF_JITTER, +BACKOFF_JITTER))
   */
  private nextBackoff(attempt: number): number {
    const base = Math.min(
      this.BACKOFF_MAX_MS,
      this.BACKOFF_BASE_MS * Math.pow(this.BACKOFF_MULTIPLIER, attempt),
    );
    const jitter = 1 + (Math.random() * 2 - 1) * this.BACKOFF_JITTER;
    return Math.round(base * jitter);
  }

  connect(): void {
    if (this.socket?.connected) return;

    this.socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000', {
      transports: ['websocket'],
      autoConnect: true,
      // Let our manual backoff drive reconnection instead of socket.io's built-in
      reconnection: false,
    });

    this.socket.on('connect', () => {
      console.log('🔌 Connected to Socket.IO server');
      this._reconnectAttempt = 0;
      this._isReconnecting = false;
      this._reconnectDelayMs = this.BACKOFF_BASE_MS;
      this.emitReconnectState();
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Disconnected from Socket.IO server:', reason);
      if (reason === 'io server disconnect' || reason === 'io client disconnect') {
        // Manual disconnect — don't reconnect
        this._isReconnecting = false;
        this.emitReconnectState();
        return;
      }
      // Start reconnecting with exponential backoff
      this._isReconnecting = true;
      this.scheduleReconnect();
      this.emitReconnectState();
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    // Set up event listeners
    this.setupEventListeners();
  }

  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    const delay = this.nextBackoff(this._reconnectAttempt);
    this._reconnectDelayMs = delay;
    this._reconnectAttempt++;
    this.emitReconnectState();

    console.log(
      `🔁 Reconnecting in ${Math.round(delay / 1000)}s (attempt ${this._reconnectAttempt})`,
    );

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (this.socket && !this.socket.connected) {
        this.socket.connect();
      }
    }, delay);
  }

  private emitReconnectState(): void {
    this.emit('reconnect-state', {
      isReconnecting: this._isReconnecting,
      attempt: this._reconnectAttempt,
      delayMs: this._reconnectDelayMs,
    });
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this._isReconnecting = false;
    this._reconnectAttempt = 0;
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.emitReconnectState();
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

  // Join squad room — requires a preview token (walletAddress); the
  // server verifies the holder is a member of the squad before joining.
  joinSquad(squadId: string, token: string): void {
    if (this.socket) {
      this.socket.emit('join-squad', { squadId, token });
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

  // Send squad update (broadcast to squad room)
  sendSquadUpdate(squadId: string, update: any): void {
    if (this.socket) {
      this.socket.emit('squad-update', { squadId, update });
    }
  }

  // Event listener management
  on(event: string, callback: (...args: unknown[]) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: (...args: unknown[]) => void): void {
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