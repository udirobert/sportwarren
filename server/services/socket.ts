import { Server as SocketIOServer } from 'socket.io';

export class SocketService {
  private io: SocketIOServer;

  constructor(io: SocketIOServer) {
    this.io = io;
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket) => {
      console.log(`🔌 User connected: ${socket.id}`);

      // Join match room for live updates
      socket.on('join-match', (matchId: string) => {
        socket.join(`match:${matchId}`);
        console.log(`👤 User ${socket.id} joined match ${matchId}`);
      });

      // Leave match room
      socket.on('leave-match', (matchId: string) => {
        socket.leave(`match:${matchId}`);
        console.log(`👤 User ${socket.id} left match ${matchId}`);
      });

      // Join squad room for updates
      socket.on('join-squad', (squadId: string) => {
        socket.join(`squad:${squadId}`);
        console.log(`👤 User ${socket.id} joined squad ${squadId}`);
      });

      // Leave squad room
      socket.on('leave-squad', (squadId: string) => {
        socket.leave(`squad:${squadId}`);
        console.log(`👤 User ${socket.id} left squad ${squadId}`);
      });

      // Handle live match events
      socket.on('match-event', (data) => {
        this.broadcastMatchEvent(data.matchId, data.event);
      });

      // Handle live score updates
      socket.on('score-update', (data) => {
        this.broadcastScoreUpdate(data.matchId, data.score);
      });

      socket.on('disconnect', () => {
        console.log(`🔌 User disconnected: ${socket.id}`);
      });
    });
  }

  // Broadcast match events to all users in the match room
  broadcastMatchEvent(matchId: string, event: any): void {
    this.io.to(`match:${matchId}`).emit('match-event', {
      matchId,
      event,
      timestamp: new Date().toISOString(),
    });
  }

  // Broadcast score updates
  broadcastScoreUpdate(matchId: string, score: any): void {
    this.io.to(`match:${matchId}`).emit('score-update', {
      matchId,
      score,
      timestamp: new Date().toISOString(),
    });
  }

  // Broadcast squad updates
  broadcastSquadUpdate(squadId: string, update: any): void {
    this.io.to(`squad:${squadId}`).emit('squad-update', {
      squadId,
      update,
      timestamp: new Date().toISOString(),
    });
  }

  // Send notification to specific user
  sendNotification(userId: string, notification: any): void {
    this.io.emit('notification', {
      userId,
      notification,
      timestamp: new Date().toISOString(),
    });
  }

  // Broadcast achievement unlock
  broadcastAchievement(userId: string, achievement: any): void {
    this.io.emit('achievement-unlocked', {
      userId,
      achievement,
      timestamp: new Date().toISOString(),
    });
  }

  // Get connected users count
  getConnectedUsersCount(): number {
    return this.io.engine.clientsCount;
  }

  // Get users in a specific room
  async getUsersInRoom(room: string): Promise<string[]> {
    const sockets = await this.io.in(room).fetchSockets();
    return sockets.map(socket => socket.id);
  }
}